import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, requireSections } from '../middleware/auth.js';
import { validate, validateCouponSchema, couponSchema, updateCouponSchema } from '../utils/validate.js';
import { couponValidateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/validate', protect, couponValidateLimiter, validate(validateCouponSchema), validateCoupon);
router.get('/', protect, requireSections('coupons'), getCoupons);
router.post('/', protect, requireSections('coupons'), validate(couponSchema), createCoupon);
router.put('/:id', protect, requireSections('coupons'), validate(updateCouponSchema), updateCoupon);
router.delete('/:id', protect, requireSections('coupons'), deleteCoupon);

export default router;