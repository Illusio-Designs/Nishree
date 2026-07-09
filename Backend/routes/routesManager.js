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
// B2B management routes
import zoneRoutes from './zoneRoutes.js';
import partyRoutes from './partyRoutes.js';
import distributorRoutes from './distributorRoutes.js';
import salesmanRoutes from './salesmanRoutes.js';
import salesmanCheckinRoutes from './salesmanCheckinRoutes.js';
import salesmanTargetRoutes from './salesmanTargetRoutes.js';
import salesmanExpenseRoutes from './salesmanExpenseRoutes.js';
import offerRoutes from './offerRoutes.js';
import eventRoutes from './eventRoutes.js';
import b2bOrderRoutes from './b2bOrderRoutes.js';
import b2bAnalyticsRoutes from './b2bAnalyticsRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
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

// ---- B2B Management (unified with D2C) ----
router.use('/zones', zoneRoutes);
router.use('/parties', partyRoutes);
router.use('/distributors', distributorRoutes);
router.use('/salesmen', salesmanRoutes);
router.use('/salesman-checkins', salesmanCheckinRoutes);
router.use('/salesman-targets', salesmanTargetRoutes);
router.use('/salesman-expenses', salesmanExpenseRoutes);
router.use('/offers', offerRoutes);
router.use('/events', eventRoutes);
router.use('/b2b-orders', b2bOrderRoutes);
router.use('/b2b-analytics', b2bAnalyticsRoutes);
router.use('/audit-logs', auditLogRoutes);

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