import mongoose from 'mongoose';

const couponRedemptionSchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

couponRedemptionSchema.index({ couponId: 1, userId: 1 }, { unique: true });

const CouponRedemption = mongoose.model('CouponRedemption', couponRedemptionSchema);

export default CouponRedemption;
