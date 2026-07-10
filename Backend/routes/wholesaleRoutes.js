import express from 'express';
import {
    createEnquiry,
    getAllEnquiries,
    updateEnquiryStatus,
    deleteEnquiry
} from '../controller/wholesaleController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager', 'distributor_manager'];

// Public — submit an enquiry
router.post('/public', createEnquiry);

// Admin — manage enquiries
router.get('/', isAuthenticated, authorize(MANAGERS), getAllEnquiries);
router.patch('/:id/status', isAuthenticated, authorize(MANAGERS), updateEnquiryStatus);
router.delete('/:id', isAuthenticated, authorize(MANAGERS), deleteEnquiry);

export default router;
