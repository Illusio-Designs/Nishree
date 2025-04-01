import express from 'express';
import { isAuthenticated, authorize } from '../middleware/authMiddleware.js';
import { 
    createSlider, 
    getAllSliders, 
    getSliderById, 
    updateSlider, 
    deleteSlider,
    upload 
} from '../controller/sliderController.js';

const router = express.Router();

// Public routes
router.get('/', getAllSliders);
router.get('/:id', getSliderById);

// Protected routes (admin only)
router.post('/', isAuthenticated, authorize(['admin']), upload.single('image'), createSlider);
router.put('/:id', isAuthenticated, authorize(['admin']), upload.single('image'), updateSlider);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteSlider);

export default router; 