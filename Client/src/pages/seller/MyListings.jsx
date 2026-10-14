import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { sellerListingApi } from '../../services/sellerListingApi';
import { ListingCard } from '../../components/seller/ListingCard';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';

export const MyListings = () => {
  const { refreshDashboard } = useSeller();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState('All'); // All | Active | Draft | OutOfStock
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize,
        search: search.trim() || undefined,
        status: activeTab === 'All' ? undefined : activeTab,
        category: category || undefined
      };
      const res = await sellerListingApi.getListings(params);
      setListings(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching seller listings:', err);
      notify.error(err?.response?.data?.message || 'Could not load listings');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, search, category]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handlePublish = async (id) => {
    try {
      await sellerListingApi.publishListing(id);
      notify.success('Listing published successfully! It is now live on Marketplace.');
      fetchListings();
      refreshDashboard();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to publish listing');
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await sellerListingApi.unpublishListing(id);
      notify.info('Listing moved to Draft. It is hidden from buyers.');
      fetchListings();
      refreshDashboard();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to unpublish listing');
    }
  };

  const handleMarkOutOfStock = async (id) => {
    try {
      await sellerListingApi.markOutOfStock(id);
      notify.warning('Listing marked Out of Stock. Buyers cannot order it.');
      fetchListings();
      refreshDashboard();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to mark out of stock');
    }
  };

  const handleRestock = async (id) => {
    try {
      await sellerListingApi.restockListing(id);
      notify.success('Listing restocked and set to Active.');
      fetchListings();
      refreshDashboard();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to restock listing');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? It will be removed from your catalog.')) {
      return;
    }
    try {
      await sellerListingApi.deleteListing(id);
      notify.info('Listing deleted.');
      fetchListings();
      refreshDashboard();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to delete listing');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header Row */}
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
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: 0
            }}
          >
            My Produce Listings
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Manage pricing, stock, drafts, and catalog visibility for wholesale & retail produce.
          </p>
        </div>

        <Link
          to="/seller/listings/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#1B4D3E',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(27,77,62,0.2)',
            transition: 'background-color 0.15s ease'
          }}
        >
          <PlusCircle size={18} /> Add New Crop Produce
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
          {['All', 'Active', 'Draft', 'OutOfStock'].map((tab) => {
            const isActive = activeTab === tab;
            const tabLabels = {
              All: 'All Listings',
              Active: 'Active (Live)',
              Draft: 'Drafts',
              OutOfStock: 'Out of Stock'
            };
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#1B4D3E' : '#F3F4F6',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search
              size={16}
              color="#9CA3AF"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by crop name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '0.85rem',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">All Categories</option>
            <option value="Grains">Grains & Cereals</option>
            <option value="Pulses">Pulses & Legumes</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Spices">Spices & Condiments</option>
          </select>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>
          <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading listings...</div>
        </div>
      ) : listings.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px dashed #D1D5DB',
            borderRadius: '12px',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '2rem auto'
          }}
        >
          <AlertCircle size={40} color="#9CA3AF" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.2rem' }}>
            No listings found
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {search || activeTab !== 'All'
              ? 'Try clearing your filters or searching for another crop.'
              : 'You have not added any crop listings to your catalog yet.'}
          </p>
          <Link
            to="/seller/listings/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.25rem',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none'
            }}
          >
            <PlusCircle size={16} /> Create First Listing
          </Link>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onMarkOutOfStock={handleMarkOutOfStock}
                onRestock={handleRestock}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: page <= 1 ? '#F3F4F6' : '#FFFFFF',
                  color: page <= 1 ? '#9CA3AF' : '#374151',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', padding: '0 0.5rem' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: page >= totalPages ? '#F3F4F6' : '#FFFFFF',
                  color: page >= totalPages ? '#9CA3AF' : '#374151',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
