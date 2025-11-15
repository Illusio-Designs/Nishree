import { Order } from '../model/orderModel.js';
import { OrderItem } from '../model/orderItemModel.js';
import { OrderStatusHistory } from '../model/orderStatusHistoryModel.js';
import { Product } from '../model/productModel.js';
import { ProductVariation } from '../model/productVariationModel.js';
import { ShippingFee } from '../model/shippingFeeModel.js';
import { Payment } from '../model/paymentModel.js';
import { sequelize } from '../config/db.js';

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
            0.00;
    } catch (error) {
        console.error('Error calculating shipping fee:', error);
        return 0.00;
    }
};

// Create a guest order
export const createGuestOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { 
            guest_name, 
            guest_email, 
            guest_phone, 
            shipping_address, 
            items, 
            payment_type, 
            notes 
        } = req.body;

        // Validate required fields
        if (!guest_name || !guest_email || !guest_phone || !shipping_address || !items || !payment_type) {
            await transaction.rollback();
            return res.status(400).json({ 
                message: 'Guest name, email, phone, shipping address, items, and payment type are required' 
            });
        }

        // Validate shipping address structure
        if (!shipping_address.address || !shipping_address.city || !shipping_address.state || 
            !shipping_address.postal_code || !shipping_address.country) {
            await transaction.rollback();
            return res.status(400).json({ 
                message: 'Complete shipping address is required (address, city, state, postal_code, country)' 
            });
        }

        // Calculate total amount and validate items
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const { product_id, variation_id, quantity } = item;
            
            if (!product_id || !quantity) {
                await transaction.rollback();
                return res.status(400).json({ 
                    message: 'Product ID and quantity are required for each item' 
                });
            }

            const product = await Product.findByPk(product_id);
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ 
                    message: `Product with ID ${product_id} not found` 
                });
            }

            let price;
            if (variation_id) {
                const variation = await ProductVariation.findByPk(variation_id);
                if (!variation || variation.productId !== product_id) {
                    await transaction.rollback();
                    return res.status(404).json({ 
                        message: `Invalid variation for product ${product_id}` 
                    });
                }
                price = variation.price;
            } else {
                const variations = await ProductVariation.findOne({ where: { productId: product_id } });
                price = variations ? variations.price : 0;
                if (price === 0) {
                    await transaction.rollback();
                    return res.status(400).json({ 
                        message: `No price found for product ${product_id}` 
                    });
                }
            }

            const discount = 0;
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
        const shippingFee = 0;
        const finalAmount = totalAmount;

        // Create order with guest information
        const order = await Order.create({
            order_number: generateOrderNumber(),
            user_id: null, // No user for guest orders
            is_guest: true,
            guest_name,
            guest_email,
            guest_phone,
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

        // Create initial status history (no user_id for guest orders)
        await OrderStatusHistory.create({
            order_id: order.id,
            status: 'pending',
            updated_by: null, // No user for guest orders
        }, { transaction });

        // If payment type is not COD, create a payment record
        if (payment_type !== 'cod') {
            await Payment.create({
                order_id: order.id,
                user_id: null, // No user for guest orders
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
                { model: OrderStatusHistory, order: [['updated_at', 'DESC']] }
            ]
        });

        res.status(201).json({
            message: 'Guest order created successfully',
            order: {
                ...createdOrder.toJSON(),
                shipping_address
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating guest order:', error);
        res.status(500).json({ 
            message: 'Failed to create guest order', 
            error: error.message 
        });
    }
};
