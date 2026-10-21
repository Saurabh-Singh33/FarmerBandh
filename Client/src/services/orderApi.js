import { authClient } from './authApi';

const apiClient = authClient;

export const orderApi = {
  createOrder: async (data) => {
    const res = await apiClient.post('/orders', data);
    return res.data;
  },
  getBuyerOrders: async (params = {}) => {
    const res = await apiClient.get('/orders', { params });
    return res.data;
  },
  getBuyerOrderById: async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },
  cancelOrder: async (id, reason) => {
    await apiClient.post(`/orders/${id}/cancel`, { reason });
  },
  deleteOrder: async (id) => {
    const res = await apiClient.delete(`/orders/${id}`);
    return res.data;
  },
  reorder: async (id) => {

    const res = await apiClient.post(`/orders/${id}/reorder`);
    return res.data;
  },
  getSellerOrders: async (params = {}) => {
    const res = await apiClient.get('/seller/orders', { params });
    return res.data;
  },
  sellerList: async (params = {}) => {
    const res = await apiClient.get('/seller/orders', { params });
    return res.data;
  },
  getSellerOrderById: async (id) => {
    const res = await apiClient.get(`/seller/orders/${id}`);
    return res.data;
  },
  updateOrderStatus: async (id, status) => {
    const res = await apiClient.put(`/seller/orders/${id}/status`, { status });
    return res.data;
  },
  rejectOrder: async (id, reason) => {
    const res = await apiClient.post(`/seller/orders/${id}/reject`, { reason });
    return res.data;
  },
  payOrder: async (id, data) => {
    const res = await apiClient.post(`/orders/${id}/pay`, data);
    return res.data;
  },
  updateSellerPaymentStatus: async (id, data) => {
    const res = await apiClient.put(`/seller/orders/${id}/payment-status`, data);
    return res.data;
  },
  getPublicSettings: async () => {
    const res = await apiClient.get('/settings/public');
    return res.data;
  },
  getTimeline: async (orderId) => {
    const res = await apiClient.get(`/orders/${orderId}/timeline`);
    return res.data;
  },
};
