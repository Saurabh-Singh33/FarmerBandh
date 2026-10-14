import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Tractor,
  UserCheck,
  Package,
  Sparkles,
  ClipboardList,
  MessageSquareWarning,
  Wallet,
  RotateCcw,
  BarChart3,
  Tag,
  Layers,
  Settings,
  Activity,
  User,
  LogOut,
  Store,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications, notify } from '../../context/NotificationContext';

export const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount: notifUnreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      notify.info('You have logged out of the Admin Control Center.', 'Session Closed');
      navigate('/auth');
    } catch {
      notify.error('Logout failed.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users Directory', path: '/admin/users', icon: Users },
        { name: 'Farmers Directory', path: '/admin/farmers', icon: Tractor },
        { name: 'Verifications', path: '/admin/verifications', icon: UserCheck },
        { name: 'Orders Management', path: '/admin/orders', icon: ClipboardList },
        { name: 'Disputes Resolution', path: '/admin/disputes', icon: MessageSquareWarning }
      ]
    },
    {
      title: 'FINANCE & CATALOG',
      items: [
        { name: 'Payouts Queue', path: '/admin/payouts', icon: Wallet },
        { name: 'Refunds Processing', path: '/admin/refunds', icon: RotateCcw },
        { name: 'Listings Moderation', path: '/admin/listings', icon: Package },
        { name: 'Featured Listings', path: '/admin/featured-listings', icon: Sparkles },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Coupons & Promos', path: '/admin/coupons', icon: Tag }
      ]
    },
    {
      title: 'INSIGHTS & SYSTEM',
      items: [
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: notifUnreadCount > 0 ? `${notifUnreadCount}` : null },
        { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
        { name: 'Activity Audit Logs', path: '/admin/activity-logs', icon: Activity },
        { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
        { name: 'Admin Profile', path: '/admin/profile', icon: User }
      ]
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
        color: '#1F2937',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0.75rem 0.75rem',
        boxSizing: 'border-box',
        zIndex: 90,
        boxShadow: '1px 0 6px rgba(0,0,0,0.03)',
        overflowY: 'auto'
      }}
    >
      <div>
        {/* Brand Header */}
        <Link
          to="/admin/dashboard"
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
              boxShadow: '0 2px 5px rgba(27,77,62,0.2)',
              flexShrink: 0
            }}
          >
            <ShieldAlert size={18} color="#FFFFFF" strokeWidth={2.2} />
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
                fontSize: '0.66rem',
                color: '#2E7D32',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '1px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Control Center
            </div>
          </div>
        </Link>

        {/* Navigation Sections */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {navSections.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: '#9CA3AF',
                  letterSpacing: '0.08em',
                  padding: '0 0.5rem 0.2rem 0.5rem',
                  textTransform: 'uppercase'
                }}
              >
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path + '/'));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.38rem 0.65rem',
                        borderRadius: '7px',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#1B4D3E' : '#4B5563',
                        backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                        borderLeft: isActive ? '3px solid #1B4D3E' : '3px solid transparent',
                        transition: 'all 0.12s ease'
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
                        <Icon size={16} color={isActive ? '#1B4D3E' : '#6B7280'} strokeWidth={isActive ? 2.2 : 1.8} />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer User Info & Actions */}
      <div
        style={{
          borderTop: '1px solid #F3F4F6',
          paddingTop: '0.45rem',
          marginTop: '0.45rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}
      >
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
                color: '#1B4D3E',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}
            >
              {user?.fullName || 'System Admin'}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#2E7D32', fontWeight: 600, lineHeight: 1.1, marginTop: '1px' }}>
              Platform Administrator
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link
            to="/marketplace"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0.38rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: '#E8F5E9',
              color: '#1B4D3E',
              border: '1px solid #C8E6C9',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Store size={13} /> Market
          </Link>
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0.38rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
