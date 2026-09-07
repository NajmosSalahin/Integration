import { Router } from 'express';
import {
  signup,
  login,
  logout,
  refresh,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validate.js';
import {
  signupLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  refreshLimiter,
} from '../middleware/rateLimit.js';

const router = Router();

router.post('/signup', signupLimiter, validate(signupSchema), signup);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshLimiter, refresh);
router.get('/me', protect, getMe);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
