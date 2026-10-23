import { authClient } from './authApi';

const apiClient = authClient;

export const buyerProfileApi = {
  getProfile: async () => {
    const res = await apiClient.get('/buyer/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await apiClient.put('/buyer/profile', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await apiClient.put('/buyer/profile/password', data);
    return res.data;
  },
  deleteAccount: async (data) => {
    try {
      const res = await apiClient.post('/buyer/profile/delete', data);
      return res.data;
    } catch (err) {
      if (err?.response?.status === 405 || err?.response?.status === 404) {
        const res = await apiClient.delete('/buyer/profile', { data });
        return res.data;
      }
      throw err;
    }
  }
};
