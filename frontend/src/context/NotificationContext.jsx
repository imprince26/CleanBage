import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Set up polling for new notifications
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fetch all notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const res = await api.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch only unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const res = await api.get('/api/notifications/count');
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === id
              ? { ...notification, isRead: true, readAt: new Date() }
              : notification
          )
        );
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const res = await api.put('/api/notifications/read-all');
      if (res.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date()
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const res = await api.delete(`/api/notifications/${id}`);
      if (res.data.success) {
        const deletedNotification = notifications.find(n => n._id === id);
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification._id !== id)
        );
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    try {
      const res = await api.delete('/api/notifications/delete-read');
      if (res.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => !notification.isRead)
        );
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};