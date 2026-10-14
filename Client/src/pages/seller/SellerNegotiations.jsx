import React, { useState, useEffect, useMemo } from 'react';
import { negotiationApi } from '../../services/negotiationApi';
import { useNegotiation } from '../../context/NegotiationContext';
import NegotiationCard from '../../components/NegotiationCard';
import { notify } from '../../context/NotificationContext';

export default function SellerNegotiations() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, NEEDS_RESPONSE, ACCEPTED, CLOSED
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUnreadCount } = useNegotiation();

  const fetchNegotiations = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const data = await negotiationApi.getSellerNegotiations();
      setNegotiations(Array.isArray(data) ? data : []);
      refreshUnreadCount();
    } catch (err) {
      console.error('Failed to load seller negotiations', err);
      notify.error('Could not load negotiation queue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const filtered = useMemo(() => {
    return negotiations.filter((item) => {
      let matchesStatus = true;
      if (filter === 'NEEDS_RESPONSE') {
        matchesStatus =
          (item.currentOfferByRole === 'Buyer' || item.currentOfferBy === 'Buyer') &&
          (item.status === 'Open' || item.status === 'Countered');
      } else if (filter === 'ACCEPTED') {
        matchesStatus = item.status === 'Accepted';
      } else if (filter === 'CLOSED') {
        matchesStatus = ['Rejected', 'Expired', 'Withdrawn'].includes(item.status);
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const pName = (item.productName || item.product?.name || '').toLowerCase();
        const bName = (item.buyerName || item.buyer?.fullName || '').toLowerCase();
        matchesSearch = pName.includes(q) || bName.includes(q);
      }

      return matchesStatus && matchesSearch;
    });
  }, [negotiations, filter, searchQuery]);

  // Aggregate stats
  const actionRequiredCount = negotiations.filter(
    (n) => (n.currentOfferByRole === 'Buyer' || n.currentOfferBy === 'Buyer') && (n.status === 'Open' || n.status === 'Countered')
  ).length;
  const acceptedCount = negotiations.filter((n) => n.status === 'Accepted').length;

  const totalAcceptedRevenue = negotiations
    .filter((n) => n.status === 'Accepted')
    .reduce((acc, curr) => {
      const p = Number(curr.agreedPricePerQuintal || curr.currentOfferPrice || 0);
      const q = Number(curr.quantityQuintal || 1);
      return acc + p * q;
    }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
              Farmer Deal Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Buyer Price Inquiries & Negotiations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review wholesale volume inquiries from buyers, counter with your target margin, and close farm deals.
          </p>
        </div>

        <button
          onClick={fetchNegotiations}
          disabled={refreshing}
          className="self-start sm:self-auto text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className={refreshing ? 'animate-spin' : ''}>↻</span> Refresh
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">All Inquiries</div>
          <div className="text-2xl font-black text-gray-900 mt-0.5">{negotiations.length}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Wholesale inquiries</div>
        </div>

        <div className={`p-3.5 rounded-2xl border shadow-2xs ${actionRequiredCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <span>⚡</span> Action Required
          </div>
          <div className="text-2xl font-black text-amber-900 mt-0.5">{actionRequiredCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Awaiting counter/approval</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <span>🎉</span> Accepted Deals
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-0.5">{acceptedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Successfully agreed</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Locked Revenue</div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5 truncate">
            ₹{totalAcceptedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">From accepted deals</div>
        </div>
      </div>

      {/* Controls Strip */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'All Inquiries', count: negotiations.length },
            { key: 'NEEDS_RESPONSE', label: 'Action Required', count: actionRequiredCount },
            { key: 'ACCEPTED', label: 'Accepted Deals', count: acceptedCount },
            {
              key: 'CLOSED',
              label: 'Closed',
              count: negotiations.filter((n) => ['Rejected', 'Expired', 'Withdrawn'].includes(n.status)).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filter === tab.key
                  ? 'bg-[#15803D] text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filter === tab.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Controls: Search + View Switcher */}
        <div className="flex items-center gap-2 self-stretch lg:self-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop or buyer..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200/80 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              title="2-Column Horizontal Cards"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>⊞</span>
              <span className="hidden sm:inline">2-Col</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Full-Width Horizontal Row Strips"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>☰</span>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 text-2xl flex items-center justify-center mx-auto mb-4 font-bold">
            🤝
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {searchQuery ? 'No matching inquiries' : 'No negotiations in this filter'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? `No inquiries match "${searchQuery}". Clear your search to view all.`
              : 'When buyers submit bulk price inquiries for your farm listings, they will appear here for your review and counter-proposals.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
          {filtered.map((item) => (
            <NegotiationCard
              key={item.id}
              negotiation={item}
              isSeller={true}
              viewMode={viewMode}
              onUpdated={fetchNegotiations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
