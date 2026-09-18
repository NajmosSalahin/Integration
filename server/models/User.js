import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 30, default: 'Home' },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, default: '', trim: true },
  city: { type: String, required: true, trim: true },
  region: { type: String, default: '', trim: true },
  postal: { type: String, default: '', trim: true },
  country: { type: String, default: 'Bangladesh', trim: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  notificationPrefs: {
    orderUpdates: { type: Boolean, default: true },
    newDrops: { type: Boolean, default: true },
  },
  addresses: {
    type: [addressSchema],
    default: [],
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 12);
};

const User = mongoose.model('User', userSchema);

export default User;
