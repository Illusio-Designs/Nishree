import express from 'express';
import { isAuthenticated, authorize } from '../middleware/auth.js';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    upload
} from '../controller/productController.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (admin only)
router.post('/', isAuthenticated, authorize(['admin']), upload.array('images', 5), createProduct);
router.put('/:id', isAuthenticated, authorize(['admin']), upload.array('images', 5), updateProduct);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteProduct);

export default router; 