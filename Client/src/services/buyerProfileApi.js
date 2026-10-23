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
  }
};
