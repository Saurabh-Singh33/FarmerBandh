import { authClient } from './authApi';

const apiClient = authClient;

export const productApi = {
  list: async (params = {}) => {
    const res = await apiClient.get('/products', { params });
    return res.data;
  },
  getByIdOrSlug: async (idOrSlug) => {
    const res = await apiClient.get(`/products/${idOrSlug}`);
    return res.data;
  },
  getSimilar: async (idOrSlug) => {
    const res = await apiClient.get(`/products/${idOrSlug}/similar`);
    return res.data;
  },
  listCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data;
  },
  createProduct: async (data) => {
    const res = await apiClient.post('/products', data);
    return res.data;
  },
  updateProduct: async (id, data) => {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },
  listSellerProducts: async (params = {}) => {
    const res = await apiClient.get('/seller/products', { params });
    return res.data;
  },
};
