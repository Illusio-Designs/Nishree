import express from 'express';
import {
    createMessage,
    getAllMessages,
    updateMessageStatus,
    deleteMessage
} from '../controller/contactController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager'];

// Public — submit a contact message
router.post('/', createMessage);

// Admin — manage messages
router.get('/', isAuthenticated, authorize(MANAGERS), getAllMessages);
router.patch('/:id/status', isAuthenticated, authorize(MANAGERS), updateMessageStatus);
router.delete('/:id', isAuthenticated, authorize(MANAGERS), deleteMessage);

export default router;
