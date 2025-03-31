const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const wishlistController = require('../controller/wishlistController');

// All wishlist routes are protected and require authentication

// Add product to wishlist
router.post('/', isAuthenticated, wishlistController.addToWishlist);

// Get user's wishlist
router.get('/', isAuthenticated, wishlistController.getWishlist);

// Check if a product is in the user's wishlist
router.get('/check/:productId', isAuthenticated, wishlistController.checkWishlist);

// Remove product from wishlist
router.delete('/:productId', isAuthenticated, wishlistController.removeFromWishlist);

// Clear entire wishlist
router.delete('/', isAuthenticated, wishlistController.clearWishlist);

module.exports = router; 