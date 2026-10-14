import { authClient } from './authApi';

const apiClient = authClient;

export const returnApi = {
  createReturnRequest: async (data) => {
    const endpoint = data?.orderId ? `/orders/${data.orderId}/return` : '/returns';
    const res = await apiClient.post(endpoint, data);
    return res.data;
  },
  getBuyerReturns: async (params = {}) => {
    const res = await apiClient.get('/returns', { params });
    return res.data;
  },
  getReturnById: async (id) => {
    const res = await apiClient.get(`/returns/${id}`);
    return res.data;
  },
  getSellerReturns: async (params = {}) => {
    const res = await apiClient.get('/seller/returns', { params });
    return res.data;
  },
  updateReturnStatus: async (id, status, sellerNote) => {
    const res = await apiClient.put(`/returns/${id}/status`, { status, sellerNote });
    return res.data;
  },
  addReturnMessage: async (id, data) => {
    const res = await apiClient.post(`/returns/${id}/messages`, data);
    return res.data;
  },
  deleteReturnMessage: async (returnId, messageId, forEveryone = true) => {
    const res = await apiClient.delete(`/returns/${returnId}/messages/${messageId}`, {
      params: { forEveryone }
    });
    return res.data;
  },
  deleteReturn: async (id, deleteOrder = false) => {
    const res = await apiClient.delete(`/returns/${id}`, {
      params: { deleteOrder }
    });
    return res.data;
  },
};

