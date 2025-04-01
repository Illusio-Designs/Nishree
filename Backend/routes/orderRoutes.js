import express from 'express';
import { 
    createOrder, 
    getAllOrders, 
    getUserOrders, 
    getOrderById, 
    updateOrderStatus, 
    cancelOrder 
} from '../controller/orderController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/', isAuthenticated, createOrder);
router.get('/', isAuthenticated, getUserOrders);
router.get('/:id', isAuthenticated, getOrderById);
router.put('/:id/cancel', isAuthenticated, cancelOrder);

// Admin only routes
router.get('/admin', isAuthenticated, isAdmin, getAllOrders);
router.put('/:id/status', isAuthenticated, isAdmin, updateOrderStatus);

export default router; 