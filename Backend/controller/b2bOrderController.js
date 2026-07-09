import { Order } from '../model/orderModel.js';
import { OrderItem } from '../model/orderItemModel.js';
import { OrderStatusHistory } from '../model/orderStatusHistoryModel.js';
import { Product } from '../model/productModel.js';
import { ProductVariation } from '../model/productVariationModel.js';
import { Party } from '../model/partyModel.js';
import { Distributor } from '../model/distributorModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { Event } from '../model/eventModel.js';
import { Offer } from '../model/offerModel.js';
import { sequelize } from '../config/db.js';
import { resolveWholesalePrice } from '../utils/b2bPricing.js';
import { evaluateGeofence, getGeofenceRadiusM } from '../utils/geo.js';
import { geocodeAddress } from '../utils/geocode.js';

const B2B_ORDER_TYPES = ['party_order', 'distributor_order', 'event_order', 'visit_order', 'whatsapp_order'];

const generateOrderNumber = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `B2B-${y}${m}${d}-${random}`;
};

// Compute the discount and a snapshot for an applied offer.
const applyOffer = (offer, subtotal) => {
    if (!offer || offer.status !== 'active') return { discount: 0, snapshot: null };

    const now = new Date();
    if (offer.start_date && new Date(offer.start_date) > now) return { discount: 0, snapshot: null };
    if (offer.end_date && new Date(offer.end_date) < now) return { discount: 0, snapshot: null };
    if (offer.min_order_amount && subtotal < parseFloat(offer.min_order_amount)) return { discount: 0, snapshot: null };

    let discount = offer.type === 'percentage'
        ? (subtotal * parseFloat(offer.value)) / 100
        : parseFloat(offer.value);

    if (offer.max_discount != null) discount = Math.min(discount, parseFloat(offer.max_discount));
    discount = Math.min(discount, subtotal);
    discount = Math.round(discount * 100) / 100;

    // Snapshot so later edits to the offer don't rewrite order history.
    const snapshot = { id: offer.id, name: offer.name, code: offer.code, type: offer.type, value: offer.value, discount };
    return { discount, snapshot };
};

