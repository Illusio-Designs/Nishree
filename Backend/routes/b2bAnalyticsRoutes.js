import express from 'express';
import { getTargetAchievement, getVisitReport } from '../controller/b2bAnalyticsController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Salesmen see their own data; admins/managers see everyone's (scoped in controller).
const VIEWERS = ['admin', 'sales_manager', 'reports_manager', 'salesman'];

router.get('/target-achievement', isAuthenticated, authorize(VIEWERS), getTargetAchievement);
router.get('/visit-report', isAuthenticated, authorize(VIEWERS), getVisitReport);

export default router;
