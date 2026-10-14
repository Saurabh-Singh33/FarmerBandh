import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { disputeApi } from '../../services/disputeApi';
import StatusPill from '../../components/StatusPill';

export default function BuyerDisputes() {
  const [allDisputes, setAllDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisputes(true);
    // Background polling every 5 seconds to keep dispute list fresh
    const interval = setInterval(() => {
      fetchDisputes(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDisputes = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await disputeApi.getBuyerDisputes();
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setAllDisputes(items);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch buyer disputes:', err);
      if (isInitial) setError('Could not load disputes.');
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  };

  // Client-side smart filtering for dispute tabs
  const filteredDisputes = allDisputes.filter((dsp) => {
    if (statusFilter === 'All') return true;
    const st = (dsp.status || '').toLowerCase();
    if (statusFilter === 'Open') {
      return ['open', 'awaitingbuyer', 'awaitingseller', 'escalated', 'underreview'].includes(st);
    }
    if (statusFilter === 'UnderReview') {
      return ['underreview', 'under review', 'escalated', 'awaitingbuyer', 'awaitingseller'].includes(st);
    }
    if (statusFilter === 'Resolved') {
      return st === 'resolved';
    }
    if (statusFilter === 'Closed') {
      return st === 'closed';
    }
    return true;
  });

  const getTabCount = (tab) => {
    if (tab === 'All') return allDisputes.length;
    return allDisputes.filter((dsp) => {
      const st = (dsp.status || '').toLowerCase();
      if (tab === 'Open') return ['open', 'awaitingbuyer', 'awaitingseller', 'escalated', 'underreview'].includes(st);
      if (tab === 'UnderReview') return ['underreview', 'under review', 'escalated', 'awaitingbuyer', 'awaitingseller'].includes(st);
      if (tab === 'Resolved') return st === 'resolved';
      if (tab === 'Closed') return st === 'closed';
      return false;
    }).length;
  };

  return (
    <div className="w-full px-6 py-6 font-sans space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </button>
          <h1 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-700" /> My Disputes & Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Communicate with sellers and support to resolve order issues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Sync
          </span>
          <button
            onClick={() => fetchDisputes(false)}
            disabled={refreshing}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-2">
        {['All', 'Open', 'UnderReview', 'Resolved', 'Closed'].map((tab) => {
          const count = getTabCount(tab);
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#1B4D3E] text-white shadow-sm shadow-[#1B4D3E]/20'
                  : 'bg-white text-slate-700 hover:bg-[#F0FDF4] hover:text-[#1B4D3E] border border-slate-200'
              }`}
            >
              <span>{tab === 'Open' ? 'Active / Open' : tab}</span>
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                  isActive
                    ? 'bg-[#143B2F] text-emerald-100'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1B4D3E]" />
          Loading your disputes...
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {statusFilter === 'All' ? 'No Disputes Found' : `No ${statusFilter} Disputes`}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {statusFilter === 'All'
              ? "You don't have any open disputes. If you experience an issue with an order, you can open a dispute from your order details page."
              : `There are currently no disputes in '${statusFilter}' status.`}
          </p>
          <Link
            to="/orders"
            className="mt-4 inline-block px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Go to My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredDisputes.map((dsp) => {
            const disputeNumber = dsp.disputeNumber || `DSP-${dsp.id?.slice(0, 8).toUpperCase()}`;
            const dateStr = dsp.openedAt || dsp.createdAt;
            const displayDate = dateStr ? new Date(dateStr).toLocaleString() : 'Recent';
            const sellerName = dsp.againstByName || dsp.sellerName || 'Farmer Seller';

            return (
              <div
                key={dsp.id}
                className="bg-white border border-[#E2EBE2] hover:border-[#1B4D3E]/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-900 text-sm tracking-tight">{disputeNumber}</span>
                    <StatusPill status={dsp.status} />
                  </div>
                  <div className="text-sm font-bold text-slate-800">{dsp.subject}</div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Order:</span> #{dsp.orderNumber} •{' '}
                    <span className="font-semibold text-slate-700">Seller:</span> {sellerName} •{' '}
                    <span className="font-semibold text-slate-700">Category:</span> {dsp.category}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Opened on {displayDate}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <Link
                    to={`/disputes/${dsp.id}`}
                    className="px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Join Discussion
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
