const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    upload
} = require('../controller/productController');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (admin only)
router.post('/', auth, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', auth, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', auth, authorize('admin'), deleteProduct);

module.exports = router; 