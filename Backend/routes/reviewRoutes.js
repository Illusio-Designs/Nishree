import express from 'express';
import reviewController from '../controller/reviewController.js';
import reviewLikeController from '../controller/reviewLikeController.js';
import reviewCommentController from '../controller/reviewCommentController.js';
import reviewReportController from '../controller/reviewReportController.js';
import { isAuthenticated, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============= Review Core Routes =============
// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/:reviewId', reviewController.getReviewById);

// Protected routes
router.post('/', isAuthenticated, reviewController.upload.array('files', 5), reviewController.createReview);
router.put('/:reviewId', isAuthenticated, reviewController.upload.array('files', 5), reviewController.updateReview);
router.delete('/:reviewId', isAuthenticated, reviewController.deleteReview);
router.delete('/image/:imageId', isAuthenticated, reviewController.deleteReviewImage);

// User-specific routes
router.get('/user/me', isAuthenticated, reviewController.getUserReviews);
router.get('/user/:userId', authorize(['admin']), reviewController.getUserReviews);

// Admin moderation routes
router.put('/moderate/:reviewId', authorize(['admin']), reviewController.moderateReview);

// ============= Review Like Routes =============
// Like management
router.post('/:reviewId/like', isAuthenticated, reviewLikeController.toggleLike);
router.get('/:reviewId/like/status', isAuthenticated, reviewLikeController.checkLikeStatus);
router.get('/:reviewId/likes', reviewLikeController.getReviewLikes);

// User like history
router.get('/likes/user/me', isAuthenticated, reviewLikeController.getUserLikedReviews);
router.get('/likes/user/:userId', authorize(['admin']), reviewLikeController.getUserLikedReviews);

// ============= Review Comment Routes =============
// Comment management
router.post('/:reviewId/comment', isAuthenticated, reviewCommentController.createComment);
router.get('/:reviewId/comments', reviewCommentController.getReviewComments);
router.put('/comment/:commentId', isAuthenticated, reviewCommentController.updateComment);
router.delete('/comment/:commentId', isAuthenticated, reviewCommentController.deleteComment);

// Admin comment moderation
router.put('/comment/:commentId/moderate', authorize(['admin']), reviewCommentController.moderateComment);

// ============= Review Report Routes =============
// Report management
router.post('/:reviewId/report', isAuthenticated, reviewReportController.reportReview);

// Admin report management
router.get('/reports', authorize(['admin']), reviewReportController.getAllReports);
router.get('/:reviewId/reports', authorize(['admin']), reviewReportController.getReviewReports);
router.put('/report/:reportId', authorize(['admin']), reviewReportController.updateReportStatus);

export default router; 