import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  ArrowLeft,
  RotateCcw,
  MessageSquare,
  Star,
  Check,
  UserCheck,
  ShoppingBag,
  CreditCard,
  Calendar,
  Copy,
  Printer,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

import { orderApi } from '../../services/orderApi';
import { returnApi } from '../../services/returnApi';
import { reviewApi } from '../../services/reviewApi';
import { notify } from '../../context/NotificationContext';
import TimelineItem from '../../components/TimelineItem';
import { generateOrderReceiptPdf } from '../../utils/receiptPdfGenerator';
import DisputeModal from '../../components/DisputeModal';
import ReturnModal from '../../components/ReturnModal';
import ReviewModal from '../../components/ReviewModal';


/**
 * Universal UTC-safe Date & Time parser and formatter
 */
const parseSafeDate = (dateStr) => {
  if (!dateStr) return null;
  let s = String(dateStr).trim();
  if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s += 'Z';
  }
  const date = new Date(s);
  return isNaN(date.getTime()) ? null : date;
};

const formatFullDateTime = (dateStr) => {
  const d = parseSafeDate(dateStr);
  if (!d) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatStepTime = (dateStr) => {
  const d = parseSafeDate(dateStr);
  if (!d) return null;
  return {
    date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
  };
};

export const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [existingReturn, setExistingReturn] = useState(null);

  // Review Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [selectedExistingReview, setSelectedExistingReview] = useState(null);
  const [orderReviews, setOrderReviews] = useState([]);

  // Delete Order states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const handleConfirmDeleteOrder = async () => {
    if (!order?.id) return;
    setIsDeletingOrder(true);
    try {
      await orderApi.deleteOrder(order.id);
      notify.success(
        `Order #${order.orderNumber} and all associated produce records deleted successfully.`,
        'Order Deleted'
      );
      navigate('/orders');
    } catch (err) {
      console.error('Failed to delete order:', err);
      notify.error(err.response?.data?.message || 'Failed to delete order. Please try again.');
      setIsDeletingOrder(false);
    }
  };


  const loadReviews = async () => {
    try {
      const revs = await reviewApi.getOrderReviews(id);
      setOrderReviews(Array.isArray(revs) ? revs : []);
    } catch (err) {
      console.warn('Could not load reviews for order:', err);
    }
  };

  useEffect(() => {
    const fetchOrderAndTimeline = async () => {
      setLoading(true);
      try {
        const [data, tmData, returnsRes, revsRes] = await Promise.all([
          orderApi.getBuyerOrderById(id),
          orderApi.getTimeline(id).catch(() => []),
          returnApi.getBuyerReturns().catch(() => []),
          reviewApi.getOrderReviews(id).catch(() => [])
        ]);
        setOrder(data);
        setTimeline(Array.isArray(tmData) ? tmData : []);
        setOrderReviews(Array.isArray(revsRes) ? revsRes : []);

        const rList = Array.isArray(returnsRes) ? returnsRes : (returnsRes?.items || []);
        const match = rList.find((r) => r.orderId === id);
        if (match) setExistingReturn(match);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Order not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderAndTimeline();
  }, [id]);

  const handleOpenReview = (item, existing = null) => {
    setSelectedReviewItem(item);
    if (existing) {
      setSelectedExistingReview(existing);
    } else {
      const match = orderReviews.find(
        (r) => r.productId === item.productId || r.productId === item.id
      );
      setSelectedExistingReview(match || null);
    }
    setIsReviewModalOpen(true);
  };


  const handleCopyOrderNumber = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    notify.info(`Order #${order.orderNumber} copied to clipboard!`, 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = async () => {
    if (!order) return;
    setGeneratingPdf(true);
    try {
      const fileName = generateOrderReceiptPdf(order);
      notify.success(`Receipt downloaded: ${fileName}`, 'Receipt PDF Generated');
    } catch (err) {
      console.error('Failed to generate receipt PDF:', err);
      notify.error('Could not generate PDF receipt, opening browser print view.');
      window.print();
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-800 border-t-transparent mb-4"></div>
        <h3 className="text-base font-bold text-slate-800 font-serif">Retrieving Live Order Tracking...</h3>
        <p className="text-xs text-slate-500 mt-1">Synchronizing farm dispatch and logistics log</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 font-serif mb-2">Order Not Found</h2>
        <p className="text-slate-600 text-xs mb-6 leading-relaxed">{error || 'Could not locate purchase order details.'}</p>
        <Link
          to="/orders"
          className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'Cancelled' || order.status === 'Rejected';
  const isDelivered = order.status === 'Delivered';

  // 5 Step Fulfillment Journey
  const stepDefinitions = [
    {
      key: 'Placed',
      label: 'Order Placed',
      timestamp: order.placedAt || order.createdAt,
      desc: 'Buyer completed checkout & payment',
      icon: ShoppingBag,
      isDone: !!order.placedAt || order.status !== 'Pending'
    },
    {
      key: 'Confirmed',
      label: 'Order Confirmed',
      timestamp: order.confirmedAt,
      desc: 'Farmer accepted produce order',
      icon: CheckCircle2,
      isDone: ['Confirmed', 'Packed', 'InTransit', 'Delivered'].includes(order.status)
    },
    {
      key: 'Packed',
      label: 'Produce Packed',
      timestamp: order.packedAt,
      desc: 'Harvest bagged and inspected',
      icon: Package,
      isDone: ['Packed', 'InTransit', 'Delivered'].includes(order.status)
    },
    {
      key: 'InTransit',
      label: 'Dispatched / In Transit',
      timestamp: order.shippedAt,
      desc: 'Dispatched via local farm transport',
      icon: Truck,
      isDone: ['InTransit', 'Delivered'].includes(order.status)
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      timestamp: order.deliveredAt,
      desc: 'Arrived at destination address',
      icon: Check,
      isDone: order.status === 'Delivered'
    }
  ];

  // Determine active step index (0 to 4)
  let currentStepIdx = 0;
  if (order.status === 'Confirmed') currentStepIdx = 1;
  else if (order.status === 'Packed') currentStepIdx = 2;
  else if (order.status === 'InTransit') currentStepIdx = 3;
  else if (order.status === 'Delivered') currentStepIdx = 4;

  const formattedPlacedDate = formatFullDateTime(order.placedAt || order.createdAt);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50/80 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintReceipt}
            disabled={generatingPdf}
            className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-60"
            title="Download official PDF Tax Invoice"
          >
            <Printer className={`w-3.5 h-3.5 ${generatingPdf ? 'animate-bounce text-emerald-700' : 'text-slate-600'}`} />
            <span>{generatingPdf ? 'Generating PDF...' : 'Print Receipt (PDF)'}</span>
          </button>

          {isDelivered && (
            existingReturn ? (
              <Link
                to={`/returns/${existingReturn.id}`}
                className="px-3.5 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-700" /> Return: {existingReturn.status}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(true)}
                className="px-3.5 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" /> Request Return
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setIsDisputeModalOpen(true)}
            className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Raise Dispute
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Permanently delete this order and all produce records"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete Order
          </button>
        </div>
      </div>


      {/* Hero Order Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-2">
          {/* Order # Badge & Copy Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="font-mono font-bold text-slate-900 text-xl tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-800" />
              <span>{order.orderNumber}</span>
              <button
                onClick={handleCopyOrderNumber}
                className="text-slate-400 hover:text-emerald-800 p-1 rounded-md transition-colors"
                title="Copy order number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm border ${
                isCancelled
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : isDelivered
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : order.status === 'InTransit'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : order.status === 'Packed'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : order.status === 'Confirmed'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isDelivered ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : order.status === 'InTransit' ? (
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              )}
              {order.status === 'Delivered' ? 'Delivered' : order.status === 'InTransit' ? 'In Transit' : order.status}
            </span>
          </div>

          {/* Formatted Date & Payment Status */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Ordered on <strong className="text-slate-800">{formattedPlacedDate}</strong> (IST)
              </span>
            </span>

            <span className="text-slate-300">•</span>

            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Payment: <strong className="text-slate-800">{order.paymentMethod}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  order.paymentStatus?.toLowerCase() === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus}
              </span>
            </span>
          </div>
        </div>

        {/* Right: Total Order Value */}
        <div className="text-left md:text-right bg-slate-50/80 md:bg-transparent p-4 md:p-0 rounded-xl w-full md:w-auto border md:border-0 border-slate-100">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Order Value</div>
          <div className="text-3xl font-black text-emerald-950 mt-0.5">
            ₹
            {Number(order.totalAmount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">All taxes & platform fees included</div>
        </div>
      </div>

      {/* Cancellation Banner if Cancelled */}
      {isCancelled && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900">
            <strong className="font-bold block text-sm mb-0.5">Order Cancelled</strong>
            {order.cancellationReason || 'This order was cancelled by seller or buyer.'}
          </div>
        </div>
      )}

      {/* Shipment Progress Visual Stepper */}
      {!isCancelled && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">Shipment Progress</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time fulfillment stages from harvesting to buyer delivery</p>
            </div>
            {isDelivered && (
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fulfillment Complete
              </span>
            )}
          </div>

          {/* Stepper Track */}
          <div className="relative pt-2 pb-4">
            {/* Background Connector Bar */}
            <div className="absolute top-7 left-6 right-6 h-1 bg-slate-100 -z-0 rounded-full" />
            {/* Active Colored Progress Bar */}
            <div
              className="absolute top-7 left-6 h-1 bg-emerald-600 -z-0 rounded-full transition-all duration-500"
              style={{
                width: `${(currentStepIdx / (stepDefinitions.length - 1)) * 95}%`
              }}
            />

            {/* Stepper Nodes */}
            <div className="relative z-10 flex items-start justify-between">
              {stepDefinitions.map((step, idx) => {
                const isCurrent = idx === currentStepIdx;
                const timeParsed = formatStepTime(step.timestamp);
                const IconComponent = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center flex-1 px-1">
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        step.isDone
                          ? 'bg-emerald-800 text-white shadow-emerald-200'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-emerald-100 scale-105' : ''}`}
                    >
                      {step.isDone ? <Check size={18} strokeWidth={2.8} /> : <IconComponent size={16} />}
                    </div>

                    {/* Step Title */}
                    <span
                      className={`text-xs font-bold mt-2.5 transition-colors ${
                        step.isDone ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>

                    {/* Accurate Formatted Local Time Tag */}
                    {timeParsed ? (
                      <div className="mt-1 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] text-slate-700 shadow-2xs font-semibold">
                        <div>{timeParsed.time}</div>
                        <div className="text-[9px] text-slate-400 font-normal">{timeParsed.date}</div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 mt-1 font-medium italic">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Seller Origin & Delivery Destination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Farmer Seller Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-800" /> Farmer Seller Details
              </h3>
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Verified
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-base font-serif flex-shrink-0 shadow-inner">
                {order.sellerName ? order.sellerName.charAt(0) : 'F'}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {order.sellerName || 'Verified Farmer'}
                </h4>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {order.sellerLocation || 'Gujarat, India'}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.8 Rating
                  </span>
                  <span>•</span>
                  <span>Direct Farm Dispatch</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Guaranteed fresh farm origin</span>
            <Link to="/marketplace" className="text-emerald-800 font-bold hover:underline">
              Browse More Crops →
            </Link>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-800" /> Delivery Address & Slot
              </h3>
              {order.deliverySlotWindow && (
                <span className="bg-blue-50 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  {order.deliverySlotWindow}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 text-sm">
                {order.deliveryAddress?.label || order.recipientName || 'Buyer Recipient'}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {order.deliveryAddressLine || order.deliveryAddress?.line1}
                {order.deliveryAddress?.line2 ? `, ${order.deliveryAddress.line2}` : ''}
              </p>
              <p className="text-slate-600">
                {order.deliveryCity || order.deliveryAddress?.city},{' '}
                {order.deliveryState || order.deliveryAddress?.state} -{' '}
                <strong className="text-slate-800">{order.deliveryPincode || order.deliveryAddress?.pincode}</strong>
              </p>
              <p className="text-slate-600 pt-1">
                Contact Phone: <strong className="text-slate-800">{order.recipientPhone || order.deliveryAddress?.phone || '+91 9876543210'}</strong>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Contactless Safe Delivery
            </span>
            <span className="text-slate-400">PIN: {order.deliveryPincode || '380001'}</span>
          </div>
        </div>
      </div>

      {/* Detailed Tracking Log (Audit History) */}
      {timeline.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Detailed Tracking Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological status updates and timestamped handover events</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">{timeline.length} updates recorded</span>
          </div>

          <div className="pt-2">
            {timeline.map((item, index) => (
              <TimelineItem key={item.id || index} item={item} isLast={index === timeline.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* Ordered Items Table & Financial Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 font-serif mb-4 pb-2 border-b border-slate-100">
          Items in Shipment ({order.items?.length || 0})
        </h3>

        {/* Table of items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5">Produce Item</th>
                <th className="py-2.5">Grade</th>
                <th className="py-2.5">Price / Quintal</th>
                <th className="py-2.5">Quantity Ordered</th>
                <th className="py-2.5 text-right">Subtotal</th>
                <th className="py-2.5 text-right">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {order.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        🌾
                      </div>
                      <div>
                        <div>{item.productName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">Farm Origin: {order.sellerName || 'Verified Farm'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                      Grade {item.grade || 'A'}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800">
                    ₹{(item.unitPricePerQuintal || item.unitPrice)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 font-bold text-slate-900">
                    {item.quantityQuintal} Quintal{item.quantityQuintal > 1 ? 's' : ''} ({(item.quantityQuintal * 100).toFixed(0)} kg)
                  </td>
                  <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                    ₹{(item.lineTotal || item.totalPrice)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right">
                    {isDelivered && (() => {
                      const existing = orderReviews.find(
                        (r) => r.productId === item.productId || r.productId === item.id
                      );
                      return existing ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(item, existing)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          title="Click to edit your review"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Edit Review ({existing.rating}★)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(item, null)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[11px] rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Rate & Review</span>
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown Receipt */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-xs text-slate-500 max-w-sm space-y-1">
            <p className="font-semibold text-slate-800">Official FarmerBandh Fulfillment</p>
            <p>Direct farm-to-consumer marketplace with standard quality inspection and dispute resolution protection.</p>
          </div>

          <div className="w-full md:w-80 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{order.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Promo Discount ({order.couponCode || 'Coupon'}):</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-900">₹{Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span className="font-semibold text-slate-900">₹{Number(order.platformFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Agriculture Cess:</span>
              <span className="font-semibold text-slate-900">₹{Number(order.taxAmount).toFixed(2)}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex justify-between font-black text-base text-slate-900">
              <span>Total Paid:</span>
              <span className="text-emerald-950">₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Same-Window Dispute Modal Popup */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        order={order}
        onClose={() => setIsDisputeModalOpen(false)}
        onSuccess={(result) => {
          if (result?.id) {
            navigate(`/disputes/${result.id}`);
          } else {
            navigate('/disputes');
          }
        }}
      />

      {/* Same-Window Return Modal Popup */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        order={order}
        onClose={() => setIsReturnModalOpen(false)}
        onSuccess={(result) => {
          if (result?.id) {
            navigate(`/returns/${result.id}`);
          }
        }}
      />

      {/* Same-Window Review & Edit Modal Popup */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        order={order}
        item={selectedReviewItem}
        existingReview={selectedExistingReview}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedReviewItem(null);
          setSelectedExistingReview(null);
        }}
        onSuccess={() => {
          loadReviews();
        }}
      />

      {/* Delete Order Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingOrder) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Delete Order & Product Records?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete order{' '}
                  <strong className="text-slate-900 font-mono">#{order.orderNumber}</strong>?
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1.5 mt-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Everything removed for this produce:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-0.5">
                    <li>This order and tracking log</li>
                    <li>All item records for this produce</li>
                    <li>Any associated returns, refunds & return chats</li>
                    <li>Any disputes & reviews</li>
                  </ul>
                </div>
                <p className="text-[11px] text-rose-600 font-semibold pt-1">
                  This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeletingOrder}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteOrder}
                  disabled={isDeletingOrder}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isDeletingOrder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {isDeletingOrder ? 'Deleting Everything...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default OrderTracking;