// Create a B2B (wholesale) order. Reuses the unified orders table with channel='b2b'.
export const createB2BOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            order_type,
            party_id, distributor_id, event_id,
            items, notes, offer_id,
            payment_type = 'credit',
            checkin_latitude, checkin_longitude
        } = req.body;

        if (!B2B_ORDER_TYPES.includes(order_type)) {
            await transaction.rollback();
            return res.status(400).json({ message: `order_type must be one of: ${B2B_ORDER_TYPES.join(', ')}` });
        }
        if (!Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'At least one order item is required' });
        }

        // Resolve the salesman placing the order (from the linked account, or an
        // explicit salesman_id for admins/managers).
        let salesmanRecord = null;
        if (req.body.salesman_id && ['admin', 'sales_manager', 'order_manager'].includes(req.user.role)) {
            salesmanRecord = await Salesman.findByPk(req.body.salesman_id);
        } else {
            salesmanRecord = await Salesman.findOne({ where: { user_id: req.user.id } });
        }

        // Validate referenced counterparties.
        let party = null;
        if (party_id) {
            party = await Party.findByPk(party_id);
            if (!party) { await transaction.rollback(); return res.status(404).json({ message: 'Party not found' }); }
        }
        if (distributor_id) {
            const distributor = await Distributor.findByPk(distributor_id);
            if (!distributor) { await transaction.rollback(); return res.status(404).json({ message: 'Distributor not found' }); }
        }
        if (event_id) {
            const event = await Event.findByPk(event_id);
            if (!event) { await transaction.rollback(); return res.status(404).json({ message: 'Event not found' }); }
        }

        // A visit order is placed on-site at a party — verify the geofence.
        let locationDistanceM = null;
        if (order_type === 'visit_order') {
            if (!party) { await transaction.rollback(); return res.status(400).json({ message: 'party_id is required for a visit order' }); }

            if ((party.latitude == null || party.longitude == null) && party.address) {
                const coords = await geocodeAddress({ address: party.address, city: party.city, state: party.state, pincode: party.pincode });
                if (coords) await party.update({ latitude: coords.latitude, longitude: coords.longitude });
            }

            const fence = evaluateGeofence(party.latitude, party.longitude, checkin_latitude, checkin_longitude);
            locationDistanceM = fence.distanceM;
            if (!fence.withinFence) {
                await transaction.rollback();
                return res.status(403).json({
                    message: `Visit order rejected: you are ${fence.distanceM != null ? Math.round(fence.distanceM) + 'm' : 'too far'} from the party (geofence ${getGeofenceRadiusM()}m).`,
                    distance_m: fence.distanceM,
                    geofence_radius_m: getGeofenceRadiusM()
                });
            }
        }

        // Price each line at its wholesale/tiered price.
        let subtotal = 0;
        const validatedItems = [];
        for (const item of items) {
            const { product_id, variation_id, quantity } = item;
            if (!product_id || !quantity) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Each item needs product_id and quantity' });
            }
            const product = await Product.findByPk(product_id);
            if (!product) { await transaction.rollback(); return res.status(404).json({ message: `Product ${product_id} not found` }); }

            let variation;
            if (variation_id) {
                variation = await ProductVariation.findByPk(variation_id);
                if (!variation || variation.productId !== product_id) {
                    await transaction.rollback();
                    return res.status(404).json({ message: `Invalid variation for product ${product_id}` });
                }
            } else {
                variation = await ProductVariation.findOne({ where: { productId: product_id } });
            }
            if (!variation) { await transaction.rollback(); return res.status(400).json({ message: `No price found for product ${product_id}` }); }

            const price = resolveWholesalePrice(variation, quantity);
            const lineSubtotal = Math.round(price * quantity * 100) / 100;
            subtotal += lineSubtotal;
            validatedItems.push({ product_id, variation_id: variation.id, quantity, price, discount: 0, subtotal: lineSubtotal });
        }
        subtotal = Math.round(subtotal * 100) / 100;

        // Apply an offer (snapshotted onto the order).
        let discountTotal = 0;
        let appliedOffer = null;
        if (offer_id) {
            const offer = await Offer.findByPk(offer_id);
            const result = applyOffer(offer, subtotal);
            discountTotal = result.discount;
            appliedOffer = result.snapshot;
        }

        const finalAmount = Math.round((subtotal - discountTotal) * 100) / 100;

        const order = await Order.create({
            order_number: generateOrderNumber(),
            user_id: req.user.id,
            channel: 'b2b',
            order_type,
            party_id: party_id || null,
            distributor_id: distributor_id || null,
            salesman_id: salesmanRecord ? salesmanRecord.id : null,
            event_id: event_id || null,
            total_amount: subtotal,
            subtotal,
            discount_total: discountTotal,
            applied_offer: appliedOffer,
            shipping_fee: 0,
            final_amount: finalAmount,
            payment_type,
            payment_status: 'pending',
            status: 'pending',
            notes: notes || null,
            checkin_latitude: checkin_latitude ?? null,
            checkin_longitude: checkin_longitude ?? null,
            location_distance_m: locationDistanceM
        }, { transaction });

        for (const item of validatedItems) {
            await OrderItem.create({ order_id: order.id, ...item }, { transaction });
        }

        await OrderStatusHistory.create({ order_id: order.id, status: 'pending', updated_by: req.user.id }, { transaction });
        await transaction.commit();

        const created = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, include: [{ model: Product, as: 'Product' }] }]
        });
        res.status(201).json({ message: 'B2B order created successfully', order: created });
    } catch (error) {
        await transaction.rollback();
        console.error('Create B2B order error:', error);
        res.status(500).json({ message: 'Failed to create B2B order', error: error.message });
    }
};

// List all B2B orders (admin / managers), with optional filters.
export const getB2BOrders = async (req, res) => {
    try {
        const where = { channel: 'b2b' };
        for (const key of ['order_type', 'party_id', 'distributor_id', 'salesman_id', 'event_id', 'status']) {
            if (req.query[key]) where[key] = req.query[key];
        }
        const orders = await Order.findAll({
            where,
            include: [
                { model: Party, attributes: ['id', 'shop_name'] },
                { model: Distributor, attributes: ['id', 'name'] },
                { model: Salesman, attributes: ['id', 'name'] },
                { model: Event, attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Get B2B orders error:', error);
        res.status(500).json({ message: 'Failed to fetch B2B orders', error: error.message });
    }
};

// Self-scoped B2B orders for portal roles (party / distributor / salesman).
export const getMyB2BOrders = async (req, res) => {
    try {
        const where = { channel: 'b2b' };
        const role = req.user.role;

        if (role === 'party') {
            const party = await Party.findOne({ where: { user_id: req.user.id } });
            if (!party) return res.json([]);
            where.party_id = party.id;
        } else if (role === 'distributor') {
            const distributor = await Distributor.findOne({ where: { user_id: req.user.id } });
            if (!distributor) return res.json([]);
            where.distributor_id = distributor.id;
        } else if (role === 'salesman') {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (!salesman) return res.json([]);
            where.salesman_id = salesman.id;
        } else {
            // Fall back to orders this user placed.
            where.user_id = req.user.id;
        }

        const orders = await Order.findAll({
            where,
            include: [{ model: OrderItem, include: [{ model: Product, as: 'Product' }] }],
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Get my B2B orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};
