const express = require('express');
const router = express.Router();
const { 
    getAllShippingFees,
    createOrUpdateShippingFee,
    getShippingFeeByType,
    deleteShippingFee
} = require('../controller/shippingFeeController');
const { isAuthenticated, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllShippingFees);
router.get('/:type', getShippingFeeByType);

// Admin routes
router.post('/', isAuthenticated, authorize(['admin']), createOrUpdateShippingFee);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteShippingFee);

module.exports = router; 