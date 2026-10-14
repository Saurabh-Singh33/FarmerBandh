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
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../context/NotificationContext';

export const AdminSidebar = () => {
  const { user, logout } = useAuth();
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
        width: '270px',
        minWidth: '270px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 1rem',
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
            gap: '0.75rem',
            textDecoration: 'none',
            padding: '0.5rem 0.5rem 1.25rem 0.5rem',
            borderBottom: '1px solid #F3F4F6',
            marginBottom: '1rem'
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
              boxShadow: '0 2px 6px rgba(27,77,62,0.25)',
              flexShrink: 0
            }}
          >
            <ShieldAlert size={22} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.28rem',
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
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '3px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Control Center
            </div>
          </div>
        </Link>

        {/* Navigation Sections */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {navSections.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#9CA3AF',
                  letterSpacing: '0.08em',
                  padding: '0 0.75rem 0.4rem 0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#1B4D3E' : '#4B5563',
                        backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                        borderLeft: isActive ? '3px solid #1B4D3E' : '3px solid transparent',
                        transition: 'all 0.15s ease'
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
                        <Icon size={18} color={isActive ? '#1B4D3E' : '#6B7280'} strokeWidth={isActive ? 2.2 : 1.8} />
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
          paddingTop: '1rem',
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem',
            backgroundColor: '#F9FBF8',
            borderRadius: '10px',
            border: '1px solid #E5E7EB'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0
            }}
          >
            {getInitials(user?.fullName)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#1B4D3E',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.fullName || 'System Admin'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2E7D32', fontWeight: 600 }}>
              Platform Administrator
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/marketplace"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: '#E8F5E9',
              color: '#1B4D3E',
              border: '1px solid #C8E6C9',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Store size={14} /> Market
          </Link>
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
