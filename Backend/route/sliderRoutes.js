const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
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
router.post('/', isAuthenticated, isAdmin, upload.single('image'), createSlider);
router.put('/:id', isAuthenticated, isAdmin, upload.single('image'), updateSlider);
router.delete('/:id', isAuthenticated, isAdmin, deleteSlider);

module.exports = router; 