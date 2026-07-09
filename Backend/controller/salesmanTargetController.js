import { SalesmanTarget } from '../model/salesmanTargetModel.js';
import { Salesman } from '../model/salesmanModel.js';
import { writeAudit } from '../utils/audit.js';

// List targets. Admins/managers see all (optionally ?salesman_id=); a salesman
// sees only their own.
export const getAllTargets = async (req, res) => {
    try {
        const where = {};
        if (['admin', 'sales_manager', 'reports_manager'].includes(req.user.role)) {
            if (req.query.salesman_id) where.salesman_id = req.query.salesman_id;
        } else {
            const salesman = await Salesman.findOne({ where: { user_id: req.user.id } });
            if (!salesman) return res.json([]);
            where.salesman_id = salesman.id;
        }
        const targets = await SalesmanTarget.findAll({
            where,
            include: [{ model: Salesman, attributes: ['id', 'name'] }],
            order: [['start_date', 'DESC']]
        });
        res.json(targets);
    } catch (error) {
        console.error('Get targets error:', error);
        res.status(500).json({ message: 'Failed to fetch targets', error: error.message });
    }
};

// Get one target
export const getTarget = async (req, res) => {
    try {
        const target = await SalesmanTarget.findByPk(req.params.id, { include: [{ model: Salesman, attributes: ['id', 'name'] }] });
        if (!target) return res.status(404).json({ message: 'Target not found' });
        res.json(target);
    } catch (error) {
        console.error('Get target error:', error);
        res.status(500).json({ message: 'Failed to fetch target', error: error.message });
    }
};

// Create target
export const createTarget = async (req, res) => {
    try {
        const { salesman_id, target_amount, start_date, end_date } = req.body;
        if (!salesman_id || target_amount == null || !start_date || !end_date) {
            return res.status(400).json({ message: 'salesman_id, target_amount, start_date and end_date are required' });
        }
        const target = await SalesmanTarget.create(req.body);
        await writeAudit({ userId: req.user?.id, entity: 'SalesmanTarget', entityId: target.id, action: 'create', newValues: target.toJSON() });
        res.status(201).json({ message: 'Target created successfully', target });
    } catch (error) {
        console.error('Create target error:', error);
        res.status(500).json({ message: 'Failed to create target', error: error.message });
    }
};

// Update target
export const updateTarget = async (req, res) => {
    try {
        const target = await SalesmanTarget.findByPk(req.params.id);
        if (!target) return res.status(404).json({ message: 'Target not found' });

        const oldValues = target.toJSON();
        await target.update(req.body);
        await writeAudit({ userId: req.user?.id, entity: 'SalesmanTarget', entityId: target.id, action: 'update', oldValues, newValues: target.toJSON() });
        res.json({ message: 'Target updated successfully', target });
    } catch (error) {
        console.error('Update target error:', error);
        res.status(500).json({ message: 'Failed to update target', error: error.message });
    }
};

// Delete target
export const deleteTarget = async (req, res) => {
    try {
        const target = await SalesmanTarget.findByPk(req.params.id);
        if (!target) return res.status(404).json({ message: 'Target not found' });

        const oldValues = target.toJSON();
        await target.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'SalesmanTarget', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Target deleted successfully' });
    } catch (error) {
        console.error('Delete target error:', error);
        res.status(500).json({ message: 'Failed to delete target', error: error.message });
    }
};
