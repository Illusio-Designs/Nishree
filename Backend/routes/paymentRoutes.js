import express from 'express';
import { 
    processPayment,
    getPaymentStatus,
    processRefund,
    getAllPayments
} from '../controller/paymentController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes - require authentication
router.post('/', isAuthenticated, processPayment);
router.get('/order/:orderId', isAuthenticated, getPaymentStatus);

// Admin only routes
router.post('/refund', isAuthenticated, isAdmin, processRefund);
router.get('/admin', isAuthenticated, isAdmin, getAllPayments);

export default router; 