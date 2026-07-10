import { SalesmanJourney } from '../model/salesmanJourneyModel.js';
import { SalesmanJourneyPoint } from '../model/salesmanJourneyPointModel.js';
import { SalesmanCheckin } from '../model/salesmanCheckinModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { Order } from '../model/orderModel.js';
import { Party } from '../model/partyModel.js';
import { OrderItem } from '../model/orderItemModel.js';
import { haversineDistanceM } from '../utils/geo.js';
import { Op } from 'sequelize';

const MANAGER_ROLES = ['admin', 'sales_manager', 'reports_manager'];

// Resolve the salesman for the request: the logged-in salesman's own profile, or
// (for managers) an explicit salesman_id from the body/query.
const resolveSalesman = async (req, explicitId) => {
    if (explicitId && MANAGER_ROLES.includes(req.user.role)) {
        return Salesman.findByPk(explicitId);
    }
    return Salesman.findOne({ where: { user_id: req.user.id } });
};

// Server-side "today" as YYYY-MM-DD.
const todayStr = () => new Date().toISOString().slice(0, 10);

// The [start, end] Date bounds for a journey_date (whole day).
const dayBounds = (dateStr) => [new Date(`${dateStr}T00:00:00`), new Date(`${dateStr}T23:59:59.999`)];

// Fetch the salesman's current open journey (most recent active).
const findActiveJourney = (salesmanId) =>
    SalesmanJourney.findOne({ where: { salesman_id: salesmanId, status: 'active' }, order: [['created_at', 'DESC']] });

// Start (or resume) the day journey.
export const startJourney = async (req, res) => {
    try {
        const { latitude, longitude, start_odometer, notes, journey_date, salesman_id } = req.body;
        const salesman = await resolveSalesman(req, salesman_id);
        if (!salesman) return res.status(403).json({ message: 'No salesman profile linked to this account' });

        // Resume an already-open journey instead of creating a duplicate.
        const existing = await findActiveJourney(salesman.id);
        if (existing) {
            return res.status(200).json({ message: 'Journey already active', journey: existing, resumed: true });
        }

        const now = new Date();
        const journey = await SalesmanJourney.create({
            salesman_id: salesman.id,
            journey_date: journey_date || todayStr(),
            status: 'active',
            start_time: now,
            start_latitude: latitude ?? null,
            start_longitude: longitude ?? null,
            end_latitude: latitude ?? null,
            end_longitude: longitude ?? null,
            start_odometer: start_odometer ?? null,
            total_distance_m: 0,
            notes: notes || null
        });

        if (latitude != null && longitude != null) {
            await SalesmanJourneyPoint.create({
                journey_id: journey.id,
                salesman_id: salesman.id,
                latitude, longitude,
                recorded_at: now,
                distance_from_prev_m: 0,
                event_type: 'start'
            });
        }

        res.status(201).json({ message: 'Journey started', journey });
    } catch (error) {
        console.error('Start journey error:', error);
        res.status(500).json({ message: 'Failed to start journey', error: error.message });
    }
};

