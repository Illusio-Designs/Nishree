import { Wishlist } from '../model/wishlistModel.js';
import { Product } from '../model/productModel.js';
import { ProductImage } from '../model/productImageModel.js';
import { ProductVariation } from '../model/productVariationModel.js';

// Full wishlist with product details (for the wishlist page).
export const getWishlist = async (req, res) => {
    try {
        const rows = await Wishlist.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Product,
                include: [
                    { model: ProductImage, as: 'ProductImages' },
                    { model: ProductVariation, as: 'ProductVariations' }
                ]
            }],
            order: [['created_at', 'DESC']]
        });
        const products = rows.map((r) => r.Product).filter(Boolean);
        res.json(products);
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
    }
};

// Just the saved product ids (to light up hearts across the store).
export const getWishlistIds = async (req, res) => {
    try {
        const rows = await Wishlist.findAll({ where: { user_id: req.user.id }, attributes: ['product_id'] });
        res.json(rows.map((r) => r.product_id));
    } catch (error) {
        console.error('Get wishlist ids error:', error);
        res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const product_id = req.body.product_id || req.body.productId;
        if (!product_id) return res.status(400).json({ message: 'product_id is required' });
        await Wishlist.findOrCreate({ where: { user_id: req.user.id, product_id } });
        res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        await Wishlist.destroy({ where: { user_id: req.user.id, product_id: req.params.productId } });
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
    }
};
