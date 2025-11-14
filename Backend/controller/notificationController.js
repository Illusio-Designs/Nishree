import { Notification } from '../model/notificationModel.js';
import { Order } from '../model/orderModel.js';

// Get user's unread notifications
export const getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await Notification.findAll({
            where: { 
                user_id: userId,
                is_read: false
            },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch notifications', 
            error: error.message 
        });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { 
                id,
                user_id: userId
            }
        });

        if (!notification) {
            return res.status(404).json({ 
                success: false,
                message: 'Notification not found' 
            });
        }

        notification.is_read = true;
        await notification.save();

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to mark notification as read', 
            error: error.message 
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update(
            { is_read: true },
            { 
                where: { 
                    user_id: userId,
                    is_read: false
                }
            }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to mark all notifications as read', 
            error: error.message 
        });
    }
};

// Create notification (internal use)
export const createNotification = async (userId, orderId, type, title, message) => {
    try {
        await Notification.create({
            user_id: userId,
            order_id: orderId,
            type,
            title,
            message,
            is_read: false
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
