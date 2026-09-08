import { Router } from 'express';
import { createOrder, getMyOrders, getOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validate, createOrderSchema } from '../utils/validate.js';
import { orderCreateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', protect, orderCreateLimiter, validate(createOrderSchema), createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/:id', protect, getOrder);

export default router;
