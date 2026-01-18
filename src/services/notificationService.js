import api from '../api/client';

export const NotificationService = {
  // Get all notifications for current user
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark specific notification as read
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};
