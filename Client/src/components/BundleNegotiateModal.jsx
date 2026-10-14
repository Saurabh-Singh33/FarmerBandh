import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Store,
  MapPin,
  CheckCircle2,
  Minus,
  Plus,
  MessageSquare,
  TrendingDown,
  Layers,
  Lock,
  BadgePercent
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { negotiationApi } from '../services/negotiationApi';
import { getProductImageUrl } from '../services/productImages';
import { notify } from '../context/NotificationContext';

export default function BundleNegotiateModal({ isOpen, onClose, farmerGroup }) {
  const navigate = useNavigate();

  // farmerGroup = { farmerId, farmerName, farmerLocation, items: [ cartItem, ... ] }
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quickPitches = [
    '⚡ Ready for immediate dispatch',
    '🤝 Regular wholesale buyer, seeking long-term supply',
    '📦 Standard commercial packaging required',
    '💳 Full payment on inspection upon arrival'
  ];

  useEffect(() => {
    if (farmerGroup && farmerGroup.items) {
      const initialItems = farmerGroup.items.map((it) => {
        const listPrice = Number(it.unitPricePerQuintal || 0);
        const qty = Number(it.quantityQuintal || 1);
        // Default 10% discount proposed
        const defaultProposed = Math.max(1, Math.round(listPrice * 0.9));
        return {
          productId: it.productId,
          productName: it.productName,
          categoryName: it.categoryName || 'Crop Produce',
          imageUrl: it.imageUrl || it.productImageUrl,
          quantityQuintal: qty,
          listedPricePerQuintal: listPrice,
          offeredPricePerQuintal: defaultProposed,
        };
      });

      setItems(initialItems);
      const totalQty = initialItems.reduce((sum, i) => sum + i.quantityQuintal, 0);
      setMessage(
        `Hello ${farmerGroup.farmerName}, I am looking to purchase ${initialItems.length} crops (${totalQty} quintals total) together in bulk from your farm. Can we agree on this bundle discount rate?`
      );
      setDiscountPercent(10);
    }
  }, [farmerGroup]);

  if (!isOpen || !farmerGroup) return null;

  const handlePriceChange = (productId, newPrice) => {
    const val = Number(newPrice);
    setDiscountPercent(null); // Switched to custom manual mode
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId ? { ...it, offeredPricePerQuintal: val } : it
      )
    );
  };

  const handleQuantityChange = (productId, newQty) => {
    const val = Math.max(1, Number(newQty) || 1);
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId ? { ...it, quantityQuintal: val } : it
      )
    );
  };

  const applyGlobalDiscount = (pct) => {
    setDiscountPercent(pct);
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        offeredPricePerQuintal: Math.max(
          1,
          Math.round(it.listedPricePerQuintal * (1 - pct / 100))
        ),
      }))
    );
  };

  const appendPitch = (pitch) => {
    setMessage((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return pitch;
      if (trimmed.includes(pitch)) return trimmed;
      return `${trimmed} ${pitch}`;
    });
  };

  const totalListed = items.reduce(
    (sum, it) => sum + it.listedPricePerQuintal * it.quantityQuintal,
    0
  );
  const totalOffered = items.reduce(
    (sum, it) => sum + (it.offeredPricePerQuintal || 0) * it.quantityQuintal,
    0
  );
  const totalQuantity = items.reduce((sum, it) => sum + it.quantityQuintal, 0);
  const savings = Math.max(0, totalListed - totalOffered);
  const savingsPct = totalListed > 0 ? ((savings / totalListed) * 100).toFixed(1) : 0;
  const avgOfferedPerQtl = totalQuantity > 0 ? Math.round(totalOffered / totalQuantity) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    for (const it of items) {
      if (!it.offeredPricePerQuintal || it.offeredPricePerQuintal <= 0) {
        setError(`Please enter a valid offer price for ${it.productName}.`);
        return;
      }
      if (it.offeredPricePerQuintal > it.listedPricePerQuintal) {
        setError(
          `Offer for ${it.productName} cannot be higher than listed price (₹${Number(it.listedPricePerQuintal).toLocaleString('en-IN')}/q).`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        productId: items[0].productId,
        message: message.trim(),
        items: items.map((it) => ({
          productId: it.productId,
          quantityQuintal: it.quantityQuintal,
          offeredPricePerQuintal: it.offeredPricePerQuintal,
        })),
      };

      const result = await negotiationApi.createNegotiation(payload);
      notify.success(
        `Bundle negotiation submitted for ${items.length} items!`,
        'Negotiation Opened'
      );
      onClose();
      navigate(`/negotiations/${result.id}`);
    } catch (err) {
      console.error('Failed to create bundle negotiation:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Could not submit bundle negotiation. Please verify quantities and prices.';
      setError(msg);
      notify.error(msg, 'Negotiation Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#15803D] to-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-emerald-800/20 shrink-0">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Negotiate Multi-Item Bundle
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <BadgePercent className="w-3 h-3" /> Bulk Bundle
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Store className="w-3.5 h-3.5 text-emerald-700" />
                  {farmerGroup.farmerName}
                </span>
                {farmerGroup.farmerLocation && (
                  <span className="flex items-center gap-1 text-slate-500">
                    · <MapPin className="w-3 h-3 text-slate-400" /> {farmerGroup.farmerLocation}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all duration-150 hover:rotate-90 cursor-pointer shadow-2xs"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              {error}
            </div>
          )}

          {/* Quick Bundle Discount Buttons */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Quick Bundle Discount
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Auto-applies rate across all {items.length} crops
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((pct) => {
                const isSelected = discountPercent === pct;
                const estSavings = totalListed > 0 ? Math.round(totalListed * (pct / 100)) : 0;

                return (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => applyGlobalDiscount(pct)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#15803D] to-[#166534] text-white border-[#15803D] shadow-md shadow-emerald-800/25 ring-2 ring-emerald-500/30 scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-900'
                    }`}
                  >
                    <span className="text-xs font-black">{pct}% Off</span>
                    <span
                      className={`text-[10px] font-semibold mt-0.5 ${
                        isSelected ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      Save ~₹{estSavings >= 1000 ? `${(estSavings / 1000).toFixed(1)}k` : estSavings}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items in the Bundle Table/Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                Bundle Items ({items.length} Products · {totalQuantity} Quintals)
              </span>
              <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Customizable per crop
              </span>
            </div>

            <div className="space-y-3">
              {items.map((it) => {
                const subtotal = (it.offeredPricePerQuintal || 0) * it.quantityQuintal;
                const origSubtotal = it.listedPricePerQuintal * it.quantityQuintal;
                const itemSavings = Math.max(0, origSubtotal - subtotal);
                const itemDiscountPct =
                  it.listedPricePerQuintal > 0
                    ? Math.round(
                        ((it.listedPricePerQuintal - (it.offeredPricePerQuintal || 0)) /
                          it.listedPricePerQuintal) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={it.productId}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                  >
                    {/* Product Info & Thumbnail */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={getProductImageUrl(it)}
                          alt={it.productName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200/80 shadow-2xs"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/products/tomato-fresh.jpg';
                          }}
                        />
                        {itemDiscountPct > 0 && (
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-black shadow-xs">
                            -{itemDiscountPct}%
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {it.productName}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {it.categoryName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>
                            Listed:{' '}
                            <span className="font-bold text-slate-700">
                              ₹{Number(it.listedPricePerQuintal).toLocaleString('en-IN')}/q
                            </span>
                          </span>
                          {it.offeredPricePerQuintal < it.listedPricePerQuintal && (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
                              <TrendingDown className="w-3 h-3" />
                              Save ₹{Number(itemSavings).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inputs & Subtotal */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                      
                      {/* Quantity Stepper */}
                      <div className="text-left sm:text-right">
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                          Qty (Qtl)
                        </label>
                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/60 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(it.productId, it.quantityQuintal - 1)}
                            disabled={it.quantityQuintal <= 1}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={it.quantityQuintal}
                            onChange={(e) => handleQuantityChange(it.productId, e.target.value)}
                            className="w-10 text-center text-xs font-black text-slate-900 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(it.productId, it.quantityQuintal + 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-white transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Your Offer / Q */}
                      <div className="text-left sm:text-right">
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                          Offer Rate / q
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="1"
                            max={it.listedPricePerQuintal}
                            value={it.offeredPricePerQuintal}
                            onChange={(e) => handlePriceChange(it.productId, e.target.value)}
                            className="w-24 pl-5 pr-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-black text-slate-900 text-right outline-none transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right shrink-0 min-w-[76px]">
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Subtotal</div>
                        <div className="text-xs font-black text-emerald-800">
                          ₹{Number(subtotal).toLocaleString('en-IN')}
                        </div>
                        {itemSavings > 0 && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{Number(origSubtotal).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deal Summary Receipt Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0B2E1D] via-[#10432B] to-[#0A2618] text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
            {/* Soft decorative background circles */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  <Tag className="w-3 h-3 text-emerald-300" /> Bundle Agreement Breakdown
                </div>
                
                <div className="text-xs text-emerald-100/90 pt-1">
                  Listed Value:{' '}
                  <span className="line-through text-emerald-300/60">
                    ₹{Number(totalListed).toLocaleString('en-IN')}
                  </span>
                  {' · '}
                  You Save:{' '}
                  <span className="font-extrabold text-amber-300">
                    ₹{Number(savings).toLocaleString('en-IN')} ({savingsPct}% Off)
                  </span>
                </div>

                <div className="text-[11px] text-emerald-200/70">
                  Effective Avg: <span className="font-bold text-white">₹{Number(avgOfferedPerQtl).toLocaleString('en-IN')}/Quintal</span> across {totalQuantity} Qtl
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-800/60 w-full sm:w-auto">
                <div className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">
                  Proposed Bundle Total
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ₹{Number(totalOffered).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Footer inside card */}
            <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center gap-2 text-[11px] text-emerald-200/80">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong>100% Mandi Escrow Protected:</strong> Funds remain securely held until crop inspection. Payment is only charged once the farmer accepts this bundle deal.
              </span>
            </div>
          </div>

          {/* Pitch Message to Farmer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                Message to Farmer (Optional)
              </label>
              <span className="text-[10px] text-slate-400">Click a chip to quick-add</span>
            </div>

            {/* Quick Pitch Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickPitches.map((pitch, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => appendPitch(pitch)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/70 text-[11px] font-medium text-slate-600 transition-all cursor-pointer"
                >
                  {pitch}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your bulk requirement, delivery schedule, or payment readiness..."
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 outline-none resize-none transition-all shadow-2xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 via-[#15803D] to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-800/25 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                'Submitting Offer...'
              ) : (
                <>
                  Send Combined Bundle Offer (₹{Number(totalOffered).toLocaleString('en-IN')}) 🚀
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
