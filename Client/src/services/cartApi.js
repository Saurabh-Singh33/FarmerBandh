import { authClient } from './authApi';

const apiClient = authClient;

export const cartApi = {
  getCart: async () => {
    const res = await apiClient.get('/cart');
    return res.data;
  },
  addItem: async (productId, quantityQuintal, negotiatedUnitPrice = null) => {
    const payload = { productId, quantityQuintal };
    if (negotiatedUnitPrice) payload.negotiatedUnitPrice = Number(negotiatedUnitPrice);
    const res = await apiClient.post('/cart/items', payload);
    return res.data;
  },
  updateItem: async (itemId, quantityQuintal) => {
    const res = await apiClient.put(`/cart/items/${itemId}`, { quantityQuintal });
    return res.data;
  },
  removeItem: async (itemId) => {
    const res = await apiClient.delete(`/cart/items/${itemId}`);
    return res.data;
  },
  applyCoupon: async (code) => {
    const res = await apiClient.post('/cart/coupon', { code });
    return res.data;
  },
  removeCoupon: async () => {
    const res = await apiClient.delete('/cart/coupon');
    return res.data;
  },
  clearCart: async () => {
    await apiClient.delete('/cart');
  },
};
