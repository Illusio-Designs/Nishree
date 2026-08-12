import express from 'express';
import {
    getWishlist,
    getWishlistIds,
    addToWishlist,
    removeFromWishlist
} from '../controller/wishlistController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Wishlist works for guests too — user when signed in, x-guest-id otherwise.
router.use(optionalAuth);

router.get('/', getWishlist);
router.get('/ids', getWishlistIds);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
