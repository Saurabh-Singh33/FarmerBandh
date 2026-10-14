import { authClient } from './authApi';

const apiClient = authClient;

export const disputeApi = {
  createDispute: async (data) => {
    const payload = {
      orderId: data.orderId,
      category: data.category,
      subject: data.subject,
      initialMessage: data.description || data.initialMessage || '',
      description: data.description || data.initialMessage || '',
    };

    if (data.orderId) {
      try {
        const res = await apiClient.post(`/orders/${data.orderId}/dispute`, payload);
        return res.data;
      } catch (err) {
        // Fallback to direct /disputes endpoint
        const res = await apiClient.post('/disputes', payload);
        return res.data;
      }
    }

    const res = await apiClient.post('/disputes', payload);
    return res.data;
  },
  getBuyerDisputes: async (params = {}) => {
    const res = await apiClient.get('/disputes', { params });
    return res.data;
  },
  getSellerDisputes: async (params = {}) => {
    const res = await apiClient.get('/disputes', { params });
    return res.data;
  },
  getDisputeById: async (id) => {
    const res = await apiClient.get(`/disputes/${id}`);
    return res.data;
  },
  addMessage: async (id, message) => {
    const res = await apiClient.post(`/disputes/${id}/messages`, {
      body: message,
      message: message,
    });
    return res.data;
  },
  updateDisputeStatus: async (id, status, resolutionSummary) => {
    const payload = { status, resolutionSummary, resolutionNote: resolutionSummary };
    if (status === 'Resolved') {
      try {
        const res = await apiClient.post(`/disputes/${id}/resolve`, { resolutionNote: resolutionSummary });
        return res.data;
      } catch {
        const res = await apiClient.put(`/disputes/${id}/status`, payload);
        return res.data;
      }
    } else if (status === 'Closed') {
      try {
        const res = await apiClient.post(`/disputes/${id}/close`);
        return res.data;
      } catch {
        const res = await apiClient.put(`/disputes/${id}/status`, payload);
        return res.data;
      }
    }
    const res = await apiClient.put(`/disputes/${id}/status`, payload);
    return res.data;
  },
};
