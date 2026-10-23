import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { negotiationApi } from '../../services/negotiationApi';
import { useAuth } from '../../context/AuthContext';
import { useNegotiation } from '../../context/NegotiationContext';
import StatusPill from '../../components/StatusPill';
import NegotiationBubble from '../../components/NegotiationBubble';
import { notify } from '../../context/NotificationContext';

export default function SellerNegotiationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshUnreadCount } = useNegotiation();

  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Counter offer state
  const [showCounterBox, setShowCounterBox] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // General text message state
  const [generalMessage, setGeneralMessage] = useState('');

  const chatBottomRef = useRef(null);

  const handleQuickPrompt = (text) => {
    setGeneralMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  const fetchDetail = async () => {
    try {
      const data = await negotiationApi.getSellerNegotiationById(id);
      setNegotiation(data);
      refreshUnreadCount();
    } catch (err) {
      console.error('Failed to load negotiation', err);
      notify.error('Could not load negotiation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [negotiation?.messages]);

  const handleAccept = async () => {
    const offerPrice = negotiation?.negotiation?.currentOfferPrice ?? negotiation?.currentOfferPrice;
    if (!window.confirm(`Accept buyer's offer at ₹${offerPrice}/Quintal?`)) return;
    setSubmitting(true);
    try {
      const updated = await negotiationApi.acceptSellerOffer(id);
      setNegotiation(updated);
      notify.success(`Offer of ₹${updated.agreedPricePerQuintal}/q accepted!`);
      refreshUnreadCount();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to accept offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await negotiationApi.rejectSellerOffer(id, rejectReason.trim());
      setNegotiation(updated);
      setShowRejectModal(false);
      notify.info('Offer rejected.');
      refreshUnreadCount();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reject offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCounter = async (e) => {
    e.preventDefault();
    const priceNum = Number(counterPrice);
    if (!priceNum || priceNum <= 0) {
      notify.error('Please enter a valid price per quintal');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await negotiationApi.postSellerMessage(id, {
        messageType: 'CounterOffer',
        type: 'CounterOffer',
        proposedPrice: priceNum,
        offerPrice: priceNum,
        text: counterNote.trim(),
        body: counterNote.trim(),
      });
      setNegotiation(updated);
      setCounterPrice('');
      setCounterNote('');
      setShowCounterBox(false);
      notify.success('Counter offer sent to buyer!');
      refreshUnreadCount();
    } catch (err) {
      notify.error(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to send counter offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendGeneralMessage = async (e) => {
    e.preventDefault();
    if (!generalMessage.trim()) return;
    setSubmitting(true);
    try {
      const updated = await negotiationApi.postSellerMessage(id, {
        messageType: 'Text',
        type: 'Text',
        text: generalMessage.trim(),
        body: generalMessage.trim(),
      });
      setNegotiation(updated);
      setGeneralMessage('');
      refreshUnreadCount();
    } catch (err) {
      notify.error(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded-lg" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!negotiation) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h2 className="text-xl font-bold text-gray-800">Negotiation Not Found</h2>
        <Link to="/seller/negotiations" className="text-emerald-700 text-sm font-semibold underline mt-2 inline-block">
          Return to Seller Negotiations
        </Link>
      </div>
    );
  }

  const neg = negotiation.negotiation || negotiation;
  const prod = negotiation.product || {};
  const farm = negotiation.farmer || {};
  const buy = negotiation.buyer || {};

  const negId = neg.id || negotiation.id;
  const productId = neg.productId || prod.id || negotiation.productId;
  const productName = prod.name || negotiation.productName || 'Crop Listing';
  const productImageUrl = prod.imageUrl || negotiation.productImageUrl;
  const buyerName = buy.fullName || negotiation.buyerName || 'Buyer';
  const currentOfferPrice = neg.currentOfferPrice ?? negotiation.currentOfferPrice ?? 0;
  const initialPricePerQuintal = neg.initialPricePerQuintal ?? negotiation.initialPricePerQuintal ?? prod.currentPricePerQuintal ?? 0;
  const agreedPricePerQuintal = neg.agreedPricePerQuintal ?? negotiation.agreedPricePerQuintal;
  const quantityQuintal = neg.quantityQuintal || negotiation.quantityQuintal || 1;
  const status = neg.status || negotiation.status || 'Open';
  const openedAt = neg.openedAt || negotiation.openedAt;
  const canAccept = negotiation.canAccept;
  const canCounter = negotiation.canCounter;
  const rejectionReason = neg.rejectionReason || negotiation.rejectionReason;
  const messages = negotiation.messages || [];

  const isAccepted = status === 'Accepted';
  const isClosed = ['Rejected', 'Expired', 'Withdrawn'].includes(status);
  const isActionable = !isClosed && !isAccepted;

  const activePrice = Number(agreedPricePerQuintal || currentOfferPrice || 0);
  const listPrice = Number(initialPricePerQuintal || 0);
  const qty = Number(quantityQuintal || 1);
  const totalDealValue = activePrice * qty;
  const originalTotalValue = listPrice * qty;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/seller/negotiations"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 font-bold text-xs transition-colors"
          >
            ← Back to Inquiries Queue
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-xs font-semibold text-gray-500">
            Deal Reference: <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">#{negId.slice(0, 8)}</code>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={status} />
          {negotiation.isBundle && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 flex items-center gap-1">
              <span>📦</span> Multi-Product Bundle ({negotiation.items?.length || 0})
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Dedicated Offer & Product Overview (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto no-scrollbar">
          
          {/* Main Offer Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-5 space-y-4">
            {/* Header: Thumbnail, Name, Buyer */}
            <div className="flex items-start gap-3.5 pb-3.5 border-b border-gray-100">
              <img
                src={productImageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200'}
                alt={productName}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-2xs shrink-0"
                style={{ width: '64px', height: '64px', minWidth: '64px', maxWidth: '64px', objectFit: 'cover' }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    🌾 Your Crop Listing
                  </span>
                  <span className="text-xs text-gray-400">
                    {openedAt ? `Received ${new Date(openedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : ''}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {productName}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-gray-400">Buyer:</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    👤 {buyerName}
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-md font-semibold">
                      Registered Buyer
                    </span>
                  </span>
                </p>
              </div>
            </div>

            {/* Price & Offer Matrix */}
            <div className="bg-gradient-to-br from-[#F7FAF5] to-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100/80 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {isAccepted ? 'Agreed Rate' : "Buyer's Offer Rate"}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-800">
                    ₹{activePrice.toLocaleString('en-IN')}
                    <span className="text-xs font-semibold text-gray-500"> / Quintal</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Your Listed Rate
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-500 line-through">
                    ₹{listPrice.toLocaleString('en-IN')}/q
                  </span>
                </div>
              </div>

              {/* Volume & Earnings */}
              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">
                  Order Volume: <strong className="text-gray-900 font-bold">{qty} Quintals</strong>
                </span>
                <span className="text-gray-500 text-[11px]">
                  Listed Value: ₹{originalTotalValue.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600">Total Escrow Earnings:</span>
                <span className="text-sm font-black text-emerald-900">
                  ₹{totalDealValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Multi-Item Bundle Items Breakdown if Bundle */}
            {negotiation.isBundle && negotiation.items && negotiation.items.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📦</span> Bundle Items ({negotiation.items.length})
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar pr-1">
                  {negotiation.items.map((it) => (
                    <div
                      key={it.productId}
                      className="p-2 rounded-xl bg-gray-50/90 border border-gray-200/80 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={it.imageUrl || '/images/products/tomato-fresh.jpg'}
                          alt={it.productName}
                          className="w-7 h-7 rounded-lg object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/products/tomato-fresh.jpg';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">{it.productName}</div>
                          <div className="text-[10px] text-gray-500">{it.quantityQuintal} Quintals</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-emerald-800">
                          ₹{Number(it.agreedPricePerQuintal || it.offeredPricePerQuintal).toLocaleString('en-IN')}/q
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offer Action Banner for Farmer */}
            {isAccepted && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white shadow-md space-y-2">
                <div className="flex items-center gap-1.5 text-white font-black text-xs sm:text-sm">
                  <span>🎉</span> Deal Finalized at Agreed Rate!
                </div>
                <p className="text-[11px] text-emerald-100 leading-relaxed">
                  Price is locked at <strong>₹{activePrice.toLocaleString('en-IN')}/Quintal</strong>. The buyer can now checkout and fund the escrow.
                </p>
              </div>
            )}

            {canAccept && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                <div className="text-xs font-bold text-amber-900">
                  Buyer Proposed: ₹{Number(currentOfferPrice).toLocaleString('en-IN')}/Quintal
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Accept this rate, counter with your target rate, or reject this offer.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Accept ₹{currentOfferPrice}/q
                  </button>
                  <button
                    onClick={() => setShowCounterBox(!showCounterBox)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    {showCounterBox ? 'Close Counter' : 'Counter Offer'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {!canAccept && !canCounter && !isAccepted && !isClosed && (
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <span>⏳</span> Waiting for Buyer's Response
                </div>
                <p className="text-amber-700 text-[11px]">
                  You proposed ₹{Number(currentOfferPrice).toLocaleString('en-IN')}/q. {buyerName} has been notified.
                </p>
              </div>
            )}

            {isClosed && (
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                <div className="font-bold">Inquiry Closed ({status})</div>
                <p className="text-[11px] text-gray-500">{rejectionReason || 'This negotiation thread is closed.'}</p>
              </div>
            )}

            {/* Farmer Payout Protection Guarantee */}
            <div className="pt-2.5 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span>🛡️</span>
                <span><strong>Guaranteed Escrow Payout:</strong> Funds secured upfront and wired directly to your bank account upon delivery confirmation.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🚜</span>
                <span><strong>Direct Wholesale:</strong> Full transparency with no commission deductions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Spacious Chat & Negotiation Messenger (7 cols on lg, viewport-fitted) */}
        <div className="lg:col-span-7 flex flex-col h-[520px] lg:h-[calc(100vh-140px)] lg:min-h-[480px] lg:max-h-[660px] bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden">
          
          {/* Messenger Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                {negotiation?.buyer?.avatarUrl ? (
                  <img
                    src={negotiation.buyer.avatarUrl}
                    alt={buyerName}
                    className="w-9 h-9 rounded-full object-cover shadow-2xs ring-2 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                    {buyerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  {buyerName}
                  <span className="text-[10px] font-semibold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
                    Buyer
                  </span>
                </div>
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Direct Deal Messenger
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                🔒 Escrow Secured
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                {messages.length} messages
              </span>
            </div>
          </div>

          {/* Chat Message Scrollable Viewport (Smooth, isolated, no flex overflow) */}
          <div
            className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto overscroll-contain chat-scroll space-y-3 bg-[#F8FAF6]/70"
          >
            {/* Timeline Introduction Pill */}
            <div className="text-center my-1">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 border border-gray-200 text-gray-500 shadow-2xs">
                Negotiation Thread Started · {productName}
              </span>
            </div>

            {messages && messages.length > 0 ? (
              messages.map((msg) => {
                const currentUserId = user?.userId || user?.id;
                const senderId = msg.senderUserId || msg.authorUserId;
                const isMe = currentUserId && senderId
                  ? String(senderId).toLowerCase() === String(currentUserId).toLowerCase()
                  : String(msg.senderRole || '').toLowerCase() === 'farmer';

                return (
                  <NegotiationBubble
                    key={msg.id}
                    msg={msg}
                    isMe={Boolean(isMe)}
                  />
                );
              })
            ) : (
              <div className="text-center py-16 text-xs text-gray-400">
                💬 No messages yet in this discussion. Send dispatch details or answer questions below.
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Action & Input Area (Pinned to bottom of chat card, always in view) */}
          {!isClosed && (
            <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-white space-y-2.5 shrink-0">
              {/* Counter offer expandable form */}
              {(showCounterBox || (!canAccept && canCounter)) && !isAccepted && (
                <form onSubmit={handleSendCounter} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5 shadow-2xs">
                  <div className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                    <span>⚡ Propose Counter Rate to Buyer</span>
                    <button
                      type="button"
                      onClick={() => setShowCounterBox(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Your Proposed Rate (₹ / Quintal) *
                      </label>
                      <input
                        type="number"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(e.target.value)}
                        placeholder={`e.g. ${Math.round((listPrice + currentOfferPrice) / 2)}`}
                        className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold"
                        required
                      />
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-400 self-center">Presets:</span>
                        {[
                          { label: 'Midpoint', val: Math.round((listPrice + currentOfferPrice) / 2) },
                          { label: '-5% Listed', val: Math.round(listPrice * 0.95) },
                          { label: '+5% Buyer', val: Math.round(currentOfferPrice * 1.05) },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setCounterPrice(preset.val.toString())}
                            className="px-2 py-0.5 rounded-lg bg-gray-200 hover:bg-emerald-100 hover:text-emerald-900 text-gray-700 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            {preset.label} (₹{preset.val})
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Quantity ({qty} Quintals Total)
                      </label>
                      <input
                        type="text"
                        value={`${qty} Quintals ${negotiation.isBundle ? `(${negotiation.items?.length || 0} items)` : ''}`}
                        disabled
                        className="w-full text-xs p-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Message to Buyer (Optional)
                    </label>
                    <input
                      type="text"
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                      placeholder="e.g. Ready for prompt dispatch with Grade-A packaging."
                      className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowCounterBox(false)}
                      className="px-3 py-1 rounded-xl text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-1.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-2xs cursor-pointer"
                    >
                      {submitting ? 'Sending...' : 'Send Counter Rate'}
                    </button>
                  </div>
                </form>
              )}

              {/* Quick suggestion chips for Farmer (without scrollbar) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px]">
                <span className="text-gray-400 text-[10px] font-semibold shrink-0 uppercase">Quick:</span>
                {[
                  '🚜 Ready for immediate dispatch',
                  '📦 Packed in 50kg gunny bags',
                  '📍 Farm gate pickup available',
                  '🌾 Moisture tested < 12%',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleQuickPrompt(chip)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 border border-gray-200/80 transition-colors cursor-pointer text-[11px]"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* General Message Input Bar */}
              <form onSubmit={handleSendGeneralMessage} className="flex gap-2">
                <input
                  type="text"
                  value={generalMessage}
                  onChange={(e) => setGeneralMessage(e.target.value)}
                  placeholder={
                    isAccepted
                      ? "Send dispatch, packaging, or pickup instructions to buyer..."
                      : `Message ${buyerName} about logistics or crop details...`
                  }
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={submitting || !generalMessage.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Send</span>
                  <span>➤</span>
                </button>
              </form>
            </div>
          )}

          {/* If Deal is Closed */}
          {isClosed && (
            <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 text-xs text-gray-600 shrink-0">
              <div>
                <span className="font-bold">Deal Closed ({status}):</span> {rejectionReason || 'This inquiry is closed.'}
              </div>
              <Link
                to="/seller/negotiations"
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-gray-800 font-bold hover:bg-gray-100 shadow-2xs shrink-0 text-xs"
              >
                Inquiries Queue →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          style={{ zIndex: 1000 }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Reject Negotiation Offer
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Provide a brief explanation to the buyer on why this rate cannot be accepted.
            </p>
            <form onSubmit={handleReject}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Offered rate is below our farm cultivation costs; minimum viable price is ₹2,400/q."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-600 mb-4"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                >
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
