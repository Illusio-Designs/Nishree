import { Order } from '../model/orderModel.js';
import { OrderItem } from '../model/orderItemModel.js';
import { SalesmanTarget } from '../model/salesmanTargetModel.js';
import { SalesmanCheckin } from '../model/salesmanCheckinModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { Party } from '../model/partyModel.js';
import { Op } from 'sequelize';
import { evaluateGeofence } from '../utils/geo.js';

// Resolve which salesman the report is for. Managers may pass ?salesman_id=; a
// salesman is scoped to their own profile.
const resolveScope = async (req) => {
    const isManager = ['admin', 'sales_manager', 'reports_manager'].includes(req.user.role);
    if (isManager) {
        return { salesmanId: req.query.salesman_id ? parseInt(req.query.salesman_id, 10) : null, isManager };
    }
    const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
    return { salesmanId: salesman ? salesman.id : -1, isManager };
};

// Target Achievement — target vs achieved for each target in scope.
export const getTargetAchievement = async (req, res) => {
    try {
        const { salesmanId } = await resolveScope(req);

        const targetWhere = {};
        if (salesmanId != null) targetWhere.salesman_id = salesmanId;
        const targets = await SalesmanTarget.findAll({
            where: targetWhere,
            include: [{ model: Salesman, attributes: ['id', 'name'] }],
            order: [['start_date', 'DESC']]
        });

        const rows = [];
        for (const target of targets) {
            const orderWhere = {
                channel: 'b2b',
                salesman_id: target.salesman_id,
                status: { [Op.ne]: 'cancelled' },
                created_at: { [Op.between]: [new Date(target.start_date), new Date(`${target.end_date}T23:59:59`)] }
            };
            if (target.order_type) orderWhere.order_type = target.order_type;

            const achieved = (await Order.sum('final_amount', { where: orderWhere })) || 0;
            const targetAmount = parseFloat(target.target_amount) || 0;
            const percent = targetAmount > 0 ? Math.round((achieved / targetAmount) * 100) : 0;

            rows.push({
                target_id: target.id,
                salesman: target.Salesman ? target.Salesman.name : null,
                salesman_id: target.salesman_id,
                target_amount: targetAmount,
                achieved: Math.round(achieved * 100) / 100,
                percent,
                start_date: target.start_date,
                end_date: target.end_date,
                order_type: target.order_type,
                description: target.description
            });
        }

        const summary = {
            total_target: rows.reduce((s, r) => s + r.target_amount, 0),
            total_achieved: rows.reduce((s, r) => s + r.achieved, 0),
            count: rows.length
        };
        summary.overall_percent = summary.total_target > 0
            ? Math.round((summary.total_achieved / summary.total_target) * 100)
            : 0;

        res.json({ summary, rows });
    } catch (error) {
        console.error('Target achievement error:', error);
        res.status(500).json({ message: 'Failed to build target achievement report', error: error.message });
    }
};

// Visit Report — stand-alone check-ins merged with on-site visit orders. Each row
// carries a location "match" percentage (proximity to the party address).
export const getVisitReport = async (req, res) => {
    try {
        const { salesmanId } = await resolveScope(req);
        if (salesmanId === -1) return res.json({ rows: [] });

        const checkinWhere = {};
        const orderWhere = { channel: 'b2b', order_type: 'visit_order' };
        if (salesmanId != null) {
            checkinWhere.salesman_id = salesmanId;
            orderWhere.salesman_id = salesmanId;
        }

        const checkins = await SalesmanCheckin.findAll({
            where: checkinWhere,
            include: [{ model: Party, attributes: ['id', 'shop_name', 'latitude', 'longitude'] }],
            order: [['created_at', 'DESC']]
        });

        const visitOrders = await Order.findAll({
            where: orderWhere,
            include: [
                { model: Party, attributes: ['id', 'shop_name', 'latitude', 'longitude'] },
                { model: OrderItem, attributes: ['quantity'] }
            ],
            order: [['created_at', 'DESC']]
        });

        const rows = [];

        for (const c of checkins) {
            const fence = c.Party
                ? evaluateGeofence(c.Party.latitude, c.Party.longitude, c.latitude, c.longitude)
                : { distanceM: c.distance_m, matchPercent: null };
            rows.push({
                type: 'Visit',
                date: c.created_at,
                party: c.Party ? c.Party.shop_name : null,
                qty: null,
                amount: null,
                reason: c.reason,
                distance_m: c.distance_m ?? fence.distanceM,
                match_percent: fence.matchPercent
            });
        }

        for (const o of visitOrders) {
            const fence = o.Party
                ? evaluateGeofence(o.Party.latitude, o.Party.longitude, o.checkin_latitude, o.checkin_longitude)
                : { distanceM: o.location_distance_m, matchPercent: null };
            const qty = (o.OrderItems || []).reduce((s, i) => s + (i.quantity || 0), 0);
            rows.push({
                type: 'Order',
                date: o.created_at,
                party: o.Party ? o.Party.shop_name : null,
                qty,
                amount: parseFloat(o.final_amount) || 0,
                reason: null,
                distance_m: o.location_distance_m ?? fence.distanceM,
                match_percent: fence.matchPercent
            });
        }

        rows.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ rows, count: rows.length });
    } catch (error) {
        console.error('Visit report error:', error);
        res.status(500).json({ message: 'Failed to build visit report', error: error.message });
    }
};
