import Coupon from '../models/Coupon.js';
import CouponRedemption from '../models/CouponRedemption.js';
import Order from '../models/Order.js';

export function createCouponReservationStore({ CouponModel, RedemptionModel, OrderModel }) {
  async function releaseGlobalUsage(couponId) {
    await CouponModel.updateOne(
      { _id: couponId, timesUsed: { $gt: 0 } },
      { $inc: { timesUsed: -1 } }
    );
  }

  async function incrementRedemption(coupon, userId) {
    const limit = coupon.perUserLimit > 0 ? coupon.perUserLimit : Infinity;
    const existing = await RedemptionModel.findOne({ couponId: coupon._id, userId });

    if (existing) {
      const filter = { couponId: coupon._id, userId };
      if (limit !== Infinity) filter.count = { $lt: limit };
      const updated = await RedemptionModel.findOneAndUpdate(
        filter,
        { $inc: { count: 1 } },
        { new: true }
      );
      return Boolean(updated);
    }

    const historicalCount = await OrderModel.countDocuments({
      userId,
      couponCode: coupon.code,
      discountAmount: { $gt: 0 },
    });
    if (historicalCount >= limit) {
      return false;
    }

    try {
      await RedemptionModel.create({
        couponId: coupon._id,
        userId,
        count: historicalCount + 1,
      });
      return true;
    } catch (err) {
      if (err?.code !== 11000) {
        throw err;
      }
      const filter = { couponId: coupon._id, userId };
      if (limit !== Infinity) filter.count = { $lt: limit };
      const updated = await RedemptionModel.findOneAndUpdate(
        filter,
        { $inc: { count: 1 } },
        { new: true }
      );
      return Boolean(updated);
    }
  }

  async function reserve(coupon, userId) {
    const reservedCoupon = await CouponModel.findOneAndUpdate(
      {
        _id: coupon._id,
        $expr: {
          $or: [
            { $eq: ['$usageLimit', 0] },
            { $lt: ['$timesUsed', '$usageLimit'] },
          ],
        },
      },
      { $inc: { timesUsed: 1 } },
      { new: true }
    );

    if (!reservedCoupon) {
      return { ok: false, reason: 'usage-exceeded' };
    }

    try {
      const allowed = await incrementRedemption(coupon, userId);
      if (!allowed) {
        await releaseGlobalUsage(coupon._id);
        return { ok: false, reason: 'per-user-exceeded' };
      }
    } catch (err) {
      await releaseGlobalUsage(coupon._id);
      throw err;
    }

    return { ok: true };
  }

  async function release(coupon, userId) {
    await releaseGlobalUsage(coupon._id);
    await RedemptionModel.updateOne(
      { couponId: coupon._id, userId, count: { $gt: 0 } },
      { $inc: { count: -1 } }
    );
  }

  return { reserve, release };
}

export const couponReservationStore = createCouponReservationStore({
  CouponModel: Coupon,
  RedemptionModel: CouponRedemption,
  OrderModel: Order,
});
