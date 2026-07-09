import express from 'express';
import {
    getAllTargets,
    getTarget,
    createTarget,
    updateTarget,
    deleteTarget
} from '../controller/salesmanTargetController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager'];

// Salesmen see their own targets (scoped inside the controller).
router.get('/', isAuthenticated, authorize([...MANAGERS, 'salesman', 'reports_manager']), getAllTargets);
router.get('/:id', isAuthenticated, getTarget);
router.post('/', isAuthenticated, authorize(MANAGERS), createTarget);
router.put('/:id', isAuthenticated, authorize(MANAGERS), updateTarget);
router.delete('/:id', isAuthenticated, authorize(MANAGERS), deleteTarget);

export default router;
