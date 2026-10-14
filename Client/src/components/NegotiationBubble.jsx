import React from 'react';

export default function NegotiationBubble({ msg, isMe }) {
  const typeStr = (msg.messageType || msg.type || '').toString();
  const isOffer = typeStr === 'InitialOffer' || typeStr === 'CounterOffer' || typeStr === 'Offer';
  const isAccepted = typeStr === 'Accepted' || typeStr === 'Accept';
  const isRejected = typeStr === 'Rejected' || typeStr === 'Reject';
  const isWithdrawn = typeStr === 'Withdrawn' || typeStr === 'Withdraw';

  const price = msg.offerPrice ?? msg.proposedPrice;
  const text = msg.body ?? msg.text;
  const time = msg.createdAt ?? msg.sentAt;
  const senderRole = (msg.senderRole || '').toString();
  const isFarmerRole = senderRole.toLowerCase() === 'farmer';
  const senderName = msg.senderName || (isFarmerRole ? 'Farmer' : 'Buyer');

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return (
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' +
      d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    );
  };

  return (
    <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3.5 transition-all shadow-xs ${
          isMe
            ? 'bg-[#15803D] text-white rounded-tr-xs ml-auto shadow-emerald-900/10'
            : 'bg-white text-gray-900 border border-gray-200/90 rounded-tl-xs mr-auto shadow-gray-200/50'
        }`}
      >
        {/* Header: Sender Name & Timestamp */}
        <div className="flex items-center justify-between gap-3 mb-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold truncate">
            {isMe ? (
              <span className="text-emerald-100 flex items-center gap-1">
                <span>👤</span> You ({senderName})
              </span>
            ) : (
              <span className="text-gray-800 flex items-center gap-1">
                <span>{isFarmerRole ? '🌾' : '👤'}</span> {senderName}{' '}
                <span className="text-[10px] font-semibold text-gray-500 uppercase px-1.5 py-0.2 rounded-md bg-gray-100 border border-gray-200">
                  {senderRole || 'Partner'}
                </span>
              </span>
            )}
          </div>
          <span className={`text-[11px] shrink-0 ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
            {formatTime(time)}
          </span>
        </div>

        {/* Highlight Box for Offer / Counter Offer */}
        {isOffer && price !== undefined && (
          <div
            className={`my-2 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
              isMe
                ? 'bg-emerald-800/50 border-emerald-600/50 text-white'
                : 'bg-amber-50/90 border-amber-300 text-amber-950'
            }`}
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold opacity-80 flex items-center gap-1">
                <span>⚡</span>
                {isMe
                  ? (typeStr === 'InitialOffer' || typeStr === 'Offer' ? 'Your Proposed Offer' : 'Your Counter Offer')
                  : (typeStr === 'InitialOffer' || typeStr === 'Offer' ? 'Received Price Offer' : 'Received Counter Offer')}
                {msg.bundleItems?.length > 1 && <span>(Bundle Average)</span>}
              </div>
              <div className="text-lg sm:text-xl font-black mt-0.5">
                ₹{Number(price).toLocaleString('en-IN')}{' '}
                <span className={`text-xs font-semibold ${isMe ? 'text-emerald-200' : 'text-amber-800'}`}>
                  / Quintal
                </span>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isMe
                    ? 'bg-emerald-900/60 text-emerald-100 border border-emerald-500/40'
                    : 'bg-amber-200 text-amber-900 border border-amber-300'
                }`}
              >
                {isMe ? 'You Proposed' : 'Requires Response'}
              </span>
            </div>
          </div>
        )}

        {/* Bundle Items Breakdown inside message */}
        {msg.bundleItems && msg.bundleItems.length > 0 && (
          <div
            className={`my-2 p-2.5 rounded-xl border text-xs ${
              isMe ? 'bg-emerald-900/40 border-emerald-700/60 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold opacity-75 mb-1.5 flex items-center gap-1">
              <span>📦</span> Bundle Breakdown ({msg.bundleItems.length} Products)
            </div>
            <div className="space-y-1">
              {msg.bundleItems.map((bi) => (
                <div
                  key={bi.productId}
                  className={`flex items-center justify-between gap-2 p-1.5 rounded-lg text-xs ${
                    isMe ? 'bg-emerald-950/40' : 'bg-white border border-gray-200/70'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold">{bi.productName}</span>
                    <span className={`text-[11px] ml-1.5 ${isMe ? 'text-emerald-200' : 'text-gray-500'}`}>
                      {bi.quantityQuintal}q
                    </span>
                  </div>
                  <div className="font-extrabold shrink-0">
                    ₹{Number(bi.agreedPricePerQuintal || bi.offeredPricePerQuintal).toLocaleString('en-IN')}/q
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Banner */}
        {isAccepted && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-medium text-xs flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </span>
            <div>
              <span className="font-bold">Deal Accepted!</span> Agreed rate:{' '}
              <strong>₹{Number(price || 0).toLocaleString('en-IN')}/Quintal</strong>
            </div>
          </div>
        )}

        {/* Rejected Banner */}
        {isRejected && (
          <div className="my-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-medium text-xs">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <span>✕</span> Offer Rejected
            </div>
            {text && <div className="mt-1 text-xs text-rose-700">{text}</div>}
          </div>
        )}

        {/* Withdrawn Banner */}
        {isWithdrawn && (
          <div className="my-2 p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-xs italic">
            Offer withdrawn by buyer.
          </div>
        )}

        {/* Message Text Body */}
        {text && !isRejected && (
          <p className={`text-sm leading-relaxed whitespace-pre-wrap mt-1 ${isMe ? 'text-emerald-50' : 'text-gray-800'}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
