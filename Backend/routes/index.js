const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const reviewRoutes = require('./reviewRoutes');
const sliderRoutes = require('./sliderRoutes');
const couponRoutes = require('./couponRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const shippingAddressRoutes = require('./shippingAddressRoutes');
const paymentRoutes = require('./paymentRoutes');
const shippingFeeRoutes = require('./shippingFeeRoutes');
const orderStatusHistoryRoutes = require('./orderStatusHistoryRoutes');
const seoRoutes = require('./seoRoutes');

// Core Routes
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

// Feature Routes
router.use('/sliders', sliderRoutes);
router.use('/coupons', couponRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/shipping-addresses', shippingAddressRoutes);
router.use('/payments', paymentRoutes);
router.use('/shipping-fees', shippingFeeRoutes);
router.use('/order-status', orderStatusHistoryRoutes);
router.use('/seo', seoRoutes);

// Health Check Route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        message: 'Server is running',
        timestamp: new Date()
    });
});

module.exports = router; 