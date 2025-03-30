const express = require('express');
const router = express.Router();
const { 
    getAllShippingFees,
    createOrUpdateShippingFee,
    getShippingFeeByType,
    deleteShippingFee
} = require('../controller/shippingFeeController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllShippingFees);
router.get('/:type', getShippingFeeByType);

// Admin only routes
router.post('/', isAuthenticated, isAdmin, createOrUpdateShippingFee);
router.delete('/:id', isAuthenticated, isAdmin, deleteShippingFee);

module.exports = router; 