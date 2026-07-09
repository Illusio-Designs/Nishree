import express from 'express';
import {
    getAllOffers,
    getActiveOffers,
    getOffer,
    createOffer,
    updateOffer,
    deleteOffer
} from '../controller/offerController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'order_manager', 'sales_manager'];

router.get('/active', isAuthenticated, getActiveOffers);
router.get('/', isAuthenticated, getAllOffers);
router.get('/:id', isAuthenticated, getOffer);
router.post('/', isAuthenticated, authorize(MANAGERS), createOffer);
router.put('/:id', isAuthenticated, authorize(MANAGERS), updateOffer);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteOffer);

export default router;
