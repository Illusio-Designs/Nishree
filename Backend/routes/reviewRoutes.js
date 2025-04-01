import express from 'express';
import { 
    createReview,
    getAllReviews,
    getReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getUserReviews
} from '../controller/reviewController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', isAuthenticated, createReview);
router.get('/my-reviews', isAuthenticated, getUserReviews);
router.get('/:id', isAuthenticated, getReview);
router.put('/:id', isAuthenticated, updateReview);
router.delete('/:id', isAuthenticated, deleteReview);

// Admin routes
router.get('/', isAuthenticated, authorize(['admin']), getAllReviews);

export default router; 