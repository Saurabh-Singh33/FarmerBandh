import { authClient } from './authApi';

const apiClient = authClient;

export const bankAccountApi = {
  getBankAccount: async () => {
    const res = await apiClient.get('/seller/bank-account');
    return res.data;
  },
  upsertBankAccount: async (data) => {
    const res = await apiClient.put('/seller/bank-account', data);
    return res.data;
  },
  deleteBankAccount: async () => {
    const res = await apiClient.delete('/seller/bank-account');
    return res.data;
  }
};
