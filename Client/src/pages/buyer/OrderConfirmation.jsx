import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Truck, Home, UserCheck, ExternalLink } from 'lucide-react';
import { RazorpayPaymentModal, RAZORPAY_PAYMENT_LINK_ID, RAZORPAY_PAYMENT_LINK_URL } from '../../components/RazorpayPaymentModal';

export const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderResult = location.state?.orderResult;
  const [showPayModal, setShowPayModal] = useState(false);

  if (!orderResult) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 font-serif mb-2">No active order found</h2>
        <p className="text-slate-600 mb-6 text-sm">Please check your order history to view past orders.</p>
        <Link to="/orders" className="px-6 py-2.5 bg-emerald-800 text-white font-semibold text-sm rounded-full inline-block">
          View My Orders
        </Link>
      </div>
    );
  }

  const { orders = [], grandTotal = 0 } = orderResult;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 font-serif mb-2">Order Placed Successfully!</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-8">
          Thank you for supporting local farmers directly! Your order has been registered and sent to the respective seller(s) for harvest & packing.
        </p>

        {/* Order Cards */}
        <div className="space-y-4 text-left mb-8">
          {orders.map((ord) => (
            <div key={ord.id || ord.orderNumber} className="border border-slate-200 rounded-xl p-5 bg-slate-50/60">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase">Order Number</span>
                  <div className="text-lg font-extrabold text-emerald-900 font-mono">{ord.orderNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Farmer Seller</span>
                  <div className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" /> {ord.sellerName}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>{ord.itemsCount} item(s) in sub-order</span>
                </div>
                <div className="text-emerald-900 font-black text-base">₹{ord.totalAmount?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Razorpay Payment Information Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl mb-8 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Razorpay Payment Integration</span>
                  <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold border border-blue-200">
                    {RAZORPAY_PAYMENT_LINK_ID}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {location.state?.razorpayPayment ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      ✓ Paid ₹{location.state.razorpayPayment.amount?.toLocaleString()} via Razorpay ({location.state.razorpayPayment.paymentId})
                    </span>
                  ) : (
                    <span>Flexible payment supported • Pay less or more than ₹100,000 anytime</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowPayModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5"
              >
                {location.state?.razorpayPayment ? 'View Razorpay Receipt' : 'Pay via Razorpay UI'}
              </button>

              <a
                href={RAZORPAY_PAYMENT_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Link
              </a>
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-8 text-xs text-emerald-900 font-medium text-left flex items-center gap-3">
          <Truck className="w-6 h-6 text-emerald-700 flex-shrink-0" />
          <div>
            <strong>Fulfillment Tracker:</strong> You can track live harvest, packing, and dispatch status of each order in your account dashboard.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2"
          >
            Track Orders <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/marketplace"
            className="px-8 py-3 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Marketplace
          </Link>
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      <RazorpayPaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        orderTotal={grandTotal || 100000}
        orderNumber={orders[0]?.orderNumber}
        customerPhone="+919508461241"
        customerEmail="saurabhsinghdeveloper591@gmail.com"
      />
    </div>
  );
};
export default OrderConfirmation;
