import { Zone } from '../model/zoneModel.js';
import { writeAudit } from '../utils/audit.js';

// List all zones
export const getAllZones = async (req, res) => {
    try {
        const zones = await Zone.findAll({ order: [['name', 'ASC']] });
        res.json(zones);
    } catch (error) {
        console.error('Get zones error:', error);
        res.status(500).json({ message: 'Failed to fetch zones', error: error.message });
    }
};

// Get one zone
export const getZone = async (req, res) => {
    try {
        const zone = await Zone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        res.json(zone);
    } catch (error) {
        console.error('Get zone error:', error);
        res.status(500).json({ message: 'Failed to fetch zone', error: error.message });
    }
};

// Create zone
export const createZone = async (req, res) => {
    try {
        const { name, code, description, status } = req.body;
        if (!name) return res.status(400).json({ message: 'Zone name is required' });

        const zone = await Zone.create({ name, code, description, status });
        await writeAudit({ userId: req.user?.id, entity: 'Zone', entityId: zone.id, action: 'create', newValues: zone.toJSON() });
        res.status(201).json({ message: 'Zone created successfully', zone });
    } catch (error) {
        console.error('Create zone error:', error);
        res.status(500).json({ message: 'Failed to create zone', error: error.message });
    }
};

// Update zone
export const updateZone = async (req, res) => {
    try {
        const zone = await Zone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });

        const oldValues = zone.toJSON();
        await zone.update(req.body);
        await writeAudit({ userId: req.user?.id, entity: 'Zone', entityId: zone.id, action: 'update', oldValues, newValues: zone.toJSON() });
        res.json({ message: 'Zone updated successfully', zone });
    } catch (error) {
        console.error('Update zone error:', error);
        res.status(500).json({ message: 'Failed to update zone', error: error.message });
    }
};

// Delete zone
export const deleteZone = async (req, res) => {
    try {
        const zone = await Zone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });

        const oldValues = zone.toJSON();
        await zone.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'Zone', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Zone deleted successfully' });
    } catch (error) {
        console.error('Delete zone error:', error);
        res.status(500).json({ message: 'Failed to delete zone', error: error.message });
    }
};
