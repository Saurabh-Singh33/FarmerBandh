import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusPill from './StatusPill';
import { useCart } from '../context/CartContext';
import { notify } from '../context/NotificationContext';

export default function NegotiationCard({ negotiation, isSeller = false, viewMode = 'grid', onUpdated }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  const id = negotiation.id;
  const productId = negotiation.productId || negotiation.product?.id || negotiation.product?.productId;
  const productName = negotiation.productName || negotiation.product?.name || 'Farm Produce';
  const productImageUrl = negotiation.productImageUrl || negotiation.product?.imageUrl;
  const farmerId = negotiation.farmerId || negotiation.farmer?.id;
  const farmerFarmName = negotiation.farmerFarmName || negotiation.farmer?.farmName || negotiation.farmerName || 'Verified Farmer';
  const farmerLocation = negotiation.farmerLocation || negotiation.farmer?.location;
  const farmerVerified = negotiation.farmer?.verified ?? true;
  const buyerName = negotiation.buyerName || negotiation.buyer?.fullName || 'Buyer';

  const quantityQuintal = Number(negotiation.quantityQuintal || negotiation.negotiation?.quantityQuintal || 1);
  const initialPrice = Number(negotiation.initialPricePerQuintal || negotiation.product?.currentPricePerQuintal || 0);
  const currentOfferPrice = Number(negotiation.currentOfferPrice || 0);
  const agreedPrice = Number(negotiation.agreedPricePerQuintal || (negotiation.status === 'Accepted' ? currentOfferPrice : 0));
  const activePrice = agreedPrice > 0 ? agreedPrice : currentOfferPrice;

  const currentOfferByRole = negotiation.currentOfferByRole || negotiation.currentOfferBy || 'Buyer';
  const status = negotiation.status || 'Open';
  const expiresAt = negotiation.expiresAt;
  const lastMessagePreview = negotiation.lastMessagePreview;
  const unreadCount = negotiation.unreadCount || 0;

  // Savings calculation
  const totalOriginal = initialPrice * quantityQuintal;
  const totalNegotiated = activePrice * quantityQuintal;
  const savings = totalOriginal > totalNegotiated ? totalOriginal - totalNegotiated : 0;
  const savingsPercent = totalOriginal > 0 && savings > 0 ? Math.round((savings / totalOriginal) * 100) : 0;

  const calculateHoursLeft = (expiry) => {
    if (!expiry) return null;
    const diffMs = new Date(expiry) - new Date();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h left`;
  };

  const hoursLeft = calculateHoursLeft(expiresAt);
  const isExpired = hoursLeft === 'Expired' || status === 'Expired';
  const isAccepted = status === 'Accepted';

  // Determine turn state
  const isMyTurn = isSeller
    ? (currentOfferByRole === 'Buyer' || currentOfferByRole === 1 || currentOfferByRole === 'buyer') &&
      (status === 'Open' || status === 'Countered')
    : (currentOfferByRole === 'Farmer' || currentOfferByRole === 2 || currentOfferByRole === 'farmer') &&
      (status === 'Open' || status === 'Countered');

  const detailUrl = isSeller ? `/seller/negotiations/${id}` : `/negotiations/${id}`;

  const isBundle = Boolean(negotiation.isBundle || negotiation.negotiation?.isBundle || (negotiation.items && negotiation.items.length > 1));
  const bundleItems = negotiation.items || negotiation.negotiation?.items || [];
  const bundleItemsCount = bundleItems.length;

  const handleQuickAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBundle && bundleItems.length > 0) {
      setAddingToCart(true);
      try {
        for (const item of bundleItems) {
          const itemPrice = item.agreedPricePerQuintal || item.offeredPricePerQuintal || item.initialPricePerQuintal;
          await addToCart(item.productId, item.quantityQuintal, itemPrice);
        }
        notify.success(`Added ${bundleItems.length} bundle items to cart at agreed prices!`);
      } catch (err) {
        notify.error(err.message || 'Failed to add bundle to cart');
      } finally {
        setAddingToCart(false);
      }
      return;
    }

    if (!productId || activePrice <= 0) {
      navigate(detailUrl);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(productId, quantityQuintal, activePrice);
      notify.success(`Added ${quantityQuintal} quintals of ${productName} at agreed ₹${activePrice.toLocaleString('en-IN')}/q to cart!`);
    } catch (err) {
      notify.error(err.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // ----------------------------------------------------
  // LIST VIEW: Sleek horizontal row strip
  // ----------------------------------------------------
  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all duration-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Section: Thumbnail & Main Info */}
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          {/* Compact Proportional Thumbnail */}
          <div
            className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative"
            style={{ width: '100px', height: '76px', minWidth: '100px', maxWidth: '100px' }}
          >
            <img
              src={productImageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=240'}
              alt={productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=240';
              }}
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StatusPill status={status} />

              {isBundle && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  <span>📦</span> Bundle {bundleItemsCount > 0 ? `(${bundleItemsCount} items)` : ''}
                </span>
              )}

              {isMyTurn && (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[11px] font-bold bg-amber-500 text-white animate-pulse">
                  ⚡ Your Turn
                </span>
              )}

              {!isMyTurn && (status === 'Open' || status === 'Countered') && (
                <span className="text-[11px] text-gray-500 font-medium">
                  ⏳ Waiting for {isSeller ? buyerName : farmerFarmName}
                </span>
              )}

              {hoursLeft && !isExpired && !isAccepted && (
                <span className="text-[11px] text-gray-400">⏱️ {hoursLeft}</span>
              )}
            </div>

            <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-emerald-700 transition-colors">
              <Link to={detailUrl} className="hover:underline">
                {productName}
              </Link>
            </h3>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
              {isSeller ? (
                <span>Buyer: <strong className="text-gray-700">{buyerName}</strong></span>
              ) : (
                <span>
                  Farmer:{' '}
                  {farmerId ? (
                    <Link to={`/farmers/${farmerId}`} className="font-semibold text-emerald-800 hover:underline">
                      {farmerFarmName} {farmerVerified && '✓'}
                    </Link>
                  ) : (
                    <strong className="text-gray-700">{farmerFarmName}</strong>
                  )}
                </span>
              )}
              <span>•</span>
              <span className="font-semibold text-gray-700">📦 {quantityQuintal} Quintals</span>
            </div>

            {lastMessagePreview && (
              <p className="text-[11px] text-gray-500 italic truncate mt-1 max-w-lg">
                “{lastMessagePreview}”
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Pricing & Actions */}
        <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
          <div className="text-left md:text-right">
            {initialPrice > 0 && initialPrice !== activePrice && (
              <div className="text-[11px] text-gray-400 line-through">
                Listed: ₹{initialPrice.toLocaleString('en-IN')}/q
              </div>
            )}
            <div className="text-lg font-black text-emerald-900">
              ₹{activePrice.toLocaleString('en-IN')}
              <span className="text-xs font-semibold text-gray-500"> /q</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Total: <span className="font-bold text-gray-900">₹{totalNegotiated.toLocaleString('en-IN')}</span>
            </div>
            {savings > 0 && (
              <div className="text-[10px] font-bold text-emerald-700">
                Saved ₹{savings.toLocaleString('en-IN')} ({savingsPercent}%)
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAccepted && !isSeller && (
              <button
                onClick={handleQuickAddToCart}
                disabled={addingToCart}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span>🛒</span>
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            )}

            <Link
              to={detailUrl}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 ${
                isMyTurn
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}
            >
              {isMyTurn ? 'Respond →' : 'View Thread →'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // GRID VIEW (Default): Horizontal card in 2-column layout
  // ----------------------------------------------------
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between gap-3">
      {/* Top Status & Timing Row */}
      <div className="flex items-center justify-between gap-2 text-xs border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusPill status={status} />

          {isBundle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
              <span>📦</span> Bundle {bundleItemsCount > 0 ? `(${bundleItemsCount} items)` : ''}
            </span>
          )}

          {isMyTurn && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white animate-pulse">
              ⚡ Action Needed
            </span>
          )}

          {!isMyTurn && (status === 'Open' || status === 'Countered') && (
            <span className="text-[11px] text-gray-500 font-medium">
              ⏳ Waiting for {isSeller ? buyerName : farmerFarmName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          {hoursLeft && !isExpired && !isAccepted && (
            <span className="font-medium text-gray-600">⏱️ {hoursLeft}</span>
          )}
          <span>#{id?.slice(0, 6)}</span>
        </div>
      </div>

      {/* Middle Horizontal Content: Image on left, Details on right */}
      <div className="flex gap-3.5 items-start">
        {/* Proportional Horizontal Image (112px x 82px) */}
        <div
          className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative"
          style={{ width: '112px', height: '82px', minWidth: '112px', maxWidth: '112px' }}
        >
          <img
            src={productImageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=260'}
            alt={productName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=260';
            }}
          />
          <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/60 text-white text-[8px] font-semibold">
            {quantityQuintal}Q
          </div>
        </div>

        {/* Product & Counterparty Info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-emerald-700 transition-colors">
            <Link to={detailUrl} className="hover:underline">
              {productName}
            </Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1 flex-wrap">
            {isSeller ? (
              <span className="truncate">👤 Buyer: <strong className="text-gray-800">{buyerName}</strong></span>
            ) : (
              <span className="truncate">
                🌾{' '}
                {farmerId ? (
                  <Link to={`/farmers/${farmerId}`} className="font-semibold text-emerald-800 hover:underline">
                    {farmerFarmName} {farmerVerified && '✓'}
                  </Link>
                ) : (
                  <strong className="text-gray-800">{farmerFarmName}</strong>
                )}
              </span>
            )}
            {farmerLocation && !isSeller && (
              <span className="text-gray-400 text-[11px] truncate">· {farmerLocation}</span>
            )}
          </div>

          {/* Latest Quote Snippet */}
          {lastMessagePreview ? (
            <p className="mt-1.5 text-[11px] text-gray-500 italic truncate bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
              “{lastMessagePreview}”
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400 italic">Discussion in progress</p>
          )}
        </div>
      </div>

      {/* Bottom Financials & Action Strip */}
      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-3">
        {/* Price & Deal Total */}
        <div>
          <div className="flex items-baseline gap-1.5">
            {initialPrice > 0 && initialPrice !== activePrice && (
              <span className="text-[11px] text-gray-400 line-through">
                ₹{initialPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-lg font-black text-emerald-900">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-semibold text-gray-500">/quintal</span>
          </div>

          <div className="text-[11px] text-gray-500">
            Total: <strong className="text-gray-800">₹{totalNegotiated.toLocaleString('en-IN')}</strong>
            {savings > 0 && (
              <span className="ml-1 text-emerald-700 font-bold">
                (Save ₹{savings.toLocaleString('en-IN')})
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isAccepted && !isSeller && (
            <button
              onClick={handleQuickAddToCart}
              disabled={addingToCart}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Add to cart at negotiated price"
            >
              <span>🛒</span> {addingToCart ? 'Adding...' : 'Buy'}
            </button>
          )}

          <Link
            to={detailUrl}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 ${
              isMyTurn
                ? 'bg-amber-600 hover:bg-amber-700 text-white ring-1 ring-amber-400/50'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            {isMyTurn ? 'Respond →' : 'View →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
