const ReviewComment = require('../model/reviewCommentModel');
const Review = require('../model/reviewModel');
const User = require('../model/userModel');

// Create a new comment on a review
const createComment = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { comment } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!comment) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        // Check if review exists and is approved
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.status !== 'approved') {
            return res.status(400).json({ message: 'Cannot comment on an unapproved review' });
        }

        // Create new comment
        const newComment = await ReviewComment.create({
            review_id: reviewId,
            user_id: userId,
            comment,
            status: 'approved' // Auto-approve for now, but could be changed to 'pending' for moderation
        });

        // Get the created comment with user info
        const createdComment = await ReviewComment.findByPk(newComment.id, {
            include: [{
                model: User,
                attributes: ['id', 'username', 'profileImage']
            }]
        });

        res.status(201).json({
            message: 'Comment added successfully',
            comment: createdComment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
};

// Get all comments for a review
const getReviewComments = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { page = 1, limit = 20, status } = req.query;

        // Check if review exists
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Build filter
        const filter = { review_id: reviewId };
        
        // For public endpoints, only show approved comments
        if (!req.user || req.user.role !== 'admin') {
            filter.status = 'approved';
        } else if (status) {
            filter.status = status;
        }

        // Pagination
        const offset = (page - 1) * limit;
        
        // Get comments with pagination
        const comments = await ReviewComment.findAndCountAll({
            where: filter,
            include: [{
                model: User,
                attributes: ['id', 'username', 'profileImage']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'ASC']] // Oldest first for conversation flow
        });

        const totalPages = Math.ceil(comments.count / limit);

        res.json({
            comments: comments.rows,
            pagination: {
                total: comments.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting review comments:', error);
        res.status(500).json({ message: 'Failed to get comments', error: error.message });
    }
};

// Update a comment
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { comment, status } = req.body;
        
        // Find the comment to update
        const commentToUpdate = await ReviewComment.findByPk(commentId);
        
        if (!commentToUpdate) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check permissions
        if (req.user.id !== commentToUpdate.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Update comment
        if (comment) {
            commentToUpdate.comment = comment;
        }
        
        // Only admins can update status
        if (status && req.user.role === 'admin') {
            commentToUpdate.status = status;
        }
        
        await commentToUpdate.save();
        
        // Get the updated comment with user info
        const updatedComment = await ReviewComment.findByPk(commentId, {
            include: [{
                model: User,
                attributes: ['id', 'username', 'profileImage']
            }]
        });
        
        res.json({
            message: 'Comment updated successfully',
            comment: updatedComment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Failed to update comment', error: error.message });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        // Find the comment to delete
        const comment = await ReviewComment.findByPk(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check permissions
        if (req.user.id !== comment.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Delete comment
        await comment.destroy();
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment', error: error.message });
    }
};

// Moderate a comment (admin only)
const moderateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        // Find the comment to moderate
        const comment = await ReviewComment.findByPk(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Update comment status
        comment.status = status;
        await comment.save();
        
        res.json({
            message: 'Comment moderated successfully',
            comment
        });
    } catch (error) {
        console.error('Error moderating comment:', error);
        res.status(500).json({ message: 'Failed to moderate comment', error: error.message });
    }
};

module.exports = {
    createComment,
    getReviewComments,
    updateComment,
    deleteComment,
    moderateComment
}; 