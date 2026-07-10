import { WholesaleEnquiry } from '../model/wholesaleEnquiryModel.js';
import { writeAudit } from '../utils/audit.js';

// ---- Public ----

// Submit a bulk / wholesale enquiry (no auth required).
export const createEnquiry = async (req, res) => {
    try {
        const { business_name, phone } = req.body;
        if (!business_name || !phone) {
            return res.status(400).json({ message: 'Business name and phone are required' });
        }
        const enquiry = await WholesaleEnquiry.create({ ...req.body, status: 'new' });
        res.status(201).json({ message: 'Enquiry submitted. Our team will contact you shortly.', enquiry });
    } catch (error) {
        console.error('Create enquiry error:', error);
        res.status(500).json({ message: 'Failed to submit enquiry', error: error.message });
    }
};

// ---- Admin ----

export const getAllEnquiries = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        const enquiries = await WholesaleEnquiry.findAll({ where, order: [['created_at', 'DESC']] });
        res.json(enquiries);
    } catch (error) {
        console.error('Get enquiries error:', error);
        res.status(500).json({ message: 'Failed to fetch enquiries', error: error.message });
    }
};

export const updateEnquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['new', 'contacted', 'converted', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const enquiry = await WholesaleEnquiry.findByPk(req.params.id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

        const oldValues = enquiry.toJSON();
        await enquiry.update({ status });
        await writeAudit({ userId: req.user?.id, entity: 'WholesaleEnquiry', entityId: enquiry.id, action: 'update', oldValues, newValues: enquiry.toJSON() });
        res.json({ message: `Enquiry marked ${status}`, enquiry });
    } catch (error) {
        console.error('Update enquiry error:', error);
        res.status(500).json({ message: 'Failed to update enquiry', error: error.message });
    }
};

export const deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await WholesaleEnquiry.findByPk(req.params.id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        await enquiry.destroy();
        res.json({ success: true, message: 'Enquiry deleted' });
    } catch (error) {
        console.error('Delete enquiry error:', error);
        res.status(500).json({ message: 'Failed to delete enquiry', error: error.message });
    }
};
