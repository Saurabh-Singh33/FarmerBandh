import { authClient } from './authApi';

const apiClient = authClient;

export const payoutApi = {
  getPayouts: async (params = {}) => {
    const res = await apiClient.get('/seller/payouts', { params });
    return res.data;
  },
  getSummary: async () => {
    const res = await apiClient.get('/seller/payouts/summary');
    return res.data;
  },
  requestPayout: async (data) => {
    const res = await apiClient.post('/seller/payouts', data);
    return res.data;
  },
  mockProcessPayout: async (id) => {
    const res = await apiClient.post(`/seller/payouts/${id}/mock-process`);
    return res.data;
  }
};
