import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import { resolveOrderItems } from '../utils/orderItems.js';
import { computeDiscount, couponIssue, COUPON_REASON_MESSAGES } from '../utils/coupon.js';

export async function validateCoupon(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { code, items } = req.body;
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.json({ valid: false, code, reason: 'invalid', message: 'Coupon code not found.' });
    }

    const { subtotal } = await resolveOrderItems(items);
    const userOrderCount = coupon.perUserLimit > 0
      ? await Order.countDocuments({ userId: req.user._id, couponCode: code, discountAmount: { $gt: 0 } })
      : 0;

    const issue = couponIssue({ coupon, subtotal, userOrderCount });
    if (issue) {
      return res.json({
        valid: false,
        code,
        reason: issue.reason,
        message: COUPON_REASON_MESSAGES[issue.reason],
      });
    }

    const discount = computeDiscount({ coupon, subtotal });

    res.json({
      valid: true,
      code,
      discountType: coupon.discountType,
      value: coupon.value,
      discount,
      subtotal,
      totalAmount: subtotal - discount,
    });
  } catch (err) {
    console.error('validateCoupon error:', err);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
}

export async function getCoupons(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error('getCoupons error:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
}

export async function createCoupon(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const existing = await Coupon.findOne({ code: req.body.code });
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: req.body.code,
      discountType: req.body.discountType,
      value: req.body.value,
      minOrderAmount: req.body.minOrderAmount ?? 0,
      maxDiscount: req.body.maxDiscount ?? 0,
      expiresAt: req.body.expiresAt ?? null,
      usageLimit: req.body.usageLimit ?? 0,
      perUserLimit: req.body.perUserLimit ?? 0,
      active: req.body.active ?? true,
    });

    res.status(201).json(coupon);
  } catch (err) {
    console.error('createCoupon error:', err);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
}

export async function updateCoupon(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const { code, discountType, value, minOrderAmount, maxDiscount, expiresAt, usageLimit, perUserLimit, active } = req.body;

    if (code !== undefined && code !== coupon.code) {
      const existing = await Coupon.findOne({ code, _id: { $ne: coupon._id } });
      if (existing) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }
      coupon.code = code;
    }
    if (discountType !== undefined) coupon.discountType = discountType;
    if (value !== undefined) coupon.value = value;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (perUserLimit !== undefined) coupon.perUserLimit = perUserLimit;
    if (active !== undefined) coupon.active = active;

    await coupon.save();
    res.json(coupon);
  } catch (err) {
    console.error('updateCoupon error:', err);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
}

export async function deleteCoupon(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    coupon.active = false;
    await coupon.save();

    res.json({ message: 'Coupon deactivated' });
  } catch (err) {
    console.error('deleteCoupon error:', err);
    res.status(500).json({ error: 'Failed to deactivate coupon' });
  }
}