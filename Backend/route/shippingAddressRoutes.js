const express = require('express');
const router = express.Router();
const { 
    createShippingAddress,
    getUserShippingAddresses,
    getShippingAddressById,
    updateShippingAddress,
    deleteShippingAddress,
    setDefaultShippingAddress
} = require('../controller/shippingAddressController');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.post('/', isAuthenticated, createShippingAddress);
router.get('/', isAuthenticated, getUserShippingAddresses);
router.get('/:id', isAuthenticated, getShippingAddressById);
router.put('/:id', isAuthenticated, updateShippingAddress);
router.delete('/:id', isAuthenticated, deleteShippingAddress);
router.put('/:id/default', isAuthenticated, setDefaultShippingAddress);

module.exports = router; 