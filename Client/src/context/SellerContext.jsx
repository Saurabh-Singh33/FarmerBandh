import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { sellerDashboardApi } from '../services/sellerDashboardApi';
import { payoutApi } from '../services/payoutApi';
import { verificationApi } from '../services/verificationApi';

const SellerContext = createContext();

export const SellerProvider = ({ children }) => {
  const { user } = useAuth();
  const isFarmer = user?.role?.toLowerCase() === 'farmer';

  const [dashboard, setDashboard] = useState(null);
  const [payoutSummary, setPayoutSummary] = useState(null);
  const [verificationOverview, setVerificationOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!isFarmer) return;
    try {
      setLoading(true);
      const data = await sellerDashboardApi.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching seller dashboard:', err);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [isFarmer]);

  const fetchPayoutSummary = useCallback(async () => {
    if (!isFarmer) return;
    try {
      const data = await payoutApi.getSummary();
      setPayoutSummary(data);
    } catch (err) {
      console.error('Error fetching payout summary:', err);
    }
  }, [isFarmer]);

  const fetchVerificationOverview = useCallback(async () => {
    if (!isFarmer) return;
    try {
      const data = await verificationApi.getVerificationStatus();
      setVerificationOverview(data);
    } catch (err) {
      console.error('Error fetching verification overview:', err);
    }
  }, [isFarmer]);

  const refreshAll = useCallback(async () => {
    if (isFarmer) {
      await Promise.allSettled([
        fetchDashboard(),
        fetchPayoutSummary(),
        fetchVerificationOverview()
      ]);
    }
  }, [isFarmer, fetchDashboard, fetchPayoutSummary, fetchVerificationOverview]);

  useEffect(() => {
    if (isFarmer) {
      refreshAll();
    } else {
      setDashboard(null);
      setPayoutSummary(null);
      setVerificationOverview(null);
    }
  }, [isFarmer, refreshAll]);

  const value = {
    dashboard,
    payoutSummary,
    verificationOverview,
    verificationStatus: dashboard?.verificationStatus || verificationOverview?.farmerVerified || 'Unverified',
    loading,
    error,
    refreshDashboard: fetchDashboard,
    refreshPayoutSummary: fetchPayoutSummary,
    refreshVerification: fetchVerificationOverview,
    refreshAll
  };

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
