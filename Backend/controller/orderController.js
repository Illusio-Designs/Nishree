import { Order } from '../model/orderModel.js';
import { OrderItem } from '../model/orderItemModel.js';
import { OrderStatusHistory } from '../model/orderStatusHistoryModel.js';
import { Product } from '../model/productModel.js';
import { ProductVariation } from '../model/productVariationModel.js';
import { ProductImage } from '../model/productImageModel.js';
import { ShippingAddress } from '../model/shippingAddressModel.js';
import { ShippingFee } from '../model/shippingFeeModel.js';
import { Payment } from '../model/paymentModel.js';
import { User } from '../model/userModel.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
// import { createNotification } from './notificationController.js';

// Generate unique order number
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

// Calculate shipping fee based on payment type
const calculateShippingFee = async (paymentType) => {
    try {
        const orderType = paymentType === 'cod' ? 'cod' : 'prepaid';
        const shippingFee = await ShippingFee.findOne({ where: { orderType: orderType } });
        return shippingFee ? 
            (parseFloat(shippingFee.fee) + parseFloat(shippingFee.weightBasedFee) + parseFloat(shippingFee.locationBasedFee)) : 
            0.00; // Default to 0 for prepaid orders
    } catch (error) {
        console.error('Error calculating shipping fee:', error);
        return 0.00; // Default to 0 if calculation fails
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { shipping_address_id, items, payment_type, notes } = req.body;
        const userId = req.user.id;

        if (!shipping_address_id || !items || !payment_type) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Shipping address, items, and payment type are required' });
        }

        // Validate shipping address belongs to user
        const shippingAddress = await ShippingAddress.findOne({
            where: { id: shipping_address_id, user_id: userId }
        });

        if (!shippingAddress) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Shipping address not found' });
        }

        // Calculate total amount and validate items
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const { product_id, variation_id, quantity } = item;
            
            if (!product_id || !quantity) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Product ID and quantity are required for each item' });
            }

            const product = await Product.findByPk(product_id);
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ message: `Product with ID ${product_id} not found` });
            }

            let price;
            if (variation_id) {
                const variation = await ProductVariation.findByPk(variation_id);
                if (!variation || variation.productId !== product_id) {
                    await transaction.rollback();
                    return res.status(404).json({ message: `Invalid variation for product ${product_id}` });
                }
                price = variation.price;
            } else {
                // For products without variations, you need to have a base price in the product model
                // This is just a placeholder logic
                const variations = await ProductVariation.findOne({ where: { productId: product_id } });
                price = variations ? variations.price : 0;
                if (price === 0) {
                    await transaction.rollback();
                    return res.status(400).json({ message: `No price found for product ${product_id}` });
                }
            }

            // Apply discount if exists (simplified version)
            let discount = 0;
            // You would add discount calculation logic here
            
            const subtotal = (price * quantity) - discount;
            totalAmount += subtotal;

            validatedItems.push({
                product_id,
                variation_id: variation_id || null,
                quantity,
                price,
                discount,
                subtotal
            });
        }

        // No shipping fee for prepaid orders
        const shippingFee = payment_type === 'cod' ? await calculateShippingFee(payment_type) : 0;
        const finalAmount = totalAmount + shippingFee;

        // Create order
        const order = await Order.create({
            order_number: generateOrderNumber(),
            user_id: userId,
            total_amount: totalAmount,
            shipping_fee: shippingFee,
            final_amount: finalAmount,
            payment_type,
            payment_status: payment_type === 'cod' ? 'pending' : 'pending',
            status: 'pending',
            notes: notes || null,
        }, { transaction });

        // Create order items
        for (const item of validatedItems) {
            await OrderItem.create({
                order_id: order.id,
                ...item
            }, { transaction });
        }

        // Create initial status history
        await OrderStatusHistory.create({
            order_id: order.id,
            status: 'pending',
            updated_by: userId,
        }, { transaction });

        // If payment type is not COD, create a payment record
        if (payment_type !== 'cod') {
            await Payment.create({
                order_id: order.id,
                user_id: userId,
                payment_type,
                amount_paid: finalAmount,
                status: 'pending'
            }, { transaction });
        }

        await transaction.commit();

        // Fetch the created order with its items
        const createdOrder = await Order.findByPk(order.id, {
            include: [
                { 
                    model: OrderItem, 
                    include: [{ model: Product, as: 'Product' }] 
                },
                { model: User, attributes: ['id', 'username', 'email'] },
                { model: OrderStatusHistory, order: [['updated_at', 'DESC']] }
            ]
        });

        res.status(201).json({
            message: 'Order created successfully',
            order: createdOrder
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        const { status, payment_status, start_date, end_date, page = 1, limit = 10 } = req.query;
        
        // Build filter based on query parameters
        const filter = {};
        if (status) filter.status = status;
        if (payment_status) filter.payment_status = payment_status;
        
        // Date range filter
        if (start_date && end_date) {
            filter.createdAt = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        }

        // Pagination
        const offset = (page - 1) * limit;
        
        const orders = await Order.findAndCountAll({
            where: filter,
            include: [
                { model: User, attributes: ['id', 'username', 'email'] },
                { 
                    model: OrderItem, 
                    include: [
                        { 
                            model: Product, 
                            as: 'Product',
                            include: [
                                { 
                                    model: ProductImage, 
                                    as: 'ProductImages',
                                    limit: 1
                                }
                            ]
                        }
                    ] 
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(orders.count / limit);

        res.json({
            orders: orders.rows,
            pagination: {
                total: orders.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Failed to get orders', error: error.message });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;
        
        // Build filter
        const filter = { user_id: userId };
        if (status) filter.status = status;
        
        // Pagination
        const offset = (page - 1) * limit;

        const orders = await Order.findAndCountAll({
            where: filter,
            include: [
                { 
                    model: OrderItem, 
                    include: [
                        { 
                            model: Product, 
                            as: 'Product',
                            include: [
                                { 
                                    model: ProductImage, 
                                    as: 'ProductImages',
                                    limit: 1
                                }
                            ]
                        }
                    ] 
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(orders.count / limit);
        
        res.json({
            orders: orders.rows,
            pagination: {
                total: orders.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).json({ message: 'Failed to get orders', error: error.message });
    }
};

// Get Order by ID
export const getOrder = async (req, res) => {
    try {
        const { id } = req.params; // Assuming the order ID is passed as a URL parameter

        const order = await Order.findByPk(id, {
            include: [
                { model: OrderItem },
                { model: User }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;
        
        if (!status) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Status is required' });
        }
        
        // Only admin can update status
        if (req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Only admin can update order status' });
        }
        
        const order = await Order.findByPk(orderId);
        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Cannot change status if already delivered or cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            await transaction.rollback();
            return res.status(400).json({ message: `Cannot change status of ${order.status} orders` });
        }
        
        // Update order status
        order.status = status;
        await order.save({ transaction });
        
        // Create status history entry
        await OrderStatusHistory.create({
            order_id: order.id,
            status,
            updated_by: userId
        }, { transaction });

        // If status is 'cancelled' and payment is 'paid', create refund record
        if (status === 'cancelled' && order.payment_status === 'paid') {
            const payment = await Payment.findOne({ 
                where: { order_id: order.id, status: 'successful' }
            });
            
            if (payment) {
                payment.status = 'refunded';
                await payment.save({ transaction });
                
                order.payment_status = 'refunded';
                await order.save({ transaction });
            }
        }
        
        await transaction.commit();
        
        // Get updated order
        const updatedOrder = await Order.findByPk(orderId, {
            include: [
                { 
                    model: OrderItem, 
                    include: [{ model: Product, as: 'Product' }] 
                },
                { model: User, attributes: ['id', 'username', 'email'] },
                { model: OrderStatusHistory, order: [['updated_at', 'DESC']] },
                { model: Payment }
            ]
        });
        
        // Create notification for user - Temporarily disabled
        // const statusMessages = {
        //     'pending': 'Your order is pending confirmation',
        //     'processing': 'Your order is being processed',
        //     'shipped': 'Your order has been shipped',
        //     'delivered': 'Your order has been delivered',
        //     'cancelled': 'Your order has been cancelled'
        // };
        
        // await createNotification(
        //     order.user_id,
        //     order.id,
        //     `order_${status}`,
        //     `Order ${order.order_number} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        //     statusMessages[status] || `Your order status has been updated to ${status}`
        // );
        
        res.json({
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
};

// Cancel order (by user)
export const cancelOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const orderId = req.params.id;
        const { reason } = req.body;
        const userId = req.user.id;
        
        const order = await Order.findByPk(orderId);
        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Verify order belongs to user
        if (order.user_id !== userId) {
            await transaction.rollback();
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Cannot cancel if already delivered or cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            await transaction.rollback();
            return res.status(400).json({ message: `Cannot cancel ${order.status} orders` });
        }
        
        // Can only cancel pending or processing orders
        if (order.status !== 'pending' && order.status !== 'processing') {
            await transaction.rollback();
            return res.status(400).json({ message: `Cannot cancel orders in ${order.status} status` });
        }
        
        // Update order status
        order.status = 'cancelled';
        await order.save({ transaction });
        
        // Create status history entry with user's reason
        await OrderStatusHistory.create({
            order_id: order.id,
            status: 'cancelled',
            updated_by: userId,
            notes: reason
        }, { transaction });
        
        // If payment is 'paid', mark for refund
        if (order.payment_status === 'paid') {
            const payment = await Payment.findOne({ 
                where: { order_id: order.id, status: 'successful' }
            });
            
            if (payment) {
                payment.status = 'refunded';
                await payment.save({ transaction });
                
                order.payment_status = 'refunded';
                await order.save({ transaction });
            }
        }
        
        await transaction.commit();
        
        res.json({
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.count();
        const totalRevenue = await Order.sum('final_amount');
        const totalPendingOrders = await Order.count({ where: { status: 'pending' } });
        const totalDeliveredOrders = await Order.count({ where: { status: 'delivered' } });
        const totalCancelledOrders = await Order.count({ where: { status: 'cancelled' } });

        res.json({
            totalOrders,
            totalRevenue,
            totalPendingOrders,
            totalDeliveredOrders,
            totalCancelledOrders
        });
    } catch (error) {
        console.error('Error fetching order statistics:', error);
        res.status(500).json({ message: 'Failed to fetch order statistics', error: error.message });
    }
};


// ==================== SHIPROCKET INTEGRATION ====================

import axios from 'axios';
import { Shipment } from '../model/shipmentModel.js';

const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

// Get Shiprocket token
const getShiprocketToken = async () => {
    try {
        // Check if token exists and is not expired
        if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
            return shiprocketToken;
        }

        const email = process.env.SHIPROCKET_EMAIL;
        const password = process.env.SHIPROCKET_PASSWORD;

        if (!email || !password) {
            throw new Error('Shiprocket credentials not configured');
        }

        const response = await axios.post(`${SHIPROCKET_API}/auth/login`, { email, password });
        shiprocketToken = response.data.token;
        tokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

        return shiprocketToken;
    } catch (error) {
        console.error('Shiprocket login error:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Shiprocket');
    }
};

// Sync orders with Shiprocket
export const syncOrdersWithShiprocket = async (req, res) => {
    try {
        // Get all paid orders without shipments
        const orders = await Order.findAll({
            where: { payment_status: 'paid' },
            include: [
                { model: OrderItem, include: [{ model: Product, as: 'Product' }] },
                { model: User },
                { model: ShippingAddress },
                { model: Shipment }
            ]
        });

        const ordersToSync = orders.filter(order => !order.Shipment);

        if (ordersToSync.length === 0) {
            return res.json({
                success: true,
                message: 'All orders are already synced with Shiprocket',
                synced: 0
            });
        }

        const token = await getShiprocketToken();
        let syncedCount = 0;
        let failedCount = 0;
        const errors = [];

        for (const order of ordersToSync) {
            try {
                const shiprocketOrderData = {
                    order_id: order.order_number,
                    order_date: order.createdAt,
                    pickup_location: "Primary",
                    billing_customer_name: order.User?.username || 'Customer',
                    billing_last_name: "",
                    billing_address: order.ShippingAddress?.address || "",
                    billing_city: order.ShippingAddress?.city || "",
                    billing_pincode: order.ShippingAddress?.postal_code || "",
                    billing_state: order.ShippingAddress?.state || "",
                    billing_country: order.ShippingAddress?.country || "India",
                    billing_email: order.User?.email || "",
                    billing_phone: order.ShippingAddress?.phone_number || "",
                    shipping_is_billing: true,
                    order_items: order.OrderItems.map(item => ({
                        name: item.Product?.name || 'Product',
                        sku: item.Product?.id?.toString() || 'SKU',
                        units: item.quantity,
                        selling_price: parseFloat(item.price),
                        discount: 0,
                        tax: 0
                    })),
                    payment_method: order.payment_type === 'cod' ? 'COD' : 'Prepaid',
                    sub_total: parseFloat(order.total_amount),
                    length: 10,
                    breadth: 10,
                    height: 10,
                    weight: 0.5
                };

                const response = await axios.post(
                    `${SHIPROCKET_API}/orders/create/adhoc`,
                    shiprocketOrderData,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );

                await Shipment.create({
                    order_id: order.id,
                    shiprocket_order_id: response.data.order_id,
                    shipment_id: response.data.shipment_id,
                    status: 'created'
                });

                syncedCount++;
            } catch (error) {
                console.error(`Failed to sync order ${order.order_number}:`, error.message);
                failedCount++;
                errors.push({ order_number: order.order_number, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Synced ${syncedCount} orders with Shiprocket`,
            synced: syncedCount,
            failed: failedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Sync orders error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Failed to sync orders with Shiprocket' 
        });
    }
};
