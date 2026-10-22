import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fb_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('fb_access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('fb_refresh_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rehydrate = async () => {
      const storedToken = localStorage.getItem('fb_access_token');
      if (storedToken) {
        try {
          const userData = await authApi.me();
          setUser(userData);
          localStorage.setItem('fb_user', JSON.stringify(userData));
        } catch {
          // Token invalid or expired, clear local storage
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem('fb_access_token');
          localStorage.removeItem('fb_refresh_token');
          localStorage.removeItem('fb_user');
        }
      }
      setLoading(false);
    };

    rehydrate();
  }, []);

  const handleAuthSuccess = (response) => {
    const { accessToken: newAccess, refreshToken: newRefresh, ...userData } = response;
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    setUser(userData);

    localStorage.setItem('fb_access_token', newAccess);
    localStorage.setItem('fb_refresh_token', newRefresh);
    localStorage.setItem('fb_user', JSON.stringify(userData));
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    handleAuthSuccess(response);
    return response;
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    handleAuthSuccess(response);
    return response;
  };

  const logout = async () => {
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('fb_access_token');
    localStorage.removeItem('fb_refresh_token');
    localStorage.removeItem('fb_user');
  };

  const refresh = async () => {
    if (!refreshToken) return null;
    try {
      const response = await authApi.refresh(refreshToken);
      handleAuthSuccess(response);
      return response;
    } catch (err) {
      await logout();
      throw err;
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      try {
        localStorage.setItem('fb_user', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save user in storage:', err);
      }
      return updated;
    });
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    register,
    logout,
    refresh,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
