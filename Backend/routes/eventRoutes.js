import express from 'express';
import {
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventOrders
} from '../controller/eventController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'order_manager', 'sales_manager'];

router.get('/', isAuthenticated, getAllEvents);
router.get('/:id', isAuthenticated, getEvent);
router.get('/:id/orders', isAuthenticated, getEventOrders);
router.post('/', isAuthenticated, authorize(MANAGERS), createEvent);
router.put('/:id', isAuthenticated, authorize(MANAGERS), updateEvent);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteEvent);

export default router;
