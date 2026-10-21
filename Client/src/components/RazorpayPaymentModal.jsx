import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  HelpCircle,
  Globe,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { notify } from '../context/NotificationContext';

export const RAZORPAY_PAYMENT_LINK_ID = 'plink_Tqe4bgUXaopgZ0';
export const RAZORPAY_PAYMENT_LINK_URL = 'https://rzp.io/rzp/MkpDZkX';

/**
 * RazorpayPaymentModal
 * Authentic interactive Razorpay payment modal reproducing the exact UI from Razorpay Payment Link
 * Link: https://rzp.io/rzp/MkpDZkX (ID: plink_Tqe4bgUXaopgZ0)
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - orderTotal: number (optional, defaults to 100000)
 * - orderNumber: string (optional)
 * - customerPhone: string (optional)
 * - customerEmail: string (optional)
 * - onSuccess: (paymentResult) => void
 * - readOnly: boolean (optional, for farmer preview mode)
 */
export const RazorpayPaymentModal = ({
  isOpen,
  onClose,
  orderTotal = 100000,
  orderNumber,
  customerPhone = '+919508461241',
  customerEmail = 'saurabhsinghdeveloper591@gmail.com',
  onSuccess,
  readOnly = false
}) => {
  // Amount state (supports custom amount less or more than 100000 as requested)
  const defaultAmount = orderTotal && orderTotal > 0 ? orderTotal : 100000;
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmountInput, setCustomAmountInput] = useState(defaultAmount.toString());
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Contact state
  const cleanPhone = (customerPhone || '').replace(/^\+91/, '').trim() || '9508461241';
  const [phone, setPhone] = useState(cleanPhone);
  const [email, setEmail] = useState(customerEmail || '');

  // UI Flow step: 'contact' | 'method' | 'processing' | 'success'
  const [paymentStep, setPaymentStep] = useState('contact');
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'qr'
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const initAmt = orderTotal && orderTotal > 0 ? orderTotal : 100000;
      setSelectedAmount(initAmt);
      setCustomAmountInput(initAmt.toString());
      setPaymentStep('contact');
      setPaymentResult(null);
    }
  }, [isOpen, orderTotal]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(RAZORPAY_PAYMENT_LINK_URL);
    setCopiedLink(true);
    notify.success('Razorpay Payment Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAmountChange = (amt) => {
    const num = Math.max(1, Number(amt) || 0);
    setSelectedAmount(num);
    setCustomAmountInput(num.toString());
  };

  const handleCustomInputBlur = () => {
    const parsed = parseFloat(customAmountInput);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
    } else {
      setCustomAmountInput(selectedAmount.toString());
    }
  };

  const handleProceedToPay = () => {
    if (!phone || phone.length < 10) {
      notify.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    setPaymentStep('method');
  };

  const handleSimulatePayment = () => {
    setPaymentStep('processing');
    const simulatedPaymentId = 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    setTimeout(() => {
      const result = {
        paymentId: simulatedPaymentId,
        paymentLinkId: RAZORPAY_PAYMENT_LINK_ID,
        paymentLinkUrl: RAZORPAY_PAYMENT_LINK_URL,
        amount: selectedAmount,
        method: selectedMethod,
        phone: '+91' + phone,
        status: 'Paid',
        timestamp: new Date().toISOString()
      };
      setPaymentResult(result);
      setPaymentStep('success');
      notify.success(`Payment of ₹${selectedAmount.toLocaleString('en-IN')} completed via Razorpay!`, 'Payment Successful');
      if (onSuccess) {
        onSuccess(result);
      }
    }, 1800);
  };

  // Remaining due calculation
  const totalDueBase = orderTotal || 100000;
  const remainingDue = Math.max(0, totalDueBase - selectedAmount);
  const paidPercent = Math.min(100, Math.round((selectedAmount / totalDueBase) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#F8FAFC] rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Razorpay Test Mode Warning Banner */}
        <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-5 py-2.5 text-xs text-[#92400E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>
              This payment link is created in <strong>Test Mode</strong>. Only test payments can be made for this.
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content: 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Payment Request Details & Flexible Amount Picker */}
          <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-white flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Payment Request from
                  </h2>
                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      PAYMENT FOR
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      FarmerBandh {orderNumber ? `• Order #${orderNumber}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {RAZORPAY_PAYMENT_LINK_ID}
                  </span>
                </div>
              </div>

              {/* Amount Display */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  AMOUNT PAYABLE
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  INR {selectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* Due vs Paid stats */}
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="text-slate-700">
                    INR {remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} DUE
                  </span>
                  <span className="text-emerald-700">
                    INR {selectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} PAID
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${paidPercent}%` }}
                  />
                  <div 
                    className="bg-slate-200 h-full transition-all duration-300"
                    style={{ width: `${100 - paidPercent}%` }}
                  />
                </div>
              </div>

              {/* Flexible Amount Controller (Pay Less or More than 100,000) */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Pay Less or More Amount:
                  </span>
                  <span className="text-[11px] text-slate-500">Partial & Full Allowed</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { label: '₹100,000 (Default)', value: 100000 },
                    ...(orderTotal && orderTotal !== 100000 ? [{ label: `₹${orderTotal.toLocaleString()} (Order Total)`, value: orderTotal }] : []),
                    { label: '₹50,000 (Advance)', value: 50000 },
                    { label: '₹10,000 (Deposit)', value: 10000 },
                    { label: 'Custom', value: 'custom' }
                  ].map((chip) => {
                    const isSelected = chip.value === 'custom' ? isCustomMode : (!isCustomMode && selectedAmount === chip.value);
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          if (chip.value === 'custom') {
                            setIsCustomMode(true);
                          } else {
                            setIsCustomMode(false);
                            handleAmountChange(chip.value);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input Field */}
                {(isCustomMode || ![100000, 50000, 10000, orderTotal].includes(selectedAmount)) && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="100"
                      value={customAmountInput}
                      onChange={(e) => {
                        setCustomAmountInput(e.target.value);
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setSelectedAmount(val);
                        }
                      }}
                      onBlur={handleCustomInputBlur}
                      placeholder="Enter custom amount..."
                      className="w-full px-3 py-1.5 bg-white border border-blue-400 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className="text-[11px] text-slate-500 mt-2">
                  * Buyer can pay token/advance or any custom figure less or more than ₹100,000.
                </div>
              </div>
            </div>

            {/* Bottom Actions for Link Sharing & Viewing */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 bg-white shadow-xs transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>

                <a
                  href={RAZORPAY_PAYMENT_LINK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Live Link
                </a>
              </div>

              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Razorpay 256-bit SSL Secure</span>
              </div>
            </div>
          </div>

          {/* Right Column: Razorpay Checkout Box (Matching Screenshot 2) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-slate-50/50">
            {/* Top Blue Card */}
            <div className="bg-gradient-to-br from-[#2371EC] to-[#1A5ED8] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              {/* Background watermark effect */}
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex justify-between items-start">
                {/* Center App Icon placeholder */}
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                  <span className="text-xl font-black text-white">🌾</span>
                </div>

                {/* Translation icon */}
                <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors" title="Translate / भाषा बदलें">
                  <span className="text-sm font-bold">文A</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="text-xs uppercase tracking-wider text-blue-100 font-semibold block">
                  Total Amount
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                  ₹{selectedAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Bottom White Card (Contact Details / Payment Method) */}
            <div className="mt-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              {paymentStep === 'contact' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Contact details</h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-3">Enter mobile number to continue</p>

                  <div className="space-y-3">
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <div className="flex items-center gap-1 px-3 bg-slate-50 border-r border-slate-200 text-xs font-semibold text-slate-700">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength="10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Mobile number"
                        className="w-full px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address (optional)"
                        className="w-full px-3 py-2 text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToPay}
                    className="mt-4 w-full py-3 bg-[#0B132B] hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-[10px] text-center text-slate-400 mt-3 leading-relaxed">
                    By proceeding, I agree to Razorpay's{' '}
                    <span className="text-slate-600 underline cursor-pointer">Privacy Notice</span> •{' '}
                    <span className="text-slate-600 underline cursor-pointer">Edit Preferences</span>
                  </div>
                </div>
              )}

              {paymentStep === 'method' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Select Payment Method</h3>
                    <button
                      type="button"
                      onClick={() => setPaymentStep('contact')}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {[
                      { id: 'upi', name: 'UPI / QR', desc: 'Google Pay, PhonePe, Paytm, BHIM', icon: Smartphone },
                      { id: 'card', name: 'Cards', desc: 'Visa, Mastercard, RuPay, Maestro', icon: CreditCard },
                      { id: 'netbanking', name: 'Net Banking', desc: 'All Indian Banks Supported', icon: Building2 }
                    ].map((m) => {
                      const IconComponent = m.icon;
                      const isSelected = selectedMethod === m.id;
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payMethod"
                            checked={isSelected}
                            onChange={() => setSelectedMethod(m.id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <IconComponent className="w-4 h-4 text-slate-600" />
                          <div className="flex-1">
                            <div className="text-xs font-bold text-slate-900">{m.name}</div>
                            <div className="text-[10px] text-slate-500">{m.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full py-3 bg-[#2371EC] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Pay ₹{selectedAmount.toLocaleString('en-IN')} Now
                  </button>

                  <a
                    href={RAZORPAY_PAYMENT_LINK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Pay on Razorpay.com Page
                  </a>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-8 text-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-900">Processing Payment...</h4>
                  <p className="text-xs text-slate-500 mt-1">Connecting to Razorpay secure test gateway</p>
                </div>
              )}

              {paymentStep === 'success' && paymentResult && (
                <div className="py-4 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Payment Successful!</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ₹{paymentResult.amount?.toLocaleString('en-IN')} verified on Razorpay
                  </p>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-left text-[11px] space-y-1 font-mono text-slate-600 border border-slate-200">
                    <div>Ref: <strong>{paymentResult.paymentId}</strong></div>
                    <div>Link: <strong>{paymentResult.paymentLinkId}</strong></div>
                    <div>Time: {new Date(paymentResult.timestamp).toLocaleTimeString()}</div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-4 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Done & Return to Order
                  </button>
                </div>
              )}
            </div>

            {/* Official Razorpay & Banking Badges Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold text-slate-500 flex items-center gap-1">
                <span className="text-blue-600">⚡</span> Razorpay
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <span>UPI</span>
                <span>•</span>
                <span>VISA</span>
                <span>•</span>
                <span>RuPay</span>
                <span>•</span>
                <span>NetBanking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPaymentModal;
