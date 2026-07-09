import { Offer } from '../model/offerModel.js';
import { Op } from 'sequelize';
import { writeAudit } from '../utils/audit.js';

// List offers (optional ?status=)
export const getAllOffers = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        const offers = await Offer.findAll({ where, order: [['created_at', 'DESC']] });
        res.json(offers);
    } catch (error) {
        console.error('Get offers error:', error);
        res.status(500).json({ message: 'Failed to fetch offers', error: error.message });
    }
};

// Active offers (valid now) — used when building a B2B order
export const getActiveOffers = async (req, res) => {
    try {
        const now = new Date();
        const offers = await Offer.findAll({
            where: {
                status: 'active',
                [Op.and]: [
                    { [Op.or]: [{ start_date: null }, { start_date: { [Op.lte]: now } }] },
                    { [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: now } }] }
                ]
            },
            order: [['value', 'DESC']]
        });
        res.json(offers);
    } catch (error) {
        console.error('Get active offers error:', error);
        res.status(500).json({ message: 'Failed to fetch active offers', error: error.message });
    }
};

// Get one offer
export const getOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });
        res.json(offer);
    } catch (error) {
        console.error('Get offer error:', error);
        res.status(500).json({ message: 'Failed to fetch offer', error: error.message });
    }
};

// Create offer
export const createOffer = async (req, res) => {
    try {
        const { name, type, value } = req.body;
        if (!name || !type || value == null) {
            return res.status(400).json({ message: 'Name, type and value are required' });
        }
        const offer = await Offer.create(req.body);
        await writeAudit({ userId: req.user?.id, entity: 'Offer', entityId: offer.id, action: 'create', newValues: offer.toJSON() });
        res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
        console.error('Create offer error:', error);
        res.status(500).json({ message: 'Failed to create offer', error: error.message });
    }
};

// Update offer
export const updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        const oldValues = offer.toJSON();
        await offer.update(req.body);
        await writeAudit({ userId: req.user?.id, entity: 'Offer', entityId: offer.id, action: 'update', oldValues, newValues: offer.toJSON() });
        res.json({ message: 'Offer updated successfully', offer });
    } catch (error) {
        console.error('Update offer error:', error);
        res.status(500).json({ message: 'Failed to update offer', error: error.message });
    }
};

// Delete offer
export const deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        const oldValues = offer.toJSON();
        await offer.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'Offer', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Delete offer error:', error);
        res.status(500).json({ message: 'Failed to delete offer', error: error.message });
    }
};
