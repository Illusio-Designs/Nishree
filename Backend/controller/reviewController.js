import { Review } from '../model/reviewModel.js';
import { ReviewImage } from '../model/reviewImageModel.js';
import { Product } from '../model/productModel.js';
import { Order } from '../model/orderModel.js';
import { OrderItem } from '../model/orderItemModel.js';
import { User } from '../model/userModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { upload } from '../middleware/uploadMiddleware.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to update product review statistics
const updateProductReviewStats = async (productId, transaction) => {
    try {
        // Get all approved reviews for this product
        const reviews = await Review.findAll({
            where: { 
                product_id: productId,
                status: 'approved'
            },
            attributes: [
                'rating',
                [sequelize.fn('COUNT', sequelize.col('id')), 'review_count']
            ],
            group: ['product_id'],
            transaction
        });

        // Calculate average rating
        const avgRating = await Review.findOne({
            where: { 
                product_id: productId,
                status: 'approved'
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
            ],
            transaction
        });

        // Check if product has video reviews
        const hasVideoReviews = await ReviewImage.findOne({
            include: [{
                model: Review,
                where: { 
                    product_id: productId,
                    status: 'approved'
                }
            }],
            where: { file_type: 'video' },
            transaction
        });

        // Update product statistics
        await Product.update({
            avg_rating: avgRating ? avgRating.getDataValue('avg_rating') : null,
            review_count: reviews.length > 0 ? reviews[0].getDataValue('review_count') : 0,
            has_video_reviews: !!hasVideoReviews
        }, {
            where: { id: productId },
            transaction
        });

    } catch (error) {
        console.error('Error updating product review stats:', error);
        throw error;
    }
};

