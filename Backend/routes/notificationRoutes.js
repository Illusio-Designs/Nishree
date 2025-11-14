import express from 'express';
import { 
    getUnreadNotifications,
    markAsRead,
    markAllAsRead
} from '../controller/notificationController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.get('/unread', isAuthenticated, getUnreadNotifications);
router.put('/:id/read', isAuthenticated, markAsRead);
router.put('/read-all', isAuthenticated, markAllAsRead);

export default router;
