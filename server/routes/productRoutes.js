import { Router } from 'express';
import {
  getProducts,
  getProduct,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  setActive,
  setFeatured,
  setHomeCollection,
} from '../controllers/productController.js';
import { protect, requireSections } from '../middleware/auth.js';
import { validate, createProductSchema, updateProductSchema, setActiveSchema, setFeaturedSchema, setHomeCollectionSchema } from '../utils/validate.js';

const router = Router();

router.get('/admin/all', protect, requireSections('products'), getAllProductsAdmin);
router.get('/', getProducts);
router.post('/', protect, requireSections('products'), validate(createProductSchema), createProduct);
router.patch('/:id/stock', protect, requireSections('products'), toggleStock);
router.put('/:id', protect, requireSections('products'), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, requireSections('products'), deleteProduct);
router.patch('/:id/active', protect, requireSections('products'), validate(setActiveSchema), setActive);
router.patch('/:id/featured', protect, requireSections('products'), validate(setFeaturedSchema), setFeatured);
router.patch('/:id/home-collection', protect, requireSections('products'), validate(setHomeCollectionSchema), setHomeCollection);
router.get('/:id', getProduct);

export default router;
