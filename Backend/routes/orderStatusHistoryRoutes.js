const express = require('express');
const router = express.Router();
const { 
    getOrderStatusHistory,
    addOrderStatusEntry
} = require('../controller/orderStatusHistoryController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Routes for specific order status history
router.get('/order/:orderId', isAuthenticated, getOrderStatusHistory);
router.post('/order/:orderId', isAuthenticated, isAdmin, addOrderStatusEntry);

module.exports = router; 