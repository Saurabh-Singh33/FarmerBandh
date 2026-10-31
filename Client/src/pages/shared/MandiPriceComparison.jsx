import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  RefreshCw,
  Search,
  Building2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Info,
  Layers,
  Sparkles,
  BarChart2,
  Zap,
  MapPin,
  Wheat,
  Calendar,
  Scale,
  Activity,
  CheckCircle2,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import { mandiApi } from '../../services/mandiApi';

const FALLBACK_DISTRICTS_BY_STATE = {
  'Bihar': ['All Districts', 'Patna', 'Muzaffarpur', 'Purnia', 'Begusarai', 'Bhagalpur', 'Gaya', 'Samastipur', 'Darbhanga', 'Nalanda', 'Rohtas', 'Bhojpur', 'Vaishali', 'East Champaran', 'West Champaran', 'Katihar', 'Saharsa'],
  'Kerala': ['All Districts', 'Alappuzha', 'Ernakulam', 'Kottayam', 'Kozhikode', 'Palakkad', 'Thrissur', 'Thiruvananthapuram'],
  'Gujarat': ['All Districts', 'Ahmedabad', 'Rajkot', 'Surat', 'Mehsana', 'Vadodara', 'Bhavnagar'],
  'Maharashtra': ['All Districts', 'Nashik', 'Pune', 'Mumbai', 'Nagpur', 'Ahmednagar', 'Solapur'],
  'Punjab': ['All Districts', 'Ludhiana', 'Amritsar', 'Bathinda', 'Jalandhar', 'Patiala'],
  'Uttar Pradesh': ['All Districts', 'Lucknow', 'Agra', 'Kanpur', 'Varanasi', 'Aligarh', 'Bareilly'],
  'Madhya Pradesh': ['All Districts', 'Indore', 'Neemuch', 'Mandsaur', 'Ujjain', 'Bhopal'],
  'Rajasthan': ['All Districts', 'Jaipur', 'Kota', 'Jodhpur', 'Bikaner', 'Sri Ganganagar', 'Alwar', 'Nagaur'],
  'Haryana': ['All Districts', 'Karnal', 'Hisar', 'Ambala', 'Sirsa', 'Kurukshetra', 'Rohtak'],
  'Karnataka': ['All Districts', 'Bengaluru', 'Kolar', 'Belagavi', 'Davanagere', 'Mysuru', 'Shivamogga'],
  'Andhra Pradesh': ['All Districts', 'Guntur', 'Krishna', 'Kurnool', 'East Godavari', 'West Godavari', 'Visakhapatnam'],
  'Tamil Nadu': ['All Districts', 'Coimbatore', 'Madurai', 'Erode', 'Salem', 'Thanjavur', 'Tiruchirappalli'],
  'West Bengal': ['All Districts', 'Hooghly', 'Burdwan', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Malda']
};

export const MandiPriceComparison = () => {
  // Controls state
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [granularity, setGranularity] = useState('day'); // 'day' | 'week'
  const [pointCount, setPointCount] = useState(14); // 7, 14, 30 for day; 4, 8, 12 for week
  const [unit, setUnit] = useState('quintal'); // 'quintal' | 'kg'

  // Metadata lists
  const [commodities, setCommodities] = useState([
    'Wheat',
    'Cabbage',
    'Basmati Rice',
    'Yellow Maize',
    'Chana (Gram)',
    'Onion',
    'Potato',
    'Tomato',
    'Mustard Seeds',
    'Cotton',
    'Soybean'
  ]);
  const [states, setStates] = useState([
    'All India',
    'Kerala',
    'Gujarat',
    'Maharashtra',
    'Punjab',
    'Madhya Pradesh',
    'Uttar Pradesh',
    'Rajasthan',
    'Haryana',
    'Karnataka',
    'Andhra Pradesh',
    'Tamil Nadu',
    'Bihar',
    'West Bengal'
  ]);
  const [districts, setDistricts] = useState(['All Districts']);

  const [comparisonData, setComparisonData] = useState(null);
  const [liveRates, setLiveRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMandi, setSearchMandi] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'table' | 'live'
  const [responseTimeMs, setResponseTimeMs] = useState(4);

  // Helper for safe currency & number formatting
  const formatNum = (val) => {
    if (val == null || isNaN(val)) return '0';
    return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  // Load metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cList, sList] = await Promise.all([
          mandiApi.getCommodities(),
          mandiApi.getStates()
        ]);
        if (cList?.length) setCommodities(cList);
        if (sList?.length) setStates(sList);
      } catch (err) {
        console.error('Error fetching mandi metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Update district options when selectedState changes
  useEffect(() => {
    if (selectedState && FALLBACK_DISTRICTS_BY_STATE[selectedState]) {
      setDistricts(FALLBACK_DISTRICTS_BY_STATE[selectedState]);
      setSelectedDistrict('All Districts');
    } else if (selectedState === 'All India') {
      setDistricts(['All Districts']);
      setSelectedDistrict('All Districts');
    }

    const fetchDistricts = async () => {
      try {
        const dList = await mandiApi.getDistricts(selectedState === 'All India' ? null : selectedState);
        if (dList?.length) {
          setDistricts(dList);
          setSelectedDistrict('All Districts');
        }
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Load comparison data (instant from fast cache)
  const loadComparison = useCallback(async (forceRefresh = false) => {
    const t0 = performance.now();
    try {
      if (forceRefresh) {
        mandiApi.clearCache();
        setLoading(true);
      }
      const data = await mandiApi.getComparison({
        commodity: selectedCommodity,
        state: selectedState === 'All India' ? null : selectedState,
        district: selectedDistrict === 'All Districts' ? null : selectedDistrict,
        granularity,
        points: pointCount,
        unit
      });
      setComparisonData(data);
      if (data?.points?.length > 0) {
        setHoveredPoint(data.points[data.points.length - 1]);
      }
      const t1 = performance.now();
      setResponseTimeMs(Math.max(3, Math.round(t1 - t0)));
    } catch (err) {
      console.error('Error fetching comparison data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCommodity, selectedState, selectedDistrict, granularity, pointCount, unit]);

  // Load live mandi rates
  const loadLiveRates = useCallback(async () => {
    try {
      const res = await mandiApi.getLiveRates({
        commodity: selectedCommodity,
        state: selectedState === 'All India' ? null : selectedState,
        district: selectedDistrict === 'All Districts' ? null : selectedDistrict,
        limit: 50
      });
      setLiveRates(res?.records || []);
    } catch (err) {
      console.error('Error fetching live mandi rates:', err);
    }
  }, [selectedCommodity, selectedState, selectedDistrict]);

  useEffect(() => {
    loadComparison();
    loadLiveRates();
  }, [loadComparison, loadLiveRates]);

  const handleGranularityChange = (newGran) => {
    setGranularity(newGran);
    setPointCount(newGran === 'day' ? 14 : 8);
  };

  const filteredLiveRates = useMemo(() => {
    if (!searchMandi.trim()) return liveRates;
    const q = searchMandi.toLowerCase();
    return liveRates.filter(
      (r) =>
        r?.market?.toLowerCase().includes(q) ||
        r?.district?.toLowerCase().includes(q) ||
        r?.state?.toLowerCase().includes(q) ||
        r?.commodity?.toLowerCase().includes(q) ||
        r?.variety?.toLowerCase().includes(q)
    );
  }, [liveRates, searchMandi]);

  // Normalized safe properties from comparisonData
  const curAppPrice = comparisonData?.currentAppPrice ?? comparisonData?.CurrentAppPrice ?? 0;
  const curMandiPrice = comparisonData?.currentMandiPrice ?? comparisonData?.CurrentMandiPrice ?? 0;
  const curAppPricePerKg = comparisonData?.appPricePerKg ?? comparisonData?.AppPricePerKg ?? (curAppPrice / 100);
  const diffAmount = comparisonData?.differenceAmount ?? comparisonData?.DifferenceAmount ?? 0;
  const diffPercentage = comparisonData?.differencePercentage ?? comparisonData?.DifferencePercentage ?? 0;
  const totalArrivals = comparisonData?.totalMandiArrivals ?? comparisonData?.TotalMandiArrivals ?? 'N/A';
  const primaryMandiName = comparisonData?.primaryMandi ?? comparisonData?.PrimaryMandi ?? 'Regional APMC Mandi';
  const marketSummaryText = comparisonData?.marketSummary ?? comparisonData?.MarketSummary ?? '';
  const currentUnit = comparisonData?.unit ?? (unit === 'kg' ? 'kg' : 'Quintal');
  const unitSymbol = unit === 'kg' ? '/kg' : '/Qtl';

  // Export CSV
  const exportToCsv = () => {
    if (!comparisonData?.points?.length) return;
    const header = [
      'Period',
      `FarmerBandh Price (INR/${currentUnit})`,
      `Mandi Modal Price (INR/${currentUnit})`,
      `Mandi Min (INR/${currentUnit})`,
      `Mandi Max (INR/${currentUnit})`,
      'Difference (INR)',
      'Difference (%)',
      'Verdict'
    ].join(',');

    const rows = comparisonData.points.map((p) =>
      [
        `"${p.periodLabel}"`,
        p.appPrice,
        p.mandiModalPrice,
        p.mandiMinPrice,
        p.mandiMaxPrice,
        p.differenceAmount,
        `${p.differencePercentage}%`,
        `"${p.status}"`
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${selectedCommodity}_Mandi_Comparison_${granularity}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart computation
  const chartPoints = comparisonData?.points || [];
  const { minVal, maxVal, width, height, padding } = useMemo(() => {
    const w = 920;
    const h = 340;
    const p = { top: 30, right: 35, bottom: 50, left: 75 };

    if (!chartPoints.length) return { minVal: 0, maxVal: 100, width: w, height: h, padding: p };

    let min = Infinity;
    let max = -Infinity;

    chartPoints.forEach((pt) => {
      min = Math.min(min, pt.mandiMinPrice, pt.appPrice, pt.mandiModalPrice);
      max = Math.max(max, pt.mandiMaxPrice, pt.appPrice, pt.mandiModalPrice);
    });

    const range = max - min || 10;
    const buffer = range * 0.14;

    return {
      minVal: Math.max(0, Math.floor(min - buffer)),
      maxVal: Math.ceil(max + buffer),
      width: w,
      height: h,
      padding: p
    };
  }, [chartPoints]);

  const getY = (val) => {
    const chartHeight = height - padding.top - padding.bottom;
    const valRange = maxVal - minVal || 1;
    return height - padding.bottom - ((val - minVal) / valRange) * chartHeight;
  };

  const getX = (index) => {
    const chartWidth = width - padding.left - padding.right;
    const total = chartPoints.length;
    if (total <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (total - 1)) * chartWidth;
  };

  // Gradient area beneath the FarmerBandh price line
  const appAreaString = useMemo(() => {
    if (!chartPoints.length) return '';
    const pointsList = chartPoints.map((pt, i) => `${getX(i)} ${getY(pt.appPrice)}`);
    const firstX = getX(0);
    const lastX = getX(chartPoints.length - 1);
    const bottomY = height - padding.bottom;
    return `M ${firstX} ${bottomY} L ${pointsList.join(' L ')} L ${lastX} ${bottomY} Z`;
  }, [chartPoints, minVal, maxVal, width, height]);

  const appPathString = useMemo(() => {
    if (!chartPoints.length) return '';
    return chartPoints.reduce((acc, pt, i) => {
      const x = getX(i);
      const y = getY(pt.appPrice);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartPoints, minVal, maxVal]);

  const mandiModalPathString = useMemo(() => {
    if (!chartPoints.length) return '';
    return chartPoints.reduce((acc, pt, i) => {
      const x = getX(i);
      const y = getY(pt.mandiModalPrice);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartPoints, minVal, maxVal]);

  const mandiRangeAreaString = useMemo(() => {
    if (!chartPoints.length) return '';
    let topPath = '';
    let bottomPath = '';

    chartPoints.forEach((pt, i) => {
      const x = getX(i);
      const yMax = getY(pt.mandiMaxPrice);
      topPath += i === 0 ? `M ${x} ${yMax}` : ` L ${x} ${yMax}`;
    });

    for (let i = chartPoints.length - 1; i >= 0; i--) {
      const x = getX(i);
      const yMin = getY(chartPoints[i].mandiMinPrice);
      bottomPath += ` L ${x} ${yMin}`;
    }

    return topPath + bottomPath + ' Z';
  }, [chartPoints, minVal, maxVal]);

  return (
    <div
      style={{
        backgroundColor: '#F8FAF7',
        minHeight: '100vh',
        padding: '2.5rem 1.5rem',
        boxSizing: 'border-box',
        color: '#1F2937'
      }}
    >
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
        {/* Breadcrumb & Real-Time Sync Indicator */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#6B7280' }}>
            <Link to="/" style={{ color: '#1B4D3E', textDecoration: 'none', fontWeight: 600 }}>
              Home
            </Link>
            <ChevronRight size={14} color="#9CA3AF" />
            <Link to="/marketplace" style={{ color: '#1B4D3E', textDecoration: 'none', fontWeight: 600 }}>
              Marketplace
            </Link>
            <ChevronRight size={14} color="#9CA3AF" />
            <span style={{ color: '#111827', fontWeight: 600 }}>Mandi Price Intelligence</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                fontSize: '0.78rem',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.05)'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                  display: 'inline-block'
                }}
              />
              Official APMC Network Synced
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '9999px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #E5E7EB',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <Zap size={13} color="#F59E0B" />
              {responseTimeMs}ms Cache Latency
            </span>
          </div>
        </div>

        {/* Refined 2-Column Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0E3528 0%, #174837 50%, #1B4D3E 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px -15px rgba(27, 77, 62, 0.28)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Decorative Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-60px',
              left: '30%',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Left Column: Title & Mission */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#6EE7B7',
                    border: '1px solid rgba(110, 231, 183, 0.3)'
                  }}
                >
                  <Sparkles size={13} color="#F59E0B" /> Live Agmarknet APMC & Farm Gate Intel
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '2.6rem',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  margin: '0 0 1rem 0',
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF'
                }}
              >
                Indian Mandi vs. FarmerBandh
                <span
                  style={{
                    display: 'block',
                    color: '#A7F3D0',
                    fontSize: '1.9rem',
                    fontWeight: 600,
                    marginTop: '4px'
                  }}
                >
                  Live Price & Arbitrage Tracker
                </span>
              </h1>

              <p
                style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.6,
                  color: '#D1FAE5',
                  margin: '0 0 1.5rem 0',
                  maxWidth: '580px'
                }}
              >
                Direct farm gate listings compared against real-time official APMC Mandi auction spot rates.
                Gain total price clarity, monitor historical spreads, and eliminate middleman deductions with zero latency.
              </p>

              {/* Trust Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    fontSize: '0.8rem',
                    color: '#F0FDF4'
                  }}
                >
                  <CheckCircle2 size={13} color="#34D399" />
                  Verified Direct Listings
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    fontSize: '0.8rem',
                    color: '#F0FDF4'
                  }}
                >
                  <Building2 size={13} color="#FBBF24" />
                  2,700+ APMC Yards
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    fontSize: '0.8rem',
                    color: '#F0FDF4'
                  }}
                >
                  <Zap size={13} color="#6EE7B7" />
                  Zero-Lag In-Memory Sync
                </span>
              </div>
            </div>

            {/* Right Column: Floating Parity Spotlight Card */}
            <div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.09)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 35px rgba(0, 0, 0, 0.18)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#34D399',
                        boxShadow: '0 0 10px #34D399'
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#A7F3D0'
                      }}
                    >
                      Market Parity Spotlight
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#FEF3C7',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    {selectedCommodity}
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#D1D5DB', marginBottom: '4px' }}>
                    Regional Benchmark: {selectedState === 'All India' ? 'National APMC Average' : selectedState}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        backgroundColor: diffAmount >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                        border: `1.5px solid ${diffAmount >= 0 ? '#34D399' : '#60A5FA'}`,
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}
                    >
                      {diffAmount >= 0 ? <ArrowUpRight size={18} color="#34D399" /> : <ArrowDownRight size={18} color="#93C5FD" />}
                      {diffAmount >= 0 ? '+' : ''}₹{formatNum(diffAmount)}/{unit === 'kg' ? 'kg' : 'Qtl'} ({diffPercentage > 0 ? `+${diffPercentage}%` : `${diffPercentage}%`})
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#D1FAE5', fontWeight: 500 }}>
                      {diffAmount >= 0 ? 'Net Direct Farmer Premium' : 'Direct Buyer Saving'}
                    </span>
                  </div>
                </div>

                {/* 2 Mini Metric Panels */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    paddingTop: '0.5rem'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: 600, textTransform: 'uppercase' }}>
                      FarmerBandh App
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      ₹{formatNum(curAppPrice)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#D1D5DB' }}>
                      {unitSymbol} (Direct Farm)
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#FCD34D', fontWeight: 600, textTransform: 'uppercase' }}>
                      Mandi Modal Rate
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#FDE68A', marginTop: '2px' }}>
                      ₹{formatNum(curMandiPrice)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#D1D5DB' }}>
                      {unitSymbol} (APMC Clearing)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refined Filter & Intelligence Control Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.05)',
            marginBottom: '2rem'
          }}
        >
          {/* Top Row: Selectors + Timeline Mode + Unit Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '1.25rem'
            }}
          >
            {/* Primary Selectors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              {/* Commodity Selector */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#4B5563',
                    marginBottom: '6px',
                    letterSpacing: '0.03em'
                  }}
                >
                  <Wheat size={13} color="#1B4D3E" /> Commodity / Crop
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    style={{
                      appearance: 'none',
                      backgroundColor: '#F8FAF7',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '9px 36px 9px 14px',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#111827',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '175px',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#1B4D3E')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  >
                    {commodities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={16}
                    color="#6B7280"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(90deg)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* State Selector */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#4B5563',
                    marginBottom: '6px',
                    letterSpacing: '0.03em'
                  }}
                >
                  <MapPin size={13} color="#D97706" /> State
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    style={{
                      appearance: 'none',
                      backgroundColor: '#F8FAF7',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '9px 36px 9px 14px',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#111827',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '160px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#1B4D3E')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  >
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={16}
                    color="#6B7280"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(90deg)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* District Selector */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#4B5563',
                    marginBottom: '6px',
                    letterSpacing: '0.03em'
                  }}
                >
                  <Building2 size={13} color="#059669" /> District / Mandi
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={{
                      appearance: 'none',
                      backgroundColor: '#F8FAF7',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '9px 36px 9px 14px',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#111827',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '160px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#1B4D3E')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={16}
                    color="#6B7280"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(90deg)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Segmented Controls & Unit Switcher */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              {/* Timeline Mode Segmented Pill */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#4B5563',
                    marginBottom: '6px',
                    letterSpacing: '0.03em'
                  }}
                >
                  Comparison Mode
                </label>
                <div
                  style={{
                    display: 'inline-flex',
                    backgroundColor: '#F1F5F9',
                    padding: '3px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleGranularityChange('day')}
                    style={{
                      border: 'none',
                      backgroundColor: granularity === 'day' ? '#1B4D3E' : 'transparent',
                      color: granularity === 'day' ? '#FFFFFF' : '#4B5563',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      padding: '7px 15px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: granularity === 'day' ? '0 2px 6px rgba(27, 77, 62, 0.25)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Calendar size={13} />
                    <span>Day-Wise</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGranularityChange('week')}
                    style={{
                      border: 'none',
                      backgroundColor: granularity === 'week' ? '#1B4D3E' : 'transparent',
                      color: granularity === 'week' ? '#FFFFFF' : '#4B5563',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      padding: '7px 15px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: granularity === 'week' ? '0 2px 6px rgba(27, 77, 62, 0.25)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <BarChart2 size={13} />
                    <span>Week-Wise</span>
                  </button>
                </div>
              </div>

              {/* Span Selector */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#4B5563',
                    marginBottom: '6px',
                    letterSpacing: '0.03em'
                  }}
                >
                  Span
                </label>
                <div
                  style={{
                    display: 'inline-flex',
                    backgroundColor: '#F1F5F9',
                    padding: '3px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  {granularity === 'day'
                    ? [7, 14, 30].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPointCount(num)}
                          style={{
                            border: 'none',
                            backgroundColor: pointCount === num ? '#FFFFFF' : 'transparent',
                            color: pointCount === num ? '#1B4D3E' : '#64748B',
                            fontWeight: pointCount === num ? 700 : 500,
                            boxShadow: pointCount === num ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                            fontSize: '0.82rem',
                            padding: '7px 12px',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {num}D
                        </button>
                      ))
                    : [4, 8, 12].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPointCount(num)}
                          style={{
                            border: 'none',
                            backgroundColor: pointCount === num ? '#FFFFFF' : 'transparent',
                            color: pointCount === num ? '#1B4D3E' : '#64748B',
                            fontWeight: pointCount === num ? 700 : 500,
                            boxShadow: pointCount === num ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                            fontSize: '0.82rem',
                            padding: '7px 12px',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {num}W
                        </button>
                      ))}
                </div>
              </div>

              {/* Unit Toggle */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#4B5563',
                    marginBottom: '6px',
                    letterSpacing: '0.03em'
                  }}
                >
                  Unit
                </label>
                <div
                  style={{
                    display: 'inline-flex',
                    backgroundColor: '#F1F5F9',
                    padding: '3px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setUnit('quintal')}
                    style={{
                      border: 'none',
                      backgroundColor: unit === 'quintal' ? '#FFFFFF' : 'transparent',
                      color: unit === 'quintal' ? '#1B4D3E' : '#64748B',
                      fontWeight: unit === 'quintal' ? 700 : 500,
                      boxShadow: unit === 'quintal' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                      fontSize: '0.82rem',
                      padding: '7px 13px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ₹/Qtl
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('kg')}
                    style={{
                      border: 'none',
                      backgroundColor: unit === 'kg' ? '#FFFFFF' : 'transparent',
                      color: unit === 'kg' ? '#1B4D3E' : '#64748B',
                      fontWeight: unit === 'kg' ? 700 : 500,
                      boxShadow: unit === 'kg' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                      fontSize: '0.82rem',
                      padding: '7px 13px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ₹/kg
                  </button>
                </div>
              </div>

              {/* Sync Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    loadComparison(true);
                    loadLiveRates();
                  }}
                  title="Purge cache and refresh live rates"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F8FAF7',
                    border: '1.5px solid #CBD5E1',
                    color: '#1B4D3E',
                    borderRadius: '12px',
                    padding: '9px 15px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ECFDF5';
                    e.currentTarget.style.borderColor = '#10B981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAF7';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                >
                  <RefreshCw size={15} className={loading ? 'spin-animate' : ''} />
                  <span>Sync</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Quick Select Pill Clusters */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '1.25rem',
              paddingTop: '1.15rem',
              borderTop: '1px solid #F1F5F9'
            }}
          >
            {/* Trending Crops */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748B',
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '130px'
                }}
              >
                🔥 Trending Produce:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Wheat', 'Cabbage', 'Onion', 'Potato', 'Tomato', 'Basmati Rice', 'Yellow Maize'].map((c) => {
                  const isActive = selectedCommodity === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCommodity(c)}
                      style={{
                        border: 'none',
                        backgroundColor: isActive ? '#1B4D3E' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#475569',
                        borderRadius: '9999px',
                        padding: '4px 14px',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        boxShadow: isActive ? '0 2px 6px rgba(27, 77, 62, 0.22)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isActive && <span style={{ marginRight: '5px' }}>•</span>}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* State Hubs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748B',
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '130px'
                }}
              >
                🏛️ State Hubs:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['All India', 'Kerala', 'Gujarat', 'Maharashtra', 'Punjab', 'Uttar Pradesh', 'Rajasthan'].map((s) => {
                  const isActive = selectedState === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedState(s)}
                      style={{
                        border: 'none',
                        backgroundColor: isActive ? '#D97706' : '#F8FAF7',
                        color: isActive ? '#FFFFFF' : '#475569',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: isActive ? '#D97706' : '#E2E8F0',
                        borderRadius: '9999px',
                        padding: '4px 14px',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        boxShadow: isActive ? '0 2px 6px rgba(217, 119, 6, 0.22)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top 4 KPI Cards (Fintech Grade) */}
        {comparisonData && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}
          >
            {/* KPI 1: FarmerBandh App Price */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1.5px solid #D1FAE5',
                background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 60%)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#065F46',
                    letterSpacing: '0.04em'
                  }}
                >
                  FarmerBandh Price
                </span>
                <span
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    padding: '3px 9px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  Direct Farm Gate
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '2.15rem',
                    fontWeight: 700,
                    color: '#1B4D3E'
                  }}
                >
                  ₹{formatNum(curAppPrice)}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600 }}>{unitSymbol}</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#047857', fontWeight: 500 }}>
                {unit === 'kg' ? `Verified Direct listings` : `Equiv: ₹${formatNum(curAppPricePerKg)}/kg direct`}
              </p>
            </div>

            {/* KPI 2: Mandi Benchmark Rate */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1.5px solid #FDE68A',
                background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 60%)',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#92400E',
                    letterSpacing: '0.04em'
                  }}
                >
                  APMC Mandi Rate
                </span>
                <span
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    padding: '3px 9px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  Auction Spot
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '2.15rem',
                    fontWeight: 700,
                    color: '#B45309'
                  }}
                >
                  ₹{formatNum(curMandiPrice)}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600 }}>{unitSymbol}</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#B45309', fontWeight: 500 }}>
                {primaryMandiName} clearing auction
              </p>
            </div>

            {/* KPI 3: Direct Trade Advantage */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.5rem',
                border: diffAmount >= 0 ? '1.5px solid #A7F3D0' : '1.5px solid #BFDBFE',
                background: diffAmount >= 0 ? 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 60%)' : 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 60%)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: diffAmount >= 0 ? '#065F46' : '#1E40AF',
                    letterSpacing: '0.04em'
                  }}
                >
                  Direct Spread Advantage
                </span>
                <span
                  style={{
                    backgroundColor: diffAmount >= 0 ? '#ECFDF5' : '#EFF6FF',
                    color: diffAmount >= 0 ? '#065F46' : '#1E40AF',
                    border: `1px solid ${diffAmount >= 0 ? '#A7F3D0' : '#BFDBFE'}`,
                    padding: '3px 9px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {diffAmount >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {diffPercentage > 0 ? `+${diffPercentage}%` : `${diffPercentage}%`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '2.15rem',
                    fontWeight: 700,
                    color: diffAmount >= 0 ? '#047857' : '#1E40AF'
                  }}
                >
                  {diffAmount >= 0 ? '+' : ''}₹{formatNum(Math.abs(diffAmount))}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600 }}>{unitSymbol}</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: diffAmount >= 0 ? '#065F46' : '#1E40AF', fontWeight: 500 }}>
                {diffAmount >= 0 ? 'Farmer premium over middleman rate' : 'Direct buyer wholesale saving'}
              </p>
            </div>

            {/* KPI 4: Market Volume / Yard Arrivals */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1.5px solid #DDD6FE',
                background: 'linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 60%)',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#5B21B6',
                    letterSpacing: '0.04em'
                  }}
                >
                  Mandi Yard Volume
                </span>
                <span
                  style={{
                    backgroundColor: '#F3E8FF',
                    color: '#6B21A8',
                    border: '1px solid #DDD6FE',
                    padding: '3px 9px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  APMC Arrivals
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '2.15rem',
                    fontWeight: 700,
                    color: '#5B21B6'
                  }}
                >
                  {totalArrivals}
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#6B21A8', fontWeight: 500 }}>
                Active yard arrivals across regional APMCs
              </p>
            </div>
          </div>
        )}

        {/* Tab Controls & Actions Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #E5E7EB',
            marginBottom: '1.75rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('chart')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '12px 6px',
                fontSize: '1rem',
                fontWeight: 700,
                color: activeTab === 'chart' ? '#1B4D3E' : '#64748B',
                borderBottom: activeTab === 'chart' ? '3px solid #1B4D3E' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'color 0.15s ease'
              }}
            >
              <BarChart2 size={19} color={activeTab === 'chart' ? '#1B4D3E' : '#64748B'} />
              <span>Comparative Trend Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('table')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '12px 6px',
                fontSize: '1rem',
                fontWeight: 700,
                color: activeTab === 'table' ? '#1B4D3E' : '#64748B',
                borderBottom: activeTab === 'table' ? '3px solid #1B4D3E' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'color 0.15s ease'
              }}
            >
              <Layers size={19} color={activeTab === 'table' ? '#1B4D3E' : '#64748B'} />
              <span>{granularity === 'day' ? 'Day-Wise Ledger' : 'Week-Wise Ledger'}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: '#E2E8F0',
                  color: '#334155',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  fontWeight: 700
                }}
              >
                {chartPoints.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('live')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '12px 6px',
                fontSize: '1rem',
                fontWeight: 700,
                color: activeTab === 'live' ? '#1B4D3E' : '#64748B',
                borderBottom: activeTab === 'live' ? '3px solid #1B4D3E' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'color 0.15s ease'
              }}
            >
              <Building2 size={19} color={activeTab === 'live' ? '#1B4D3E' : '#64748B'} />
              <span>Live APMC Feed</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  border: '1px solid #A7F3D0',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  fontWeight: 700
                }}
              >
                {liveRates.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportToCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '10px',
              padding: '7px 16px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAF7';
              e.currentTarget.style.borderColor = '#1B4D3E';
              e.currentTarget.style.color = '#1B4D3E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.color = '#334155';
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* TAB 1: CHART VIEW */}
        {activeTab === 'chart' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.04)',
              marginBottom: '2rem'
            }}
          >
            {/* Chart Subheader & Legend */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #F1F5F9'
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    color: '#1B4D3E',
                    margin: 0
                  }}
                >
                  {selectedCommodity} — {granularity === 'day' ? 'Day-Wise' : 'Week-Wise'} Price Analysis
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Region: <strong>{selectedState === 'All India' ? 'National APMC Network' : selectedState}</strong> • Hover any period node to inspect spread details
                </p>
              </div>

              {/* Legend Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#1B4D3E',
                      boxShadow: '0 0 0 2px #A7F3D0',
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>FarmerBandh App Price</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#D97706',
                      boxShadow: '0 0 0 2px #FDE68A',
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>Mandi Modal Price</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '12px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(217, 119, 6, 0.16)',
                      border: '1px dashed #D97706',
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ color: '#64748B' }}>Mandi Min-Max Range</span>
                </div>
              </div>
            </div>

            {/* Interactive Inspection Tooltip Banner */}
            {hoveredPoint && (
              <div
                style={{
                  backgroundColor: '#F8FAF7',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Period
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                    {hoveredPoint.periodLabel}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1B4D3E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    FarmerBandh App
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1B4D3E' }}>
                    ₹{formatNum(hoveredPoint.appPrice)} {unitSymbol}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mandi Modal Rate
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#B45309' }}>
                    ₹{formatNum(hoveredPoint.mandiModalPrice)} {unitSymbol}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mandi Range
                  </span>
                  <div style={{ fontSize: '0.96rem', fontWeight: 600, color: '#475569' }}>
                    ₹{formatNum(hoveredPoint.mandiMinPrice)} — ₹{formatNum(hoveredPoint.mandiMaxPrice)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Net Price Spread
                  </span>
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: hoveredPoint.differenceAmount >= 0 ? '#047857' : '#1E40AF'
                    }}
                  >
                    {hoveredPoint.differenceAmount >= 0 ? '+' : ''}₹{formatNum(hoveredPoint.differenceAmount)} (
                    {hoveredPoint.differencePercentage}%)
                  </div>
                </div>
              </div>
            )}

            {/* SVG Visual Chart */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{ width: '100%', minWidth: '700px', height: 'auto', display: 'block' }}
              >
                <defs>
                  {/* Subtle Gradient beneath FarmerBandh line */}
                  <linearGradient id="appGradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B4D3E" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1B4D3E" stopOpacity="0.01" />
                  </linearGradient>

                  {/* Gradient for Mandi Range corridor */}
                  <linearGradient id="mandiCorridorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#D97706" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const val = minVal + (maxVal - minVal) * ratio;
                  const y = getY(val);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 12}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11.5"
                        fill="#94A3B8"
                        fontWeight="600"
                      >
                        ₹{Math.round(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Mandi Min-Max Corridor Area */}
                {mandiRangeAreaString && <path d={mandiRangeAreaString} fill="url(#mandiCorridorArea)" />}

                {/* FarmerBandh Soft Gradient Area */}
                {appAreaString && <path d={appAreaString} fill="url(#appGradientArea)" />}

                {/* Mandi Modal Line */}
                {mandiModalPathString && (
                  <path
                    d={mandiModalPathString}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* FarmerBandh App Line */}
                {appPathString && (
                  <path
                    d={appPathString}
                    fill="none"
                    stroke="#1B4D3E"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Nodes & Interactive Hover Triggers */}
                {chartPoints.map((pt, i) => {
                  const x = getX(i);
                  const yApp = getY(pt.appPrice);
                  const yMandi = getY(pt.mandiModalPrice);
                  const isHovered = hoveredPoint?.periodLabel === pt.periodLabel;
                  const isLastPoint = i === chartPoints.length - 1;

                  return (
                    <g key={i}>
                      {/* Crosshair Vertical Guide on Hover */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={padding.top}
                          x2={x}
                          y2={height - padding.bottom}
                          stroke="#94A3B8"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                      )}

                      {/* Mandi Node */}
                      <circle
                        cx={x}
                        cy={yMandi}
                        r={isHovered ? 6 : 4}
                        fill="#D97706"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />

                      {/* FarmerBandh Node */}
                      <circle
                        cx={x}
                        cy={yApp}
                        r={isHovered ? 7.5 : 5}
                        fill="#1B4D3E"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />

                      {/* Pulsing ring on latest current node */}
                      {isLastPoint && !isHovered && (
                        <circle
                          cx={x}
                          cy={yApp}
                          r="9"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          opacity="0.8"
                        />
                      )}

                      {/* Period Label on X Axis */}
                      <text
                        x={x}
                        y={height - padding.bottom + 24}
                        textAnchor="middle"
                        fontSize="11"
                        fill={isHovered ? '#1B4D3E' : '#64748B'}
                        fontWeight={isHovered ? '700' : '500'}
                      >
                        {pt.periodLabel}
                      </text>

                      {/* Invisible Hover Rect */}
                      <rect
                        x={x - width / chartPoints.length / 2}
                        y={padding.top}
                        width={width / chartPoints.length}
                        height={height - padding.top - padding.bottom}
                        fill="transparent"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredPoint(pt)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Dynamic Market Intelligence Insight */}
            {marketSummaryText && (
              <div
                style={{
                  marginTop: '1.75rem',
                  padding: '1.15rem 1.4rem',
                  borderRadius: '16px',
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <Info size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.9rem', color: '#065F46', lineHeight: 1.6 }}>
                  <strong style={{ color: '#047857' }}>Market Dynamics Insight:</strong> {marketSummaryText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLE VIEW */}
        {activeTab === 'table' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              marginBottom: '2rem'
            }}
          >
            <div
              style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#1B4D3E',
                    margin: 0
                  }}
                >
                  {selectedCommodity} — {granularity === 'day' ? 'Day-Wise' : 'Week-Wise'} Price Ledger
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748B' }}>
                  Audited historical records comparing FarmerBandh farm listings against APMC Mandi rates
                </p>
              </div>

              <button
                type="button"
                onClick={exportToCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(27, 77, 62, 0.25)'
                }}
              >
                <Download size={14} /> Download Ledger (CSV)
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAF7', borderBottom: '1.5px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Period / Date</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>FarmerBandh Price</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mandi Modal Rate</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mandi Trading Range</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price Spread</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Variance (%)</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {chartPoints.map((pt, idx) => {
                    const isPositive = pt.differenceAmount >= 0;
                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFA'
                        }}
                      >
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0F172A' }}>
                          {pt.periodLabel}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1B4D3E' }}>
                          ₹{formatNum(pt.appPrice)} {unitSymbol}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: '#B45309' }}>
                          ₹{formatNum(pt.mandiModalPrice)} {unitSymbol}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#64748B' }}>
                          ₹{formatNum(pt.mandiMinPrice)} — ₹{formatNum(pt.mandiMaxPrice)}
                        </td>
                        <td
                          style={{
                            padding: '14px 20px',
                            fontWeight: 700,
                            color: isPositive ? '#047857' : '#1E40AF'
                          }}
                        >
                          {isPositive ? '+' : ''}₹{formatNum(pt.differenceAmount)}
                        </td>
                        <td
                          style={{
                            padding: '14px 20px',
                            fontWeight: 700,
                            color: isPositive ? '#047857' : '#1E40AF'
                          }}
                        >
                          {isPositive ? `+${pt.differencePercentage}%` : `${pt.differencePercentage}%`}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              backgroundColor: isPositive ? '#ECFDF5' : '#EFF6FF',
                              color: isPositive ? '#065F46' : '#1E40AF',
                              border: `1px solid ${isPositive ? '#A7F3D0' : '#BFDBFE'}`
                            }}
                          >
                            {isPositive ? '🌾 Farmer Premium' : '🛒 Buyer Value'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE MANDIS FEED VIEW */}
        {activeTab === 'live' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              marginBottom: '2rem'
            }}
          >
            <div
              style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#1B4D3E',
                    margin: 0
                  }}
                >
                  Live APMC Mandi Auction Rates
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748B' }}>
                  Live spot arrivals and clearing auctions across Indian APMCs for {selectedCommodity}
                </p>
              </div>

              <div style={{ position: 'relative', width: '300px' }}>
                <Search
                  size={16}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search market, yard, or district..."
                  value={searchMandi}
                  onChange={(e) => setSearchMandi(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 38px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#1B4D3E')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAF7', borderBottom: '1.5px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>State & District</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>APMC Mandi Yard</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Commodity</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Variety</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Arrival Date</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Min Price</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Modal Price</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Max Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLiveRates.length > 0 ? (
                    filteredLiveRates.map((rec, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFA'
                        }}
                      >
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0F172A' }}>
                          <div>{rec.state}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>{rec.district}</div>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1B4D3E' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={14} color="#059669" />
                            {rec.market}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', color: '#0F172A', fontWeight: 600 }}>
                          {rec.commodity}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#64748B' }}>
                          {rec.variety}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '0.84rem' }}>
                          {rec.arrivalDate}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#64748B' }}>
                          ₹{formatNum(rec.minPrice)}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#B45309' }}>
                          ₹{formatNum(rec.modalPrice)}/Qtl
                        </td>
                        <td style={{ padding: '14px 20px', color: '#64748B' }}>
                          ₹{formatNum(rec.maxPrice)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                        No mandi records match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MandiPriceComparison;
