import { Router } from 'express';
import {
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, requireSections } from '../middleware/auth.js';
import { validate, bannerSchema, updateBannerSchema } from '../utils/validate.js';

const router = Router();

router.get('/', getBanners);
router.get('/admin/all', protect, requireSections('banners'), getAllBannersAdmin);
router.post('/', protect, requireSections('banners'), validate(bannerSchema), createBanner);
router.put('/:id', protect, requireSections('banners'), validate(updateBannerSchema), updateBanner);
router.delete('/:id', protect, requireSections('banners'), deleteBanner);

export default router;