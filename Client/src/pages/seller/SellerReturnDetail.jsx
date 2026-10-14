import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Package, 
  Truck, 
  Clock, 
  User, 
  MessageSquare, 
  ExternalLink,
  MapPin,
  Banknote,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import { returnApi } from '../../services/returnApi';
import StatusPill from '../../components/StatusPill';
import ReturnParcelChat from '../../components/ReturnParcelChat';
import { notify } from '../../context/NotificationContext';

export default function SellerReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTrigger, setChatTrigger] = useState(0);

  const handleOpenChat = () => {
    setChatOpen(true);
    setChatTrigger((prev) => prev + 1);
  };

  // Decision Modal/Prompt state
  const [actionModal, setActionModal] = useState({ open: false, type: null, note: '' });

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await returnApi.getReturnById(id);
      setReturnReq(data);
    } catch (err) {
      console.error('Failed to load return details:', err);
      setError('Return request not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAction = (type) => {
    setActionModal({
      open: true,
      type,
      note: type === 'Approved' ? 'Return request approved. We will arrange parcel collection shortly.' : ''
    });
  };

  const handleConfirmAction = async () => {
    const { type, note } = actionModal;
    if (type === 'Rejected' && !note.trim()) {
      notify.warning('Please provide a rejection reason for the buyer.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await returnApi.updateReturnStatus(id, type, note.trim());
      setReturnReq(updated);
      setActionModal({ open: false, type: null, note: '' });
      notify.success(`Return request ${type.toLowerCase()} successfully.`, 'Status Updated');
    } catch (err) {
      console.error('Failed to update status:', err);
      notify.error(err.response?.data?.message || 'Failed to update return status.');
    } finally {
      setUpdating(false);
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
      Damaged: 'Damaged Goods / Packaging',
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
        <p className="text-sm font-semibold text-slate-600">Loading return request...</p>
      </div>
    );
  }

  if (error || !returnReq) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 font-serif mb-2">Return Not Found</h2>
        <p className="text-slate-600 text-xs mb-6">{error || 'Could not retrieve return details.'}</p>
        <Link 
          to="/seller/returns" 
          className="px-6 py-2.5 bg-[#1B4D3E] text-white font-semibold text-xs rounded-full inline-flex items-center gap-2 hover:bg-[#143B2F] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Return Queue
        </Link>
      </div>
    );
  }

  // Fallback sum of items for refund calculation
  const calculatedItemsTotal = returnReq.items?.reduce(
    (sum, item) => sum + (Number(item.unitPricePerQuintal || 0) * Number(item.quantityQuintal || 0)),
    0
  ) || 0;
  const displayRefundAmount = Number(returnReq.refundAmount || calculatedItemsTotal);

  const status = (returnReq.status || 'Requested').toLowerCase();
  const isPending = status === 'requested';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isRefunded = status === 'refunded' || status === 'completed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-6">
      {/* Top Nav & Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/seller/returns')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4D3E] hover:text-[#143B2F] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Return Queue
        </button>

        <div className="flex items-center gap-2">
          {returnReq.orderId && (
            <Link
              to={`/seller/orders`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            >
              <Package className="w-3.5 h-3.5 text-slate-500" />
              Order #{returnReq.orderNumber}
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          )}
          <button
            onClick={handleOpenChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
            Return Parcel Chat
            {returnReq.messages?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-emerald-500/30 rounded-full border border-emerald-400/30 font-bold">
                {returnReq.messages.length}
              </span>
            )}
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
              Buyer Return Claim
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Buyer: <strong className="text-slate-800">{returnReq.buyerName || 'Verified Buyer'}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Requested: <strong className="text-slate-700">{formatDate(returnReq.requestedAt || returnReq.createdAt)}</strong>
              </span>
            </div>
          </div>

          {/* Refund Box */}
          <div className="bg-[#1B4D3E]/5 border border-[#1B4D3E]/15 rounded-2xl p-4 sm:p-5 text-right w-full md:w-auto min-w-[210px] shrink-0">
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-end gap-1 mb-1">
              <Banknote className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Total Refund Amount
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1B4D3E] font-sans">
              ₹{displayRefundAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Deducted from order payout upon resolution
            </div>
          </div>
        </div>
      </div>

      {/* Seller Decision Action Banner (If pending) */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-sm font-bold text-amber-950">Action Required: Farmer Review</h3>
            </div>
            <p className="text-xs text-amber-900/80 max-w-xl">
              Inspect the buyer's reason and requested quantities below. You can accept the return for pickup or provide a rejection reason.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => handleOpenAction('Approved')}
              disabled={updating}
              className="flex-1 md:flex-none px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Approve Return
            </button>
            <button
              onClick={() => handleOpenAction('Rejected')}
              disabled={updating}
              className="flex-1 md:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <XCircle className="w-4 h-4 text-rose-200" />
              Reject Return
            </button>
          </div>
        </div>
      )}

      {/* Action Dialog / Note Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                {actionModal.type === 'Approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                {actionModal.type === 'Approved' ? 'Confirm Return Approval' : 'Confirm Return Rejection'}
              </h3>
              <button
                onClick={() => setActionModal({ open: false, type: null, note: '' })}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {actionModal.type === 'Approved'
                ? 'Approving allows the buyer to coordinate parcel pickup. You can provide pickup or warehouse instructions below.'
                : 'Please state clearly why this return request is being rejected for the buyer.'}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {actionModal.type === 'Approved' ? 'Note / Pickup Instructions (Optional)' : 'Rejection Reason *'}
              </label>
              <textarea
                rows={3}
                value={actionModal.note}
                onChange={(e) => setActionModal((prev) => ({ ...prev, note: e.target.value }))}
                placeholder={
                  actionModal.type === 'Approved'
                    ? 'e.g. Approved. We will dispatch our pickup transporter tomorrow at 11:00 AM.'
                    : 'e.g. Products were inspected and verified within tolerance at delivery.'
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: null, note: '' })}
                disabled={updating}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={updating || (actionModal.type === 'Rejected' && !actionModal.note.trim())}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                  actionModal.type === 'Approved' ? 'bg-[#1B4D3E] hover:bg-[#143B2F]' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {updating ? 'Updating...' : `Confirm ${actionModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}

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

          {/* Step 2: Farmer Decision */}
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
                2. {isApproved ? 'You Approved' : isRejected ? 'You Rejected' : 'Awaiting Your Decision'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isApproved ? (returnReq.respondedAt ? formatDate(returnReq.respondedAt) : 'Approved') : isRejected ? 'Rejected' : 'Action pending'}
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
              <div className="text-xs font-bold text-slate-900">3. Parcel Collection</div>
              <div className="text-[11px] text-slate-500">
                {isApproved ? 'Coordinate via Live Chat' : 'Scheduled on approval'}
              </div>
            </div>
          </div>

          {/* Step 4: Refund Resolution */}
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
              <div className="text-xs font-bold text-slate-900">4. Resolution Completed</div>
              <div className="text-[11px] text-slate-500">
                {isRefunded ? (formatDate(returnReq.refundedAt) || 'Completed') : 'Post inspection'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Response Note if already added */}
      {(returnReq.sellerResponse || returnReq.sellerNote) && (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs text-slate-800 space-y-1">
          <span className="font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1B4D3E]" />
            Your Seller Note & Response:
          </span>
          <p className="mt-1 text-slate-700 leading-relaxed font-medium">
            {returnReq.sellerResponse || returnReq.sellerNote}
          </p>
        </div>
      )}

      {/* Grid: Reason & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Reason & Items (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Buyer Claimed Reason & Category
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Claim Category:</span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-white border border-slate-200 text-slate-800">
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
                Items Requested for Return
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
                        <span>Unit Price: <strong className="text-slate-700">₹{unitPrice.toLocaleString('en-IN')}/Qtl</strong></span>
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

        {/* Right: Real-time parcel actions & Coordination guidelines */}
        <div className="space-y-6">
          {/* Real-time Parcel Coordination Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">Parcel Pickup Coordination</h4>
                <p className="text-[11px] text-slate-500">Real-time sync with {returnReq.buyerName || 'Buyer'}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Coordinate pickup date and vehicle arrival time via <strong>Parcel Live Chat</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify produce condition and crate seals before signing collection receipt.</span>
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

          {/* Seller Guidelines */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#1B4D3E]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Seller Protection Guarantee
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              If the returned produce does not match the claimed defect or weight, you can dispute the return within 48 hours of parcel collection.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Return Parcel Chat Component */}
      <ReturnParcelChat
        returnId={id}
        returnReq={returnReq}
        onMessagesUpdated={(updated) => setReturnReq(updated)}
        isOpen={chatOpen}
        openTrigger={chatTrigger}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
