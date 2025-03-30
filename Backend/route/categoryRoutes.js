const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getAllCategories, 
    getCategoryByName, 
    updateCategory, 
    deleteCategory,
    upload 
} = require('../controller/categoryController');
const { auth, authorize } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', getAllCategories);
router.get('/name/:name', getCategoryByName);

// Protected routes (require authentication)
router.post('/', auth, authorize(['admin']), upload, createCategory);
router.put('/:id', auth, authorize(['admin']), upload, updateCategory);
router.delete('/:id', auth, authorize(['admin']), deleteCategory);

module.exports = router;