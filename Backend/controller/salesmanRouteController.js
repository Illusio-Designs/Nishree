import { Op } from 'sequelize';
import { SalesmanRouteStop } from '../model/salesmanRouteStopModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { SalesmanZone } from '../model/salesmanZoneModel.js';
import { Party } from '../model/partyModel.js';
import { SalesmanCheckin } from '../model/salesmanCheckinModel.js';
import { Order } from '../model/orderModel.js';

const MANAGER_ROLES = ['admin', 'sales_manager', 'reports_manager'];

const resolveSalesman = async (req, explicitId) => {
    if (explicitId && MANAGER_ROLES.includes(req.user.role)) return Salesman.findByPk(explicitId);
    return Salesman.findOne({ where: { user_id: req.user.id } });
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const dayBounds = (dateStr) => [new Date(`${dateStr}T00:00:00`), new Date(`${dateStr}T23:59:59.999`)];

/**
 * The salesman's daily beat route, auto-generated from the parties in their
 * zone(s). Stops are created once per (salesman, party, date) and auto-marked
 * "visited" when a check-in or visit order exists for that party that day.
 */
export const getMyRoute = async (req, res) => {
    try {
        const salesman = await resolveSalesman(req, req.query.salesman_id);
        if (!salesman) return res.status(403).json({ message: 'No salesman profile linked to this account' });

        const date = req.query.date || todayStr();

        // Parties in the salesman's assigned zones.
        const zoneRows = await SalesmanZone.findAll({ where: { salesman_id: salesman.id } });
        const zoneIds = zoneRows.map((z) => z.zone_id);

        let parties = [];
        if (zoneIds.length) {
            parties = await Party.findAll({
                where: { zone_id: { [Op.in]: zoneIds }, status: 'active' },
                order: [['shop_name', 'ASC']]
            });
        }

        // Ensure a stop exists for each party on this date.
        let seq = 1;
        for (const party of parties) {
            await SalesmanRouteStop.findOrCreate({
                where: { salesman_id: salesman.id, party_id: party.id, route_date: date },
                defaults: { salesman_id: salesman.id, party_id: party.id, route_date: date, sequence: seq, status: 'pending' }
            });
            seq += 1;
        }

        // Auto-resolve "visited" from check-ins / visit orders that day.
        const [dayStart, dayEnd] = dayBounds(date);
        const pendingStops = await SalesmanRouteStop.findAll({
            where: { salesman_id: salesman.id, route_date: date, status: 'pending' }
        });
        for (const stop of pendingStops) {
            const checkin = await SalesmanCheckin.findOne({
                where: { salesman_id: salesman.id, party_id: stop.party_id, created_at: { [Op.between]: [dayStart, dayEnd] } }
            });
            const order = await Order.findOne({
                where: { salesman_id: salesman.id, party_id: stop.party_id, order_type: 'visit_order', created_at: { [Op.between]: [dayStart, dayEnd] } }
            });
            if (checkin || order) {
                await stop.update({ status: 'visited', visited_at: checkin?.created_at || order?.created_at || new Date() });
            }
        }

        const stops = await SalesmanRouteStop.findAll({
            where: { salesman_id: salesman.id, route_date: date },
            include: [{ model: Party, attributes: ['id', 'shop_name', 'address', 'city', 'phone', 'latitude', 'longitude'] }],
            order: [['sequence', 'ASC']]
        });

        const summary = {
            total: stops.length,
            visited: stops.filter((s) => s.status === 'visited').length,
            skipped: stops.filter((s) => s.status === 'skipped').length,
            pending: stops.filter((s) => s.status === 'pending').length
        };

        res.json({ date, salesman_id: salesman.id, zone_ids: zoneIds, summary, stops });
    } catch (error) {
        console.error('Get my route error:', error);
        res.status(500).json({ message: 'Failed to build route', error: error.message });
    }
};

// Update a stop's working state (visited / skipped / pending).
export const setStopStatus = async (req, res) => {
    try {
        const { status, skip_reason } = req.body;
        if (!['pending', 'visited', 'skipped'].includes(status)) {
            return res.status(400).json({ message: 'status must be pending, visited or skipped' });
        }
        const stop = await SalesmanRouteStop.findByPk(req.params.id);
        if (!stop) return res.status(404).json({ message: 'Stop not found' });

        // A salesman may only update their own stops; managers may update any.
        if (!MANAGER_ROLES.includes(req.user.role)) {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (!salesman || salesman.id !== stop.salesman_id) {
                return res.status(403).json({ message: 'Not your route stop' });
            }
        }

        await stop.update({
            status,
            skip_reason: status === 'skipped' ? (skip_reason || null) : null,
            visited_at: status === 'visited' ? (stop.visited_at || new Date()) : null
        });
        res.json({ message: `Stop marked ${status}`, stop });
    } catch (error) {
        console.error('Set stop status error:', error);
        res.status(500).json({ message: 'Failed to update stop', error: error.message });
    }
};

// Admin/manager view of route stops (filter by ?date= and ?salesman_id=).
export const getRoutes = async (req, res) => {
    try {
        const where = {};
        if (req.query.date) where.route_date = req.query.date;
        if (req.query.salesman_id) where.salesman_id = req.query.salesman_id;
        const stops = await SalesmanRouteStop.findAll({
            where,
            include: [
                { model: Salesman, attributes: ['id', 'name'] },
                { model: Party, attributes: ['id', 'shop_name', 'city'] }
            ],
            order: [['route_date', 'DESC'], ['sequence', 'ASC']]
        });
        res.json(stops);
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({ message: 'Failed to fetch routes', error: error.message });
    }
};
