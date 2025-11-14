import { useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const response = await api.get('/api/notifications/unread');
        
        if (response.data.success && response.data.notifications.length > 0) {
          // Show each notification as a toast
          response.data.notifications.forEach((notification) => {
            toast.info(
              <div>
                <strong>{notification.title}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                  {notification.message}
                </p>
              </div>,
              {
                autoClose: 5000,
                onClose: () => markAsRead(notification.id)
              }
            );
          });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const markAsRead = async (notificationId) => {
      try {
        await api.put(`/api/notifications/${notificationId}/read`);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };

    // Check notifications on mount
    checkNotifications();

    // Check notifications every 30 seconds
    const interval = setInterval(checkNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);
};
