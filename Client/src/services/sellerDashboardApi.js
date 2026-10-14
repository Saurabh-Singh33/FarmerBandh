import { authClient } from './authApi';

const apiClient = authClient;

export const sellerDashboardApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/seller/dashboard');
    return res.data;
  }
};
