import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/newsletterController.js';
import { validate, newsletterSchema } from '../utils/validate.js';
import { newsletterLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/subscribe', newsletterLimiter, validate(newsletterSchema), subscribeNewsletter);

export default router;
