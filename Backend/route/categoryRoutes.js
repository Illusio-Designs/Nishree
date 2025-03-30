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
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', getAllCategories);
router.get('/name/:name', getCategoryByName);

// Protected routes (require authentication)
router.post('/', isAuthenticated, isAdmin, upload.single('image'), createCategory);
router.put('/:id', isAuthenticated, isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', isAuthenticated, isAdmin, deleteCategory);

module.exports = router;