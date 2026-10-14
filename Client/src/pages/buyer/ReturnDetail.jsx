import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Package, 
  UserCheck, 
  Truck, 
  ShieldCheck, 
  ExternalLink, 
  MessageSquare, 
  MapPin, 
  Sprout,
  XCircle,
  HelpCircle,
  Banknote,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { returnApi } from '../../services/returnApi';
import { orderApi } from '../../services/orderApi';
import StatusPill from '../../components/StatusPill';
import ReturnParcelChat from '../../components/ReturnParcelChat';
import { notify } from '../../context/NotificationContext';

export default function ReturnDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const navigate = useNavigate();

  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTrigger, setChatTrigger] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEntireProduct, setDeleteEntireProduct] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChat = () => {
    setChatOpen(true);
    setChatTrigger((prev) => prev + 1);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await returnApi.deleteReturn(id, deleteEntireProduct);
      notify.success(
        deleteEntireProduct
          ? 'Order, return request, and all produce records deleted permanently.'
          : 'Return request deleted successfully.'
      );
      navigate(deleteEntireProduct ? '/orders' : '/returns');
    } catch (err) {
      console.error('Failed to delete return:', err);
      notify.error(err.response?.data?.message || 'Failed to delete return request.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // New return form state (fallback if accessed via /returns/new)
  const [isCreating] = useState(!!orderIdParam && id === 'new');
  const [order, setOrder] = useState(null);
  const [category, setCategory] = useState('QualityIssue');
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isCreating && orderIdParam) {
      fetchOrderToReturn(orderIdParam);
    } else if (id && id !== 'new') {
      fetchReturnDetails(id);
    }
  }, [id, orderIdParam]);

  const fetchOrderToReturn = async (oId) => {
    setLoading(true);
    try {
      const data = await orderApi.getBuyerOrderById(oId);
      setOrder(data);
      const initItems = {};
      data.items?.forEach((item) => {
        initItems[item.id] = { selected: true, qty: item.quantityQuintal, reason: '' };
      });
      setSelectedItems(initItems);
    } catch (err) {
      console.error('Failed to load order for return:', err);
      setError('Could not fetch order details for return.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnDetails = async (retId) => {
    setLoading(true);
    try {
      const data = await returnApi.getReturnById(retId);
      setReturnReq(data);
    } catch (err) {
      console.error('Failed to load return details:', err);
      setError('Return request not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      notify.warning('Please provide a detailed reason for return.');
      return;
    }

    const itemsPayload = Object.entries(selectedItems)
      .filter(([_, val]) => val.selected && val.qty > 0)
      .map(([orderItemId, val]) => ({
        orderItemId,
        quantityQuintal: parseFloat(val.qty),
        reason: val.reason || reason,
      }));

    if (itemsPayload.length === 0) {
      notify.warning('Please select at least one item to return.');
      return;
    }

    setSubmitting(true);
    try {
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

      const res = await returnApi.createReturnRequest({
        orderId: orderIdParam,
        reasonCategory: CATEGORY_MAP[category] || 1,
        category,
        reason: reason.trim(),
        items: itemsPayload,
      });
      notify.success('Return request submitted successfully.');
      navigate(`/returns/${res.id}`);
    } catch (err) {
      console.error('Failed to create return request:', err);
      notify.error(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getCategoryLabel = (cat) => {
    const map = {
      QualityIssue: 'Quality Issue / Spoilage',
      Damaged: 'Damaged Goods / In-Transit Spoilage',
      WrongItem: 'Wrong Produce Delivered',
      ExpiredProduct: 'Quality / Freshness Substandard',
      NotFresh: 'Not Fresh / Substandard',
      QuantityMismatch: 'Quantity / Weight Mismatch',
      PackagingDamaged: 'Packaging / Crates Damaged',
      Other: 'Other Discrepancy',
    };
    return map[cat] || cat || 'Return Request';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <div className="inline-block p-4 bg-emerald-50 rounded-2xl text-[#1B4D3E] mb-3 animate-pulse">
          <RotateCcw className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Loading return details...</p>
      </div>
    );
  }

  // Create Form Fallback
  if (isCreating) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 font-sans space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4D3E] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Back
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#1B4D3E]" /> Request Return for Order #{order?.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select items and specify the issue category and details.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Return Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#1B4D3E]"
              >
                <option value="QualityIssue">Quality Issue / Damaged Grain</option>
                <option value="WrongItem">Wrong Item Delivered</option>
                <option value="QuantityMismatch">Quantity / Weight Mismatch</option>
                <option value="PackagingDamaged">Packaging Damaged</option>
                <option value="ExpiredProduct">Quality / Spoilage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Detailed Reason for Return *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what was wrong with the product or shipment..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#1B4D3E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-3">
                Items to Return
              </label>
              <div className="space-y-3">
                {order?.items?.map((item) => {
                  const itemState = selectedItems[item.id] || { selected: false, qty: item.quantityQuintal, reason: '' };
                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                        itemState.selected ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={itemState.selected}
                          onChange={(e) =>
                            setSelectedItems((prev) => ({
                              ...prev,
                              [item.id]: { ...itemState, selected: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 text-[#1B4D3E] rounded focus:ring-[#1B4D3E]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[11px] text-slate-500">
                            Grade: {item.grade} • Price: ₹{item.unitPricePerQuintal}/Qtl
                          </div>
                        </div>
                      </div>

                      {itemState.selected && (
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Return Qty (Quintals)</span>
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
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#1B4D3E] text-white font-bold text-xs rounded-full shadow-sm hover:bg-[#143B2F] disabled:opacity-50"
              >
                {submitting ? 'Submitting Request...' : 'Submit Return Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (error || !returnReq) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 font-serif mb-2">Return Request Not Found</h2>
        <p className="text-slate-600 text-xs mb-6">{error || 'The requested return could not be retrieved.'}</p>
        <Link 
          to="/returns" 
          className="px-6 py-2.5 bg-[#1B4D3E] text-white font-semibold text-xs rounded-full inline-flex items-center gap-2 hover:bg-[#143B2F] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Returns
        </Link>
      </div>
    );
  }

  // Calculate items sum as robust fallback for total refund amount
  const calculatedItemsTotal = returnReq.items?.reduce(
    (sum, item) => sum + (Number(item.unitPricePerQuintal || 0) * Number(item.quantityQuintal || 0)),
    0
  ) || 0;
  const displayRefundAmount = Number(returnReq.refundAmount || calculatedItemsTotal);

  const status = (returnReq.status || 'Requested').toLowerCase();
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isRefunded = status === 'refunded' || status === 'completed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/returns')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4D3E] hover:text-[#143B2F] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to My Returns
        </button>

        <div className="flex items-center gap-2">
          {returnReq.orderId && (
            <Link
              to={`/orders/${returnReq.orderId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            >
              <Package className="w-3.5 h-3.5 text-slate-500" />
              View Order #{returnReq.orderNumber}
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          )}
          <button
            onClick={handleOpenChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
            Parcel Live Chat
            {returnReq.messages?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-emerald-500/30 rounded-full border border-emerald-400/30 font-bold">
                {returnReq.messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors shadow-xs"
            title="Permanently delete this return or all product purchase records"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-md border border-slate-200">
                RETURN #{returnReq.orderNumber || returnReq.id?.slice(0, 8).toUpperCase()}
              </span>
              <StatusPill status={returnReq.status} />
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-full border border-emerald-200/60">
                {getCategoryLabel(returnReq.reasonCategory || returnReq.category)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
              Return Parcel Request
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Requested on: <strong className="text-slate-700">{formatDate(returnReq.requestedAt || returnReq.createdAt)}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                Seller: <strong className="text-slate-700">{returnReq.sellerName || 'Verified Farmer'}</strong>
              </span>
            </div>
          </div>

          {/* Refund Box */}
          <div className="bg-[#1B4D3E]/5 border border-[#1B4D3E]/15 rounded-2xl p-4 sm:p-5 text-right w-full md:w-auto min-w-[210px] shrink-0">
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-end gap-1 mb-1">
              <Banknote className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Estimated Refund
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1B4D3E] font-sans">
              ₹{displayRefundAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isRefunded ? 'Paid to original payment method' : 'Credited upon parcel verification'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Return Progress Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#1B4D3E]" />
          Return & Parcel Handover Timeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {/* Step 1: Requested */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="w-8 h-8 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">1. Return Requested</div>
              <div className="text-[11px] text-slate-500">{formatDate(returnReq.requestedAt || returnReq.createdAt)}</div>
            </div>
          </div>

          {/* Step 2: Farmer Review */}
          <div className={`flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 rounded-xl border ${
            isApproved 
              ? 'bg-emerald-50/60 border-emerald-100' 
              : isRejected 
              ? 'bg-rose-50/60 border-rose-100' 
              : 'bg-amber-50/60 border-amber-200'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isApproved 
                ? 'bg-[#1B4D3E] text-white shadow-xs' 
                : isRejected 
                ? 'bg-rose-600 text-white' 
                : 'bg-amber-500 text-white animate-pulse'
            }`}>
              {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : isRejected ? <XCircle className="w-4 h-4" /> : '2'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                2. {isApproved ? 'Farmer Approved' : isRejected ? 'Return Rejected' : 'Farmer Review'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isApproved ? (returnReq.respondedAt ? formatDate(returnReq.respondedAt) : 'Approved') : isRejected ? 'Not accepted' : 'Awaiting review'}
              </div>
            </div>
          </div>

          {/* Step 3: Parcel Pickup */}
          <div className={`flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 rounded-xl border ${
            isApproved 
              ? 'bg-emerald-50/40 border-emerald-100' 
              : 'bg-slate-50 border-slate-200/80 opacity-70'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isApproved ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">3. Parcel Handover</div>
              <div className="text-[11px] text-slate-500">
                {isApproved ? 'Coordinate via Live Chat' : 'Scheduled upon approval'}
              </div>
            </div>
          </div>

          {/* Step 4: Refund Settlement */}
          <div className={`flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 rounded-xl border ${
            isRefunded 
              ? 'bg-emerald-50/60 border-emerald-100' 
              : 'bg-slate-50 border-slate-200/80 opacity-70'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isRefunded ? 'bg-[#1B4D3E] text-white shadow-xs' : 'bg-slate-300 text-slate-700'
            }`}>
              {isRefunded ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : '4'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">4. Refund Settled</div>
              <div className="text-[11px] text-slate-500">
                {isRefunded ? (formatDate(returnReq.refundedAt) || 'Processed') : 'Within 24-48 hrs of return'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Note / Response Banner if present */}
      {(returnReq.sellerResponse || returnReq.sellerNote) && (
        <div className="bg-blue-50/80 border border-blue-200/80 p-5 rounded-2xl text-xs text-blue-900 shadow-xs flex items-start gap-3.5">
          <div className="p-2 bg-blue-100 rounded-xl text-blue-800 shrink-0 mt-0.5">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="font-bold text-blue-950 text-xs block">
              Farmer Response / Instructions:
            </span>
            <p className="text-blue-900/90 leading-relaxed font-medium">
              {returnReq.sellerResponse || returnReq.sellerNote}
            </p>
          </div>
        </div>
      )}

      {/* Grid: Reason & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Reason & Parcel Instructions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Buyer Claimed Reason & Details
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category:</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-white border border-slate-200 text-slate-800">
                  {getCategoryLabel(returnReq.reasonCategory || returnReq.category)}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/60">
                "{returnReq.reason || 'No description provided.'}"
              </p>
            </div>
          </div>

          {/* Returned Items Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Returned Items Summary
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {returnReq.items?.length || 0} {returnReq.items?.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {returnReq.items?.map((item) => {
                const unitPrice = Number(item.unitPricePerQuintal || item.unitPrice || 0);
                const qty = Number(item.quantityQuintal || 0);
                const lineTotal = unitPrice * qty;

                return (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-serif">
                          {item.productName || 'Agricultural Produce'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                          {item.grade || 'Grade A'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Quantity: <strong className="text-slate-700">{qty} Quintals</strong></span>
                        <span>•</span>
                        <span>Unit Rate: <strong className="text-slate-700">₹{unitPrice.toLocaleString('en-IN')}/Qtl</strong></span>
                      </div>
                      {item.reason && item.reason !== returnReq.reason && (
                        <div className="text-[11px] text-slate-500 italic mt-1">
                          Item Note: "{item.reason}"
                        </div>
                      )}
                    </div>

                    <div className="text-right sm:self-center w-full sm:w-auto">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Refund Subtotal</span>
                      <span className="text-base font-black text-slate-900">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Total Return Refundable:</span>
              <span className="text-lg font-black text-[#1B4D3E]">
                ₹{displayRefundAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Parcel Coordination & Guidelines (1 col) */}
        <div className="space-y-6">
          {/* Quick Parcel Coordination Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">Return Parcel Pickup</h4>
                <p className="text-[11px] text-slate-500">Direct coordination with farmer</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Keep produce crates or bags neatly packed and ready at the gate.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Use the <strong>Live Parcel Chat</strong> below to share pickup timings with the farmer.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Confirm gross weight before handing parcel to the pickup transporter.</span>
              </div>
            </div>

            <button
              onClick={handleOpenChat}
              className="w-full py-2.5 px-4 bg-[#1B4D3E] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#143B2F] transition-all shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              Open Parcel Real-Time Chat
            </button>
          </div>

          {/* Refund Protection Card */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#1B4D3E]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              FarmerBandh Escrow Protection
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your refund amount is securely backed by the FarmerBandh transaction escrow. Once the return parcel is received and verified, the funds are instantly released to your account.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Parcel Chat Component */}
      <ReturnParcelChat
        returnId={id}
        returnReq={returnReq}
        onMessagesUpdated={(updated) => setReturnReq(updated)}
        isOpen={chatOpen}
        openTrigger={chatTrigger}
        onClose={() => setChatOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Return / Produce Records
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how much data you want to delete for this parcel:
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50/60 cursor-pointer hover:bg-rose-50 transition-colors">
                <input
                  type="radio"
                  name="deleteScope"
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
                  name="deleteScope"
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
                <strong>Warning:</strong> Deletion is irreversible and cannot be undone.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
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
