import express from 'express';
import {
    startJourney,
    trackJourney,
    endJourney,
    getActiveJourney,
    getJourneys,
    getJourney
} from '../controller/salesmanJourneyController.js';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const MANAGERS = ['admin', 'sales_manager', 'reports_manager'];

// Salesman day-journey (geo route tracking) — add-on to the visit/geofence system.
router.post('/start', isAuthenticated, authorize(['salesman', ...MANAGERS]), startJourney);
router.post('/track', isAuthenticated, authorize(['salesman', ...MANAGERS]), trackJourney);
router.post('/end', isAuthenticated, authorize(['salesman', ...MANAGERS]), endJourney);

router.get('/active', isAuthenticated, authorize(['salesman', ...MANAGERS]), getActiveJourney);
router.get('/', isAuthenticated, authorize(['salesman', ...MANAGERS]), getJourneys);
router.get('/:id', isAuthenticated, authorize(['salesman', ...MANAGERS]), getJourney);

export default router;
