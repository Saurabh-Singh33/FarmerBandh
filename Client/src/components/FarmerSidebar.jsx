import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Store,
  LayoutDashboard,
  ClipboardList,
  RotateCcw,
  MessageSquareWarning,
  LogOut,
  User,
  ExternalLink,
  Handshake,
  Package,
  Wallet,
  BarChart3,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNegotiation } from '../context/NegotiationContext';
import { useSeller } from '../context/SellerContext';
import { notify } from '../context/NotificationContext';

export const FarmerSidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNegotiation();
  const { dashboard, verificationStatus } = useSeller();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      notify.info('You have been logged out successfully.', 'Session Closed');
      navigate('/auth');
    } catch (err) {
      notify.error('Logout failed. Please try again.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'F';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const navItems = [
    {
      name: 'Seller Hub',
      path: '/seller/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'My Listings',
      path: '/seller/listings',
      icon: Package,
      badge: dashboard?.activeListingsCount != null ? `${dashboard.activeListingsCount}` : null
    },
    {
      name: 'Orders Queue',
      path: '/seller/orders',
      icon: ClipboardList,
      badge: dashboard?.pendingOrdersCount > 0 ? `${dashboard.pendingOrdersCount}` : null
    },
    {
      name: 'Negotiations',
      path: '/seller/negotiations',
      icon: Handshake,
      badge: unreadCount > 0 ? `${unreadCount}` : null
    },
    {
      name: 'Returns',
      path: '/seller/returns',
      icon: RotateCcw,
      badge: dashboard?.openReturnsCount > 0 ? `${dashboard.openReturnsCount}` : null
    },
    {
      name: 'Disputes',
      path: '/seller/disputes',
      icon: MessageSquareWarning
    },
    {
      name: 'Payouts & Earnings',
      path: '/seller/payouts',
      icon: Wallet
    },
    {
      name: 'Analytics',
      path: '/seller/analytics',
      icon: BarChart3
    },
    {
      name: 'Verification',
      path: '/seller/verification',
      icon: ShieldCheck,
      badge: verificationStatus === 'Verified' ? '✓' : (verificationStatus === 'Pending' ? '...' : '!')
    },
    {
      name: 'Farm Profile',
      path: '/seller/profile',
      icon: Settings
    },
    {
      name: 'Marketplace',
      path: '/marketplace',
      icon: Store,
      badge: 'Buyer View'
    }
  ];

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 1rem',
        boxSizing: 'border-box',
        zIndex: 90,
        boxShadow: '1px 0 4px rgba(0,0,0,0.03)'
      }}
    >
      {/* Top Section: Logo & Branding */}
      <div>
        <Link
          to="/seller/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            padding: '0.5rem 0.5rem 1.25rem 0.5rem',
            borderBottom: '1px solid #F3F4F6',
            marginBottom: '1.25rem'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#1B4D3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 5px rgba(27,77,62,0.25)',
              flexShrink: 0
            }}
          >
            <Sprout size={22} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1B4D3E',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
            >
              FarmerBandh
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#2E7D32',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px'
              }}
            >
              Seller Portal
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#1B4D3E' : '#4B5563',
                  backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid #C8E6C9' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F9FBF8';
                    e.currentTarget.style.color = '#1B4D3E';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4B5563';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon
                    size={19}
                    color={isActive ? '#1B4D3E' : '#6B7280'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280',
                      fontWeight: 600
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Farmer Profile & Logout */}
      <div
        style={{
          borderTop: '1px solid #F3F4F6',
          paddingTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            backgroundColor: '#F9FBF8',
            borderRadius: '10px',
            border: '1px solid #E5E7EB'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              flexShrink: 0
            }}
          >
            {getInitials(user?.fullName)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#111827',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.fullName || 'Farmer Seller'}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: verificationStatus === 'Verified' ? '#2E7D32' : (verificationStatus === 'Pending' ? '#0284C7' : '#D97706'),
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            >
              {verificationStatus === 'Verified' ? '✓ Verified Farmer' : (verificationStatus === 'Pending' ? '⏳ Under Review' : '⚠️ Unverified')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/seller/profile"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.55rem',
              borderRadius: '8px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease'
            }}
            title="Profile & Settings"
          >
            <User size={14} /> Profile
          </Link>

          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.55rem',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            title="Sign out of account"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FarmerSidebar;
