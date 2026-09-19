import { Router } from 'express';
import {
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, bannerSchema, updateBannerSchema } from '../utils/validate.js';

const router = Router();

router.get('/', getBanners);
router.get('/admin/all', protect, adminOnly, getAllBannersAdmin);
router.post('/', protect, adminOnly, validate(bannerSchema), createBanner);
router.put('/:id', protect, adminOnly, validate(updateBannerSchema), updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

export default router;