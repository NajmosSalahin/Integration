import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { generateOrderPdf } from '../utils/pdf.js';
import { sendOrderNotificationEmail } from '../emails/orderNotification.js';
import { sendOrderConfirmationEmail } from '../emails/orderConfirmation.js';
import { resolveOrderItems } from '../utils/orderItems.js';
import { computeDiscount, couponIssue, COUPON_REASON_MESSAGES } from '../utils/coupon.js';

export async function createOrder(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { items, deliveryAddress, contactPhone, paymentMethod, promoCode } = req.body;

    const { items: validatedItems, subtotal } = await resolveOrderItems(items);

    let discountAmount = 0;
    let couponCode = '';
    if (promoCode) {
      const code = promoCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code });
      if (!coupon) {
        return res.status(400).json({ error: 'Invalid coupon code' });
      }
      const userOrderCount = await Order.countDocuments({
        userId: req.user._id,
        couponCode: code,
        discountAmount: { $gt: 0 },
      });
      const issue = couponIssue({ coupon, subtotal, userOrderCount });
      if (issue) {
        return res.status(400).json({ error: COUPON_REASON_MESSAGES[issue.reason] });
      }
      discountAmount = computeDiscount({ coupon, subtotal });
      couponCode = code;
    }

    const totalAmount = subtotal - discountAmount;

    const user = await User.findById(req.user._id).select('name email');

    const order = await Order.create({
      userId: req.user._id,
      items: validatedItems,
      totalAmount,
      couponCode,
      discountAmount,
      deliveryAddress,
      contactPhone,
      paymentMethod: paymentMethod || 'bkash',
      status: paymentMethod === 'cod' ? 'awaiting_confirmation' : 'pending_payment',
    });

    if (couponCode) {
      try {
        await Coupon.updateOne({ code: couponCode }, { $inc: { timesUsed: 1 } });
      } catch (usageErr) {
        console.error('Failed to increment coupon usage:', usageErr);
      }
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
    if (req.user.role !== 'admin' && String(ownerId) !== String(req.user._id)) {
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
      return res.json({ orders: [], page: 1, totalOrders: 0, totalPages: 0 });
    }

    const { status, page = 1, limit = 20, search, sort } = req.query;
    const filter = {};
    if (status) filter.status = status;

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
        return res.json({ orders: [], page: Number(page), totalOrders: 0, totalPages: 0 });
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
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort(orderBy)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    res.json({
      orders,
      page: Number(page),
      totalOrders,
      totalPages,
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

    order.status = status;
    if (status === 'paid' && !order.paidAt) {
      order.paidAt = new Date();
    }
    if (status === 'fulfilled' && !order.fulfilledAt) {
      order.fulfilledAt = new Date();
    }

    await order.save();

    const updated = await Order.findById(order._id)
      .populate('userId', 'name email')
      .select('-__v');

    res.json(updated);
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}
