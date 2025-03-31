const express = require('express');
const router = express.Router();
const { isAuthenticated, authorize } = require('../middleware/auth');
const { 
    createSlider, 
    getAllSliders, 
    getSliderById, 
    updateSlider, 
    deleteSlider,
    upload 
} = require('../controller/sliderController');

// Public routes
router.get('/', getAllSliders);
router.get('/:id', getSliderById);

// Protected routes (admin only)
router.post('/', isAuthenticated, authorize(['admin']), upload.single('image'), createSlider);
router.put('/:id', isAuthenticated, authorize(['admin']), upload.single('image'), updateSlider);
router.delete('/:id', isAuthenticated, authorize(['admin']), deleteSlider);

module.exports = router; 