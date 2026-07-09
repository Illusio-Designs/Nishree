import { Event } from '../model/eventModel.js';
import { Order } from '../model/orderModel.js';
import { writeAudit } from '../utils/audit.js';

// List events (optional ?status= filter)
export const getAllEvents = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        const events = await Event.findAll({ where, order: [['start_date', 'DESC']] });
        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
};

// Get one event
export const getEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Failed to fetch event', error: error.message });
    }
};

// Create event
export const createEvent = async (req, res) => {
    try {
        const { name, location, start_date, end_date, description, status } = req.body;
        if (!name) return res.status(400).json({ message: 'Event name is required' });

        const event = await Event.create({ name, location, start_date, end_date, description, status });
        await writeAudit({ userId: req.user?.id, entity: 'Event', entityId: event.id, action: 'create', newValues: event.toJSON() });
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
};

// Update event
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const oldValues = event.toJSON();
        await event.update(req.body);
        await writeAudit({ userId: req.user?.id, entity: 'Event', entityId: event.id, action: 'update', oldValues, newValues: event.toJSON() });
        res.json({ message: 'Event updated successfully', event });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Failed to update event', error: error.message });
    }
};

// Delete event
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const oldValues = event.toJSON();
        await event.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'Event', entityId: req.params.id, action: 'delete', oldValues });
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Failed to delete event', error: error.message });
    }
};

// List orders booked against an event
export const getEventOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { event_id: req.params.id },
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Get event orders error:', error);
        res.status(500).json({ message: 'Failed to fetch event orders', error: error.message });
    }
};
