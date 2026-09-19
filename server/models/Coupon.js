import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['fixed', 'percent'], required: true },
  value: { type: Number, required: true, min: 1 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, default: 0, min: 0 },
  expiresAt: { type: Date, default: null },
  usageLimit: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, default: 0, min: 0 },
  timesUsed: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ active: 1 });
couponSchema.index({ expiresAt: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;