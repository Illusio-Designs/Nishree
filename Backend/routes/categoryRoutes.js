import express from 'express';
import { 
    createCategory, 
    getAllCategories, 
    getCategoryByName, 
    updateCategory, 
    deleteCategory,
    upload 
} from '../controller/categoryController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllCategories);
router.get('/name/:name', getCategoryByName);

// Protected routes (require authentication)
router.post('/', isAuthenticated, isAdmin, upload.single('image'), createCategory);
router.put('/:id', isAuthenticated, isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', isAuthenticated, isAdmin, deleteCategory);

export default router;