// Append location breadcrumb(s) to the active journey. Accepts a single point in
// the body, or a batch via `points: [...]` for offline sync. Accumulates route
// distance from the last known point.
export const trackJourney = async (req, res) => {
    try {
        const salesman = await resolveSalesman(req, req.body.salesman_id);
        if (!salesman) return res.status(403).json({ message: 'No salesman profile linked to this account' });

        const journey = req.body.journey_id
            ? await SalesmanJourney.findByPk(req.body.journey_id)
            : await findActiveJourney(salesman.id);
        if (!journey || journey.status !== 'active') {
            return res.status(404).json({ message: 'No active journey. Start a journey first.' });
        }
        if (journey.salesman_id !== salesman.id && !MANAGER_ROLES.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not your journey' });
        }

        // Normalise to an array of incoming points.
        const incoming = Array.isArray(req.body.points) ? req.body.points : [req.body];
        const valid = incoming.filter((p) => p && p.latitude != null && p.longitude != null);
        if (valid.length === 0) return res.status(400).json({ message: 'latitude and longitude are required' });

        // Seed the "previous" coordinate from the last stored point.
        const last = await SalesmanJourneyPoint.findOne({
            where: { journey_id: journey.id },
            order: [['id', 'DESC']]
        });
        let prevLat = last ? last.latitude : journey.start_latitude;
        let prevLng = last ? last.longitude : journey.start_longitude;
        let added = 0;
        let addedDistance = 0;

        for (const p of valid) {
            let segment = null;
            if (prevLat != null && prevLng != null) {
                segment = haversineDistanceM(prevLat, prevLng, p.latitude, p.longitude);
            }
            await SalesmanJourneyPoint.create({
                journey_id: journey.id,
                salesman_id: salesman.id,
                latitude: p.latitude,
                longitude: p.longitude,
                accuracy_m: p.accuracy_m ?? p.accuracy ?? null,
                speed: p.speed ?? null,
                battery: p.battery ?? null,
                recorded_at: p.recorded_at ? new Date(p.recorded_at) : new Date(),
                distance_from_prev_m: segment != null ? Math.round(segment * 100) / 100 : null,
                event_type: p.event_type || 'track',
                reference_id: p.reference_id ?? null
            });
            if (segment != null) addedDistance += segment;
            prevLat = p.latitude;
            prevLng = p.longitude;
            added++;
        }

        // Update the running total + last-known position on the journey header.
        const newTotal = Math.round((parseFloat(journey.total_distance_m) + addedDistance) * 100) / 100;
        await journey.update({
            total_distance_m: newTotal,
            end_latitude: prevLat,
            end_longitude: prevLng
        });

        res.json({
            message: `Recorded ${added} point(s)`,
            points_added: added,
            total_distance_m: newTotal
        });
    } catch (error) {
        console.error('Track journey error:', error);
        res.status(500).json({ message: 'Failed to record journey point', error: error.message });
    }
};

// End the active journey.
export const endJourney = async (req, res) => {
    try {
        const { latitude, longitude, end_odometer, notes, salesman_id } = req.body;
        const salesman = await resolveSalesman(req, salesman_id);
        if (!salesman) return res.status(403).json({ message: 'No salesman profile linked to this account' });

        const journey = req.body.journey_id
            ? await SalesmanJourney.findByPk(req.body.journey_id)
            : await findActiveJourney(salesman.id);
        if (!journey || journey.status !== 'active') {
            return res.status(404).json({ message: 'No active journey to end' });
        }
        if (journey.salesman_id !== salesman.id && !MANAGER_ROLES.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not your journey' });
        }

        const now = new Date();
        let total = parseFloat(journey.total_distance_m) || 0;

        // Record a final point and close the distance to it.
        if (latitude != null && longitude != null) {
            const last = await SalesmanJourneyPoint.findOne({ where: { journey_id: journey.id }, order: [['id', 'DESC']] });
            const prevLat = last ? last.latitude : journey.start_latitude;
            const prevLng = last ? last.longitude : journey.start_longitude;
            let segment = null;
            if (prevLat != null && prevLng != null) segment = haversineDistanceM(prevLat, prevLng, latitude, longitude);
            await SalesmanJourneyPoint.create({
                journey_id: journey.id,
                salesman_id: salesman.id,
                latitude, longitude,
                recorded_at: now,
                distance_from_prev_m: segment != null ? Math.round(segment * 100) / 100 : null,
                event_type: 'end'
            });
            if (segment != null) total = Math.round((total + segment) * 100) / 100;
        }

        await journey.update({
            status: 'completed',
            end_time: now,
            end_latitude: latitude ?? journey.end_latitude,
            end_longitude: longitude ?? journey.end_longitude,
            end_odometer: end_odometer ?? null,
            total_distance_m: total,
            notes: notes ?? journey.notes
        });

        res.json({ message: 'Journey ended', journey });
    } catch (error) {
        console.error('End journey error:', error);
        res.status(500).json({ message: 'Failed to end journey', error: error.message });
    }
};

