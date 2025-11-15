// routes/routesManager.js
import express from 'express';
const router = express.Router();

// Import all route modules
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import sliderRoutes from './sliderRoutes.js';
import couponRoutes from './couponRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import orderStatusHistoryRoutes from './orderStatusHistoryRoutes.js';
import seoRoutes from './seoRoutes.js';
import attributeRoutes from './attributeRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import cartRoutes from './cartRoutes.js';
import policyRoutes from './policyRoutes.js';
import shippingRoutes from './shippingRoutes.js';
import guestRoutes from './guestRoutes.js';
// import notificationRoutes from './notificationRoutes.js';

// Core Routes
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// Feature Routes
router.use('/sliders', sliderRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', paymentRoutes);
router.use('/order-status', orderStatusHistoryRoutes);
router.use('/seo', seoRoutes);
router.use('/attributes', attributeRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cart', cartRoutes);
router.use('/policies', policyRoutes);

// Shipping routes (addresses + fees)
router.use('/shipping', shippingRoutes);

// Guest routes (no authentication required)
router.use('/guest', guestRoutes);

// Notification routes - Temporarily disabled
// router.use('/notifications', notificationRoutes);

// Health Check Route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        message: 'Server is running',
        timestamp: new Date()
    });
});

export default router;