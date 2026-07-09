import express from 'express';
import {
    getAllParties,
    getMyParty,
    getParty,
    createParty,
    updateParty,
    deleteParty,
    updatePartyLocations
} from '../controller/partyController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'party_manager', 'sales_manager', 'distributor_manager'];

// Self-scoped party portal
router.get('/my', isAuthenticated, authorize(['party']), getMyParty);

// Management
router.get('/', isAuthenticated, authorize([...MANAGERS, 'salesman', 'distributor']), getAllParties);
router.post('/update-locations', isAuthenticated, authorize(MANAGERS), updatePartyLocations);
router.get('/:id', isAuthenticated, getParty);
router.post('/', isAuthenticated, authorize([...MANAGERS, 'salesman']), createParty);
router.put('/:id', isAuthenticated, authorize([...MANAGERS, 'salesman']), updateParty);
router.delete('/:id', isAuthenticated, authorize(MANAGERS), deleteParty);

export default router;
