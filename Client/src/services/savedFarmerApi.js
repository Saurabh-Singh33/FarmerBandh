import { authClient } from './authApi';

const apiClient = authClient;

export const savedFarmerApi = {
  getSavedFarmers: async () => {
    const res = await apiClient.get('/saved-farmers');
    return res.data;
  },
  saveFarmer: async (farmerId, notes = '') => {
    const res = await apiClient.post('/saved-farmers', { farmerId, notes });
    return res.data;
  },
  removeSavedFarmer: async (farmerId) => {
    const res = await apiClient.delete(`/saved-farmers/${farmerId}`);
    return res.data;
  },
  checkSavedFarmer: async (farmerId) => {
    const res = await apiClient.get(`/saved-farmers/check/${farmerId}`);
    return res.data;
  },
};
