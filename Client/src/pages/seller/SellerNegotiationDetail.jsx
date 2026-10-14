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
        type: 'CounterOffer',
        proposedPrice: priceNum,
        text: counterNote.trim(),
      });
      setNegotiation(updated);
      setCounterPrice('');
      setCounterNote('');
      setShowCounterBox(false);
      notify.success('Counter offer sent to buyer!');
      refreshUnreadCount();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to send counter offer');
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
        type: 'Message',
        text: generalMessage.trim(),
      });
      setNegotiation(updated);
      setGeneralMessage('');
      refreshUnreadCount();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to send message');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/seller/negotiations"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
        >
          ← Back to Inquiries Queue
        </Link>
        <span className="text-xs text-gray-400">ID: {negId.slice(0, 8)}</span>
      </div>

      {/* Deal Overview Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <img
              src={productImageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200'}
              alt={productName}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shrink-0"
              style={{ width: '64px', height: '64px', minWidth: '64px', maxWidth: '64px', objectFit: 'cover' }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill status={status} />
                {negotiation.isBundle && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                    <span>📦</span> Multi-Product Bundle ({negotiation.items?.length || 0} items)
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  Inquiry from <strong className="text-gray-700">{buyerName}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-1">
                {productName}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Bulk Volume:{' '}
                <span className="font-bold text-gray-800">{quantityQuintal} Quintals</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto bg-emerald-50/50 p-3 sm:p-0 rounded-2xl sm:bg-transparent">
            <div className="text-xs text-gray-400 line-through">
              {negotiation.isBundle ? 'Avg Listed: ' : 'Your Listed Rate: '}₹{Number(initialPricePerQuintal || 0).toLocaleString('en-IN')}/q
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">
              ₹{Number(currentOfferPrice || 0).toLocaleString('en-IN')}
              <span className="text-xs font-semibold text-gray-600"> / Quintal</span>
            </div>
            <div className="text-xs text-gray-600 font-medium mt-0.5">
              Order Value:{' '}
              <span className="font-bold text-gray-900">
                ₹{Number((currentOfferPrice || 0) * quantityQuintal).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Item Bundle Items Breakdown */}
        {negotiation.isBundle && negotiation.items && negotiation.items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>📦</span> Products Included in this Bundle ({negotiation.items.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {negotiation.items.map((it) => (
                <div
                  key={it.productId}
                  className="p-3 rounded-2xl bg-gray-50/90 border border-gray-200/80 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={it.imageUrl || '/images/products/tomato-fresh.jpg'}
                      alt={it.productName}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/products/tomato-fresh.jpg';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{it.productName}</div>
                      <div className="text-[11px] text-gray-500">
                        {it.quantityQuintal} Quintals · Listed: ₹{Number(it.initialPricePerQuintal).toLocaleString('en-IN')}/q
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-emerald-800">
                      ₹{Number(it.agreedPricePerQuintal || it.offeredPricePerQuintal).toLocaleString('en-IN')}
                      <span className="text-[10px] font-normal text-gray-500">/q</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Line: ₹{Number((it.agreedPricePerQuintal || it.offeredPricePerQuintal) * it.quantityQuintal).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Callout Banner */}
        {isAccepted && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
              <span>🎉</span> Deal Agreed at ₹{Number(agreedPricePerQuintal || currentOfferPrice).toLocaleString('en-IN')}/Quintal!
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              The buyer can now add this produce to their cart at the negotiated rate and place the order.
            </p>
          </div>
        )}

        {isClosed && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
            <span className="font-bold">Deal Closed ({status}):</span>{' '}
            {rejectionReason || 'This inquiry is closed for further counter offers.'}
          </div>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Offer History & Chat
          </div>
          <div className="text-xs text-gray-400">
            {messages.length} messages
          </div>
        </div>

        <div className="p-4 sm:p-6 min-h-[300px] max-h-[460px] overflow-y-auto bg-[#F9FBF8]/40">
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
            <div className="text-center py-12 text-xs text-gray-400">
              No messages yet in this discussion.
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Action Bar for Farmer */}
        {!isClosed && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white">
            {/* If Deal is already Accepted */}
            {isAccepted && (
              <div className="mb-3.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <span>🎉</span> Deal Finalized at Agreed Rate: ₹{Number(agreedPricePerQuintal || currentOfferPrice).toLocaleString('en-IN')}/Quintal
                </div>
                <div className="text-emerald-700 text-[11px] mt-0.5">
                  The deal is locked! The buyer can now purchase at this negotiated rate. You can send dispatch, packaging, or pickup notes below.
                </div>
              </div>
            )}

            {/* If Farmer is waiting for Buyer's response */}
            {!canAccept && !canCounter && !isAccepted && (
              <div className="mb-3.5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>⏳</span> Waiting for Buyer's Response ({buyerName})
                  </div>
                  <div className="text-amber-700 text-[11px] mt-0.5">
                    You proposed ₹{Number(currentOfferPrice).toLocaleString('en-IN')}/q. The buyer has been notified and can accept or send a counter offer. You can also send a follow-up note below.
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full shrink-0">
                  Buyer's Turn
                </span>
              </div>
            )}

            {/* If Farmer can accept or counter */}
            {canAccept && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Buyer Offered: ₹{Number(currentOfferPrice).toLocaleString('en-IN')}/Quintal
                  </div>
                  <div className="text-xs text-amber-700">
                    Accept this rate, counter with your minimum price, or reject the inquiry.
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    Accept ₹{currentOfferPrice}/q
                  </button>
                  <button
                    onClick={() => setShowCounterBox(!showCounterBox)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-2xs"
                  >
                    {showCounterBox ? 'Close Counter' : 'Counter Offer'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Counter offer box form */}
            {(showCounterBox || (!canAccept && canCounter)) && !isAccepted && (
              <form onSubmit={handleSendCounter} className="mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Propose Counter Offer to Buyer
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      {negotiation.isBundle ? 'Your Counter Average Rate (₹ / Quintal) *' : 'Your Counter Rate (₹ / Quintal) *'}
                    </label>
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      placeholder={`e.g. ${Math.round((initialPricePerQuintal + currentOfferPrice) / 2)}`}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold"
                      required
                    />
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-gray-400 self-center">Presets:</span>
                      {[
                        { label: 'Midpoint', val: Math.round((initialPricePerQuintal + currentOfferPrice) / 2) },
                        { label: '-5% Listed', val: Math.round(initialPricePerQuintal * 0.95) },
                        { label: '+5% Buyer', val: Math.round(currentOfferPrice * 1.05) },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setCounterPrice(preset.val.toString())}
                          className="px-2 py-0.5 rounded-lg bg-gray-200 hover:bg-emerald-100 hover:text-emerald-900 text-gray-700 text-[10px] font-bold transition-colors"
                        >
                          {preset.label} (₹{preset.val})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Quantity ({quantityQuintal} Quintals Total)
                    </label>
                    <input
                      type="text"
                      value={`${quantityQuintal} Quintals ${negotiation.isBundle ? `(${negotiation.items?.length || 0} items)` : ''}`}
                      disabled
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-semibold"
                    />
                    {negotiation.isBundle && (
                      <p className="text-[10px] text-gray-400 mt-2">
                        Bundle items will automatically scale proportionally to this rate.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Message to Buyer (Optional)
                  </label>
                  <textarea
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    placeholder="e.g. Can supply Grade-A sorted wheat at this rate with prompt loading."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCounterBox(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-2xs"
                  >
                    Send Counter Rate
                  </button>
                </div>
              </form>
            )}

            {/* General message input */}
            <form onSubmit={handleSendGeneralMessage} className="flex gap-2">
              <input
                type="text"
                value={generalMessage}
                onChange={(e) => setGeneralMessage(e.target.value)}
                placeholder={isAccepted ? "Send dispatch, packaging, or pickup instructions..." : "Send a note or clarify harvest / dispatch details..."}
                className="flex-1 text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={submitting || !generalMessage.trim()}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-bold shadow-2xs"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
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
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs"
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
