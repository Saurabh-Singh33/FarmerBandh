import { authClient } from './authApi';

const apiClient = authClient;

export const mandiApi = {
  getComparison: async (params = {}) => {
    const res = await apiClient.get('/mandi-prices/comparison', { params });
    return res.data;
  },

  getLiveRates: async (params = {}) => {
    const res = await apiClient.get('/mandi-prices/live', { params });
    return res.data;
  },

  getCommodities: async () => {
    const res = await apiClient.get('/mandi-prices/commodities');
    return res.data;
  },

  getStates: async () => {
    const res = await apiClient.get('/mandi-prices/states');
    return res.data;
  }
};
