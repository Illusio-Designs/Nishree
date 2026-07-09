import express from 'express';
import {
    createB2BOrder,
    getB2BOrders,
    getMyB2BOrders
} from '../controller/b2bOrderController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'order_manager', 'sales_manager'];

// Self-scoped orders for portal roles.
router.get('/my', isAuthenticated, authorize(['party', 'distributor', 'salesman']), getMyB2BOrders);

// Placing a wholesale order (salesman on-site / office staff).
router.post('/', isAuthenticated, authorize([...MANAGERS, 'salesman', 'party', 'distributor']), createB2BOrder);

// Management listing of all B2B orders.
router.get('/', isAuthenticated, authorize(MANAGERS), getB2BOrders);

export default router;
