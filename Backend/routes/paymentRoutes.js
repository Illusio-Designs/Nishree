const express = require('express');
const router = express.Router();
const { 
    processPayment,
    getPaymentStatus,
    processRefund,
    getAllPayments
} = require('../controller/paymentController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// User routes - require authentication
router.post('/', isAuthenticated, processPayment);
router.get('/order/:orderId', isAuthenticated, getPaymentStatus);

// Admin only routes
router.post('/refund', isAuthenticated, isAdmin, processRefund);
router.get('/admin', isAuthenticated, isAdmin, getAllPayments);

module.exports = router; 