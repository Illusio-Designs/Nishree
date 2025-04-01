import express from 'express';
import { 
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory
} from '../controller/categoryController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', isAuthenticated, authorize(['admin']), upload.single('image'), createCategory);
router.put('/:id', isAuthenticated, authorize(['admin']), upload.single('image'), updateCategory);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteCategory);

export default router;