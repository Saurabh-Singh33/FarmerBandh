import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle, Search, RefreshCw, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { returnApi } from '../../services/returnApi';
import { notify } from '../../context/NotificationContext';

export const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [returnsMap, setReturnsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Reject Modal State
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadSellerOrders();
  }, [activeTab]);

  const loadSellerOrders = async (queryOverride) => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'All' ? null : activeTab;
      const searchToUse = queryOverride !== undefined ? queryOverride : searchTerm;
      const trimmedSearch = (searchToUse || '').trim();
      const [res, returnsRes] = await Promise.all([
        orderApi.getSellerOrders({
          status: statusParam,
          search: trimmedSearch || undefined,
          page: 1,
          pageSize: 50
        }),
        returnApi.getSellerReturns().catch(() => [])
      ]);
      setOrders(res.items || []);

      const rList = Array.isArray(returnsRes) ? returnsRes : (returnsRes?.items || []);
      const rMap = {};
      rList.forEach((r) => {
        if (r.orderId) rMap[r.orderId] = r;
      });
      setReturnsMap(rMap);
    } catch (err) {
      console.error('Failed to load seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    // When removing all text from search bar, immediately reset to default and show all orders
    if (!val.trim()) {
      loadSellerOrders('');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadSellerOrders('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSellerOrders(searchTerm);
  };

  const handleUpdateStatus = async (orderId, statusCode) => {
    setUpdatingId(orderId);
    try {
      await orderApi.updateOrderStatus(orderId, statusCode);
      notify.success('Order status updated successfully.', 'Order Updated');
      await loadSellerOrders();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectOrderSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalOrder) return;
    setRejecting(true);
    try {
      await orderApi.rejectOrder(rejectModalOrder.id, rejectReason || 'Stock unavailable / Rejected by seller');
      notify.info('Order has been rejected.', 'Order Rejected');
      setRejectModalOrder(null);
      setRejectReason('');
      await loadSellerOrders();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reject order.');
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-amber-200 shadow-sm"><Clock className="w-3.5 h-3.5 text-amber-600" /> New Order</span>;
      case 'Confirmed':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-blue-200 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Confirmed</span>;
      case 'Packed':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-purple-200 shadow-sm"><Package className="w-3.5 h-3.5 text-purple-600" /> Packed</span>;
      case 'InTransit':
        return <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-indigo-200 shadow-sm"><Truck className="w-3.5 h-3.5 text-indigo-600" /> Dispatched</span>;
      case 'Delivered':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-emerald-200 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered</span>;
      case 'Cancelled':
        return <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-rose-200 shadow-sm"><XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const inProgressCount = orders.filter(o => ['Confirmed', 'Packed', 'InTransit'].includes(o.status)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? (o.totalAmount || 0) : 0), 0);

  return (
    <div className="w-full px-6 py-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Farmer Orders Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Manage incoming buyer purchase orders, harvest & dispatch status</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/seller/returns"
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" /> Returns Queue {Object.keys(returnsMap).length > 0 && `(${Object.keys(returnsMap).length})`}
          </Link>
          <button
            onClick={loadSellerOrders}
            disabled={loading}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all hover:border-slate-400 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-800' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Queue'}
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Total Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</div>
        </div>
        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-semibold text-amber-800">New Pending</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-semibold text-indigo-800">Processing / Dispatch</div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-semibold text-emerald-800">Queue Revenue</div>
          <div className="text-2xl font-bold text-emerald-950 mt-1">₹{totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {['All', 'Pending', 'Confirmed', 'Packed', 'InTransit', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-[#1B4D3E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'InTransit' ? 'In Transit' : tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order or buyer..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear search"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Queue List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
          <span className="text-sm font-medium">Loading orders queue...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 font-serif mb-1">No Orders in Queue</h3>
          <p className="text-xs text-slate-500">No buyer orders match the current status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isUpdatingThis = updatingId === ord.id;
            return (
              <div key={ord.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 text-base">{ord.orderNumber}</span>
                      {getStatusBadge(ord.status)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
                      <span>Buyer: <strong className="text-slate-800">{ord.buyerName}</strong></span>
                      <span>•</span>
                      <span>Placed: {new Date(ord.placedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-semibold">Sub-Order Revenue</div>
                    <div className="text-2xl font-black text-emerald-900">₹{ord.totalAmount?.toLocaleString()}</div>
                  </div>
                </div>

                {/* Status Action Buttons Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="text-slate-600 font-medium flex items-center gap-2">
                    <span>Payment Method: <strong className="text-slate-800">{ord.paymentMethod}</strong></span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-semibold">{ord.paymentStatus}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {ord.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 2)}
                          disabled={isUpdatingThis}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {isUpdatingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Accept & Confirm Order
                        </button>
                        <button
                          onClick={() => setRejectModalOrder(ord)}
                          disabled={isUpdatingThis}
                          className="px-3 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                        >
                          Reject Order
                        </button>
                      </>
                    )}

                    {ord.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 3)}
                        disabled={isUpdatingThis}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {isUpdatingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                        Mark as Packed
                      </button>
                    )}

                    {ord.status === 'Packed' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 4)}
                        disabled={isUpdatingThis}
                        className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {isUpdatingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                        Dispatch / In Transit
                      </button>
                    )}

                    {ord.status === 'InTransit' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 6)}
                        disabled={isUpdatingThis}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {isUpdatingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Mark Delivered
                      </button>
                    )}

                    {ord.status === 'Delivered' && (
                      returnsMap[ord.id] ? (
                        <Link
                          to="/seller/returns"
                          className="text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" /> Buyer Requested Return ({returnsMap[ord.id].status})
                        </Link>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Order Fulfilled & Delivered
                        </span>
                      )
                    )}

                    {ord.status === 'Cancelled' && (
                      <span className="text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                        <XCircle className="w-4 h-4 text-rose-600" /> Order Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif">Reject Order ({rejectModalOrder.orderNumber})</h3>
            <p className="text-xs text-slate-600">
              Please specify a reason for rejecting this buyer's order. Stock quantity will be automatically restored.
            </p>
            <form onSubmit={handleRejectOrderSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="Reason for rejection (e.g. crop stock depleted, unseasonal rain delay)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-5 py-2 bg-rose-700 text-white text-xs font-bold rounded-lg hover:bg-rose-800 flex items-center gap-1.5"
                >
                  {rejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
