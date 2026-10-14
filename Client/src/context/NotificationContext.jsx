import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../services/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollingTimerRef = useRef(null);

  // Fetch unread count from backend
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await notificationApi.unreadCount();
      setUnreadCount(data?.count || 0);
    } catch (err) {
      // Gracefully ignore network/auth errors in background poll
    }
  }, [user]);

  // Fetch last 8 recent notifications (used when bell dropdown opens)
  const fetchRecent = useCallback(async () => {
    if (!user) {
      setRecent([]);
      return;
    }
    setLoading(true);
    try {
      const data = await notificationApi.list({ page: 1, pageSize: 8 });
      setRecent(data?.items || []);
    } catch (err) {
      // Gracefully ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Manual refresh of both unread count and recent items
  const refresh = useCallback(async () => {
    await Promise.all([fetchUnreadCount(), fetchRecent()]);
  }, [fetchUnreadCount, fetchRecent]);

  // Mark single notification read
  const markRead = useCallback(async (id) => {
    try {
      await notificationApi.markRead(id);
      setRecent((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all unread notifications read
  const markAllRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
      setRecent((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Delete a notification
  const remove = useCallback(async (id) => {
    try {
      await notificationApi.remove(id);
      setRecent((prev) => {
        const item = prev.find((n) => n.id === id);
        if (item && !item.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  // Polling management: polls every 30s when tab is visible, pauses when hidden
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setRecent([]);
      return;
    }

    // Initial fetch
    fetchUnreadCount();

    const startPolling = () => {
      stopPolling();
      pollingTimerRef.current = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          fetchUnreadCount();
        }
      }, 30000); // 30s interval
    };

    const stopPolling = () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchUnreadCount]);

  const value = {
    unreadCount,
    recent,
    loading,
    refresh,
    fetchRecent,
    markRead,
    markAllRead,
    remove
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
