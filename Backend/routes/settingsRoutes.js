import express from 'express';
import { getAllSettings, getSettingByKey, upsertSetting, deleteSetting } from '../controller/settingsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllSettings);
router.get('/:key', getSettingByKey);

// Protected routes (admin only)
router.post('/', authenticate, authorize(['admin']), upsertSetting);
router.put('/:key', authenticate, authorize(['admin']), upsertSetting);
router.delete('/:key', authenticate, authorize(['admin']), deleteSetting);

export default router; 