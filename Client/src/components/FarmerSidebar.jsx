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
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNegotiation } from '../context/NegotiationContext';
import { useSeller } from '../context/SellerContext';
import { useNotifications, notify } from '../context/NotificationContext';

export const FarmerSidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNegotiation();
  const { unreadCount: notifUnreadCount } = useNotifications();
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
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: notifUnreadCount > 0 ? `${notifUnreadCount}` : null
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
        width: '250px',
        minWidth: '250px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0.75rem 0.75rem',
        boxSizing: 'border-box',
        zIndex: 90,
        boxShadow: '1px 0 4px rgba(0,0,0,0.03)',
        overflowY: 'auto'
      }}
    >
      {/* Top Section: Logo & Branding */}
      <div>
        <Link
          to="/seller/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            padding: '0.2rem 0.35rem 0.65rem 0.35rem',
            borderBottom: '1px solid #F3F4F6',
            marginBottom: '0.5rem'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#1B4D3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(27,77,62,0.2)',
              flexShrink: 0
            }}
          >
            <Sprout size={18} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.15rem',
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
                fontSize: '0.68rem',
                color: '#2E7D32',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '1px'
              }}
            >
              Seller Portal
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                  padding: '0.4rem 0.65rem',
                  borderRadius: '7px',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#1B4D3E' : '#4B5563',
                  backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                  transition: 'all 0.12s ease',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Icon
                    size={17}
                    color={isActive ? '#1B4D3E' : '#6B7280'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '5px',
                      backgroundColor: isActive ? '#C8E6C9' : '#F3F4F6',
                      color: isActive ? '#1B4D3E' : '#6B7280',
                      fontWeight: 600,
                      lineHeight: '1.2'
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
          paddingTop: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}
      >
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.35rem 0.5rem',
            backgroundColor: '#F9FBF8',
            borderRadius: '8px',
            border: '1px solid #E5E7EB'
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.78rem',
              flexShrink: 0
            }}
          >
            {getInitials(user?.fullName)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#111827',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}
            >
              {user?.fullName || 'Farmer Seller'}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: verificationStatus === 'Verified' ? '#2E7D32' : (verificationStatus === 'Pending' ? '#0284C7' : '#D97706'),
                fontWeight: 600,
                textTransform: 'capitalize',
                lineHeight: 1.1,
                marginTop: '1px'
              }}
            >
              {verificationStatus === 'Verified' ? '✓ Verified Farmer' : (verificationStatus === 'Pending' ? '⏳ Under Review' : '⚠️ Unverified')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link
            to="/seller/profile"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0.4rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              fontSize: '0.76rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease'
            }}
            title="Profile & Settings"
          >
            <User size={13} /> Profile
          </Link>

          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0.4rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            title="Sign out of account"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FarmerSidebar;
