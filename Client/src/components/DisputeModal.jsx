import React, { useState, useEffect } from 'react';
import { X, MessageSquareWarning, ShieldAlert, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { disputeApi } from '../services/disputeApi';
import { notify } from '../context/NotificationContext';

export default function DisputeModal({ isOpen, onClose, order, onSuccess }) {
  const [category, setCategory] = useState('DamagedInTransit');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form state when opened
      setCategory('DamagedInTransit');
      setSubject('');
      setDescription('');
      setErrorMessage('');
      setSubmitting(false);

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!subject.trim()) {
      setErrorMessage('Please enter a dispute subject.');
      notify.warning('Please enter a dispute subject.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please provide a detailed explanation of the issue.');
      notify.warning('Please provide a detailed explanation of the issue.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await disputeApi.createDispute({
        orderId: order.id,
        category,
        subject: subject.trim(),
        description: description.trim(),
      });

      notify.success(`Dispute registered successfully for Order #${order.orderNumber || ''}`);
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit dispute:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit dispute.';
      setErrorMessage(msg);
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const orderNum = order.orderNumber || order.id || '';
  const firstItem = order.items?.[0];
  const totalAmount = Number(order.totalAmount || 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[86vh] my-auto animate-scaleUp">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 to-emerald-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 leading-tight">
                Raise Order Dispute
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Order #{orderNum}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-3.5 overflow-y-auto space-y-3">
          {/* Order Summary Snapshot */}
          <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-xs flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="font-semibold text-slate-800 truncate block">
                {firstItem?.productNameSnapshot || firstItem?.product?.name || 'Order Produce'}
                {order.items?.length > 1 && (
                  <span className="text-slate-500 font-normal ml-1">+{order.items.length - 1} more items</span>
                )}
              </span>
              {order.seller?.farmName && (
                <div className="text-slate-500 text-[10px] mt-0.5 truncate">
                  Farmer: <span className="font-medium text-slate-700">{order.seller.farmName}</span>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-slate-900 text-xs">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="inline-block px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded text-[9px]">
                {order.status || 'Active'}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to submit dispute</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <form id="dispute-form" onSubmit={handleSubmit} className="space-y-3">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dispute Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
              >
                <option value="DamagedInTransit">Damaged in Transit / Crushed produce</option>
                <option value="QualityIssue">Grain Quality / Moisture Discrepancy</option>
                <option value="QuantityMismatch">Quantity or Weight Mismatch</option>
                <option value="DelayedDelivery">Delayed Shipment / Delivery</option>
                <option value="NonDelivery">Non-Delivery of Order</option>
                <option value="PaymentDispute">Payment / Billing Discrepancy</option>
                <option value="Other">Other Concern</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dispute Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={submitting}
                placeholder="e.g. Products received are damaged or not matching photos"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Explanation & Request *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                placeholder="Explain the issue clearly and state your desired resolution (e.g. replacement or refund)..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
              />
            </div>

            {/* Buyer Protection Note */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5 flex items-start gap-2 text-xs text-emerald-900">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-[10.5px] leading-relaxed text-emerald-800">
                <strong>FarmerBandh Trust Guarantee:</strong> Resolution discussions can be tracked in your Disputes dashboard.
              </p>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="dispute-form"
            disabled={submitting}
            className="px-4 py-1.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Dispute'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
