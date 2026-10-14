import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Tag, ArrowRight, ShieldCheck, Truck, Store, Info, Check, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { QuantityStepper } from '../../components/QuantityStepper';
import { getProductImageUrl } from '../../services/productImages';
import { notify } from '../../context/NotificationContext';
import BundleNegotiateModal from '../../components/BundleNegotiateModal';

export const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, error, updateCartItem, removeFromCart, applyCoupon, removeCoupon, clearCart } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBundleFarmer, setSelectedBundleFarmer] = useState(null);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

  const handleQuantityChange = async (itemId, newQty) => {
    setUpdatingId(itemId);
    try {
      await updateCartItem(itemId, newQty);
    } catch (err) {
      console.error('Update quantity failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    try {
      await applyCoupon(couponInput.trim().toUpperCase());
      const msg = `Coupon '${couponInput.trim().toUpperCase()}' applied successfully!`;
      setCouponSuccess(msg);
      notify.success(msg, 'Discount Applied');
      setCouponInput('');
    } catch (err) {
      const msg = err.message || 'Invalid coupon code.';
      setCouponError(msg);
      notify.error(msg, 'Coupon Error');
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    try {
      await removeCoupon();
      notify.info('Coupon has been removed.', 'Cart Updated');
    } catch (err) {
      console.error('Failed to remove coupon:', err);
      notify.error('Could not remove coupon.');
    }
  };

  if (loading && !cart) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-slate-200 rounded-xl"></div>
              <div className="h-32 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 font-serif mb-3">Your Cart is Empty</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Explore fresh farm produce directly listed by local farmers across India.
        </p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          Explore Marketplace <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  // Group items by farmer
  const groupedItems = items.reduce((acc, item) => {
    const farmerId = item.farmerId;
    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmerName: item.farmerName,
        farmerLocation: item.farmerLocation,
        items: []
      };
    }
    acc[farmerId].items.push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} product line(s) from {Object.keys(groupedItems).length} farmer seller(s)
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items grouped by Farmer */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedItems).map(([farmerId, group]) => (
            <div key={farmerId} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-emerald-50/80 px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 text-sm">{group.farmerName}</span>
                    <span className="text-xs text-slate-500 ml-2 inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {group.farmerLocation}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBundleFarmer({ farmerId, ...group });
                    setIsBundleModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-black flex items-center gap-1.5 shadow-xs shadow-emerald-800/20 transition-all hover:scale-[1.02] active:scale-98 shrink-0 cursor-pointer"
                  title="Negotiate a combined bundle discount on all items from this farmer"
                >
                  <span className="text-sm">🤝</span> Negotiate Multi-Crop Bundle ({group.items.length} {group.items.length === 1 ? 'crop' : 'crops'})
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img
                        src={getProductImageUrl(item)}
                        alt={item.productName}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-sm flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/tomato-fresh.jpg';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            {item.categoryName}
                          </span>
                          <Link
                            to={`/products/${item.productSlug || item.productId}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 text-base truncate block"
                          >
                            {item.productName}
                          </Link>
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          ₹{item.unitPricePerQuintal?.toLocaleString()} <span className="text-xs text-slate-400">/ Quintal</span>
                        </div>
                        {item.bulkDiscountPercent > 0 && (
                          <div className="mt-1 text-xs text-amber-700 flex items-center gap-1 font-medium">
                            <Tag className="w-3.5 h-3.5" /> {item.bulkDiscountPercent}% bulk discount applied (≥ {item.bulkDiscountThresholdQuintal} Qtl)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <QuantityStepper
                        value={item.quantityQuintal}
                        min={item.minOrderQuantityQuintal || 1}
                        max={item.availableQuantityQuintal || 100}
                        onChange={(newQty) => handleQuantityChange(item.id, newQty)}
                        disabled={updatingId === item.id}
                      />

                      <div className="text-right min-w-[90px]">
                        <div className="font-extrabold text-slate-900 text-base">
                          ₹{item.lineTotal?.toLocaleString()}
                        </div>
                        {item.lineDiscount > 0 && (
                          <div className="text-xs text-emerald-600 font-medium">
                            Saved ₹{item.lineDiscount}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Coupon Code Input Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" /> Apply Coupon or Promo Code
            </h3>

            {cart.couponCode ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-emerald-900 text-sm">{cart.couponCode}</span>
                    <span className="text-xs text-emerald-700 ml-2">Coupon Applied</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                >
                  Remove Code
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. FIRST10, BULK500)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-xs text-rose-600 mt-2 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-emerald-600 mt-2 font-medium">{couponSuccess}</p>}

            {/* Quick Suggestions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Available Coupons:</span>
              <button onClick={() => setCouponInput('FIRST10')} className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded font-mono font-bold">FIRST10</button>
              <button onClick={() => setCouponInput('BULK500')} className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded font-mono font-bold">BULK500</button>
              <button onClick={() => setCouponInput('FREESHIP')} className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded font-mono font-bold">FREESHIP</button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout CTA */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 font-serif">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal?.toLocaleString()}</span>
              </div>

              {cart.bulkDiscountTotal > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Bulk Discount</span>
                  <span>-₹{cart.bulkDiscountTotal?.toLocaleString()}</span>
                </div>
              )}

              {cart.couponDiscountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({cart.couponCode})</span>
                  <span>-₹{cart.couponDiscountTotal?.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {cart.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${cart.deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-semibold text-slate-900">₹{cart.platformFee}</span>
              </div>

              <div className="flex justify-between">
                <span>GST / Taxes (5%)</span>
                <span className="font-semibold text-slate-900">₹{cart.taxAmount}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-emerald-900">₹{cart.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-4"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Direct Farmer Payment Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Verified Local Transport & Cold Chain Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Item Bundle Negotiation Modal */}
      <BundleNegotiateModal
        isOpen={isBundleModalOpen}
        onClose={() => setIsBundleModalOpen(false)}
        farmerGroup={selectedBundleFarmer}
      />
    </div>
  );
};
export default Cart;
