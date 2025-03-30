const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getAllOrders, 
    getUserOrders, 
    getOrderById, 
    updateOrderStatus, 
    cancelOrder 
} = require('../controller/orderController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Protected routes - require authentication
router.post('/', isAuthenticated, createOrder);
router.get('/', isAuthenticated, getUserOrders);
router.get('/:id', isAuthenticated, getOrderById);
router.put('/:id/cancel', isAuthenticated, cancelOrder);

// Admin only routes
router.get('/admin', isAuthenticated, isAdmin, getAllOrders);
router.put('/:id/status', isAuthenticated, isAdmin, updateOrderStatus);

module.exports = router; 