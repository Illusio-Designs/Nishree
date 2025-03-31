const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const couponController = require('../controller/couponController');

// Admin routes (protected)
// Create a new coupon
router.post('/', isAuthenticated, isAdmin, couponController.createCoupon);

// Get all coupons
router.get('/', isAuthenticated, isAdmin, couponController.getAllCoupons);

// Get a single coupon by ID
router.get('/:id', isAuthenticated, isAdmin, couponController.getCouponById);

// Update a coupon
router.put('/:id', isAuthenticated, isAdmin, couponController.updateCoupon);

// Delete a coupon
router.delete('/:id', isAuthenticated, isAdmin, couponController.deleteCoupon);

// Public/User routes
// Validate a coupon
router.post('/validate', isAuthenticated, couponController.validateCoupon);

// Apply a coupon (increment used count)
router.post('/apply', isAuthenticated, couponController.applyCoupon);

module.exports = router; 