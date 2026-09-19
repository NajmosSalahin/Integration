import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

router.post('/image', protect, adminOnly, uploadAvatar.single('image'), uploadImage);

export default router;