import express from 'express';
import {
    getAllZones,
    getZone,
    createZone,
    updateZone,
    deleteZone
} from '../controller/zoneController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'distributor_manager', 'sales_manager'];

router.get('/', isAuthenticated, getAllZones);
router.get('/:id', isAuthenticated, getZone);
router.post('/', isAuthenticated, authorize(MANAGERS), createZone);
router.put('/:id', isAuthenticated, authorize(MANAGERS), updateZone);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteZone);

export default router;
