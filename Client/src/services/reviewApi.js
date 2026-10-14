import { authClient } from './authApi';

const apiClient = authClient;

export const reviewApi = {
  createReview: async (data) => {
    const itemPayload = {
      productId: data.productId,
      rating: Number(data.rating),
      title: data.title || '',
      body: data.comment || data.body || data.title || '',
    };
    const res = await apiClient.post(`/orders/${data.orderId}/reviews`, {
      items: [itemPayload],
      reviews: [itemPayload],
    });
    return res.data;
  },

  updateReview: async (id, data) => {
    const res = await apiClient.put(`/reviews/${id}`, {
      rating: Number(data.rating),
      title: data.title || '',
      body: data.comment || data.body || '',
    });
    return res.data;
  },

  getOrderReviews: async (orderId) => {
    const res = await apiClient.get(`/orders/${orderId}/reviews`);
    return res.data || [];
  },

  getProductReviews: async (productId) => {
    const res = await apiClient.get(`/products/${productId}/reviews`);
    return res.data.items || res.data || [];
  },

  deleteReview: async (id) => {
    const res = await apiClient.delete(`/reviews/${id}`);
    return res.data;
  },

  replyToReview: async (id, farmerReply) => {
    const res = await apiClient.put(`/reviews/${id}`, { body: farmerReply });
    return res.data;
  },
};
