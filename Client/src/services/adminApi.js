import { authClient } from './authApi';

const apiClient = authClient;

export const adminDashboardApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },
  GetDashboard: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  }
};

export const adminUsersApi = {
  getUsers: async (params = {}) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },
  getUserDetail: async (id) => {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },
  suspendUser: async (id, reason) => {
    const res = await apiClient.post(`/admin/users/${id}/suspend`, { reason });
    return res.data;
  },
  reactivateUser: async (id) => {
    const res = await apiClient.post(`/admin/users/${id}/reactivate`);
    return res.data;
  },
  resetPassword: async (id) => {
    const res = await apiClient.post(`/admin/users/${id}/reset-password`);
    return res.data;
  },
  promoteUser: async (id, role = 'Admin', notes = '') => {
    const res = await apiClient.post(`/admin/users/${id}/promote`, { role, notes });
    return res.data;
  },
  demoteUser: async (id, reason = '') => {
    const res = await apiClient.post(`/admin/users/${id}/demote`, { reason });
    return res.data;
  },
  approveSeller: async (farmerId) => {
    const res = await apiClient.post(`/admin/users/farmers/${farmerId}/approve-seller`);
    return res.data;
  },
  rejectSeller: async (farmerId, reason) => {
    const res = await apiClient.post(`/admin/users/farmers/${farmerId}/reject-seller`, { reason });
    return res.data;
  },
  revokeSeller: async (farmerId, reason) => {
    const res = await apiClient.post(`/admin/users/farmers/${farmerId}/revoke-seller`, { reason });
    return res.data;
  }
};

export const adminVerificationsApi = {
  getVerifications: async (params = {}) => {
    const res = await apiClient.get('/admin/verifications', { params });
    return res.data;
  },
  getVerificationDetail: async (id) => {
    const res = await apiClient.get(`/admin/verifications/${id}`);
    return res.data;
  },
  approveVerification: async (id) => {
    const res = await apiClient.post(`/admin/verifications/${id}/approve`);
    return res.data;
  },
  rejectVerification: async (id, reason, notes = '') => {
    const res = await apiClient.post(`/admin/verifications/${id}/reject`, { reason, notes });
    return res.data;
  }
};

export const adminListingsApi = {
  getListings: async (params = {}) => {
    const res = await apiClient.get('/admin/listings', { params });
    return res.data;
  },
  getListingDetail: async (id) => {
    const res = await apiClient.get(`/admin/listings/${id}`);
    return res.data;
  },
  flagListing: async (id, reason) => {
    const res = await apiClient.post(`/admin/listings/${id}/flag`, { reason });
    return res.data;
  },
  unflagListing: async (id) => {
    const res = await apiClient.post(`/admin/listings/${id}/unflag`);
    return res.data;
  },
  removeListing: async (id, reason) => {
    const res = await apiClient.post(`/admin/listings/${id}/remove`, { reason });
    return res.data;
  },
  restoreListing: async (id) => {
    const res = await apiClient.post(`/admin/listings/${id}/restore`);
    return res.data;
  },
  featureListing: async (id) => {
    const res = await apiClient.post(`/admin/listings/${id}/feature`);
    return res.data;
  },
  unfeatureListing: async (id) => {
    const res = await apiClient.post(`/admin/listings/${id}/unfeature`);
    return res.data;
  },
  getFeaturedListings: async () => {
    const res = await apiClient.get('/admin/featured-listings');
    return res.data;
  },
  reorderFeaturedListings: async (orders) => {
    const res = await apiClient.put('/admin/featured-listings/order', { orders });
    return res.data;
  }
};

export const adminOrdersApi = {
  getOrders: async (params = {}) => {
    const res = await apiClient.get('/admin/orders', { params });
    return res.data;
  },
  getOrderDetail: async (id) => {
    const res = await apiClient.get(`/admin/orders/${id}`);
    return res.data;
  },
  refundOrder: async (id, data) => {
    const res = await apiClient.post(`/admin/orders/${id}/refund`, data);
    return res.data;
  },
  forceCompleteOrder: async (id) => {
    const res = await apiClient.post(`/admin/orders/${id}/force-complete`);
    return res.data;
  },
  cancelOrder: async (id, reason) => {
    const res = await apiClient.post(`/admin/orders/${id}/cancel`, { reason });
    return res.data;
  },
  overrideStatus: async (id, newStatus, reason) => {
    const res = await apiClient.put(`/admin/orders/${id}/status`, { newStatus, reason });
    return res.data;
  }
};

export const adminDisputesApi = {
  getDisputes: async (params = {}) => {
    const res = await apiClient.get('/admin/disputes', { params });
    return res.data;
  },
  getDisputeDetail: async (id) => {
    const res = await apiClient.get(`/admin/disputes/${id}`);
    return res.data;
  },
  escalateDispute: async (id) => {
    const res = await apiClient.post(`/admin/disputes/${id}/escalate`);
    return res.data;
  },
  resolveDispute: async (id, resolution, resolutionNote, refundAmount = null) => {
    const res = await apiClient.post(`/admin/disputes/${id}/resolve`, {
      resolution,
      resolutionNote,
      refundAmount
    });
    return res.data;
  },
  closeDispute: async (id) => {
    const res = await apiClient.post(`/admin/disputes/${id}/close`);
    return res.data;
  },
  postMessage: async (id, message, isInternal = false) => {
    const res = await apiClient.post(`/admin/disputes/${id}/messages`, {
      message,
      isInternal
    });
    return res.data;
  }
};

