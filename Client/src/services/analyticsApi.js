import { authClient } from './authApi';

const apiClient = authClient;

export const analyticsApi = {
  getOverview: async (range = '30d') => {
    const res = await apiClient.get('/seller/analytics/overview', { params: { range } });
    return res.data;
  },
  getRevenue: async (range = '30d') => {
    const res = await apiClient.get('/seller/analytics/revenue', { params: { range } });
    return res.data;
  },
  getTopProducts: async (limit = 5) => {
    const res = await apiClient.get('/seller/analytics/top-products', { params: { limit } });
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get('/seller/analytics/categories');
    return res.data;
  },
  getBuyerLocations: async () => {
    const res = await apiClient.get('/seller/analytics/buyer-locations');
    return res.data;
  },
  getOrderStatus: async () => {
    const res = await apiClient.get('/seller/analytics/order-status');
    return res.data;
  }
};
