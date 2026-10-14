import { authClient } from './authApi';

/**
 * Service client for all in-app notification and preference operations.
 */
export const notificationApi = {
  /**
   * List paginated notifications for the current user.
   * @param {Object} params - { unreadOnly: boolean, category: string|number, page: number, pageSize: number }
   */
  list: async (params = {}) => {
    const res = await authClient.get('/notifications', { params });
    return res.data;
  },

  /**
   * Get unread notification count across all categories.
   */
  unreadCount: async () => {
    const res = await authClient.get('/notifications/unread-count');
    return res.data;
  },

  /**
   * Get a single notification and mark it as read.
   */
  get: async (id) => {
    const res = await authClient.get(`/notifications/${id}`);
    return res.data;
  },

  /**
   * Explicitly mark a notification as read.
   */
  markRead: async (id) => {
    await authClient.post(`/notifications/${id}/read`);
  },

  /**
   * Mark all unread notifications as read.
   */
  markAllRead: async () => {
    const res = await authClient.post('/notifications/read-all');
    return res.data;
  },

  /**
   * Delete a single notification.
   */
  delete: async (id) => {
    await authClient.delete(`/notifications/${id}`);
  },

  /**
   * Alias for delete.
   */
  remove: async (id) => {
    await authClient.delete(`/notifications/${id}`);
  },

  /**
   * Clear read notifications.
   */
  clearRead: async () => {
    const res = await authClient.delete('/notifications', { params: { onlyRead: true } });
    return res.data;
  },

  /**
   * Clear notifications (onlyRead: true deletes only read, false deletes all).
   */
  clear: async (onlyRead = true) => {
    const res = await authClient.delete('/notifications', { params: { onlyRead } });
    return res.data;
  },

  /**
   * Perform a bulk action (markRead, delete) across multiple notifications.
   */
  bulkAction: async ({ notificationIds = [], action = 'markRead' }) => {
    if (!notificationIds.length) return;
    if (action === 'markRead') {
      await Promise.all(notificationIds.map((id) => authClient.post(`/notifications/${id}/read`)));
    } else if (action === 'delete') {
      await Promise.all(notificationIds.map((id) => authClient.delete(`/notifications/${id}`)));
    }
  },

  /**
   * Get current user's category notification preferences.
   */
  getPreferences: async () => {
    const res = await authClient.get('/notifications/preferences');
    return res.data;
  },

  /**
   * Update current user's notification preferences.
   */
  updatePreferences: async (payload) => {
    const res = await authClient.put('/notifications/preferences', payload);
    return res.data;
  }
};

export default notificationApi;