export const adminPayoutsApi = {
  getPayouts: async (params = {}) => {
    const res = await apiClient.get('/admin/payouts', { params });
    return res.data;
  },
  getPayoutDetail: async (id) => {
    const res = await apiClient.get(`/admin/payouts/${id}`);
    return res.data;
  },
  processPayout: async (id) => {
    const res = await apiClient.post(`/admin/payouts/${id}/process`);
    return res.data;
  },
  markFailed: async (id, failureReason) => {
    const res = await apiClient.post(`/admin/payouts/${id}/mark-failed`, { failureReason });
    return res.data;
  },
  retryPayout: async (id) => {
    const res = await apiClient.post(`/admin/payouts/${id}/retry`);
    return res.data;
  },
  bulkProcess: async (payoutIds) => {
    const res = await apiClient.post('/admin/payouts/bulk-process', { payoutIds });
    return res.data;
  }
};

export const adminRefundsApi = {
  getRefunds: async (params = {}) => {
    const res = await apiClient.get('/admin/refunds', { params });
    return res.data;
  },
  getRefundDetail: async (id) => {
    const res = await apiClient.get(`/admin/refunds/${id}`);
    return res.data;
  },
  processRefund: async (id) => {
    const res = await apiClient.post(`/admin/refunds/${id}/process`);
    return res.data;
  },
  failRefund: async (id, failureReason) => {
    const res = await apiClient.post(`/admin/refunds/${id}/fail`, { failureReason });
    return res.data;
  }
};

export const adminReportsApi = {
  getOverview: async (from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/overview', { params: { from, to } });
    return res.data;
  },
  getRevenue: async (granularity = 'day', from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/revenue', { params: { granularity, from, to } });
    return res.data;
  },
  getUsers: async (from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/users', { params: { from, to } });
    return res.data;
  },
  getTopFarmers: async (limit = 10, from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/top-farmers', { params: { limit, from, to } });
    return res.data;
  },
  getTopBuyers: async (limit = 10, from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/top-buyers', { params: { limit, from, to } });
    return res.data;
  },
  getTopProducts: async (limit = 10, from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/top-products', { params: { limit, from, to } });
    return res.data;
  },
  getCategories: async (from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/categories', { params: { from, to } });
    return res.data;
  },
  getLocations: async (from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/locations', { params: { from, to } });
    return res.data;
  },
  exportCsv: async (type, from = null, to = null) => {
    const res = await apiClient.get('/admin/reports/export', {
      params: { type, from, to },
      responseType: 'blob'
    });
    return res.data;
  }
};

export const adminCouponsApi = {
  getCoupons: async (params = {}) => {
    const res = await apiClient.get('/admin/coupons', { params });
    return res.data;
  },
  getCoupon: async (id) => {
    const res = await apiClient.get(`/admin/coupons/${id}`);
    return res.data;
  },
  createCoupon: async (data) => {
    const res = await apiClient.post('/admin/coupons', data);
    return res.data;
  },
  updateCoupon: async (id, data) => {
    const res = await apiClient.put(`/admin/coupons/${id}`, data);
    return res.data;
  },
  deleteCoupon: async (id) => {
    const res = await apiClient.delete(`/admin/coupons/${id}`);
    return res.data;
  },
  toggleCoupon: async (id) => {
    const res = await apiClient.post(`/admin/coupons/${id}/toggle`);
    return res.data;
  }
};

export const adminCategoriesApi = {
  getCategories: async () => {
    const res = await apiClient.get('/admin/categories');
    return res.data;
  },
  createCategory: async (data) => {
    const res = await apiClient.post('/admin/categories', data);
    return res.data;
  },
  updateCategory: async (id, data) => {
    const res = await apiClient.put(`/admin/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await apiClient.delete(`/admin/categories/${id}`);
    return res.data;
  },
  reorderCategories: async (orders) => {
    const res = await apiClient.put('/admin/categories/order', { orders });
    return res.data;
  }
};

export const adminSettingsApi = {
  getSettings: async () => {
    const res = await apiClient.get('/admin/settings');
    return res.data;
  },
  updateSettings: async (data) => {
    const res = await apiClient.put('/admin/settings', data);
    return res.data;
  }
};

export const adminActivityApi = {
  getLogs: async (params = {}) => {
    const res = await apiClient.get('/admin/activity-logs', { params });
    return res.data;
  },
  getLogDetail: async (id) => {
    const res = await apiClient.get(`/admin/activity-logs/${id}`);
    return res.data;
  },
  exportCsv: async (params = {}) => {
    const res = await apiClient.get('/admin/activity-logs/export', {
      params,
      responseType: 'blob'
    });
    return res.data;
  }
};

export const adminProfileApi = {
  getProfile: async () => {
    const res = await apiClient.get('/admin/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await apiClient.put('/admin/profile', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await apiClient.put('/admin/profile/password', data);
    return res.data;
  }
};
