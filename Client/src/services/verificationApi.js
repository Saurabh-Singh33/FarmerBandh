import { authClient } from './authApi';

const apiClient = authClient;

export const verificationApi = {
  getVerificationStatus: async () => {
    const res = await apiClient.get('/seller/verification');
    return res.data;
  },
  submitVerification: async (data) => {
    const res = await apiClient.post('/seller/verification', data);
    return res.data;
  },
  mockApprove: async (id) => {
    const res = await apiClient.post(`/seller/verification/${id}/mock-approve`);
    return res.data;
  },
  mockReject: async (id, reason) => {
    const res = await apiClient.post(`/seller/verification/${id}/mock-reject`, { reason });
    return res.data;
  }
};
