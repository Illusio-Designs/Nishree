import { SalesmanCheckin } from '../model/salesmanCheckinModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { Party } from '../model/partyModel.js';
import { evaluateGeofence, getGeofenceRadiusM } from '../utils/geo.js';
import { geocodeAddress } from '../utils/geocode.js';

// Resolve the salesman making the request: either the logged-in salesman's own
// record, or (for admins/managers) an explicit salesman_id in the body.
const resolveSalesman = async (req) => {
    if (req.body.salesman_id && ['admin', 'sales_manager'].includes(req.user.role)) {
        return Salesman.findByPk(req.body.salesman_id);
    }
    return Salesman.findOne({ where: { user_id: req.user.id } });
};

// Record a check-in (a Visit) at a party, verified against the party geofence.
export const createCheckin = async (req, res) => {
    try {
        const { party_id, latitude, longitude, reason, notes } = req.body;

        const salesman = await resolveSalesman(req);
        if (!salesman) return res.status(403).json({ message: 'No salesman profile linked to this account' });

        let party = null;
        let distanceM = null;

        if (party_id) {
            party = await Party.findByPk(party_id);
            if (!party) return res.status(404).json({ message: 'Party not found' });

            // Geocode the party on demand if coordinates are missing.
            if ((party.latitude == null || party.longitude == null) && party.address) {
                const coords = await geocodeAddress({
                    address: party.address, city: party.city, state: party.state, pincode: party.pincode
                });
                if (coords) await party.update({ latitude: coords.latitude, longitude: coords.longitude });
            }

            const fence = evaluateGeofence(party.latitude, party.longitude, latitude, longitude);
            distanceM = fence.distanceM;

            if (!fence.withinFence) {
                return res.status(403).json({
                    message: `Check-in rejected: you are ${fence.distanceM != null ? Math.round(fence.distanceM) + 'm' : 'too far'} from the party (geofence ${getGeofenceRadiusM()}m).`,
                    distance_m: fence.distanceM,
                    geofence_radius_m: getGeofenceRadiusM()
                });
            }
        }

        const checkin = await SalesmanCheckin.create({
            salesman_id: salesman.id,
            party_id: party_id || null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            distance_m: distanceM,
            reason: reason || null,
            notes: notes || null
        });

        res.status(201).json({ message: 'Check-in recorded', checkin });
    } catch (error) {
        console.error('Create check-in error:', error);
        res.status(500).json({ message: 'Failed to record check-in', error: error.message });
    }
};

// List check-ins. Salesmen see their own; admins/managers see all (optionally
// filtered by ?salesman_id=).
export const getCheckins = async (req, res) => {
    try {
        const where = {};
        if (['admin', 'sales_manager', 'reports_manager'].includes(req.user.role)) {
            if (req.query.salesman_id) where.salesman_id = req.query.salesman_id;
        } else {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (!salesman) return res.json([]);
            where.salesman_id = salesman.id;
        }

        const checkins = await SalesmanCheckin.findAll({
            where,
            include: [
                { model: Party, attributes: ['id', 'shop_name', 'latitude', 'longitude'] },
                { model: Salesman, attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(checkins);
    } catch (error) {
        console.error('Get check-ins error:', error);
        res.status(500).json({ message: 'Failed to fetch check-ins', error: error.message });
    }
};
