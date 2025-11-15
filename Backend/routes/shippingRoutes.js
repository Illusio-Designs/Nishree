import express from 'express';
import {
    // Shipping Address
    createShippingAddress,
    getUserShippingAddresses,
    getShippingAddressById,
    updateShippingAddress,
    deleteShippingAddress,
    setDefaultShippingAddress,
    // Shipping Fee
    getAllShippingFees,
    createOrUpdateShippingFee,
    getShippingFeeByType,
    deleteShippingFee
} from '../controller/shippingController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== SHIPPING ADDRESS ROUTES ====================
router.post('/addresses', isAuthenticated, createShippingAddress);
router.get('/addresses', isAuthenticated, getUserShippingAddresses);
router.get('/addresses/:id', isAuthenticated, getShippingAddressById);
router.put('/addresses/:id', isAuthenticated, updateShippingAddress);
router.delete('/addresses/:id', isAuthenticated, deleteShippingAddress);
router.put('/addresses/:id/default', isAuthenticated, setDefaultShippingAddress);

// ==================== SHIPPING FEE ROUTES ====================
router.get('/fees', isAuthenticated, authorize(['admin']), getAllShippingFees);
router.post('/fees', isAuthenticated, authorize(['admin']), createOrUpdateShippingFee);
router.get('/fees/:type', isAuthenticated, authorize(['admin']), getShippingFeeByType);
router.delete('/fees/:id', isAuthenticated, authorize(['admin']), deleteShippingFee);

export default router;
