import { Router } from 'express';
import {
  getProducts,
  getProduct,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, createProductSchema, updateProductSchema } from '../utils/validate.js';

const router = Router();

router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.get('/', getProducts);
router.post('/', protect, adminOnly, validate(createProductSchema), createProduct);
router.patch('/:id/stock', protect, adminOnly, toggleStock);
router.put('/:id', protect, adminOnly, validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.get('/:id', getProduct);

export default router;
