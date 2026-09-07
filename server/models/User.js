import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
