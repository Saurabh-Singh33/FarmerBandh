import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { returnApi } from '../../services/returnApi';
import StatusPill from '../../components/StatusPill';
import { notify } from '../../context/NotificationContext';

export default function SellerReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'All' ? { status: statusFilter } : {};
      const data = await returnApi.getSellerReturns(params);
      const list = Array.isArray(data) ? data : (data?.items || []);
      setReturns(list);
    } catch (err) {
      console.error('Failed to fetch seller returns:', err);
      setError('Could not load buyer return requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const sellerNote = prompt(
      status === 'Approved'
        ? 'Enter approval note or instructions for buyer (optional):'
        : 'Enter rejection reason for buyer:'
    );
    if (status === 'Rejected' && !sellerNote) return;

    setUpdatingId(id);
    try {
      const updated = await returnApi.updateReturnStatus(id, status, sellerNote || '');
      setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated, status } : r)));
      notify.success(`Return status updated to ${status}.`, 'Return Updated');
    } catch (err) {
      console.error('Failed to update return status:', err);
      notify.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full px-6 py-6 font-sans space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-emerald-700" /> Buyer Return Requests Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review buyer return requests, inspect claimed reasons, approve refunds, or reject requests
          </p>
        </div>
        <button
          onClick={fetchReturns}
          className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-2">
        {['All', 'Requested', 'Approved', 'Rejected', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === tab
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Loading return requests...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Return Requests</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            There are currently no return requests matching the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => {
            const isPending = ret.status === 'Requested';
            const isBusy = updatingId === ret.id;
            return (
              <div
                key={ret.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {ret.orderNumber ? `Return for #${ret.orderNumber}` : `#RET-${ret.id?.substring(0, 8)}`}
                    </span>
                    <StatusPill status={ret.status} />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Buyer:</span> {ret.buyerName || 'Buyer'} •{' '}
                    <span className="font-semibold">Order:</span> #{ret.orderNumber} •{' '}
                    <span className="font-semibold">Category:</span> {ret.reasonCategory || ret.category || 'Quality'}
                  </div>
                  {ret.reason && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                      "{ret.reason}"
                    </p>
                  )}
                  {ret.sellerResponse && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-100">
                      <strong>Your Response:</strong> {ret.sellerResponse}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Requested on {new Date(ret.requestedAt || ret.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Order Amount</div>
                    <div className="text-sm font-black text-emerald-900">
                      ₹{(ret.totalAmount || ret.refundAmount || 0)?.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/seller/returns/${ret.id}`}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-xs"
                    >
                      Inspect
                    </Link>

                    {isPending && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ret.id, 'Approved')}
                          disabled={isBusy}
                          className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ret.id, 'Rejected')}
                          disabled={isBusy}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
