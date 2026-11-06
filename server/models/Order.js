import mongoose from 'mongoose';
import { ORDER_STATUSES } from '../utils/orderStatus.js';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ORDER_STATUSES, required: true },
  changedAt: { type: Date, required: true, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'Order must have at least one item',
    },
  },
  totalAmount: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  deliveryAddress: { type: String, required: true, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'pending_payment',
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: [],
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'cod'],
    default: 'bkash',
  },
  paymentNote: { type: String, default: '' },
  paidAt: Date,
  fulfilledAt: Date,
}, { timestamps: true });

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
