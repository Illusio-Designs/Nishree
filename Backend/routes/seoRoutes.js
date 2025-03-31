const express = require('express');
const router = express.Router();
const { 
    getSEOData, 
    getAllSEOData, 
    updateSEOData, 
    createSEOData, 
    deleteSEOData 
} = require('../controller/seoController');
const { isAuthenticated, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getSEOData); // Get SEO data for a specific page (?page_name=home)

// Admin routes
router.get('/all', isAuthenticated, authorize(['admin']), getAllSEOData);
router.post('/create', isAuthenticated, authorize(['admin']), createSEOData);
router.put('/update', isAuthenticated, authorize(['admin']), updateSEOData);
router.delete('/:page_name', isAuthenticated, authorize(['admin']), deleteSEOData);

module.exports = router; 