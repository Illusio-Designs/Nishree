import express from 'express';
import {
    getAllDistributors,
    getMyDistributor,
    getDistributor,
    getDistributorParties,
    createDistributor,
    updateDistributor,
    deleteDistributor
} from '../controller/distributorController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'distributor_manager'];

// Self-scoped distributor portal
router.get('/my', isAuthenticated, authorize(['distributor']), getMyDistributor);

router.get('/', isAuthenticated, authorize([...MANAGERS, 'sales_manager']), getAllDistributors);
router.get('/:id', isAuthenticated, getDistributor);
router.get('/:id/parties', isAuthenticated, getDistributorParties);
router.post('/', isAuthenticated, authorize(MANAGERS), createDistributor);
router.put('/:id', isAuthenticated, authorize(MANAGERS), updateDistributor);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteDistributor);

export default router;
