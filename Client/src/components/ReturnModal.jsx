import React, { useState, useEffect } from 'react';
import { RotateCcw, X, AlertCircle, Loader2 } from 'lucide-react';
import { returnApi } from '../services/returnApi';
import { orderApi } from '../services/orderApi';
import { notify } from '../context/NotificationContext';

const CATEGORY_MAP = {
  QualityIssue: 1,
  Damaged: 1,
  WrongItem: 2,
  ExpiredProduct: 3,
  NotFresh: 3,
  QuantityMismatch: 4,
  PackagingDamaged: 1,
  Other: 5,
};

export default function ReturnModal({ isOpen, onClose, order, onSuccess }) {
  const [orderData, setOrderData] = useState(order);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [category, setCategory] = useState('QualityIssue');
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize and load order details when modal opens
  useEffect(() => {
    if (!isOpen || !order) return;

    setCategory('QualityIssue');
    setReason('');
    setErrorMessage('');
    setSubmitting(false);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // If order already has items array, use it
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      setOrderData(order);
      initItemsSelection(order.items);
    } else {
      // Fetch full order to obtain items
      setLoadingOrder(true);
      orderApi.getBuyerOrderById(order.id)
        .then((fullOrder) => {
          setOrderData(fullOrder);
          initItemsSelection(fullOrder.items || []);
        })
        .catch((err) => {
          console.error('Failed to load order items for return modal:', err);
          setErrorMessage('Could not load order details. Please try again.');
        })
        .finally(() => {
          setLoadingOrder(false);
        });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, order]);

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

  const initItemsSelection = (items) => {
    const initItems = {};
    items.forEach((item) => {
      initItems[item.id] = {
        selected: true,
        qty: item.quantityQuintal,
        reason: '',
      };
    });
    setSelectedItems(initItems);
  };

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reason.trim()) {
      setErrorMessage('Please provide a detailed reason for return.');
      notify.warning('Please provide a detailed reason for return.');
      return;
    }

    const itemsPayload = Object.entries(selectedItems)
      .filter(([_, val]) => val.selected && parseFloat(val.qty) > 0)
      .map(([orderItemId, val]) => ({
        orderItemId,
        quantityQuintal: parseFloat(val.qty),
        reason: val.reason || reason.trim(),
      }));

    if (itemsPayload.length === 0) {
      setErrorMessage('Please select at least one item to return.');
      notify.warning('Please select at least one item to return.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await returnApi.createReturnRequest({
        orderId: order.id,
        reasonCategory: CATEGORY_MAP[category] || 1,
        category,
        reason: reason.trim(),
        items: itemsPayload,
      });

      notify.success('Return request submitted successfully.');
      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit return request:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit return request.';
      setErrorMessage(msg);
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const orderNum = orderData?.orderNumber || order.orderNumber || order.id || '';
  const items = orderData?.items || [];

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
      <div
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif leading-tight">
                Request Return for Order #{orderNum}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select items and specify the issue category and details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Return Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Return Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
            >
              <option value="QualityIssue">Quality Issue / Damaged Grain</option>
              <option value="WrongItem">Wrong Item Delivered</option>
              <option value="QuantityMismatch">Quantity / Weight Mismatch</option>
              <option value="PackagingDamaged">Packaging Damaged</option>
              <option value="ExpiredProduct">Quality / Spoilage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Detailed Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Reason for Return *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              placeholder="Explain what was wrong with the product or shipment..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 resize-y"
            />
          </div>

          {/* Items to Return */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Items to Return
            </label>

            {loadingOrder ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Loader2 className="w-5 h-5 text-emerald-700 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Loading order items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                No items found for this order.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const itemState = selectedItems[item.id] || {
                    selected: false,
                    qty: item.quantityQuintal,
                    reason: '',
                  };
                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                        itemState.selected
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={itemState.selected}
                          onChange={(e) =>
                            setSelectedItems((prev) => ({
                              ...prev,
                              [item.id]: { ...itemState, selected: e.target.checked },
                            }))
                          }
                          disabled={submitting}
                          className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Grade: {item.grade || 'Standard'} • Price: ₹{item.unitPricePerQuintal}/Qtl
                          </div>
                        </div>
                      </label>

                      {itemState.selected && (
                        <div className="flex items-center gap-3 w-full sm:w-auto pl-7 sm:pl-0">
                          <div>
                            <span className="text-[10px] text-slate-500 block font-medium mb-1">
                              Return Qty (Quintals)
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              max={item.quantityQuintal}
                              min="0.1"
                              value={itemState.qty}
                              onChange={(e) =>
                                setSelectedItems((prev) => ({
                                  ...prev,
                                  [item.id]: { ...itemState, qty: e.target.value },
                                }))
                              }
                              disabled={submitting}
                              className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingOrder}
              className="px-6 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-full shadow-sm hover:bg-emerald-900 transition-all active:scale-98 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: '#1B4D3E' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <span>Submit Return Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
