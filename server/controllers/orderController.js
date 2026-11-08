import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { generateOrderPdf } from '../utils/pdf.js';
import { sendOrderNotificationEmail } from '../emails/orderNotification.js';
import { sendOrderConfirmationEmail } from '../emails/orderConfirmation.js';
import { resolveOrderItems } from '../utils/orderItems.js';
import { computeDiscount, couponIssue, COUPON_REASON_MESSAGES } from '../utils/coupon.js';
import { couponReservationStore } from '../utils/couponReservation.js';
import { parseOrderQuery } from '../utils/orderQuery.js';
import { canTransition, ORDER_STATUSES } from '../utils/orderStatus.js';

const MAX_ORDER_TOTAL = 1000000;

export async function createOrder(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { items, deliveryAddress, contactPhone, paymentMethod, promoCode } = req.body;

    const { items: validatedItems, subtotal } = await resolveOrderItems(items);
    const user = await User.findById(req.user._id).select('name email');

    let discountAmount = 0;
    let couponCode = '';
    let couponToReserve = null;
    if (promoCode) {
      const code = promoCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code });
      if (!coupon) {
        return res.status(400).json({ error: 'Invalid coupon code' });
      }
      const issue = couponIssue({ coupon, subtotal, userOrderCount: 0 });
      if (issue) {
        return res.status(400).json({ error: COUPON_REASON_MESSAGES[issue.reason] });
      }
      discountAmount = computeDiscount({ coupon, subtotal });
      couponCode = code;
      couponToReserve = coupon;
    }

    const totalAmount = subtotal - discountAmount;
    if (totalAmount > MAX_ORDER_TOTAL) {
      return res.status(400).json({ error: 'Order total exceeds the maximum allowed' });
    }

    let reservedCoupon = null;
    if (couponToReserve) {
      const reservation = await couponReservationStore.reserve(couponToReserve, req.user._id);
      if (!reservation.ok) {
        return res.status(400).json({ error: COUPON_REASON_MESSAGES[reservation.reason] });
      }
      reservedCoupon = couponToReserve;
    }

    const initialStatus = paymentMethod === 'cod' ? 'awaiting_confirmation' : 'pending_payment';

    let order;
    try {
      order = await Order.create({
        userId: req.user._id,
        items: validatedItems,
        totalAmount,
        couponCode,
        discountAmount,
        deliveryAddress,
        contactPhone,
        paymentMethod: paymentMethod || 'bkash',
        status: initialStatus,
        statusHistory: [{ status: initialStatus, changedAt: new Date(), changedBy: req.user._id }],
      });
    } catch (err) {
      if (reservedCoupon) {
        try {
          await couponReservationStore.release(reservedCoupon, req.user._id);
        } catch (releaseErr) {
          console.error('Failed to release coupon reservation:', releaseErr);
        }
      }
      throw err;
    }

    const pdfBuffer = await generateOrderPdf({
      order,
      customerName: user.name,
      customerEmail: user.email,
    });

    try {
      await sendOrderNotificationEmail({
        order,
        customerName: user.name,
        customerEmail: user.email,
        pdfBuffer,
      });
    } catch (emailErr) {
      console.error('Failed to send order notification:', emailErr);
    }

    try {
      await sendOrderConfirmationEmail({
        order,
        customerEmail: user.email,
        customerName: user.name,
      });
    } catch (emailErr) {
      console.error('Failed to send order confirmation:', emailErr);
    }

    res.status(201).json(order);
  } catch (err) {
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

export async function getMyOrders(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(orders);
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function getOrder(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .select('-__v');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const ownerId = order.userId?._id ?? order.userId;
    const permissions = req.user.permissions || [];
    const canManageOrders =
      req.user.role === 'admin' &&
      (permissions.length === 0 || permissions.includes('orders'));
    if (!canManageOrders && String(ownerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    console.error('getOrder error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

export async function getAllOrders(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        orders: [],
        page: 1,
        totalOrders: 0,
        totalPages: 0,
        statusCounts: Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])),
      });
    }

    const parsed = parseOrderQuery(req.query);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }
    const { status, page, limit, search, sort } = parsed;
    const filter = {};
    if (status) filter.status = status;

    const groupedCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    for (const row of groupedCounts) {
      if (statusCounts[row._id] !== undefined) statusCounts[row._id] = row.count;
    }

    const trimmedSearch = (search || '').trim();
    if (trimmedSearch) {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const conditions = [];

      if (/^[0-9a-f]{1,24}$/i.test(trimmedSearch)) {
        conditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: trimmedSearch,
              options: 'i',
            },
          },
        });
      }

      const textReg = new RegExp(escapeRegex(trimmedSearch), 'i');
      const matchingUsers = await User.find({ $or: [{ name: textReg }, { email: textReg }] })
        .select('_id')
        .lean();
      if (matchingUsers.length > 0) {
        conditions.push({ userId: { $in: matchingUsers.map((u) => u._id) } });
      }

      if (conditions.length > 0) {
        filter.$or = conditions;
      } else {
        return res.json({ orders: [], page, totalOrders: 0, totalPages: 0, statusCounts });
      }
    }

    const SORTS = {
      date_desc: { createdAt: -1 },
      date_asc: { createdAt: 1 },
      total_desc: { totalAmount: -1 },
      total_asc: { totalAmount: 1 },
    };
    const orderBy = SORTS[sort] || SORTS.date_desc;

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort(orderBy)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      orders,
      page,
      totalOrders,
      totalPages,
      statusCounts,
    });
  } catch (err) {
    console.error('getAllOrders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === status) {
      const unchanged = await Order.findById(order._id)
        .populate('userId', 'name email')
        .select('-__v');
      return res.json(unchanged);
    }

    if (!canTransition(order.status, status)) {
      return res.status(409).json({
        error: `Cannot change status from ${order.status} to ${status}`,
        code: 'INVALID_STATUS_TRANSITION',
      });
    }

    const now = new Date();
    const update = {
      $set: { status },
      $push: { statusHistory: { status, changedAt: now, changedBy: req.user._id } },
    };
    if (status === 'paid' && !order.paidAt) {
      update.$set.paidAt = now;
    }
    if (status === 'fulfilled' && !order.fulfilledAt) {
      update.$set.fulfilledAt = now;
    }

    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      update,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .select('-__v');

    if (!updated) {
      return res.status(409).json({
        error: 'Order status changed by another request. Refresh and try again.',
        code: 'STATUS_CONFLICT',
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}
