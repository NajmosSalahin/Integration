import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, validateCouponSchema, couponSchema, updateCouponSchema } from '../utils/validate.js';
import { couponValidateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/validate', protect, couponValidateLimiter, validate(validateCouponSchema), validateCoupon);
router.get('/', protect, adminOnly, getCoupons);
router.post('/', protect, adminOnly, validate(couponSchema), createCoupon);
router.put('/:id', protect, adminOnly, validate(updateCouponSchema), updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;