import express from 'express';
import { createCheckin, getCheckins } from '../controller/salesmanCheckinController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Salesmen record check-ins; managers/reports can view all.
router.post('/', isAuthenticated, authorize(['salesman', 'admin', 'sales_manager']), createCheckin);
router.get('/', isAuthenticated, authorize(['salesman', 'admin', 'sales_manager', 'reports_manager']), getCheckins);

export default router;
