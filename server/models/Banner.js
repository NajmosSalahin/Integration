import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  publicId: { type: String, required: true, trim: true },
  label: { type: String, default: '' },
  alt: { type: String, default: '' },
  cta: { type: String, default: '/shop' },
  order: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

bannerSchema.index({ active: 1 });
bannerSchema.index({ order: 1, createdAt: -1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;