import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Users,
  Tractor,
  Package,
  ClipboardList,
  MessageSquareWarning,
  Wallet,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
  Layers,
  Tag,
  Settings
} from 'lucide-react';
import { adminDashboardApi } from '../../services/adminApi';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { notify } from '../../context/NotificationContext';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminDashboardApi.GetDashboard ? adminDashboardApi.GetDashboard() : adminDashboardApi.getDashboard();
      setData(res);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Control Center Metrics...</div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Platform GMV',
      value: formatCurrency(data?.totalGmv || 0),
      trend: data?.gmvGrowthPercent,
      trendLabel: 'this month',
      icon: IndianRupee,
      iconColor: '#059669',
      iconBg: '#ECFDF5',
      onClick: () => navigate('/admin/reports')
    },
    {
      title: 'Platform Net Revenue',
      value: formatCurrency(data?.platformRevenue || 0),
      trend: data?.revenueGrowthPercent,
      trendLabel: 'commission & fees',
      icon: TrendingUp,
      iconColor: '#0284C7',
      iconBg: '#F0F9FF',
      onClick: () => navigate('/admin/reports')
    },
    {
      title: 'Total Users',
      value: (data?.totalUsers || 0).toLocaleString(),
      subtitle: `${data?.totalFarmers || 0} farmers • ${data?.totalBuyers || 0} buyers`,
      icon: Users,
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Completed Orders',
      value: (data?.totalOrders || 0).toLocaleString(),
      subtitle: `${data?.activeOrdersCount || 0} in progress`,
      icon: ClipboardList,
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
      onClick: () => navigate('/admin/orders')
    }
  ];

  const pendingItems = [
    {
      title: 'Pending Verifications',
      count: data?.pendingVerificationsCount || 0,
      path: '/admin/verifications',
      icon: UserCheck,
      color: '#0284C7',
      bg: '#E0F2FE',
      label: 'Farmers waiting for identity check'
    },
    {
      title: 'Pending Payouts',
      count: data?.pendingPayoutsCount || 0,
      path: '/admin/payouts',
      icon: Wallet,
      color: '#D97706',
      bg: '#FEF3C7',
      label: 'Farmer earnings ready to process'
    },
    {
      title: 'Open Disputes',
      count: data?.openDisputesCount || 0,
      path: '/admin/disputes',
      icon: MessageSquareWarning,
      color: '#DC2626',
      bg: '#FEE2E2',
      label: 'Requires arbitrator intervention'
    },
    {
      title: 'Pending Refunds',
      count: data?.pendingRefundsCount || 0,
      path: '/admin/refunds',
      icon: RotateCcw,
      color: '#475569',
      bg: '#F1F5F9',
      label: 'Buyer returns & dispute refunds'
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
              Admin Control Center
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
                border: '1px solid #C8E6C9',
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Live
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            System overview, operational queues, and platform integrity management.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#1B4D3E',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            to="/admin/reports"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Analytics & Reports <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {kpis.map((kpi, idx) => (
          <AdminStatCard key={idx} {...kpi} />
        ))}
      </div>

      {/* Operational Attention Queue Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>
          Operational Attention Queues
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}
        >
          {pendingItems.map((item, idx) => {
            const Icon = item.icon;
            const hasPending = item.count > 0;

            return (
              <div
                key={idx}
                onClick={() => navigate(item.path)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: hasPending ? `1.5px solid ${item.color}` : '1px solid #E2E8F0',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: hasPending ? '0 4px 12px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: item.bg,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {item.label}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: hasPending ? item.color : '#94A3B8',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: hasPending ? item.bg : '#F8FAFC'
                  }}
                >
                  {item.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Activity Audit Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Recent Orders Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                Recent Platform Orders
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Latest purchase orders across all regions
              </div>
            </div>
            <Link
              to="/admin/orders"
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#059669',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.recentOrders?.length > 0 ? (
              data.recentOrders.slice(0, 6).map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => navigate(`/admin/orders/${ord.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #F1F5F9',
                    backgroundColor: '#FAFAFA',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAFAFA';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {ord.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Buyer: {ord.buyerName} • Seller: {ord.sellerName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                      {formatCurrency(ord.totalAmount)}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        backgroundColor:
                          ord.status === 'Delivered'
                            ? '#DCFCE7'
                            : ord.status === 'Cancelled'
                            ? '#FEE2E2'
                            : ord.status === 'InTransit'
                            ? '#E0F2FE'
                            : '#FEF3C7',
                        color:
                          ord.status === 'Delivered'
                            ? '#15803D'
                            : ord.status === 'Cancelled'
                            ? '#B91C1C'
                            : ord.status === 'InTransit'
                            ? '#0369A1'
                            : '#B45309'
                      }}
                    >
                      {ord.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                No recent orders found.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Activity Audit Feed */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                Activity Audit Stream
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Immutable log of administrative & platform actions
              </div>
            </div>
            <Link
              to="/admin/activity-logs"
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#059669',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              Full log <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.recentActivity?.length > 0 ? (
              data.recentActivity.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #F1F5F9',
                    backgroundColor: '#FAFAFA'
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#059669',
                      marginTop: '6px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#475569',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {log.summary}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                      by {log.actorName || 'System'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                No activity logs recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Configuration Modules */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>
          Management Launchpad
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          {[
            { name: 'Featured Listings', path: '/admin/featured-listings', icon: Sparkles, desc: 'Pin hero products' },
            { name: 'Category Hierarchy', path: '/admin/categories', icon: Layers, desc: 'Manage crop classifications' },
            { name: 'Coupons & Discounts', path: '/admin/coupons', icon: Tag, desc: 'Promos & seasonal vouchers' },
            { name: 'Platform Settings', path: '/admin/settings', icon: Settings, desc: 'Fees, maintenance, limits' }
          ].map((launch, idx) => {
            const Icon = launch.icon;
            return (
              <Link
                key={idx}
                to={launch.path}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  padding: '1rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.15s, transform 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    {launch.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    {launch.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
