import { Distributor } from '../model/distributorModel.js';
import { DistributorState } from '../model/distributorStateModel.js';
import { DistributorZone } from '../model/distributorZoneModel.js';
import { Zone } from '../model/zoneModel.js';
import { Party } from '../model/partyModel.js';
import { sequelize } from '../config/db.js';
import { writeAudit } from '../utils/audit.js';

const includeTerritory = [
    { model: DistributorState, as: 'States' },
    { model: DistributorZone, as: 'Zones', include: [{ model: Zone, attributes: ['id', 'name'] }] }
];

// Replace a distributor's territory rows (states + zones) within a transaction.
const syncTerritory = async (distributorId, states, zones, transaction) => {
    if (Array.isArray(states)) {
        await DistributorState.destroy({ where: { distributor_id: distributorId }, transaction });
        for (const state of states.filter(Boolean)) {
            await DistributorState.create({ distributor_id: distributorId, state }, { transaction });
        }
    }
    if (Array.isArray(zones)) {
        await DistributorZone.destroy({ where: { distributor_id: distributorId }, transaction });
        for (const zone_id of zones.filter(Boolean)) {
            await DistributorZone.create({ distributor_id: distributorId, zone_id }, { transaction });
        }
    }
};

// List distributors
export const getAllDistributors = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        const distributors = await Distributor.findAll({ where, include: includeTerritory, order: [['name', 'ASC']] });
        res.json(distributors);
    } catch (error) {
        console.error('Get distributors error:', error);
        res.status(500).json({ message: 'Failed to fetch distributors', error: error.message });
    }
};

// Self-scoped: logged-in distributor's own record
export const getMyDistributor = async (req, res) => {
    try {
        const distributor = await Distributor.findOne({ where: { user_id: req.user.id }, include: includeTerritory });
        if (!distributor) return res.status(404).json({ message: 'Distributor profile not found' });
        res.json(distributor);
    } catch (error) {
        console.error('Get my distributor error:', error);
        res.status(500).json({ message: 'Failed to fetch distributor profile', error: error.message });
    }
};

// Get one distributor
export const getDistributor = async (req, res) => {
    try {
        const distributor = await Distributor.findByPk(req.params.id, { include: includeTerritory });
        if (!distributor) return res.status(404).json({ message: 'Distributor not found' });
        res.json(distributor);
    } catch (error) {
        console.error('Get distributor error:', error);
        res.status(500).json({ message: 'Failed to fetch distributor', error: error.message });
    }
};

// The parties routed through a distributor
export const getDistributorParties = async (req, res) => {
    try {
        const parties = await Party.findAll({ where: { distributor_id: req.params.id }, order: [['shop_name', 'ASC']] });
        res.json(parties);
    } catch (error) {
        console.error('Get distributor parties error:', error);
        res.status(500).json({ message: 'Failed to fetch distributor parties', error: error.message });
    }
};

// Create distributor (+ territory)
export const createDistributor = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, states, zones, ...rest } = req.body;
        if (!name) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Distributor name is required' });
        }

        const distributor = await Distributor.create({ name, ...rest }, { transaction });
        await syncTerritory(distributor.id, states, zones, transaction);
        await transaction.commit();

        const created = await Distributor.findByPk(distributor.id, { include: includeTerritory });
        await writeAudit({ userId: req.user?.id, entity: 'Distributor', entityId: distributor.id, action: 'create', newValues: created.toJSON() });
        res.status(201).json({ message: 'Distributor created successfully', distributor: created });
    } catch (error) {
        await transaction.rollback();
        console.error('Create distributor error:', error);
        res.status(500).json({ message: 'Failed to create distributor', error: error.message });
    }
};

// Update distributor (+ territory). Mirrors status onto the linked user account.
export const updateDistributor = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const distributor = await Distributor.findByPk(req.params.id);
        if (!distributor) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Distributor not found' });
        }

        const oldValues = distributor.toJSON();
        const { states, zones, ...rest } = req.body;
        await distributor.update(rest, { transaction });
        await syncTerritory(distributor.id, states, zones, transaction);
        await transaction.commit();

        const updated = await Distributor.findByPk(distributor.id, { include: includeTerritory });
        await writeAudit({ userId: req.user?.id, entity: 'Distributor', entityId: distributor.id, action: 'update', oldValues, newValues: updated.toJSON() });
        res.json({ message: 'Distributor updated successfully', distributor: updated });
    } catch (error) {
        await transaction.rollback();
        console.error('Update distributor error:', error);
        res.status(500).json({ message: 'Failed to update distributor', error: error.message });
    }
};

// Delete distributor
export const deleteDistributor = async (req, res) => {
    try {
        const distributor = await Distributor.findByPk(req.params.id);
        if (!distributor) return res.status(404).json({ message: 'Distributor not found' });

        const oldValues = distributor.toJSON();
        await distributor.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'Distributor', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Distributor deleted successfully' });
    } catch (error) {
        console.error('Delete distributor error:', error);
        res.status(500).json({ message: 'Failed to delete distributor', error: error.message });
    }
};
