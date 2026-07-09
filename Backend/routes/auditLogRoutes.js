import express from 'express';
import { getAuditLogs } from '../controller/auditLogController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', isAuthenticated, authorize(['admin', 'reports_manager']), getAuditLogs);

export default router;
