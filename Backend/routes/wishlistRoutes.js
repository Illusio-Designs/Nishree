import express from 'express';
import {
    getWishlist,
    getWishlistIds,
    addToWishlist,
    removeFromWishlist
} from '../controller/wishlistController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// All wishlist routes require a logged-in shopper.
router.use(isAuthenticated);

router.get('/', getWishlist);
router.get('/ids', getWishlistIds);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
