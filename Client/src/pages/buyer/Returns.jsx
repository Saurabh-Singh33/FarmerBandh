import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, ArrowLeft, PlusCircle, AlertCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { returnApi } from '../../services/returnApi';
import StatusPill from '../../components/StatusPill';
import { notify } from '../../context/NotificationContext';

export default function BuyerReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [deletingReturn, setDeletingReturn] = useState(null);
  const [deleteEntireProduct, setDeleteEntireProduct] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const handleConfirmDelete = async () => {
    if (!deletingReturn) return;
    try {
      setIsDeleting(true);
      await returnApi.deleteReturn(deletingReturn.id, deleteEntireProduct);
      notify.success(
        deleteEntireProduct
          ? 'Order, return request, and all produce records deleted permanently.'
          : 'Return request deleted successfully.'
      );
      setReturns((prev) => prev.filter((r) => r.id !== deletingReturn.id));
      setDeletingReturn(null);
    } catch (err) {
      console.error('Failed to delete return:', err);
      notify.error(err.response?.data?.message || 'Failed to delete return request.');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'All' ? { status: statusFilter } : {};
      const data = await returnApi.getBuyerReturns(params);
      const list = Array.isArray(data) ? data : (data?.items || []);
      setReturns(list);
    } catch (err) {
      console.error('Failed to fetch returns:', err);
      setError('Could not load return requests.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 py-6 font-sans space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </button>
          <h1 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-emerald-700" /> My Return Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track return statuses, seller approvals, and refund progress
          </p>
        </div>
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
        <div className="py-16 text-center text-slate-500 text-sm">Loading returns...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Return Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You have not requested any returns yet. You can request a return from your delivered orders page.
          </p>
          <Link
            to="/orders"
            className="mt-4 inline-block px-5 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-full shadow-sm hover:bg-emerald-900"
          >
            View Delivered Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
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
                  <span className="font-semibold">Order:</span> #{ret.orderNumber} •{' '}
                  <span className="font-semibold">Seller:</span> {ret.sellerName || 'Farmer'} •{' '}
                  <span className="font-semibold">Category:</span> {ret.reasonCategory || ret.category || 'Quality'}
                </div>
                {ret.reason && (
                  <p className="text-xs text-slate-600 line-clamp-1 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{ret.reason}"
                  </p>
                )}
                {ret.sellerResponse && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-100">
                    <strong>Seller Response:</strong> {ret.sellerResponse}
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  Requested on {new Date(ret.requestedAt || ret.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Est. Refund</div>
                  <div className="text-sm font-black text-emerald-900">
                    ₹{(ret.totalAmount || ret.refundAmount || 0)?.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/returns/${ret.id}`}
                    className="px-3.5 py-2 border border-emerald-800 text-emerald-800 hover:bg-emerald-50 rounded-lg font-bold text-xs transition-colors"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeletingReturn(ret)}
                    className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                    title="Delete return / produce records"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Return Confirmation Modal */}
      {deletingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Return #{deletingReturn.orderNumber || deletingReturn.id?.slice(0, 8)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how much data you want to delete for this produce:
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50/60 cursor-pointer hover:bg-rose-50 transition-colors">
                <input
                  type="radio"
                  name="retDeleteScope"
                  checked={deleteEntireProduct}
                  onChange={() => setDeleteEntireProduct(true)}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-rose-900">
                    Delete everything about this product & order (Recommended)
                  </div>
                  <p className="text-[11px] text-rose-700/90 mt-0.5">
                    Completely deletes the purchase order, product item records, return request, parcel chat history, disputes, and reviews.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="radio"
                  name="retDeleteScope"
                  checked={!deleteEntireProduct}
                  onChange={() => setDeleteEntireProduct(false)}
                  className="mt-0.5 text-slate-700 focus:ring-slate-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">
                    Delete return request only
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Deletes this return request and its parcel chat messages, but preserves the original delivered order.
                  </p>
                </div>
              </label>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <strong>Warning:</strong> Deletion is permanent and cannot be undone.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingReturn(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {isDeleting ? 'Deleting...' : deleteEntireProduct ? 'Delete Everything' : 'Delete Return Only'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
