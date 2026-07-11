import express from 'express';
import { getCountries, getStates, getCities } from '../controller/geoController.js';

const router = express.Router();

// Public geography reference data for dropdowns.
router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/cities', getCities);

export default router;
