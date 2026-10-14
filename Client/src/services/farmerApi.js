import { authClient } from './authApi';

const apiClient = authClient;

export const farmerApi = {
  getFarmerProfile: async (id) => {
    const res = await apiClient.get(`/farmers/${id}`);
    return res.data;
  },
  getFarmerListings: async (id, page = 1, pageSize = 12) => {
    const res = await apiClient.get(`/farmers/${id}/listings`, {
      params: { page, pageSize }
    });
    return res.data;
  },
  getFarmerReviews: async (id, page = 1, pageSize = 10) => {
    const res = await apiClient.get(`/farmers/${id}/reviews`, {
      params: { page, pageSize }
    });
    return res.data;
  },
};
