import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, role }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

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
    const handleSwitchAccount = async () => {
      try {
        await logout();
      } catch {
        // proceed
      }
      navigate('/auth');
    };

    const handleReturnToDashboard = () => {
      if (userRole === 'buyer') navigate('/marketplace');
      else if (userRole === 'farmer' || userRole === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    };

    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F9FBF8',
          padding: '1.5rem'
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '2.25rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.6rem' }}>
            {requiredRole === 'admin' ? 'Admin Access Required' : 'Access Restricted'}
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.55, marginBottom: '1.5rem' }}>
            You are currently signed in as <strong>{user.fullName || user.email}</strong> with a{' '}
            <strong style={{ textTransform: 'capitalize' }}>{userRole}</strong> account.
            {requiredRole === 'admin'
              ? ' The Admin Control Center is restricted to administrator accounts.'
              : ` This section requires ${requiredRole} credentials.`}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={handleSwitchAccount}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14382D')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1B4D3E')}
            >
              <LogIn size={16} /> Sign in as {requiredRole === 'admin' ? 'Admin' : 'Different Role'}
            </button>

            <button
              onClick={handleReturnToDashboard}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #E5E7EB',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
            >
              <ArrowLeft size={16} /> Return to {userRole === 'buyer' ? 'Marketplace' : 'Seller Hub'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

