import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, requireSections } from '../middleware/auth.js';
import { requireVerifiedEmail } from '../middleware/requireVerifiedEmail.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { validate, createOrderSchema, updateStatusSchema } from '../utils/validate.js';
import { orderCreateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', protect, requireSections('orders'), getAllOrders);
router.post('/', protect, orderCreateLimiter, requireVerifiedEmail, validate(createOrderSchema), createOrder);
router.get('/mine', protect, getMyOrders);
router.patch('/:id/status', protect, requireSections('orders'), validateObjectId('id'), validate(updateStatusSchema), updateOrderStatus);
router.get('/:id', protect, validateObjectId('id'), getOrder);

export default router;
