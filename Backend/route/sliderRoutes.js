const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
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
router.post('/', auth, authorize('admin'), upload, createSlider);
router.put('/:id', auth, authorize('admin'), upload, updateSlider);
router.delete('/:id', auth, authorize('admin'), deleteSlider);

module.exports = router; 