import { authClient } from './authApi';

const apiClient = authClient;

export const negotiationApi = {
  // Buyer
  createNegotiation: async (data) => {
    const res = await apiClient.post('/negotiations', data);
    return res.data;
  },
  getBuyerNegotiations: async (status = null) => {
    const params = status ? { status } : {};
    const res = await apiClient.get('/negotiations', { params });
    return res.data;
  },
  getBuyerNegotiationById: async (id) => {
    const res = await apiClient.get(`/negotiations/${id}`);
    return res.data;
  },
  postBuyerMessage: async (id, data) => {
    const res = await apiClient.post(`/negotiations/${id}/messages`, data);
    return res.data;
  },
  acceptBuyerOffer: async (id) => {
    const res = await apiClient.post(`/negotiations/${id}/accept`);
    return res.data;
  },
  rejectBuyerOffer: async (id, reason = '') => {
    const res = await apiClient.post(`/negotiations/${id}/reject`, { reason });
    return res.data;
  },
  withdrawBuyerOffer: async (id) => {
    const res = await apiClient.post(`/negotiations/${id}/withdraw`);
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await apiClient.get('/negotiations/unread-count');
    return res.data;
  },

  // Seller
  getSellerNegotiations: async (status = null) => {
    const params = status ? { status } : {};
    const res = await apiClient.get('/seller/negotiations', { params });
    return res.data;
  },
  getSellerNegotiationById: async (id) => {
    const res = await apiClient.get(`/seller/negotiations/${id}`);
    return res.data;
  },
  postSellerMessage: async (id, data) => {
    const res = await apiClient.post(`/seller/negotiations/${id}/messages`, data);
    return res.data;
  },
  acceptSellerOffer: async (id) => {
    const res = await apiClient.post(`/seller/negotiations/${id}/accept`);
    return res.data;
  },
  rejectSellerOffer: async (id, reason = '') => {
    const res = await apiClient.post(`/seller/negotiations/${id}/reject`, { reason });
    return res.data;
  },
};
