import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { generateOrderPdf } from '../utils/pdf.js';
import { sendOrderNotificationEmail } from '../emails/orderNotification.js';
import { sendOrderConfirmationEmail } from '../emails/orderConfirmation.js';

export async function createOrder(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { items, deliveryAddress, contactPhone } = req.body;

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: productIds }, active: true });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found or inactive` });
      }

      const sizeStock = product.stock.find((s) => s.size === item.size);
      if (sizeStock && !sizeStock.inStock) {
        return res.status(400).json({ error: `${product.title} size ${item.size} is out of stock` });
      }

      if (!product.sizes.includes(item.size)) {
        return res.status(400).json({ error: `${product.title} does not have size ${item.size}` });
      }

      totalAmount += product.price * item.quantity;
      validatedItems.push({
        productId: product._id,
        title: product.title,
        size: item.size,
        quantity: item.quantity,
        priceAtOrder: product.price,
      });
    }

    const user = await User.findById(req.user._id).select('name email');

    const order = await Order.create({
      userId: req.user._id,
      items: validatedItems,
      totalAmount,
      deliveryAddress,
      contactPhone,
    });

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

    const order = await Order.findById(req.params.id).select('-__v');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
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
