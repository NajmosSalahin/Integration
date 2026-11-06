import { Router } from 'express';
import {
  signup,
  login,
  logout,
  refresh,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateMe,
  uploadAvatar,
  changePassword,
  toggleWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload.js';
import {
  validate,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  wishlistSchema,
  addressSchema,
  updateAddressSchema,
} from '../utils/validate.js';
import {
  signupLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  refreshLimiter,
  resendVerificationLimiter,
} from '../middleware/rateLimit.js';

const router = Router();

router.post('/signup', signupLimiter, validate(signupSchema), signup);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshLimiter, refresh);
router.get('/me', protect, getMe);
router.patch('/me', protect, validate(updateProfileSchema), updateMe);
router.post('/avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.patch('/password', protect, validate(changePasswordSchema), changePassword);
router.patch('/wishlist', protect, validate(wishlistSchema), toggleWishlist);
router.post('/addresses', protect, validate(addressSchema), addAddress);
router.put('/addresses/:addressId', protect, validate(updateAddressSchema), updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerificationLimiter, resendVerification);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
