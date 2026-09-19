import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect, requireSections } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

router.post('/image', protect, requireSections('banners', 'products'), uploadAvatar.single('image'), uploadImage);

export default router;