import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Package,
  ClipboardList,
  Handshake,
  Star,
  PlusCircle,
  Wallet,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSeller } from '../../context/SellerContext';
import { KpiCard } from '../../components/seller/KpiCard';
import { RevenueChart } from '../../components/seller/RevenueChart';
import { VerificationBadge } from '../../components/seller/VerificationBadge';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dashboard, loading, refreshAll, verificationStatus } = useSeller();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const earningsThisMonth = dashboard?.earningsThisMonth || 0;
  const earningsLastMonth = dashboard?.earningsLastMonth || 0;
  const earningsGrowth = earningsLastMonth > 0
    ? (((earningsThisMonth - earningsLastMonth) / earningsLastMonth) * 100).toFixed(0)
    : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Top Welcome Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.85rem',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: 0
              }}
            >
              Seller Hub
            </h1>
            <VerificationBadge status={verificationStatus} />
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            {user?.profile?.farmName || user?.fullName || 'Farmer Partner'} &bull; {user?.district || 'Ahmedabad'}, {user?.state || 'Gujarat'}
          </p>
        </div>

        {/* Quick Action CTA Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/seller/listings/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.1rem',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(27,77,62,0.2)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <PlusCircle size={16} /> Add Product Listing
          </Link>
          <Link
            to="/seller/payouts"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.1rem',
              backgroundColor: '#FFFFFF',
              color: '#1B4D3E',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              border: '1px solid #1B4D3E',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Wallet size={16} /> Payouts & Balance
          </Link>
        </div>
      </div>

      {/* Verification Notice Banner */}
      {String(verificationStatus).toLowerCase() !== 'verified' && String(verificationStatus) !== '2' && String(verificationStatus).toLowerCase() !== 'approved' && (
        <div
          style={{
            backgroundColor: String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0' ? '#FEF2F2' : '#FFFBEB',
            border: `1px solid ${String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0' ? '#FECACA' : '#FDE68A'}`,
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color={String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0' ? '#DC2626' : '#D97706'} />
            <div>
              <div style={{ fontWeight: 700, color: String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0' ? '#991B1B' : '#92400E', fontSize: '0.92rem' }}>
                {String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0'
                  ? 'Seller Access Restricted / Rejected'
                  : 'Seller Account Pending Admin Approval'}
              </div>
              <div style={{ color: String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0' ? '#B91C1C' : '#B45309', fontSize: '0.82rem', marginTop: '2px' }}>
                {String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0'
                  ? 'Your seller account has not been approved by the platform administrator. You can prepare listings, but they will not show to buyers on the marketplace.'
                  : 'You can add and manage crop listings freely, but they will remain hidden from buyers on the marketplace until an Admin verifies and approves your seller profile.'}
              </div>
            </div>
          </div>
          <Link
            to="/seller/verification"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.45rem 0.9rem',
              backgroundColor: String(verificationStatus).toLowerCase() === 'rejected' || String(verificationStatus) === '0' ? '#DC2626' : '#D97706',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            Check Verification Status <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Primary KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <KpiCard
          title="All-Time Earnings"
          value={`₹${(dashboard?.earningsAllTime || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
          subtext="Net delivered sales revenue"
          icon={IndianRupee}
          accentColor="#1B4D3E"
          onClick={() => navigate('/seller/payouts')}
        />

        <KpiCard
          title="Earnings This Month"
          value={`₹${earningsThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
          subtext={earningsGrowth ? `${earningsGrowth > 0 ? '+' : ''}${earningsGrowth}% vs last month` : 'Current calendar month'}
          icon={TrendingUp}
          badgeText={earningsGrowth ? `${earningsGrowth > 0 ? '+' : ''}${earningsGrowth}%` : null}
          badgeColor={earningsGrowth && earningsGrowth >= 0 ? '#065F46' : '#DC2626'}
          badgeBg={earningsGrowth && earningsGrowth >= 0 ? '#ECFDF5' : '#FEF2F2'}
          accentColor="#059669"
        />

        <KpiCard
          title="Pending Payouts"
          value={`₹${(dashboard?.pendingPayoutAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
          subtext="Requested / in-processing"
          icon={Wallet}
          accentColor="#2563EB"
          onClick={() => navigate('/seller/payouts')}
        />

        <KpiCard
          title="Active Listings"
          value={dashboard?.activeListingsCount ?? 0}
          subtext={`${dashboard?.outOfStockCount || 0} out of stock`}
          icon={Package}
          accentColor="#7C3AED"
          badgeText="Catalog"
          badgeBg="#F5F3FF"
          badgeColor="#6D28D9"
          onClick={() => navigate('/seller/listings')}
        />
      </div>

      {/* Operational Highlights Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <KpiCard
          title="Orders In Queue"
          value={dashboard?.pendingOrdersCount ?? 0}
          subtext={`${dashboard?.completedOrdersCount || 0} completed orders`}
          icon={ClipboardList}
          badgeText={dashboard?.pendingOrdersCount > 0 ? 'Action Needed' : 'Clear'}
          badgeBg={dashboard?.pendingOrdersCount > 0 ? '#FEF2F2' : '#ECFDF5'}
          badgeColor={dashboard?.pendingOrdersCount > 0 ? '#DC2626' : '#065F46'}
          onClick={() => navigate('/seller/orders')}
        />

        <KpiCard
          title="Open Negotiations"
          value={dashboard?.unreadNegotiationsCount ?? 0}
          subtext="Unread buyer proposals"
          icon={Handshake}
          badgeText={dashboard?.unreadNegotiationsCount > 0 ? 'New' : 'Zero'}
          badgeBg={dashboard?.unreadNegotiationsCount > 0 ? '#EFF6FF' : '#F3F4F6'}
          badgeColor={dashboard?.unreadNegotiationsCount > 0 ? '#1D4ED8' : '#6B7280'}
          onClick={() => navigate('/seller/negotiations')}
        />

        <KpiCard
          title="Customer Returns"
          value={dashboard?.openReturnsCount ?? 0}
          subtext="Open replacement / refund requests"
          icon={RotateCcw}
          onClick={() => navigate('/seller/returns')}
        />

        <KpiCard
          title="Seller Rating"
          value={dashboard?.averageRating ? `${dashboard.averageRating.toFixed(1)} ★` : '4.8 ★'}
          subtext={`Based on ${dashboard?.ratingCount || 12} buyer reviews`}
          icon={Star}
          accentColor="#D97706"
        />
      </div>

      {/* Mandi Parity Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #E6F4EA 100%)',
          border: '1.5px solid #A7F3D0',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#065F46' }}>
                Indian Mandi vs. App Price Comparison
              </h4>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#D1FAE5',
                  color: '#047857',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #6EE7B7'
                }}
              >
                Government Agmarknet Sync
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#047857' }}>
              Track day-wise and week-wise APMC mandi rates across India. Ensure your farm produce captures higher direct margins!
            </p>
          </div>
        </div>

        <Link
          to="/mandi-prices"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1B4D3E',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'background-color 0.15s ease'
          }}
        >
          <span>Compare Mandi Rates</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* Left Column: Revenue Chart & Recent Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Monthly Revenue Chart Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                  Monthly Revenue Trend
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Delivered harvest sales across recent months
                </span>
              </div>
              <Link
                to="/seller/analytics"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#1B4D3E',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Deep Analytics <ArrowRight size={14} />
              </Link>
            </div>

            <RevenueChart
              data={dashboard?.monthlyEarningsChart || []}
              height={250}
              color="#1B4D3E"
            />
          </div>

          {/* Recent Orders Queue Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                  Recent Orders
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Latest orders placed by wholesale and retail buyers
                </span>
              </div>
              <Link
                to="/seller/orders"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#1B4D3E',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View All Queue <ArrowRight size={14} />
              </Link>
            </div>

            {(!dashboard?.recentOrders || dashboard.recentOrders.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.88rem' }}>
                No recent orders found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E5E7EB', textAlign: 'left', color: '#6B7280' }}>
                      <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Order #</th>
                      <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Buyer</th>
                      <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentOrders.map((ord) => (
                      <tr
                        key={ord.id}
                        style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                        onClick={() => navigate(`/seller/orders`)}
                      >
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#1B4D3E' }}>
                          {ord.orderNumber}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#374151' }}>
                          {ord.buyerName || 'Buyer'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#111827' }}>
                          ₹{ord.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: ord.status === 'Delivered' ? '#ECFDF5' : '#EFF6FF',
                              color: ord.status === 'Delivered' ? '#065F46' : '#1E40AF'
                            }}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#6B7280' }}>
                          {new Date(ord.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent Negotiations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Actions Shortcuts */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
              Operations Center
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link
                to="/seller/listings/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#F9FBF8',
                  border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  color: '#1B4D3E',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>🌱 Add New Produce Listing</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/seller/listings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#F9FBF8',
                  border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>📦 Manage Product Catalog</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/seller/payouts"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#F9FBF8',
                  border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>💰 Request Payout & Bank Info</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/seller/verification"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#F9FBF8',
                  border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>🛡️ Verification & Trust Badge</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/seller/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#F9FBF8',
                  border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>⚙️ Farm Profile & Settings</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Active Negotiations Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                Live Negotiations
              </h4>
              <Link
                to="/seller/negotiations"
                style={{ fontSize: '0.78rem', color: '#1B4D3E', fontWeight: 600, textDecoration: 'none' }}
              >
                View all
              </Link>
            </div>

            {(!dashboard?.recentNegotiations || dashboard.recentNegotiations.length === 0) ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.82rem' }}>
                No active buyer negotiations.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {dashboard.recentNegotiations.map((neg) => (
                  <div
                    key={neg.id}
                    onClick={() => navigate(`/seller/negotiations/${neg.id}`)}
                    style={{
                      padding: '0.65rem 0.8rem',
                      borderRadius: '8px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1B4D3E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>
                        {neg.buyerName || 'Buyer'}
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1B4D3E' }}>
                        ₹{neg.currentOfferPrice}/qtl
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{neg.productName}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#2563EB',
                          backgroundColor: '#EFF6FF',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {neg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
