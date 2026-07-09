import express from 'express';
import {
    getAllSalesmen,
    getMySalesman,
    getSalesman,
    createSalesman,
    updateSalesman,
    setSalesmanStatus,
    deleteSalesman
} from '../controller/salesmanController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager'];

// KYC document fields accepted on create/update.
const kycUpload = upload.fields([
    { name: 'pan_card', maxCount: 1 },
    { name: 'aadhaar_card', maxCount: 1 },
    { name: 'cancelled_cheque', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

// Self-scoped salesman portal
router.get('/my', isAuthenticated, authorize(['salesman']), getMySalesman);

router.get('/', isAuthenticated, authorize(MANAGERS), getAllSalesmen);
router.get('/:id', isAuthenticated, getSalesman);
router.post('/', isAuthenticated, authorize(MANAGERS), kycUpload, createSalesman);
router.put('/:id', isAuthenticated, authorize(MANAGERS), kycUpload, updateSalesman);
router.patch('/:id/status', isAuthenticated, authorize(MANAGERS), setSalesmanStatus);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteSalesman);

export default router;
