import { authClient } from './authApi';

const apiClient = authClient;

export const addressApi = {
  listAddresses: async () => {
    const res = await apiClient.get('/addresses');
    return res.data;
  },
  createAddress: async (data) => {
    const res = await apiClient.post('/addresses', data);
    return res.data;
  },
  updateAddress: async (id, data) => {
    const res = await apiClient.put(`/addresses/${id}`, data);
    return res.data;
  },
  deleteAddress: async (id) => {
    await apiClient.delete(`/addresses/${id}`);
  },
  setDefaultAddress: async (id) => {
    await apiClient.put(`/addresses/${id}/default`);
  },
};
