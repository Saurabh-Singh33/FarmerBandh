import { authClient } from './authApi';

const apiClient = authClient;

// Fast client-side cache to guarantee instant (< 10ms) UI updates without remote fetch lag
const clientCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const getCachedOrFetch = async (cacheKey, fetchFn) => {
  const cached = clientCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const data = await fetchFn();
  clientCache.set(cacheKey, { timestamp: now, data });
  return data;
};

export const mandiApi = {
  getComparison: async (params = {}) => {
    const key = `comp_${JSON.stringify(params)}`;
    return getCachedOrFetch(key, async () => {
      const res = await apiClient.get('/mandi-prices/comparison', { params });
      return res.data;
    });
  },

  getLiveRates: async (params = {}) => {
    const key = `live_${JSON.stringify(params)}`;
    return getCachedOrFetch(key, async () => {
      const res = await apiClient.get('/mandi-prices/live', { params });
      return res.data;
    });
  },

  getLiveByCrop: async (crop) => {
    const key = `crop_${crop}`;
    return getCachedOrFetch(key, async () => {
      const res = await apiClient.get(`/mandi-prices/crop/${encodeURIComponent(crop)}`);
      return res.data;
    });
  },

  getLiveByState: async (state) => {
    const key = `state_${state}`;
    return getCachedOrFetch(key, async () => {
      const res = await apiClient.get(`/mandi-prices/state/${encodeURIComponent(state)}`);
      return res.data;
    });
  },

  getLiveByDistrict: async (district) => {
    const key = `district_${district}`;
    return getCachedOrFetch(key, async () => {
      const res = await apiClient.get(`/mandi-prices/district/${encodeURIComponent(district)}`);
      return res.data;
    });
  },

  getCommodities: async () => {
    return getCachedOrFetch('commodities', async () => {
      const res = await apiClient.get('/mandi-prices/commodities');
      return res.data;
    });
  },

  getStates: async () => {
    return getCachedOrFetch('states', async () => {
      const res = await apiClient.get('/mandi-prices/states');
      return res.data;
    });
  },

  getDistricts: async (state) => {
    const key = `districts_${state || 'all'}`;
    return getCachedOrFetch(key, async () => {
      const res = await apiClient.get('/mandi-prices/districts', { params: { state } });
      return res.data;
    });
  },

  // Clear cache manually if needed (e.g. on forced refresh)
  clearCache: () => {
    clientCache.clear();
  }
};
