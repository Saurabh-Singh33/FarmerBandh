import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { negotiationApi } from '../services/negotiationApi';
import { useAuth } from './AuthContext';

const NegotiationContext = createContext(null);

export const NegotiationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await negotiationApi.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      // Gracefully handle or ignore when not authenticated
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();

    if (!user) return;
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 45000); // 45s polling interval

    return () => clearInterval(interval);
  }, [fetchUnreadCount, user]);

  const value = {
    unreadCount,
    setUnreadCount,
    refreshUnreadCount: fetchUnreadCount,
  };

  return (
    <NegotiationContext.Provider value={value}>
      {children}
    </NegotiationContext.Provider>
  );
};

export const useNegotiation = () => {
  const context = useContext(NegotiationContext);
  if (!context) {
    throw new Error('useNegotiation must be used within a NegotiationProvider');
  }
  return context;
};
