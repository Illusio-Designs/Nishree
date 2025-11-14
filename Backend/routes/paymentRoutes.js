import express from 'express';
import { 
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    refundPayment,
    getAllPayments,
    getUserPayments
} from '../controller/paymentController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.post('/create-payment-intent', isAuthenticated, createPaymentIntent);
router.post('/confirm/:paymentIntentId', isAuthenticated, confirmPayment);
router.get('/status/:paymentIntentId', isAuthenticated, getPaymentStatus);
router.get('/my-payments', isAuthenticated, getUserPayments);

// Razorpay routes
router.post('/create-razorpay-order', isAuthenticated, async (req, res) => {
    try {
        const { order_id, amount } = req.body;
        
        // Check if Razorpay is installed
        let Razorpay;
        try {
            Razorpay = (await import('razorpay')).default;
        } catch (error) {
            console.error('Razorpay not installed:', error);
            return res.status(500).json({ 
                message: 'Payment gateway not configured. Please install razorpay package.' 
            });
        }
        
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
        });

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: 'INR',
            receipt: `order_${order_id}`,
            payment_capture: 1
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            razorpay_order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy'
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ 
            message: 'Failed to create Razorpay order', 
            error: error.message 
        });
    }
});

router.post('/verify-razorpay-payment', isAuthenticated, async (req, res) => {
    try {
        const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
        
        const crypto = await import('crypto');
        
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Update payment and order status
            const { Payment, Order } = await import('../model/associations.js');
            
            const payment = await Payment.create({
                order_id,
                user_id: req.user.id,
                payment_type: 'online',
                transaction_id: razorpay_payment_id,
                amount_paid: amount || 0,
                status: 'successful',
                payment_gateway: 'Razorpay'
            });

            await Order.update(
                { payment_status: 'paid', status: 'processing' },
                { where: { id: order_id } }
            );

            res.json({ success: true, payment });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Payment verification failed', 
            error: error.message 
        });
    }
});

// Admin routes
router.get('/', isAuthenticated, authorize(['admin']), getAllPayments);
router.post('/refund/:paymentId', isAuthenticated, authorize(['admin']), refundPayment);

export default router; 