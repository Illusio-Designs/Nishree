import { ContactMessage } from '../model/contactMessageModel.js';
import { writeAudit } from '../utils/audit.js';

const STATUSES = ['new', 'read', 'replied', 'closed'];

// ---- Public ----

// Submit a contact message (no auth required).
export const createMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email and message are required' });
        }
        const contact = await ContactMessage.create({ ...req.body, status: 'new' });
        res.status(201).json({ message: "Thanks! We'll get back to you shortly.", contact });
    } catch (error) {
        console.error('Create contact message error:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

// ---- Admin ----

export const getAllMessages = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        const messages = await ContactMessage.findAll({ where, order: [['created_at', 'DESC']] });
        res.json(messages);
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
};

export const updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const contact = await ContactMessage.findByPk(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Message not found' });

        const oldValues = contact.toJSON();
        await contact.update({ status });
        await writeAudit({ userId: req.user?.id, entity: 'ContactMessage', entityId: contact.id, action: 'update', oldValues, newValues: contact.toJSON() });
        res.json({ message: `Message marked ${status}`, contact });
    } catch (error) {
        console.error('Update contact message error:', error);
        res.status(500).json({ message: 'Failed to update message', error: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const contact = await ContactMessage.findByPk(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Message not found' });
        await contact.destroy();
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ message: 'Failed to delete message', error: error.message });
    }
};
