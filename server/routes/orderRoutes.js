import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, createOrderSchema, updateStatusSchema } from '../utils/validate.js';
import { orderCreateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', protect, adminOnly, getAllOrders);
router.post('/', protect, orderCreateLimiter, validate(createOrderSchema), createOrder);
router.get('/mine', protect, getMyOrders);
router.patch('/:id/status', protect, adminOnly, validate(updateStatusSchema), updateOrderStatus);
router.get('/:id', protect, getOrder);

export default router;
