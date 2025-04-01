import ReviewLike from '../model/reviewLikeModel.js';
import Review from '../model/reviewModel.js';
import User from '../model/userModel.js';
import ReviewImage from '../model/reviewImageModel.js';
import Product from '../model/productModel.js';
import { Op } from 'sequelize';

// Toggle like on a review (like if not liked, unlike if already liked)
export const toggleLike = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Check if review exists
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if review is approved
        if (review.status !== 'approved') {
            return res.status(400).json({ message: 'Cannot like an unapproved review' });
        }

        // Check if user already liked this review
        const existingLike = await ReviewLike.findOne({
            where: {
                review_id: reviewId,
                user_id: userId
            }
        });

        if (existingLike) {
            // User already liked this review, so unlike it
            await existingLike.destroy();
            
            // Get updated like count
            const likeCount = await ReviewLike.count({
                where: { review_id: reviewId }
            });
            
            return res.json({
                message: 'Review unliked successfully',
                liked: false,
                likeCount
            });
        } else {
            // User hasn't liked this review yet, so like it
            await ReviewLike.create({
                review_id: reviewId,
                user_id: userId
            });
            
            // Get updated like count
            const likeCount = await ReviewLike.count({
                where: { review_id: reviewId }
            });
            
            return res.json({
                message: 'Review liked successfully',
                liked: true,
                likeCount
            });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Failed to toggle like', error: error.message });
    }
};

// Check if a user has liked a review
export const checkLikeStatus = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Check if review exists
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user has liked this review
        const like = await ReviewLike.findOne({
            where: {
                review_id: reviewId,
                user_id: userId
            }
        });

        // Get total like count
        const likeCount = await ReviewLike.count({
            where: { review_id: reviewId }
        });

        res.json({
            liked: !!like,
            likeCount
        });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ message: 'Failed to check like status', error: error.message });
    }
};

// Get all likes for a review
export const getReviewLikes = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Check if review exists
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Get likes with pagination
        const offset = (page - 1) * limit;
        
        const likes = await ReviewLike.findAndCountAll({
            where: { review_id: reviewId },
            include: [{
                model: User,
                attributes: ['id', 'username', 'profileImage']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(likes.count / limit);

        res.json({
            likes: likes.rows,
            pagination: {
                total: likes.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting review likes:', error);
        res.status(500).json({ message: 'Failed to get review likes', error: error.message });
    }
};

// Get reviews liked by a user
export const getUserLikedReviews = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const { page = 1, limit = 10 } = req.query;
        
        // Only admins can see other users' liked reviews
        if (userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Pagination
        const offset = (page - 1) * limit;
        
        // Get reviews liked by the user with pagination
        const likedReviews = await ReviewLike.findAndCountAll({
            where: { user_id: userId },
            include: [{
                model: Review,
                where: { status: 'approved' },
                include: [
                    { 
                        model: User,
                        attributes: ['id', 'username', 'profileImage']
                    },
                    { model: ReviewImage },
                    { 
                        model: Product,
                        attributes: ['id', 'name', 'slug']
                    }
                ]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(likedReviews.count / limit);
        
        res.json({
            likedReviews: likedReviews.rows.map(like => like.Review),
            pagination: {
                total: likedReviews.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting user liked reviews:', error);
        res.status(500).json({ message: 'Failed to get liked reviews', error: error.message });
    }
}; 