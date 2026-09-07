import mongoose from 'mongoose';

const stockItemSchema = new mongoose.Schema({
  size: { type: String, required: true },
  inStock: { type: Boolean, default: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }],
  sizes: [{ type: String, required: true }],
  sizeGuideNote: { type: String, default: '' },
  stock: [stockItemSchema],
  tags: [{ type: String }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ active: 1 });
productSchema.index({ tags: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
