import { authClient } from './authApi';

const apiClient = authClient;

export const sellerProfileApi = {
  getProfile: async () => {
    const res = await apiClient.get('/seller/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await apiClient.put('/seller/profile', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await apiClient.put('/seller/profile/password', data);
    return res.data;
  },
  getSettings: async () => {
    const res = await apiClient.get('/seller/settings');
    return res.data;
  },
  updateSettings: async (data) => {
    const res = await apiClient.put('/seller/settings', data);
    return res.data;
  },
  deleteAccount: async (data) => {
    try {
      const res = await apiClient.post('/seller/account/delete', data);
      return res.data;
    } catch (err) {
      if (err?.response?.status === 405 || err?.response?.status === 404) {
        const res = await apiClient.delete('/seller/account', { data });
        return res.data;
      }
      throw err;
    }
  }
};
