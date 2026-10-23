import axios from 'axios';
import { notify } from '../context/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fb_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register') || originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('fb_refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('fb_access_token');
        localStorage.removeItem('fb_refresh_token');
        localStorage.removeItem('fb_user');
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, ...userData } = res.data;

        localStorage.setItem('fb_access_token', accessToken);
        localStorage.setItem('fb_refresh_token', newRefreshToken);
        if (userData && userData.userId) {
          localStorage.setItem('fb_user', JSON.stringify(userData));
        }

        authClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return authClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        localStorage.removeItem('fb_access_token');
        localStorage.removeItem('fb_refresh_token');
        localStorage.removeItem('fb_user');

        return Promise.reject(refreshErr);
      }
    }

    // Network error retry once
    if (!error.response && !originalRequest._networkRetry) {
      originalRequest._networkRetry = true;
      try {
        return await authClient(originalRequest);
      } catch (retryErr) {
        if (typeof notify !== 'undefined' && notify?.error) {
          notify.error('Network connection issue. Please verify that the backend server is running.', 'Connection Error');
        }
        return Promise.reject(retryErr);
      }
    }

    // Trigger toast on 500 or 503
    if (error.response && (error.response.status === 500 || error.response.status === 503)) {
      toast.error('The server encountered an issue. Please try again shortly.', 'Server Error');
    }

    return Promise.reject(error);
  }
);

export { authClient };

export const authApi = {
  register: async (data) => {
    const res = await authClient.post('/auth/register', data);
    return res.data;
  },
  login: async (data) => {
    const res = await authClient.post('/auth/login', data);
    return res.data;
  },
  refresh: async (refreshToken) => {
    const res = await authClient.post('/auth/refresh', { refreshToken });
    return res.data;
  },
  logout: async (refreshToken) => {
    try {
      await authClient.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore logout API errors, local clearing will happen anyway
    }
  },
  me: async () => {
    const res = await authClient.get('/auth/me');
    return res.data;
  },
};
