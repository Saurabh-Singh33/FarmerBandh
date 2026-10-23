import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  IndianRupee,
  Calendar,
  Download,
  MapPin,
  RefreshCw,
  Tractor,
  Layers
} from 'lucide-react';
import { adminReportsApi } from '../../services/adminApi';
import { CsvExportButton } from '../../components/admin/CsvExportButton';
import { notify } from '../../context/NotificationContext';

export const Reports = () => {
  const [range, setRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [topFarmers, setTopFarmers] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateDates = (r) => {
    const to = new Date();
    const from = new Date();
    if (r === '7d') from.setDate(to.getDate() - 7);
    else if (r === '30d') from.setDate(to.getDate() - 30);
    else if (r === '90d') from.setDate(to.getDate() - 90);
    else if (r === '1y') from.setFullYear(to.getFullYear() - 1);
    else from.setDate(to.getDate() - 30);
    return { from: from.toISOString(), to: to.toISOString() };
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const loadAllReports = async (showFullLoading = true) => {
    try {
      if (showFullLoading) setLoading(true);
      else setIsSyncing(true);

      const { from, to } = calculateDates(range);

      const [ov, rev, usr, tf, tb, tp, cat, loc] = await Promise.all([
        adminReportsApi.getOverview(from, to),
        adminReportsApi.getRevenue('day', from, to),
        adminReportsApi.getUsers(from, to),
        adminReportsApi.getTopFarmers(5, from, to),
        adminReportsApi.getTopBuyers(5, from, to),
        adminReportsApi.getTopProducts(5, from, to),
        adminReportsApi.getCategories(from, to),
        adminReportsApi.getLocations(from, to)
      ]);

      setOverview(ov);
      setRevenueData(rev || []);
      setUserData(usr || []);
      setTopFarmers(tf || []);
      setTopBuyers(tb || []);
      setTopProducts(tp || []);
      setCategories(cat || []);
      setLocations(loc || []);
    } catch (err) {
      if (showFullLoading) {
        notify.error(err.response?.data?.message || err.message || 'Failed to load analytics.');
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadAllReports(true);
    // Real-time live polling every 20 seconds
    const interval = setInterval(() => {
      loadAllReports(false);
    }, 20000);
    return () => clearInterval(interval);
  }, [range]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Pure SVG Line / Area Chart Renderer
  const renderSvgAreaChart = (points = [], valueKey = 'revenue', color = '#059669', height = 220) => {
    if (!points || points.length === 0) {
      return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
          No data available for selected time period.
        </div>
      );
    }

    const values = points.map((p) => p[valueKey] || 0);
    const maxVal = Math.max(...values, 100);
    const minVal = 0;
    const padding = 20;
    const width = 600;

    const coords = points.map((p, i) => {
      const x = padding + (i / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p[valueKey] - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y, point: p };
    });

    const pathD = coords.reduce((acc, curr, i) => {
      return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }}>
          <defs>
            <linearGradient id={`grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - padding - ratio * (height - padding * 2);
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#grad-${valueKey})`} />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r="3.5"
              fill="#FFFFFF"
              stroke={color}
              strokeWidth="2"
            >
              <title>{`${c.point.label || c.point.period}: ${c.point[valueKey]}`}</title>
            </circle>
          ))}
        </svg>

        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px 0 10px', fontSize: '0.72rem', color: '#94A3B8' }}>
          <span>{points[0]?.label || points[0]?.period}</span>
          {points.length > 2 && (
            <span>{points[Math.floor(points.length / 2)]?.label || points[Math.floor(points.length / 2)]?.period}</span>
          )}
          <span>{points[points.length - 1]?.label || points[points.length - 1]?.period}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Computing Platform Analytics & Aggregates...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Top Header & Range Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
            Reports & Analytics
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Comprehensive gross merchandise value, net revenue streams, category performance, and regional trends.
          </p>
        </div>

        {/* Range Selector & Real-Time Sync & CSV Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-Time Live
          </span>

          <button
            type="button"
            onClick={() => loadAllReports(false)}
            title="Refresh analytics data"
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-emerald-700' : ''} />
          </button>

          <div style={{ display: 'inline-flex', backgroundColor: '#E2E8F0', padding: '2px', borderRadius: '8px' }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: '1 Year' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: range === r.id ? '#FFFFFF' : 'transparent',
                  color: range === r.id ? '#0F172A' : '#64748B',
                  fontWeight: range === r.id ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: range === r.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <CsvExportButton
            onExport={() => {
              const { from, to } = calculateDates(range);
              return adminReportsApi.exportCsv('revenue', from, to);
            }}
            filename={`farmerbandh_revenue_${range}.csv`}
            label="Export Revenue CSV"
          />
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Period GMV</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            {formatCurrency(overview?.totalGmv ?? overview?.totalRevenue ?? 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '4px', fontWeight: 600 }}>
            Gross merchandise traded
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Platform Net Revenue</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {formatCurrency(overview?.netRevenue ?? overview?.platformFeeRevenue ?? 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Commission + platform charges
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Orders Placed</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            {(overview?.totalOrders || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Avg value: {formatCurrency(overview?.averageOrderValue || 0)}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Crops Traded</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            {(overview?.unitsSoldQuintals || 0).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Qtl</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Delivered produce volume
          </div>
        </div>
      </div>

      {/* SVG Charts: Revenue and User Growth */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Revenue Chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                Platform Revenue Trend
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Daily fee income over selected window
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
              Revenue (₹)
            </div>
          </div>
          {renderSvgAreaChart(revenueData, 'revenue', '#059669', 240)}
        </div>

        {/* User Growth Chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                New User Signups
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Farmer and buyer account registrations
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#2563EB', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
              Signups
            </div>
          </div>
          {renderSvgAreaChart(userData, 'newUsers', '#2563EB', 240)}
        </div>
      </div>

      {/* Two Column: Top Producers & Top Commodities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Top Farmers */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              Top Farmers by Volume
            </h3>
            <CsvExportButton
              onExport={() => {
                const { from, to } = calculateDates(range);
                return adminReportsApi.exportCsv('farmers', from, to);
              }}
              filename={`top_farmers_${range}.csv`}
              label="Export"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topFarmers.map((f, idx) => (
              <div
                key={f.farmerId || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#FAFAFA',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#059669', width: '20px' }}>#{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{f.farmName || f.farmerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{f.ordersCount} completed orders</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>
                  {formatCurrency(f.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              Top Selling Crops
            </h3>
            <CsvExportButton
              onExport={() => {
                const { from, to } = calculateDates(range);
                return adminReportsApi.exportCsv('products', from, to);
              }}
              filename={`top_products_${range}.csv`}
              label="Export"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topProducts.map((p, idx) => (
              <div
                key={p.productId || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#FAFAFA',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#2563EB', width: '20px' }}>#{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.unitsSold} Quintals sold</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>
                  {formatCurrency(p.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance & Location breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Categories Bar Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
            Category Contribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map((c) => (
              <div key={c.categoryId || c.categoryName}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{c.categoryName}</span>
                  <span style={{ fontWeight: 700, color: '#64748B' }}>
                    {formatCurrency(c.revenue)} ({c.percentage}%)
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, c.percentage)}%`,
                      backgroundColor: '#059669',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
            Regional Agricultural Markets
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {locations.slice(0, 5).map((l, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#FAFAFA',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="#64748B" />
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {l.district ? `${l.district}, ${l.state}` : l.state}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{formatCurrency(l.revenue)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{l.ordersCount} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
