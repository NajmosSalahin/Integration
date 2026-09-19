import { Router } from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, categorySchema, updateCategorySchema } from '../utils/validate.js';

const router = Router();

router.get('/', getCategories);
router.get('/admin/all', protect, adminOnly, getAllCategoriesAdmin);
router.post('/', protect, adminOnly, validate(categorySchema), createCategory);
router.put('/:id', protect, adminOnly, validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;