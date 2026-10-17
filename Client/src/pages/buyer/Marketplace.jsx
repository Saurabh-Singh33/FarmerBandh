import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productApi } from '../../services/productApi';
import { getProductImageUrl } from '../../services/productImages';
import { notify } from '../../context/NotificationContext';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  UserCheck,
  BadgeCheck,
  Star,
  Sprout,
  RotateCcw,
  PackageSearch,
  XCircle,
  Sparkles
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry'
];

export const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [allIndia, setAllIndia] = useState(false);
  const [appliedScope, setAppliedScope] = useState('country');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Debounce search input (~300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productApi.listCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        sort: sort || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        verifiedOnly: verifiedOnly ? true : undefined,
        state: stateFilter || undefined,
        district: districtFilter || undefined,
        allIndia: allIndia ? true : undefined,
        page: 1,
        pageSize: 12
      };

      const res = await productApi.list(params);
      setProducts(res.items || []);
      setTotal(res.total || 0);
      setAppliedScope(res.appliedScope || 'country');
      setFallbackMessage(res.fallbackMessage || '');
    } catch (err) {
      console.error('Failed to fetch products', err);
      setProducts([]);
      setTotal(0);
      setAppliedScope('country');
      setFallbackMessage('');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sort, minPrice, maxPrice, minRating, verifiedOnly, stateFilter, districtFilter, allIndia]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setVerifiedOnly(false);
    setStateFilter('');
    setDistrictFilter('');
    setAllIndia(true);
    notify.info('All filters reset to All India.');
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '1.25rem 0.85rem', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Welcome Banner */}
      <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', padding: '1.25rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1B4D3E', margin: 0, fontSize: '1.8rem' }}>
              Welcome to Buyer Marketplace, {user?.fullName || 'Valued Buyer'}!
            </h1>
            <p style={{ color: '#2E7D32', marginTop: '0.4rem', marginBottom: 0, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <MapPin size={16} color="#2E7D32" />
              <span>Delivery Location: <strong>{user?.district && user?.state ? `${user.district}, ${user.state}` : user?.state || 'India'}</strong></span>
              <span style={{ color: '#81C784' }}>&bull;</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: appliedScope === 'district' ? '#C8E6C9' : appliedScope === 'state' ? '#FEF3C7' : '#DCFCE7',
                color: appliedScope === 'district' ? '#1B4D3E' : appliedScope === 'state' ? '#92400E' : '#166534',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
                {appliedScope === 'district'
                  ? `📍 Near You (${districtFilter || user?.district})`
                  : appliedScope === 'state'
                  ? `📍 Statewide (${stateFilter || user?.state || 'State'})`
                  : '🇮🇳 Nationwide (All India)'}
              </span>
            </p>
          </div>

          {/* Location Quick Switcher Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {user?.district && (
              <button
                type="button"
                onClick={() => {
                  if (districtFilter === user.district) {
                    setDistrictFilter('');
                    setStateFilter('');
                    setAllIndia(true);
                  } else {
                    setAllIndia(false);
                    setDistrictFilter(user.district);
                    setStateFilter(user.state || '');
                  }
                }}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '20px',
                  border: '1px solid #2E7D32',
                  backgroundColor: districtFilter === user.district ? '#1B4D3E' : '#FFFFFF',
                  color: districtFilter === user.district ? '#FFFFFF' : '#1B4D3E',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <MapPin size={13} />
                Near Me ({user.district})
              </button>
            )}

            {user?.state && (
              <button
                type="button"
                onClick={() => {
                  if (stateFilter === user.state && !districtFilter) {
                    setStateFilter('');
                    setDistrictFilter('');
                    setAllIndia(true);
                  } else {
                    setAllIndia(false);
                    setDistrictFilter('');
                    setStateFilter(user.state);
                  }
                }}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '20px',
                  border: '1px solid #2E7D32',
                  backgroundColor: (stateFilter === user.state && !districtFilter) ? '#1B4D3E' : '#FFFFFF',
                  color: (stateFilter === user.state && !districtFilter) ? '#FFFFFF' : '#1B4D3E',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <MapPin size={13} />
                My State ({user.state})
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setDistrictFilter('');
                setStateFilter('');
                setAllIndia(true);
              }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid #2E7D32',
                backgroundColor: allIndia || (!stateFilter && !districtFilter) ? '#1B4D3E' : '#FFFFFF',
                color: allIndia || (!stateFilter && !districtFilter) ? '#FFFFFF' : '#1B4D3E',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              All India
            </button>
          </div>
        </div>
      </div>

      {/* Search & Main Controls Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', width: '100%' }}>
        
        {/* Search input with Lucide Search Icon */}
        <div style={{ flex: '1 1 280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search crops, products, or farm names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 2.4rem 0.75rem 2.75rem',
              borderRadius: '24px',
              border: '1px solid #E5E7EB',
              fontSize: '0.95rem',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title="Clear search"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* State Selector Dropdown (Allows user to select a state to show products from) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#FFFFFF',
          border: stateFilter ? '1.5px solid #2E7D32' : '1px solid #E5E7EB',
          borderRadius: '24px',
          padding: '0.45rem 0.85rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <MapPin size={16} color={stateFilter ? '#2E7D32' : '#6B7280'} />
          <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>State:</span>
          <select
            id="market-state-select"
            value={stateFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStateFilter(val);
              setDistrictFilter(''); // selecting a state scopes to that entire state
              if (val) {
                setAllIndia(false);
              } else {
                setAllIndia(true);
              }
            }}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.9rem',
              color: stateFilter ? '#1B4D3E' : '#374151',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="">All States (All India)</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {stateFilter && (
            <button
              type="button"
              onClick={() => {
                setStateFilter('');
                setDistrictFilter('');
                setAllIndia(true);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0 2px', display: 'flex' }}
              title="Reset to All States"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>

        {/* Sort dropdown & Filter toggle button */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '24px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              fontSize: '0.9rem',
              color: '#1B4D3E',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '24px',
              border: '1px solid #2E7D32',
              backgroundColor: showMobileFilter ? '#2E7D32' : '#FFFFFF',
              color: showMobileFilter ? '#FFFFFF' : '#2E7D32',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            backgroundColor: selectedCategory === '' ? '#1B4D3E' : '#FFFFFF',
            color: selectedCategory === '' ? '#FFFFFF' : '#374151',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              backgroundColor: selectedCategory === cat.slug ? '#1B4D3E' : '#FFFFFF',
              color: selectedCategory === cat.slug ? '#FFFFFF' : '#374151',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Layout Grid (Filter Sidebar + Products Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: showMobileFilter ? '260px 1fr' : '1fr', gap: '2rem' }}>
        
        {/* Sidebar Filters */}
        {showMobileFilter && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem', height: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, color: '#1B4D3E', fontSize: '1.1rem' }}>Filter Products</h3>
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E65100',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={13} /> Reset All
              </button>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Price per Quintal (₹)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Min Rating */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5 & above</option>
                <option value="4.0">4.0 & above</option>
                <option value="3.5">3.5 & above</option>
              </select>
            </div>

            {/* Verified Only */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              <label htmlFor="verifiedOnly" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                Verified Farmers Only
              </label>
            </div>

            {/* State Selection in Sidebar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Select State
              </label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setStateFilter(val);
                  setDistrictFilter('');
                  if (val) setAllIndia(false);
                  else setAllIndia(true);
                }}
                style={{ width: '100%', padding: '0.5rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
              >
                <option value="">All States (All India)</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                District Filter (Optional)
              </label>
              <input
                type="text"
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  if (e.target.value) setAllIndia(false);
                }}
                placeholder="District (e.g. Ahmedabad)"
                style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        )}

        {/* Product Cards Container */}
        <div>
          {/* Fallback Notification Banner */}
          {fallbackMessage && (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxShadow: '0 2px 5px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#D97706" />
                <div>
                  <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>
                    {appliedScope === 'state' ? `Showing produce from ${stateFilter || user?.state || 'your state'}` : 'Showing produce across All India'}
                  </div>
                  <div style={{ margin: '2px 0 0 0', color: '#B45309', fontSize: '0.84rem' }}>
                    {fallbackMessage}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStateFilter('');
                    setDistrictFilter('');
                    setAllIndia(true);
                  }}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '16px',
                    border: '1px solid #D97706',
                    backgroundColor: '#FFFFFF',
                    color: '#92400E',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Browse All India
                </button>
              </div>
            </div>
          )}

          {/* Total Count & Current Location Scope Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 500 }}>
              {loading ? 'Searching catalog...' : `${total} listings found`}
            </div>
            {!loading && (
              <span style={{
                fontSize: '0.8rem',
                color: '#1B4D3E',
                backgroundColor: '#E8F5E9',
                border: '1px solid #C8E6C9',
                padding: '0.2rem 0.65rem',
                borderRadius: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <MapPin size={12} />
                {appliedScope === 'district' ? `District: ${districtFilter || user?.district}` : appliedScope === 'state' ? `State: ${stateFilter || user?.state}` : 'Region: All India'}
              </span>
            )}
          </div>

          {/* Skeleton Loader */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem', height: '220px', animate: 'pulse' }}>
                  <div style={{ height: '24px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '70%', marginBottom: '1rem' }} />
                  <div style={{ height: '16px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '40%', marginBottom: '1rem' }} />
                  <div style={{ height: '20px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '30%', marginTop: '2rem' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <PackageSearch size={54} color="#1B4D3E" />
              </div>
              <h3 style={{ color: '#1B4D3E', marginTop: 0 }}>No products match your filters</h3>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                {districtFilter
                  ? `There are no active produce listings in "${districtFilter}" yet. Clear your location filter or browse statewide produce from verified farmers.`
                  : stateFilter
                  ? `There are no active produce listings in "${stateFilter}" matching your criteria yet. You can browse produce across all India or pick another state.`
                  : 'Try clearing your search criteria or resetting filters to browse all fresh produce.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {(districtFilter || stateFilter) && (
                  <button
                    onClick={() => {
                      setDistrictFilter('');
                      setStateFilter('');
                      setAllIndia(true);
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '24px',
                      backgroundColor: '#1B4D3E',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <RotateCcw size={16} /> Show All Regions (Browse All India)
                  </button>
                )}
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '24px',
                    backgroundColor: (districtFilter || stateFilter) ? '#F3F4F6' : '#1B4D3E',
                    color: (districtFilter || stateFilter) ? '#374151' : '#FFFFFF',
                    fontWeight: 600,
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RotateCcw size={16} /> Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {!loading && products.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/products/${prod.slug || prod.id}`)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: prod.isFeatured ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: prod.isFeatured ? '0 4px 12px rgba(245, 158, 11, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                    const img = e.currentTarget.querySelector('.prod-card-img');
                    if (img) img.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                    const img = e.currentTarget.querySelector('.prod-card-img');
                    if (img) img.style.transform = 'scale(1)';
                  }}
                >
                  {/* Product Image Showcase Container */}
                  <div style={{ position: 'relative', width: '100%', height: '175px', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                    <img
                      className="prod-card-img"
                      src={getProductImageUrl(prod)}
                      alt={prod.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/products/tomato-fresh.jpg';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)',
                      pointerEvents: 'none'
                    }} />

                    {/* Bulk Discount Badge */}
                    {prod.bulkDiscountPercent > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#FFF3E0',
                        color: '#E65100',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: '1px solid #FFE0B2',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        zIndex: 2
                      }}>
                        {prod.bulkDiscountPercent}% BULK OFF
                      </div>
                    )}

                    {/* Featured Badge */}
                    {prod.isFeatured && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        letterSpacing: '0.04em',
                        zIndex: 2
                      }}>
                        <Sparkles size={12} fill="#FFFFFF" /> FEATURED
                      </div>
                    )}

                    {/* Category Overlay Tag */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      backgroundColor: 'rgba(27, 77, 62, 0.88)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Sprout size={13} /> {prod.category}
                    </div>
                  </div>

                  {/* Product Details Section */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {/* Title */}
                      <h3 style={{ color: '#1B4D3E', margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontFamily: 'Playfair Display, serif', lineHeight: 1.3 }}>
                        {prod.name}
                      </h3>

                      {/* Seller & Verification */}
                      <div style={{ color: '#4B5563', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (prod.farmerId) navigate(`/farmers/${prod.farmerId}`);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                          title="View Farmer Profile & Store"
                        >
                          <UserCheck size={14} color="#1B4D3E" /> {prod.farmerName}
                        </span>
                        {prod.verified === 'Verified' && (
                          <span
                            title="Verified Farmer"
                            style={{
                              color: '#2E7D32',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              backgroundColor: '#E8F5E9',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <BadgeCheck size={13} color="#2E7D32" /> Verified
                          </span>
                        )}
                      </div>

                      {/* Location & Rating */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6B7280', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="#6B7280" /> {prod.farmerLocation}
                        </span>
                        {prod.rating > 0 && (
                          <span style={{ color: '#E65100', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Star size={13} fill="#E65100" color="#E65100" /> {prod.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Quantity Footer */}
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#E65100' }}>
                          ₹{prod.pricePerQuintal.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#6B7280' }}> / quintal</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 600, backgroundColor: '#F3F4F6', padding: '3px 8px', borderRadius: '6px' }}>
                        Avail: {prod.availableQuantityQuintal} Qtl
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
