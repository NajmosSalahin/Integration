import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tag: { type: String, required: true, lowercase: true, trim: true },
  group: { type: String, required: true, trim: true },
  icon: { type: String, default: 'Shirt' },
  home: { type: Boolean, default: false },
  order: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ tag: 1 }, { unique: true });
categorySchema.index({ active: 1 });
categorySchema.index({ group: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;