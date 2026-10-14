import { authClient } from './authApi';

const apiClient = authClient;

export const sellerListingApi = {
  getListings: async (params = {}) => {
    const res = await apiClient.get('/seller/listings', { params });
    return res.data;
  },
  getListing: async (id) => {
    const res = await apiClient.get(`/seller/listings/${id}`);
    return res.data;
  },
  createListing: async (data) => {
    const res = await apiClient.post('/seller/listings', data);
    return res.data;
  },
  updateListing: async (id, data) => {
    const res = await apiClient.put(`/seller/listings/${id}`, data);
    return res.data;
  },
  deleteListing: async (id) => {
    const res = await apiClient.delete(`/seller/listings/${id}`);
    return res.data;
  },
  publishListing: async (id) => {
    const res = await apiClient.patch(`/seller/listings/${id}/publish`);
    return res.data;
  },
  unpublishListing: async (id) => {
    const res = await apiClient.patch(`/seller/listings/${id}/unpublish`);
    return res.data;
  },
  markOutOfStock: async (id) => {
    const res = await apiClient.patch(`/seller/listings/${id}/out-of-stock`);
    return res.data;
  },
  restockListing: async (id) => {
    const res = await apiClient.patch(`/seller/listings/${id}/restock`);
    return res.data;
  }
};
