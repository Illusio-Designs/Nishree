import express from 'express';
import { getMyRoute, setStopStatus, getRoutes } from '../controller/salesmanRouteController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager', 'reports_manager'];

// Salesman's own daily route (auto-generated from their zone).
router.get('/my', isAuthenticated, authorize(['salesman', ...MANAGERS]), getMyRoute);

// Update a stop's working state.
router.patch('/stops/:id', isAuthenticated, authorize(['salesman', ...MANAGERS]), setStopStatus);

// Manager overview of all route stops.
router.get('/', isAuthenticated, authorize(MANAGERS), getRoutes);

export default router;
