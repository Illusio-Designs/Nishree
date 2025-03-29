const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const auth = require('../middleware/auth');

// Routes with auth
router.post('/', auth, categoryController.createCategory);
router.put('/:id', auth, categoryController.updateCategory);
router.delete('/:id', auth, categoryController.deleteCategory);

// Routes without auth
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

module.exports = router;