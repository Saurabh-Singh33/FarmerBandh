import { authClient } from './authApi';

/**
 * Service client for Contact Support operations:
 * - Public user message submissions
 * - Admin message queue, ticket tracking, and direct email replies
 */
export const contactApi = {
  /**
   * Submit a public contact message directly to admin desk.
   * Accessible by visitors, farmers, buyers, partners.
   */
  submit: async (payload) => {
    const res = await authClient.post('/contact', payload);
    return res.data;
  },

  /**
   * Retrieve paginated contact messages for admin portal.
   * @param {Object} params - { search, status, userType, page, pageSize }
   */
  list: async (params = {}) => {
    const res = await authClient.get('/admin/contacts', { params });
    return res.data;
  },

  /**
   * Get single contact message details by ID.
   */
  getById: async (id) => {
    const res = await authClient.get(`/admin/contacts/${id}`);
    return res.data;
  },

  /**
   * Update message status (Pending, InReview, Replied, Closed) and optional admin notes.
   */
  updateStatus: async (id, payload) => {
    const res = await authClient.patch(`/admin/contacts/${id}/status`, payload);
    return res.data;
  },

  /**
   * Send direct email reply from admin to the inquiry sender.
   * Automatically updates status to 'Replied'.
   */
  reply: async (id, payload) => {
    const res = await authClient.post(`/admin/contacts/${id}/reply`, payload);
    return res.data;
  },

  /**
   * Remove a contact message.
   */
  delete: async (id) => {
    const res = await authClient.delete(`/admin/contacts/${id}`);
    return res.data;
  }
};

export default contactApi;
