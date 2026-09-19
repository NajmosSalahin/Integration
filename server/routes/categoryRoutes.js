import { Router } from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, requireSections } from '../middleware/auth.js';
import { validate, categorySchema, updateCategorySchema } from '../utils/validate.js';

const router = Router();

router.get('/', getCategories);
router.get('/admin/all', protect, requireSections('categories'), getAllCategoriesAdmin);
router.post('/', protect, requireSections('categories'), validate(categorySchema), createCategory);
router.put('/:id', protect, requireSections('categories'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, requireSections('categories'), deleteCategory);

export default router;