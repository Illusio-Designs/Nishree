import { ReviewReport } from '../model/reviewReportModel.js';
import { Review } from '../model/reviewModel.js';
import { User } from '../model/userModel.js';
import { Product } from '../model/productModel.js';

// Report a review
export const reportReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason, details } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }

        // Check if review exists and is approved
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.status !== 'approved') {
            return res.status(400).json({ message: 'Cannot report an unapproved review' });
        }

        // Check if user has already reported this review
        const existingReport = await ReviewReport.findOne({
            where: {
                review_id: reviewId,
                user_id: userId
            }
        });

        if (existingReport) {
            return res.status(400).json({ message: 'You have already reported this review' });
        }

        // Create new report
        const newReport = await ReviewReport.create({
            review_id: reviewId,
            user_id: userId,
            reason,
            details: details || null,
            status: 'pending' // Initial status is pending
        });

        res.status(201).json({
            message: 'Review reported successfully',
            report: newReport
        });
    } catch (error) {
        console.error('Error reporting review:', error);
        res.status(500).json({ message: 'Failed to report review', error: error.message });
    }
};

// Get all reports (admin only)
export const getAllReports = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        // Build filter
        const filter = {};
        if (status) {
            filter.status = status;
        }

        // Pagination
        const offset = (page - 1) * limit;
        
        // Get reports with pagination
        const reports = await ReviewReport.findAndCountAll({
            where: filter,
            include: [
                {
                    model: Review,
                    include: [
                        { 
                            model: User,
                            attributes: ['id', 'username', 'profileImage']
                        },
                        { 
                            model: Product,
                            attributes: ['id', 'name', 'slug']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'Reporter',
                    attributes: ['id', 'username', 'profileImage']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(reports.count / limit);

        res.json({
            reports: reports.rows,
            pagination: {
                total: reports.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting reports:', error);
        res.status(500).json({ message: 'Failed to get reports', error: error.message });
    }
};

// Get reports for a specific review (admin only)
export const getReviewReports = async (req, res) => {
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
        if (status) {
            filter.status = status;
        }

        // Pagination
        const offset = (page - 1) * limit;
        
        // Get reports with pagination
        const reports = await ReviewReport.findAndCountAll({
            where: filter,
            include: [{
                model: User,
                as: 'Reporter',
                attributes: ['id', 'username', 'profileImage']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(reports.count / limit);

        res.json({
            reports: reports.rows,
            pagination: {
                total: reports.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting review reports:', error);
        res.status(500).json({ message: 'Failed to get reports', error: error.message });
    }
};

// Update report status (admin only)
export const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, admin_notes } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        // Find the report to update
        const report = await ReviewReport.findByPk(reportId);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        // Update report status
        report.status = status;
        
        // Add admin notes if provided
        if (admin_notes) {
            report.admin_notes = admin_notes;
        }
        
        await report.save();
        
        res.json({
            message: 'Report status updated successfully',
            report
        });
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ message: 'Failed to update report status', error: error.message });
    }
}; 