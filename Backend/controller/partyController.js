import { Party } from '../model/partyModel.js';
import { Distributor } from '../model/distributorModel.js';
import { Zone } from '../model/zoneModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { SalesmanZone } from '../model/salesmanZoneModel.js';
import { SalesmanRouteStop } from '../model/salesmanRouteStopModel.js';
import { geocodeAddress } from '../utils/geocode.js';
import { writeAudit } from '../utils/audit.js';

const todayStr = () => new Date().toISOString().slice(0, 10);

// When a salesman registers a new shop while on their beat, fold it straight
// into today's route: stamp who added it, default it to the rep's own zone (so
// it also appears on future auto-built routes), and drop an ad-hoc stop for
// today so the rep can check in and take the first order right away.
const attachFieldParty = async (party, salesman) => {
    const patch = { added_by_salesman_id: salesman.id };
    if (!party.zone_id) {
        const firstZone = await SalesmanZone.findOne({ where: { salesman_id: salesman.id } });
        if (firstZone) patch.zone_id = firstZone.zone_id;
    }
    await party.update(patch);

    const date = todayStr();
    const last = await SalesmanRouteStop.findOne({
        where: { salesman_id: salesman.id, route_date: date },
        order: [['sequence', 'DESC']]
    });
    await SalesmanRouteStop.findOrCreate({
        where: { salesman_id: salesman.id, party_id: party.id, route_date: date },
        defaults: {
            salesman_id: salesman.id, party_id: party.id, route_date: date,
            sequence: (last?.sequence || 0) + 1, status: 'pending', ad_hoc: true
        }
    });
};

const includeRefs = [
    { model: Distributor, attributes: ['id', 'name', 'company_name'] },
    { model: Zone, attributes: ['id', 'name'] }
];

// List all parties (admin / managers)
export const getAllParties = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.distributor_id) where.distributor_id = req.query.distributor_id;
        const parties = await Party.findAll({ where, include: includeRefs, order: [['shop_name', 'ASC']] });
        res.json(parties);
    } catch (error) {
        console.error('Get parties error:', error);
        res.status(500).json({ message: 'Failed to fetch parties', error: error.message });
    }
};

// Self-scoped: the logged-in party's own record
export const getMyParty = async (req, res) => {
    try {
        const party = await Party.findOne({ where: { user_id: req.user.id }, include: includeRefs });
        if (!party) return res.status(404).json({ message: 'Party profile not found' });
        res.json(party);
    } catch (error) {
        console.error('Get my party error:', error);
        res.status(500).json({ message: 'Failed to fetch party profile', error: error.message });
    }
};

// Get one party
export const getParty = async (req, res) => {
    try {
        const party = await Party.findByPk(req.params.id, { include: includeRefs });
        if (!party) return res.status(404).json({ message: 'Party not found' });
        res.json(party);
    } catch (error) {
        console.error('Get party error:', error);
        res.status(500).json({ message: 'Failed to fetch party', error: error.message });
    }
};

// Create party (geocodes the address on the way in)
export const createParty = async (req, res) => {
    try {
        const { shop_name } = req.body;
        if (!shop_name) return res.status(400).json({ message: 'Shop name is required' });

        const payload = { ...req.body };
        const coords = await geocodeAddress(payload);
        if (coords) {
            payload.latitude = coords.latitude;
            payload.longitude = coords.longitude;
        }

        const party = await Party.create(payload);

        // A rep adding a shop from the field → attach it to their beat now.
        if (req.user?.role === 'salesman') {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (salesman) await attachFieldParty(party, salesman);
        }

        await writeAudit({ userId: req.user?.id, entity: 'Party', entityId: party.id, action: 'create', newValues: party.toJSON() });
        res.status(201).json({ message: 'Party created successfully', party });
    } catch (error) {
        console.error('Create party error:', error);
        res.status(500).json({ message: 'Failed to create party', error: error.message });
    }
};

// Update party (re-geocodes when the address changes)
export const updateParty = async (req, res) => {
    try {
        const party = await Party.findByPk(req.params.id);
        if (!party) return res.status(404).json({ message: 'Party not found' });

        const oldValues = party.toJSON();
        const payload = { ...req.body };

        const addressChanged = ['address', 'city', 'state', 'pincode'].some(
            (f) => payload[f] !== undefined && payload[f] !== party[f]
        );
        if (addressChanged) {
            const coords = await geocodeAddress({
                address: payload.address ?? party.address,
                city: payload.city ?? party.city,
                state: payload.state ?? party.state,
                pincode: payload.pincode ?? party.pincode
            });
            if (coords) {
                payload.latitude = coords.latitude;
                payload.longitude = coords.longitude;
            }
        }

        await party.update(payload);
        await writeAudit({ userId: req.user?.id, entity: 'Party', entityId: party.id, action: 'update', oldValues, newValues: party.toJSON() });
        res.json({ message: 'Party updated successfully', party });
    } catch (error) {
        console.error('Update party error:', error);
        res.status(500).json({ message: 'Failed to update party', error: error.message });
    }
};

// Delete party
export const deleteParty = async (req, res) => {
    try {
        const party = await Party.findByPk(req.params.id);
        if (!party) return res.status(404).json({ message: 'Party not found' });

        const oldValues = party.toJSON();
        await party.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'Party', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Party deleted successfully' });
    } catch (error) {
        console.error('Delete party error:', error);
        res.status(500).json({ message: 'Failed to delete party', error: error.message });
    }
};

// Bulk "Update Locations" — (re)geocode parties missing coordinates
export const updatePartyLocations = async (req, res) => {
    try {
        const onlyMissing = req.query.all !== 'true';
        const parties = await Party.findAll();
        let updated = 0;
        let skipped = 0;

        for (const party of parties) {
            if (onlyMissing && party.latitude != null && party.longitude != null) {
                skipped++;
                continue;
            }
            const coords = await geocodeAddress({
                address: party.address,
                city: party.city,
                state: party.state,
                pincode: party.pincode
            });
            if (coords) {
                await party.update({ latitude: coords.latitude, longitude: coords.longitude });
                updated++;
            } else {
                skipped++;
            }
        }

        res.json({ message: 'Party locations updated', updated, skipped, total: parties.length });
    } catch (error) {
        console.error('Update party locations error:', error);
        res.status(500).json({ message: 'Failed to update party locations', error: error.message });
    }
};
