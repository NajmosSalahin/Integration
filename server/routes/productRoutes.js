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
import { validateObjectId } from '../middleware/validateObjectId.js';
import { validate, createProductSchema, updateProductSchema, setActiveSchema, setFeaturedSchema, setHomeCollectionSchema } from '../utils/validate.js';

const router = Router();

router.get('/admin/all', protect, requireSections('products'), getAllProductsAdmin);
router.get('/', getProducts);
router.post('/', protect, requireSections('products'), validate(createProductSchema), createProduct);
router.patch('/:id/stock', protect, requireSections('products'), validateObjectId('id'), toggleStock);
router.put('/:id', protect, requireSections('products'), validateObjectId('id'), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, requireSections('products'), validateObjectId('id'), deleteProduct);
router.patch('/:id/active', protect, requireSections('products'), validateObjectId('id'), validate(setActiveSchema), setActive);
router.patch('/:id/featured', protect, requireSections('products'), validateObjectId('id'), validate(setFeaturedSchema), setFeatured);
router.patch('/:id/home-collection', protect, requireSections('products'), validateObjectId('id'), validate(setHomeCollectionSchema), setHomeCollection);
router.get('/:id', validateObjectId('id'), getProduct);

export default router;
