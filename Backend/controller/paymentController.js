import Payment from '../model/paymentModel.js';
import Order from '../model/orderModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

// Process a payment
export const processPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { order_id, payment_type, payment_details } = req.body;
        const userId = req.user.id;

        if (!order_id || !payment_type) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Order ID and payment type are required' });
        }

        // Validate order exists and belongs to user
        const order = await Order.findOne({
            where: { 
                id: order_id,
                user_id: userId
            },
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if payment already exists for this order
        const existingPayment = await Payment.findOne({
            where: { order_id },
            transaction
        });

        if (existingPayment && existingPayment.status === 'successful') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Payment already processed for this order' });
        }

        // For COD orders, simply mark as pending
        if (payment_type === 'cod') {
            if (order.payment_type !== 'cod') {
                await transaction.rollback();
                return res.status(400).json({ message: 'This order is not configured for COD payment' });
            }

            // Create or update payment record
            let payment;
            if (existingPayment) {
                payment = existingPayment;
                payment.payment_type = 'cod';
                payment.status = 'pending';
                payment.amount_paid = order.final_amount;
                await payment.save({ transaction });
            } else {
                payment = await Payment.create({
                    order_id,
                    user_id: userId,
                    payment_type: 'cod',
                    transaction_id: null,
                    amount_paid: order.final_amount,
                    status: 'pending',
                    payment_gateway: null
                }, { transaction });
            }

            // Update order status if needed
            if (order.payment_status !== 'pending') {
                order.payment_status = 'pending';
                await order.save({ transaction });
            }

            await transaction.commit();

            return res.json({
                message: 'COD payment set. Payment will be collected on delivery.',
                payment,
                order
            });
        }

        // For other payment types, verify payment details
        if (!payment_details) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Payment details are required' });
        }

        // This is where you would integrate with actual payment gateways
        // For demo purposes, we'll simulate payment processing
        
        // Generate a fake transaction ID
        const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 15);
        
        // Determine payment gateway based on type
        let paymentGateway = '';
        switch (payment_type) {
            case 'credit_card':
            case 'debit_card':
                paymentGateway = 'Stripe';
                break;
            case 'upi':
                paymentGateway = 'Razorpay';
                break;
            case 'wallet':
                paymentGateway = 'PayPal';
                break;
            default:
                paymentGateway = 'Other';
        }

        // Create or update payment record
        let payment;
        if (existingPayment) {
            payment = existingPayment;
            payment.payment_type = payment_type;
            payment.transaction_id = transactionId;
            payment.amount_paid = order.final_amount;
            payment.status = 'successful';
            payment.payment_gateway = paymentGateway;
            await payment.save({ transaction });
        } else {
            payment = await Payment.create({
                order_id,
                user_id: userId,
                payment_type,
                transaction_id: transactionId,
                amount_paid: order.final_amount,
                status: 'successful',
                payment_gateway: paymentGateway
            }, { transaction });
        }

        // Update order payment status
        order.payment_status = 'paid';
        await order.save({ transaction });

        await transaction.commit();

        res.json({
            message: 'Payment processed successfully',
            payment,
            order
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Failed to process payment', error: error.message });
    }
};

// Get payment status for an order
export const getPaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.user.id;

        // First check if the order exists and belongs to the user or is admin
        const order = await Order.findOne({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If not admin and not order owner, deny access
        if (req.user.role !== 'admin' && order.user_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const payment = await Payment.findOne({
            where: { order_id: orderId },
            order: [['createdAt', 'DESC']]
        });

        if (!payment) {
            return res.status(404).json({ message: 'No payment found for this order' });
        }

        res.json({ payment, orderStatus: order.status, paymentStatus: order.payment_status });
    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({ message: 'Failed to get payment status', error: error.message });
    }
};

// Process a refund
export const processRefund = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { payment_id, reason, amount } = req.body;
        const userId = req.user.id;

        if (!payment_id) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        // Only admin can process refunds
        if (req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Only admin can process refunds' });
        }

        const payment = await Payment.findByPk(payment_id, { transaction });
        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Can only refund successful payments
        if (payment.status !== 'successful') {
            await transaction.rollback();
            return res.status(400).json({ message: `Cannot refund ${payment.status} payments` });
        }

        // Update payment status
        payment.status = 'refunded';
        await payment.save({ transaction });

        // Also update the order's payment status
        const order = await Order.findByPk(payment.order_id, { transaction });
        if (order) {
            order.payment_status = 'refunded';
            await order.save({ transaction });
        }

        // Create a refund record
        // In a real app, you might have a separate Refund model
        // For simplicity, we're just creating a new payment record with negative amount
        const refundAmount = amount || payment.amount_paid;
        
        await Payment.create({
            order_id: payment.order_id,
            user_id: userId, // Admin who processed the refund
            payment_type: payment.payment_type,
            transaction_id: `REFUND-${payment.transaction_id || payment.id}`,
            amount_paid: -refundAmount, // Negative amount to indicate refund
            status: 'successful',
            payment_gateway: payment.payment_gateway,
            notes: reason || 'Refund processed'
        }, { transaction });

        await transaction.commit();

        res.json({
            message: 'Refund processed successfully',
            payment: {
                id: payment.id,
                status: payment.status,
                refundedAmount: refundAmount,
                reason: reason || 'Refund processed'
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error processing refund:', error);
        res.status(500).json({ message: 'Failed to process refund', error: error.message });
    }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
    try {
        const { status, payment_type, start_date, end_date, page = 1, limit = 10 } = req.query;
        
        // Build filter based on query parameters
        const filter = {};
        if (status) filter.status = status;
        if (payment_type) filter.payment_type = payment_type;
        
        // Date range filter
        if (start_date && end_date) {
            filter.createdAt = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        }

        // Pagination
        const offset = (page - 1) * limit;
        
        const payments = await Payment.findAndCountAll({
            where: filter,
            include: [
                { model: Order }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(payments.count / limit);

        res.json({
            payments: payments.rows,
            pagination: {
                total: payments.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting payments:', error);
        res.status(500).json({ message: 'Failed to get payments', error: error.message });
    }
}; 