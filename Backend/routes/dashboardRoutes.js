import express from 'express';
import { getAdvancedAnalytics } from '../controller/dashboardController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager', 'reports_manager', 'distributor_manager'];

// Aggregate KPIs for the admin dashboard overview.
router.get('/advanced-analytics', isAuthenticated, authorize(MANAGERS), getAdvancedAnalytics);

export default router;
