import express from 'express';
import { createGuestOrder } from '../controller/guestController.js';

const router = express.Router();

// Guest checkout - no authentication required
router.post('/checkout', createGuestOrder);

export default router;
