import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, CreditCard, CheckCircle, Plus, ShieldCheck, Truck, ArrowLeft, ArrowRight, AlertCircle, Check, Clock, Megaphone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { addressApi } from '../../services/addressApi';
import { orderApi } from '../../services/orderApi';
import { notify } from '../../context/NotificationContext';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();

  const [step, setStep] = useState(1);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  // Delivery slot state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [deliverySlotDate, setDeliverySlotDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [deliverySlotWindow, setDeliverySlotWindow] = useState('Morning (8 AM - 12 PM)');

  // Payment method state (1 = COD, 2 = UPI, 3 = NetBanking, 4 = Card)
  const [paymentMethod, setPaymentMethod] = useState(4); // Card default

  // Order submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await addressApi.listAddresses();
      setAddresses(data || []);
      const defaultAddr = data?.find((a) => a.isDefault) || data?.[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.phone) {
      setErrorMsg('Please fill in all required address fields.');
      return;
    }
    try {
      const created = await addressApi.createAddress(newAddress);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowAddAddressModal(false);
      setNewAddress({
        label: 'Home',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        isDefault: false
      });
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMsg('Please select a delivery address.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const result = await orderApi.createOrder({
        addressId: selectedAddressId,
        deliverySlotDate: new Date(deliverySlotDate).toISOString(),
        deliverySlotWindow,
        paymentMethod: Number(paymentMethod),
        couponCode: cart?.couponCode || null
      });

      await fetchCart();
      navigate('/order-confirmation', { state: { orderResult: result } });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Order placement failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 font-serif mb-2">Cart is empty</h2>
        <p className="text-slate-600 mb-6">Add crops to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-6 py-2.5 bg-emerald-800 text-white font-semibold rounded-full"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const items = cart.items;
  const sellerCount = new Set(items.map((i) => i.farmerId)).size;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-900 font-serif mb-6">Checkout</h1>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        {[
          { num: 1, title: 'Delivery Address', icon: MapPin },
          { num: 2, title: 'Delivery Slot', icon: Calendar },
          { num: 3, title: 'Payment Method', icon: CreditCard },
          { num: 4, title: 'Review & Confirm', icon: CheckCircle }
        ].map((st) => {
          const IconComponent = st.icon;
          const isActive = step === st.num;
          const isDone = step > st.num;
          return (
            <div
              key={st.num}
              onClick={() => isDone && setStep(st.num)}
              className={`flex items-center gap-2 cursor-pointer ${
                isActive ? 'text-emerald-800 font-bold' : isDone ? 'text-emerald-600 font-medium' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isDone ? <Check size={14} /> : st.num}
              </div>
              <span className="hidden sm:inline text-sm">{st.title}</span>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Wizard Step Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address Selection */}
          {step === 1 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" /> Select Delivery Address
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>

              {loadingAddresses ? (
                <div className="py-8 text-center text-slate-500">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-600 mb-3">No saved addresses found.</p>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="px-4 py-2 bg-emerald-800 text-white font-semibold text-sm rounded-lg"
                  >
                    Add Delivery Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span>{addr.label || 'Address'}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="text-slate-700 mt-1">
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ''}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5">
                            {addr.city}, {addr.state} - {addr.pincode} | Phone: {addr.phone}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  disabled={!selectedAddressId}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-full flex items-center gap-2 disabled:opacity-50"
                >
                  Continue to Delivery Slot <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Slot Selection */}
          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" /> Choose Preferred Delivery Slot
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={deliverySlotDate}
                    onChange={(e) => setDeliverySlotDate(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Time Window</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      'Morning (8 AM - 12 PM)',
                      'Afternoon (12 PM - 4 PM)',
                      'Evening (4 PM - 8 PM)'
                    ].map((win) => (
                      <button
                        key={win}
                        type="button"
                        onClick={() => setDeliverySlotWindow(win)}
                        className={`p-3 border rounded-xl text-xs font-semibold text-center transition-all ${
                          deliverySlotWindow === win
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {win}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-full flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-full flex items-center gap-2"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method Selection */}
          {step === 3 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" /> Select Payment Option
              </h2>

              <div className="space-y-3">
                {[
                  { id: 4, name: 'Credit / Debit Card', desc: 'Pay via Visa, Mastercard, RuPay' },
                  { id: 2, name: 'UPI / BHIM / Google Pay', desc: 'Instant UPI payment confirmation' },
                  { id: 3, name: 'Net Banking', desc: 'All major Indian banks supported' },
                  { id: 1, name: 'Cash on Delivery (COD)', desc: 'Pay cash directly to farmer/transporter on delivery' }
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{pm.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{pm.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-full flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-full flex items-center gap-2"
                >
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Review & Confirm */}
          {step === 4 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-700" /> Review & Place Order
              </h2>

              {sellerCount > 1 && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs leading-relaxed font-medium flex items-start gap-2.5">
                  <Megaphone className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Multi-Seller Order Notice:</strong> Your cart contains items from <strong>{sellerCount} different farmer sellers</strong>. For fulfillment clarity, your order will be automatically split into {sellerCount} seller sub-orders.
                  </div>
                </div>
              )}

              {/* Delivery & Slot summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Delivery Address:</span>
                  {(() => {
                    const a = addresses.find((addr) => addr.id === selectedAddressId);
                    return a ? (
                      <div className="text-slate-600">
                        <strong>{a.label}</strong>: {a.line1}, {a.city}, {a.state} ({a.pincode})
                      </div>
                    ) : null;
                  })()}
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Delivery Schedule:</span>
                  <div className="text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(deliverySlotDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{deliverySlotWindow}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-slate-900">{item.productName}</span>
                      <span className="text-xs text-slate-500 block">
                        {item.quantityQuintal} Quintals @ ₹{item.unitPricePerQuintal}/Qtl (Farmer: {item.farmerName})
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900">₹{item.lineTotal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-full flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-base rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : `Confirm & Place Order (₹${cart.totalAmount?.toLocaleString()})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Order Summary Card */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 font-serif">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal?.toLocaleString()}</span>
              </div>
              {cart.bulkDiscountTotal > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Bulk Savings</span>
                  <span>-₹{cart.bulkDiscountTotal}</span>
                </div>
              )}
              {cart.couponDiscountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>-₹{cart.couponDiscountTotal}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">₹{cart.deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-semibold text-slate-900">₹{cart.platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-semibold text-slate-900">₹{cart.taxAmount}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="text-xl font-black text-emerald-900">₹{cart.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Direct bank settlement to verified farmers upon delivery confirmation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Modal to Add New Address */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif">Add Delivery Address</h3>
            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Address Label</label>
                <input
                  type="text"
                  placeholder="e.g. Home, Warehouse, Shop"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Street Address Line 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="House/Plot No., Street, Area"
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Line 2 (Landmark)</label>
                <input
                  type="text"
                  placeholder="Near APMC Mandi, Bus Stand"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defChk"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                />
                <label htmlFor="defChk" className="text-slate-600 cursor-pointer">Set as default address</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-lg"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Checkout;