// The logged-in salesman's current active journey (with its points so far).
export const getActiveJourney = async (req, res) => {
    try {
        const salesman = await resolveSalesman(req, req.query.salesman_id);
        if (!salesman) return res.status(403).json({ message: 'No salesman profile linked to this account' });

        const journey = await findActiveJourney(salesman.id);
        if (!journey) return res.json({ active: false, journey: null });

        const points = await SalesmanJourneyPoint.findAll({ where: { journey_id: journey.id }, order: [['id', 'ASC']] });
        res.json({ active: true, journey, points });
    } catch (error) {
        console.error('Get active journey error:', error);
        res.status(500).json({ message: 'Failed to fetch active journey', error: error.message });
    }
};

// List journeys. Salesmen see their own; managers see all (filter by
// ?salesman_id=, ?date=, ?status=).
export const getJourneys = async (req, res) => {
    try {
        const where = {};
        if (MANAGER_ROLES.includes(req.user.role)) {
            if (req.query.salesman_id) where.salesman_id = req.query.salesman_id;
        } else {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (!salesman) return res.json([]);
            where.salesman_id = salesman.id;
        }
        if (req.query.date) where.journey_date = req.query.date;
        if (req.query.status) where.status = req.query.status;

        const journeys = await SalesmanJourney.findAll({
            where,
            include: [{ model: Salesman, attributes: ['id', 'name'] }],
            order: [['journey_date', 'DESC'], ['created_at', 'DESC']]
        });
        res.json(journeys);
    } catch (error) {
        console.error('Get journeys error:', error);
        res.status(500).json({ message: 'Failed to fetch journeys', error: error.message });
    }
};

// One journey with its full route (ordered points) plus that day's check-ins and
// visit orders, so the whole day can be plotted on a map.
export const getJourney = async (req, res) => {
    try {
        const journey = await SalesmanJourney.findByPk(req.params.id, {
            include: [{ model: Salesman, attributes: ['id', 'name'] }]
        });
        if (!journey) return res.status(404).json({ message: 'Journey not found' });

        // Access control: a salesman may only view their own journeys.
        if (!MANAGER_ROLES.includes(req.user.role)) {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (!salesman || salesman.id !== journey.salesman_id) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const points = await SalesmanJourneyPoint.findAll({
            where: { journey_id: journey.id },
            order: [['id', 'ASC']]
        });

        const [dayStart, dayEnd] = dayBounds(journey.journey_date);

        const checkins = await SalesmanCheckin.findAll({
            where: { salesman_id: journey.salesman_id, created_at: { [Op.between]: [dayStart, dayEnd] } },
            include: [{ model: Party, attributes: ['id', 'shop_name', 'latitude', 'longitude'] }],
            order: [['created_at', 'ASC']]
        });

        const orders = await Order.findAll({
            where: {
                salesman_id: journey.salesman_id,
                channel: 'b2b',
                created_at: { [Op.between]: [dayStart, dayEnd] }
            },
            include: [
                { model: Party, attributes: ['id', 'shop_name', 'latitude', 'longitude'] },
                { model: OrderItem, attributes: ['quantity'] }
            ],
            order: [['created_at', 'ASC']]
        });

        res.json({
            journey,
            points,
            timeline: {
                checkins,
                orders: orders.map((o) => ({
                    id: o.id,
                    order_number: o.order_number,
                    order_type: o.order_type,
                    party: o.Party ? o.Party.shop_name : null,
                    latitude: o.checkin_latitude ?? (o.Party ? o.Party.latitude : null),
                    longitude: o.checkin_longitude ?? (o.Party ? o.Party.longitude : null),
                    qty: (o.OrderItems || []).reduce((s, i) => s + (i.quantity || 0), 0),
                    amount: parseFloat(o.final_amount) || 0,
                    created_at: o.created_at
                }))
            },
            summary: {
                total_distance_m: parseFloat(journey.total_distance_m) || 0,
                total_distance_km: Math.round(((parseFloat(journey.total_distance_m) || 0) / 1000) * 100) / 100,
                points: points.length,
                checkins: checkins.length,
                orders: orders.length
            }
        });
    } catch (error) {
        console.error('Get journey error:', error);
        res.status(500).json({ message: 'Failed to fetch journey', error: error.message });
    }
};
