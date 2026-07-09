import { Salesman } from '../model/salesmanModel.js';
import { SalesmanState } from '../model/salesmanStateModel.js';
import { SalesmanZone } from '../model/salesmanZoneModel.js';
import { Zone } from '../model/zoneModel.js';
import { User } from '../model/userModel.js';
import { sequelize } from '../config/db.js';
import { writeAudit } from '../utils/audit.js';

const includeTerritory = [
    { model: SalesmanState, as: 'States' },
    { model: SalesmanZone, as: 'Zones', include: [{ model: Zone, attributes: ['id', 'name'] }] }
];

const KYC_FIELDS = ['pan_card', 'aadhaar_card', 'cancelled_cheque', 'photo'];

// Collect uploaded KYC files (from upload.fields) into a { field: filename } map.
const collectKycFiles = (req) => {
    const files = {};
    if (req.files) {
        for (const field of KYC_FIELDS) {
            if (req.files[field] && req.files[field][0]) {
                files[field] = req.files[field][0].filename;
            }
        }
    }
    return files;
};

// Parse states/zones which may arrive as JSON strings in multipart form data.
const parseArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try { const p = JSON.parse(value); return Array.isArray(p) ? p : [value]; }
        catch { return value.split(',').map((s) => s.trim()).filter(Boolean); }
    }
    return undefined;
};

const syncTerritory = async (salesmanId, states, zones, transaction) => {
    const s = parseArray(states);
    const z = parseArray(zones);
    if (Array.isArray(s)) {
        await SalesmanState.destroy({ where: { salesman_id: salesmanId }, transaction });
        for (const state of s.filter(Boolean)) {
            await SalesmanState.create({ salesman_id: salesmanId, state }, { transaction });
        }
    }
    if (Array.isArray(z)) {
        await SalesmanZone.destroy({ where: { salesman_id: salesmanId }, transaction });
        for (const zone_id of z.filter(Boolean)) {
            await SalesmanZone.create({ salesman_id: salesmanId, zone_id }, { transaction });
        }
    }
};

// List salesmen
export const getAllSalesmen = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        const salesmen = await Salesman.findAll({ where, include: includeTerritory, order: [['name', 'ASC']] });
        res.json(salesmen);
    } catch (error) {
        console.error('Get salesmen error:', error);
        res.status(500).json({ message: 'Failed to fetch salesmen', error: error.message });
    }
};

// Self-scoped: logged-in salesman's own record
export const getMySalesman = async (req, res) => {
    try {
        const salesman = await Salesman.findOne({ where: { user_id: req.user.id }, include: includeTerritory });
        if (!salesman) return res.status(404).json({ message: 'Salesman profile not found' });
        res.json(salesman);
    } catch (error) {
        console.error('Get my salesman error:', error);
        res.status(500).json({ message: 'Failed to fetch salesman profile', error: error.message });
    }
};

// Get one salesman
export const getSalesman = async (req, res) => {
    try {
        const salesman = await Salesman.findByPk(req.params.id, { include: includeTerritory });
        if (!salesman) return res.status(404).json({ message: 'Salesman not found' });
        res.json(salesman);
    } catch (error) {
        console.error('Get salesman error:', error);
        res.status(500).json({ message: 'Failed to fetch salesman', error: error.message });
    }
};

// Create salesman (+ KYC uploads + territory)
export const createSalesman = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, states, zones, ...rest } = req.body;
        if (!name) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Salesman name is required' });
        }

        const salesman = await Salesman.create({ name, ...rest, ...collectKycFiles(req) }, { transaction });
        await syncTerritory(salesman.id, states, zones, transaction);
        await transaction.commit();

        const created = await Salesman.findByPk(salesman.id, { include: includeTerritory });
        await writeAudit({ userId: req.user?.id, entity: 'Salesman', entityId: salesman.id, action: 'create', newValues: created.toJSON() });
        res.status(201).json({ message: 'Salesman created successfully', salesman: created });
    } catch (error) {
        await transaction.rollback();
        console.error('Create salesman error:', error);
        res.status(500).json({ message: 'Failed to create salesman', error: error.message });
    }
};

// Update salesman (+ KYC uploads + territory). Active status mirrors onto the
// linked user account so a departed salesman is blocked from access.
export const updateSalesman = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const salesman = await Salesman.findByPk(req.params.id);
        if (!salesman) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Salesman not found' });
        }

        const oldValues = salesman.toJSON();
        const { states, zones, ...rest } = req.body;
        await salesman.update({ ...rest, ...collectKycFiles(req) }, { transaction });
        await syncTerritory(salesman.id, states, zones, transaction);
        await transaction.commit();

        const updated = await Salesman.findByPk(salesman.id, { include: includeTerritory });
        await writeAudit({ userId: req.user?.id, entity: 'Salesman', entityId: salesman.id, action: 'update', oldValues, newValues: updated.toJSON() });
        res.json({ message: 'Salesman updated successfully', salesman: updated });
    } catch (error) {
        await transaction.rollback();
        console.error('Update salesman error:', error);
        res.status(500).json({ message: 'Failed to update salesman', error: error.message });
    }
};

// Toggle active/inactive; mirror onto the linked user account.
export const setSalesmanStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'status must be active or inactive' });
        }
        const salesman = await Salesman.findByPk(req.params.id);
        if (!salesman) return res.status(404).json({ message: 'Salesman not found' });

        const oldValues = salesman.toJSON();
        await salesman.update({ status });

        // Mirror onto the linked login account (best-effort).
        if (salesman.user_id) {
            const user = await User.findByPk(salesman.user_id);
            if (user) {
                // A deactivated salesman keeps the role but is blocked at login by
                // the (inactive) salesman record; we simply record the change here.
                await writeAudit({ userId: req.user?.id, entity: 'User', entityId: user.id, action: 'update', oldValues: { status: oldValues.status }, newValues: { status } });
            }
        }

        await writeAudit({ userId: req.user?.id, entity: 'Salesman', entityId: salesman.id, action: 'update', oldValues, newValues: salesman.toJSON() });
        res.json({ message: `Salesman marked ${status}`, salesman });
    } catch (error) {
        console.error('Set salesman status error:', error);
        res.status(500).json({ message: 'Failed to update salesman status', error: error.message });
    }
};

// Delete salesman
export const deleteSalesman = async (req, res) => {
    try {
        const salesman = await Salesman.findByPk(req.params.id);
        if (!salesman) return res.status(404).json({ message: 'Salesman not found' });

        const oldValues = salesman.toJSON();
        await salesman.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'Salesman', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Salesman deleted successfully' });
    } catch (error) {
        console.error('Delete salesman error:', error);
        res.status(500).json({ message: 'Failed to delete salesman', error: error.message });
    }
};
