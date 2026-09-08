import { Router } from 'express';
import { submitContact } from '../controllers/contactController.js';
import { validate, contactSchema } from '../utils/validate.js';
import { contactLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', contactLimiter, validate(contactSchema), submitContact);

export default router;
