import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Repeat,
  Star,
  Package,
  MapPin,
  RefreshCw,
  PieChart as PieIcon,
  IndianRupee
} from 'lucide-react';
import { analyticsApi } from '../../services/analyticsApi';
import { KpiCard } from '../../components/seller/KpiCard';
import { RevenueChart } from '../../components/seller/RevenueChart';
import { DonutChart } from '../../components/seller/DonutChart';
import { notify } from '../../context/NotificationContext';

export const Analytics = () => {
  const [range, setRange] = useState('30d'); // 7d | 30d | 90d | 1y
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [buyerLocations, setBuyerLocations] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [ov, rev, top, cats, locs, statuses] = await Promise.all([
        analyticsApi.getOverview(range),
        analyticsApi.getRevenue(range),
        analyticsApi.getTopProducts(5),
        analyticsApi.getCategories(),
        analyticsApi.getBuyerLocations(),
        analyticsApi.getOrderStatus()
      ]);

      setOverview(ov);
      setRevenueData(rev || []);
      setTopProducts(top || []);
      setCategories(cats || []);
      setBuyerLocations(locs || []);
      setOrderStatus(statuses || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
      notify.error('Could not load analytics data');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header & Date Range Filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: 0
            }}
          >
            Business & Harvest Analytics
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Computed on-demand performance metrics, buyer demand geographic distribution, and revenue trends.
          </p>
        </div>

        {/* Range Selector */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px'
          }}
        >
          {[
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' },
            { label: 'Past 1 Year', value: '1y' }
          ].map((r) => {
            const isActive = range === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#1B4D3E' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Overview Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <KpiCard
          title="Period Revenue"
          value={`₹${(overview?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
          subtext={`Avg Order: ₹${(overview?.averageOrderValue || 0).toFixed(0)}`}
          icon={IndianRupee}
          accentColor="#059669"
        />

        <KpiCard
          title="Orders Placed"
          value={overview?.totalOrders ?? 0}
          subtext="Total confirmed orders"
          icon={ShoppingBag}
          accentColor="#2563EB"
        />

        <KpiCard
          title="Volume Sold"
          value={`${(overview?.totalItemsSold || 0).toFixed(1)} qtl`}
          subtext="Net weight produce sold"
          icon={Package}
          accentColor="#7C3AED"
        />

        <KpiCard
          title="Buyer Reach"
          value={overview?.uniqueBuyers ?? 0}
          subtext={`${overview?.newBuyers || 0} first-time buyers`}
          icon={Users}
          accentColor="#D97706"
        />
      </div>

      {/* Main Revenue Chart Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
              Revenue Performance Series
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Delivered sales volume over the selected time horizon
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#065F46', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '9999px' }}>
            <TrendingUp size={14} />
            <span>Active Trend</span>
          </div>
        </div>

        <RevenueChart data={revenueData} height={260} color="#1B4D3E" />
      </div>

      {/* 2-Column Insights: Top Products & Category Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* Top 5 Products */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
            Top Selling Produce
          </h3>

          {topProducts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
              No product sales recorded in this period.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Crop</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Volume</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr key={p.productId || idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{p.productName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <Star size={11} fill="#FBBF24" color="#FBBF24" /> {p.rating?.toFixed(1) || '4.8'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#374151', fontWeight: 500 }}>
                        {p.unitsSold} qtl
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#1B4D3E' }}>
                        ₹{p.revenue?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Breakdown Donut */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
            Category Sales Share
          </h3>

          <DonutChart
            data={categories.map((c) => ({
              name: c.categoryName,
              value: c.revenue,
              percentage: c.percentage
            }))}
            size={190}
            centerTitle="Total Sales"
          />
        </div>
      </div>

      {/* 2-Column: Buyer Locations & Order Status Distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Buyer Locations Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
            <MapPin size={18} color="#1B4D3E" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
              Buyer Geographic Demand
            </h3>
          </div>

          {buyerLocations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
              No geographic distribution data recorded.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Location</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Orders</th>
                    <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {buyerLocations.map((loc, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{loc.district}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{loc.state}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#374151' }}>
                        {loc.orders}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#1B4D3E' }}>
                        ₹{loc.revenue?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
            <PieIcon size={18} color="#2563EB" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
              Order Lifecycle Distribution
            </h3>
          </div>

          <DonutChart
            data={orderStatus.map((s) => ({
              name: s.status,
              value: s.count
            }))}
            size={190}
            centerTitle="Total Orders"
            palette={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280']}
          />
        </div>
      </div>
    </div>
  );
};
