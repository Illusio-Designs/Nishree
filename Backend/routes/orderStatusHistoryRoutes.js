import express from 'express';
import { 
    getOrderStatusHistory,
    addOrderStatusEntry
} from '../controller/orderStatusHistoryController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Routes for specific order status history
router.get('/order/:orderId', isAuthenticated, getOrderStatusHistory);
router.post('/order/:orderId', isAuthenticated, isAdmin, addOrderStatusEntry);

export default router; 