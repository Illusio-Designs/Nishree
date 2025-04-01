import express from 'express';
import { 
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
} from '../controller/cartController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.get('/', isAuthenticated, getCart);
router.post('/add', isAuthenticated, addToCart);
router.put('/update/:itemId', isAuthenticated, updateCartItem);
router.delete('/remove/:itemId', isAuthenticated, removeFromCart);
router.delete('/clear', isAuthenticated, clearCart);
router.post('/coupon/apply', isAuthenticated, applyCoupon);
router.delete('/coupon/remove', isAuthenticated, removeCoupon);

export default router; 