// Create a new review
export const createReview = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { product_id, order_id, rating, review } = req.body;
        const userId = req.user.id;
        const files = req.files;

        // Validate required fields
        if (!product_id || !rating) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Product ID and rating are required' });
        }

        // Validate rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if product exists
        const product = await Product.findByPk(product_id, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            where: {
                user_id: userId,
                product_id
            },
            transaction
        });

        if (existingReview) {
            await transaction.rollback();
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user has purchased the product for verified purchase badge
        let verifiedPurchase = false;
        let userOrderId = order_id;

        if (!userOrderId) {
            // If order_id not provided, check if user has purchased the product
            const userOrders = await Order.findAll({
                where: {
                    user_id: userId,
                    status: 'delivered'  // Only count delivered orders
                },
                include: [{
                    model: OrderItem,
                    where: { product_id }
                }],
                transaction
            });

            if (userOrders && userOrders.length > 0) {
                verifiedPurchase = true;
                userOrderId = userOrders[0].id;
            }
        } else {
            // Verify that the provided order_id belongs to the user and contains the product
            const order = await Order.findOne({
                where: {
                    id: userOrderId,
                    user_id: userId,
                    status: 'delivered'  // Only count delivered orders
                },
                include: [{
                    model: OrderItem,
                    where: { product_id }
                }],
                transaction
            });

            if (order) {
                verifiedPurchase = true;
            } else {
                // If order doesn't exist or doesn't contain the product, don't use it
                userOrderId = null;
            }
        }

        // Create new review
        const newReview = await Review.create({
            user_id: userId,
            product_id,
            order_id: userOrderId,
            rating,
            review: review || null,
            status: 'pending',  // All reviews need moderation
            verified_purchase: verifiedPurchase,
            is_featured: false  // Default not featured
        }, { transaction });

        // Handle uploaded files
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => {
                const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';
                
                return ReviewImage.create({
                    review_id: newReview.id,
                    file_name: file.filename,
                    file_type: fileType
                }, { transaction });
            });

            await Promise.all(uploadPromises);

            // If there's at least one video, update product
            const hasVideo = files.some(file => file.mimetype.startsWith('video/'));
            if (hasVideo) {
                await Product.update({
                    has_video_reviews: true
                }, {
                    where: { id: product_id },
                    transaction
                });
            }
        }

        // Update product review statistics
        await updateProductReviewStats(product_id, transaction);

        await transaction.commit();

        // Fetch the created review with its images
        const createdReview = await Review.findByPk(newReview.id, {
            include: [
                { model: ReviewImage },
                { 
                    model: User,
                    attributes: ['id', 'username', 'profileImage']
                }
            ]
        });

        res.status(201).json({
            message: 'Review submitted successfully and pending moderation',
            review: createdReview
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Failed to create review', error: error.message });
    }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { status, rating, verified, hasImages, hasVideos, featured, page = 1, limit = 10, sort = 'recent' } = req.query;
        
        // Build filter
        const filter = { product_id: productId };
        
        // For public endpoints, only show approved reviews
        if (!req.user || req.user.role !== 'admin') {
            filter.status = 'approved';
        } else if (status) {
            filter.status = status;
        }
        
        if (rating) {
            filter.rating = rating;
        }
        
        if (verified === 'true') {
            filter.verified_purchase = true;
        }
        
        // Prepare include options for ReviewImage filtering
        const includeOptions = [
            { 
                model: User,
                attributes: ['id', 'username', 'profileImage']
            },
            {
                model: ReviewImage,
                required: false
            }
        ];
        
        // If filtering by images or videos
        if (hasImages === 'true' || hasVideos === 'true') {
            const imageFilter = {};
            
            if (hasVideos === 'true') {
                imageFilter.file_type = 'video';
            } else if (hasImages === 'true') {
                imageFilter.file_type = 'image';
            }
            
            // Update the ReviewImage include option
            includeOptions[1].required = true;
            includeOptions[1].where = imageFilter;
        }
        
        // If filtering by featured reviews
        if (featured === 'true') {
            filter.is_featured = true;
        }
        
        // Set up sorting
        let order = [['createdAt', 'DESC']]; // Default: most recent
        
        if (sort === 'highest') {
            order = [['rating', 'DESC'], ['createdAt', 'DESC']];
        } else if (sort === 'lowest') {
            order = [['rating', 'ASC'], ['createdAt', 'DESC']];
        }
        
        // Pagination
        const offset = (page - 1) * limit;
        
        const reviews = await Review.findAndCountAll({
            where: filter,
            include: includeOptions,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true // For correct count when including associations
        });
        
        // Get review statistics
        const stats = await Review.findAll({
            where: { 
                product_id: productId,
                status: 'approved'
            },
            attributes: [
                'rating',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['rating']
        });
        
        // Format statistics
        const ratingStats = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        
        stats.forEach(stat => {
            ratingStats[stat.rating] = parseInt(stat.getDataValue('count'));
        });
        
        // Calculate total reviews and average rating
        const totalReviews = Object.values(ratingStats).reduce((a, b) => a + b, 0);
        const weightedSum = Object.entries(ratingStats).reduce((sum, [rating, count]) => {
            return sum + (parseInt(rating) * count);
        }, 0);
        const avgRating = totalReviews > 0 ? (weightedSum / totalReviews).toFixed(1) : 0;
        
        // Build pagination info
        const totalPages = Math.ceil(reviews.count / limit);
        
        res.json({
            reviews: reviews.rows,
            pagination: {
                total: reviews.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            },
            stats: {
                ratings: ratingStats,
                total: totalReviews,
                average: parseFloat(avgRating)
            }
        });
    } catch (error) {
        console.error('Error getting product reviews:', error);
        res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        
        // Only admins can see other users' reviews or filter by status
        if ((userId !== req.user.id || status) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Build filter
        const filter = { user_id: userId };
        
        if (status) {
            filter.status = status;
        } else if (userId !== req.user.id) {
            // If not filtering by status and not viewing own reviews, only show approved
            filter.status = 'approved';
        }
        
        // Pagination
        const offset = (page - 1) * limit;
        
        const reviews = await Review.findAndCountAll({
            where: filter,
            include: [
                { 
                    model: Product,
                    attributes: ['id', 'name', 'slug']
                },
                { model: ReviewImage }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        const totalPages = Math.ceil(reviews.count / limit);
        
        res.json({
            reviews: reviews.rows,
            pagination: {
                total: reviews.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting user reviews:', error);
        res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
};

// Get a single review
export const getReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByPk(reviewId, {
            include: [
                { model: User, attributes: ['id', 'username', 'profileImage'] },
                { model: ReviewImage }
            ]
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ message: 'Failed to fetch review', error: error.message });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { reviewId } = req.params;
        const { rating, review, status, is_featured } = req.body;
        const files = req.files;
        
        // Find the review to update
        const reviewToUpdate = await Review.findByPk(reviewId, { transaction });
        
        if (!reviewToUpdate) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Check permissions
        if (req.user.id !== reviewToUpdate.user_id && req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // For regular users, can only update own review content
        if (req.user.role !== 'admin') {
            if (reviewToUpdate.status === 'approved') {
                await transaction.rollback();
                return res.status(403).json({ message: 'Cannot update an approved review' });
            }
            
            // Update allowed fields for regular users
            if (rating) reviewToUpdate.rating = rating;
            if (review !== undefined) reviewToUpdate.review = review;
            
            // Reset to pending for re-moderation
            reviewToUpdate.status = 'pending';
        } else {
            // Admins can update all fields
            if (rating) reviewToUpdate.rating = rating;
            if (review !== undefined) reviewToUpdate.review = review;
            if (status) reviewToUpdate.status = status;
            if (is_featured !== undefined) reviewToUpdate.is_featured = is_featured;
            
            // If marked as featured, update the product
            if (is_featured) {
                await Product.update(
                    { featured_review_id: reviewId },
                    { 
                        where: { id: reviewToUpdate.product_id },
                        transaction
                    }
                );
            } else if (is_featured === false) {
                // If unmarking as featured, check if this is the featured review
                const product = await Product.findOne({
                    where: { 
                        id: reviewToUpdate.product_id,
                        featured_review_id: reviewId
                    },
                    transaction
                });
                
                if (product) {
                    await product.update({ featured_review_id: null }, { transaction });
                }
            }
        }
        
        // Save the updated review
        await reviewToUpdate.save({ transaction });
        
        // Handle uploaded files
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => {
                const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';
                
                return ReviewImage.create({
                    review_id: reviewId,
                    file_name: file.filename,
                    file_type: fileType
                }, { transaction });
            });
            
            await Promise.all(uploadPromises);
            
            // If there's at least one video, update product
            const hasVideo = files.some(file => file.mimetype.startsWith('video/'));
            if (hasVideo) {
                await Product.update({
                    has_video_reviews: true
                }, {
                    where: { id: reviewToUpdate.product_id },
                    transaction
                });
            }
        }
        
        // If it's a status update and the review is now approved, update product stats
        if (status === 'approved' || (req.user.role !== 'admin' && reviewToUpdate.status === 'pending')) {
            await updateProductReviewStats(reviewToUpdate.product_id, transaction);
        }
        
        await transaction.commit();
        
        // Fetch the updated review with its images
        const updatedReview = await Review.findByPk(reviewId, {
            include: [
                { 
                    model: User,
                    attributes: ['id', 'username', 'profileImage']
                },
                { model: ReviewImage }
            ]
        });
        
        res.json({
            message: 'Review updated successfully',
            review: updatedReview
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Failed to update review', error: error.message });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { reviewId } = req.params;
        
        // Find the review to delete
        const review = await Review.findByPk(reviewId, {
            include: [{ model: ReviewImage }],
            transaction
        });
        
        if (!review) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Check permissions
        if (req.user.id !== review.user_id && req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const productId = review.product_id;
        
        // Delete associated images from storage
        if (review.ReviewImages && review.ReviewImages.length > 0) {
            review.ReviewImages.forEach(image => {
                const imagePath = path.join(__dirname, '../uploads/reviews', image.file_name);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }
        
        // Delete associated records - Sequelize will cascade delete
        await review.destroy({ transaction });
        
        // If this was a featured review, unmark it
        await Product.update(
            { featured_review_id: null },
            { 
                where: { 
                    id: productId,
                    featured_review_id: reviewId
                },
                transaction
            }
        );
        
        // Update product review statistics
        await updateProductReviewStats(productId, transaction);
        
        await transaction.commit();
        
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
};

// Moderate a review (admin only)
export const moderateReview = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { reviewId } = req.params;
        const { status, is_featured, admin_notes } = req.body;
        
        if (!status) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Status is required' });
        }
        
        // Find the review to moderate
        const review = await Review.findByPk(reviewId, { transaction });
        
        if (!review) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Update review status
        review.status = status;
        
        // Update featured status if provided
        if (is_featured !== undefined) {
            review.is_featured = is_featured;
            
            // If marked as featured, update the product
            if (is_featured) {
                await Product.update(
                    { featured_review_id: reviewId },
                    { 
                        where: { id: review.product_id },
                        transaction
                    }
                );
            } else {
                // If unmarking as featured, check if this is the featured review
                const product = await Product.findOne({
                    where: { 
                        id: review.product_id,
                        featured_review_id: reviewId
                    },
                    transaction
                });
                
                if (product) {
                    await product.update({ featured_review_id: null }, { transaction });
                }
            }
        }
        
        // Add admin notes if provided
        if (admin_notes) {
            review.admin_notes = admin_notes;
        }
        
        await review.save({ transaction });
        
        // Update product review statistics if status changed
        await updateProductReviewStats(review.product_id, transaction);
        
        await transaction.commit();
        
        res.json({
            message: 'Review moderated successfully',
            review
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error moderating review:', error);
        res.status(500).json({ message: 'Failed to moderate review', error: error.message });
    }
};

// Delete a review image
export const deleteReviewImage = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { imageId } = req.params;
        
        // Find the image to delete
        const image = await ReviewImage.findByPk(imageId, {
            include: [{ model: Review }],
            transaction
        });
        
        if (!image) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Image not found' });
        }
        
        // Check permissions
        if (req.user.id !== image.Review.user_id && req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Delete image from storage
        const imagePath = path.join(__dirname, '../uploads/reviews', image.file_name);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        // Delete image record
        await image.destroy({ transaction });
        
        // If this was a video, check if there are any other videos for this product
        if (image.file_type === 'video') {
            const hasOtherVideos = await ReviewImage.findOne({
                include: [{
                    model: Review,
                    where: { product_id: image.Review.product_id }
                }],
                where: { 
                    file_type: 'video',
                    id: { [Op.ne]: imageId }
                },
                transaction
            });
            
            if (!hasOtherVideos) {
                await Product.update({
                    has_video_reviews: false
                }, {
                    where: { id: image.Review.product_id },
                    transaction
                });
            }
        }
        
        await transaction.commit();
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting review image:', error);
        res.status(500).json({ message: 'Failed to delete review image', error: error.message });
    }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, attributes: ['id', 'username'] },
                { model: Product, attributes: ['id', 'name'] }
            ]
        });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
};

