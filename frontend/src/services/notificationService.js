import api from './api';

/**
 * Service for Notification operations (Module D).
 */
const notificationService = {
    /**
     * Get all notifications for the current user.
     */
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data.data;
    },

    /**
     * Get unread notification count.
     */
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data.data;
    },

    /**
     * Mark a notification as read.
     */
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data.data;
    },

    /**
     * Mark all notifications as read.
     */
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },

    /**
     * Delete a notification.
     */
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    /**
     * Get notification settings for the current user.
     */
    getNotificationSettings: async () => {
        const response = await api.get('/notifications/settings');
        return response.data.data;
    },

    /**
     * Update notification settings.
     */
    updateNotificationSettings: async (enabled) => {
        const response = await api.patch(`/notifications/settings/${enabled}`);
        return response.data;
    }
};

export default notificationService;
