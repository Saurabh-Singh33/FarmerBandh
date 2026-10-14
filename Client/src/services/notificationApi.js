import authApi from './authApi';

/**
 * Service client for all in-app notification and preference operations.
 */
export const notificationApi = {
  /**
   * List paginated notifications for the current user.
   * @param {Object} params - { unreadOnly: boolean, category: number, page: number, pageSize: number }
   */
  list: async (params = {}) => {
    const res = await authApi.get('/notifications', { params });
    return res.data;
  },

  /**
   * Get unread notification count across all categories.
   */
  unreadCount: async () => {
    const res = await authApi.get('/notifications/unread-count');
    return res.data;
  },

  /**
   * Get a single notification and mark it as read.
   */
  get: async (id) => {
    const res = await authApi.get(`/notifications/${id}`);
    return res.data;
  },

  /**
   * Explicitly mark a notification as read.
   */
  markRead: async (id) => {
    await authApi.post(`/notifications/${id}/read`);
  },

  /**
   * Mark all unread notifications as read.
   */
  markAllRead: async () => {
    const res = await authApi.post('/notifications/read-all');
    return res.data;
  },

  /**
   * Delete a single notification.
   */
  remove: async (id) => {
    await authApi.delete(`/notifications/${id}`);
  },

  /**
   * Clear notifications (onlyRead: true deletes only read, false deletes all).
   */
  clear: async (onlyRead = true) => {
    const res = await authApi.delete('/notifications', { params: { onlyRead } });
    return res.data;
  },

  /**
   * Get current user's category notification preferences.
   */
  getPreferences: async () => {
    const res = await authApi.get('/notifications/preferences');
    return res.data;
  },

  /**
   * Update current user's notification preferences.
   */
  updatePreferences: async (payload) => {
    const res = await authApi.put('/notifications/preferences', payload);
    return res.data;
  }
};
