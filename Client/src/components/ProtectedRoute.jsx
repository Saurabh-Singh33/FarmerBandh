import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F9FBF8' }}>
        <div style={{ fontSize: '1.1rem', color: '#1B4D3E', fontWeight: 600 }}>Loading FarmerBandh...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = (user.role || '').toLowerCase();
  const requiredRole = (role || '').toLowerCase();

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'buyer') {
      return <Navigate to="/marketplace" replace />;
    }
    if (userRole === 'farmer' || userRole === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    }
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  return children;
};
