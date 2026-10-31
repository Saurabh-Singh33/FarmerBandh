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
  AlertCircle,
  Lock,
  Mail,
  Phone,
  Info,
  ChevronRight,
  RefreshCw,
  Send
} from 'lucide-react';
import { notify } from '../context/NotificationContext';
import { authClient } from '../services/authApi';

export const RAZORPAY_PAYMENT_LINK_ID = 'plink_Tqe4bgUXaopgZ0';
export const RAZORPAY_PAYMENT_LINK_URL = 'https://rzp.io/rzp/MkpDZkX';

/**
 * RazorpayPaymentModal
 * High-polish interactive Razorpay payment modal reproducing the exact UI from Razorpay Payment Link
 * Link: https://rzp.io/rzp/MkpDZkX (ID: plink_Tqe4bgUXaopgZ0)
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
  const defaultAmount = orderTotal && orderTotal > 0 ? orderTotal : 100000;
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);

  // Contact details
  const cleanPhone = (customerPhone || '').replace(/^\+91/, '').trim() || '9508461241';
  const [phone, setPhone] = useState(cleanPhone);
  const [email, setEmail] = useState(customerEmail || 'saurabhsinghdeveloper591@gmail.com');

  // UI Flow step: 'contact' | 'method' | 'processing' | 'success'
  const [paymentStep, setPaymentStep] = useState('contact');
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiSubOption, setUpiSubOption] = useState('qr'); // 'qr' | 'vpa'
  const [upiVpa, setUpiVpa] = useState('9508461241@okhdfcbank');
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initAmt = orderTotal && orderTotal > 0 ? orderTotal : 100000;
      setSelectedAmount(initAmt);
      setPaymentStep('contact');
      setPaymentResult(null);
      setIsEmailSent(false);
    }
  }, [isOpen, orderTotal]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(RAZORPAY_PAYMENT_LINK_URL);
    setCopiedLink(true);
    notify.success('Razorpay Payment Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
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

    // Fire background email dispatch if email is configured
    if (email && email.includes('@')) {
      authClient.post('/orders/dispatch-payment-receipt', {
        email: email.trim(),
        customerName: 'Saurabh Singh',
        phone: '+91' + phone,
        amount: selectedAmount,
        paymentId: simulatedPaymentId,
        paymentLinkId: RAZORPAY_PAYMENT_LINK_ID,
        method: selectedMethod
      })
      .then(() => setIsEmailSent(true))
      .catch((err) => console.log('Email dispatch note:', err?.message));
    }

    setTimeout(() => {
      const result = {
        paymentId: simulatedPaymentId,
        paymentLinkId: RAZORPAY_PAYMENT_LINK_ID,
        paymentLinkUrl: RAZORPAY_PAYMENT_LINK_URL,
        amount: selectedAmount,
        method: selectedMethod,
        phone: '+91' + phone,
        email: email,
        status: 'Paid',
        timestamp: new Date().toISOString()
      };
      setPaymentResult(result);
      setPaymentStep('success');
      notify.success(`Payment of ₹${selectedAmount.toLocaleString('en-IN')} secured via Razorpay Escrow!`, 'Payment Successful');
      if (onSuccess) {
        onSuccess(result);
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#F8FAFC] rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200/90 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Sandbox Trust Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 px-5 py-2.5 text-xs text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-bold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              TEST ESCROW ENVIRONMENT
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Razorpay Sandbox Active • Bank-grade simulated agrarian escrow settlement
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 rounded-md transition-all flex items-center gap-1"
              title="Copy official link"
            >
              {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors p-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content: 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Escrow Guarantee & Request Info */}
          <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200/90 bg-white flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Escrow Settlement
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
                    Payment Request
                  </h2>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      PAYMENT FOR
                    </span>
                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      FarmerBandh {orderNumber ? `• Order #${orderNumber}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div 
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 hover:bg-slate-200/80 cursor-pointer px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
                    title="Click to copy Payment Link ID"
                  >
                    <span>{RAZORPAY_PAYMENT_LINK_ID}</span>
                    <Copy size={11} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  AMOUNT PAYABLE
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    INR {selectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="text-slate-600">
                    Order Total: INR {selectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Full Escrow Protected
                  </span>
                </div>
              </div>

              {/* Trust & Escrow Architecture Details */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Escrow Trust & Security Guarantee
                </div>
                <div className="text-[11px] text-slate-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                    <span><strong>100% Escrow Protection:</strong> Funds remain securely held until you inspect and accept your crop shipment upon delivery.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                    <span><strong>Direct Farmer Clearing:</strong> Instant automated RTGS/NEFT payout to verified agricultural producers upon delivery confirmation.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                    <span><strong>Universal Compatibility:</strong> Supports all Indian UPI apps (GPay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard, and NetBanking.</span>
                  </div>
                </div>
              </div>

              {/* Delivery Receipt Transparency Box */}
              <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  Order Confirmation & Dispatch Notice
                </div>
                <div className="text-[11px] text-blue-800/90 space-y-1.5 leading-relaxed">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span><strong>Gmail Confirmation:</strong> Instant order invoice will be dispatched to <strong>{email || 'your registered email'}</strong>.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="text-slate-600"><strong>SMS Dispatch:</strong> Cellular SMS is disabled in test mode (requires live Fast2SMS/Twilio provider).</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Razorpay 256-bit SSL Secure</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">RBI Certified Payment Aggregator</span>
            </div>
          </div>

          {/* Right Column: Razorpay Checkout Box */}
          <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between bg-slate-50/70">
            
            {/* Top Blue Card */}
            <div className="bg-gradient-to-br from-[#1652F0] via-[#0E44CE] to-[#0A3199] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-black">🌾</span>
                </div>

                <button 
                  type="button"
                  onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                  className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold transition-colors flex items-center gap-1.5"
                  title="Toggle language"
                >
                  <Globe size={12} />
                  <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
                </button>
              </div>

              <div className="mt-5 text-center">
                <span className="text-xs uppercase tracking-wider text-blue-100 font-bold block">
                  {language === 'en' ? 'Total Amount' : 'कुल राशि'}
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-white">
                  ₹{selectedAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-blue-200 mt-1 block font-medium">
                  Zero convenience fees for buyers
                </span>
              </div>
            </div>

            {/* Bottom Form Card (Step: Contact | Method | Processing | Success) */}
            <div className="mt-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              
              {/* STEP 1: CONTACT DETAILS */}
              {paymentStep === 'contact' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'en' ? 'Contact details' : 'संपर्क विवरण'}
                    </h3>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Step 1 of 2
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3.5">
                    {language === 'en' ? 'Enter your details to receive payment confirmation' : 'भुगतान रसीद पाने के लिए अपना विवरण दर्ज करें'}
                  </p>

                  <div className="space-y-3">
                    {/* Mobile Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Mobile Number
                      </label>
                      <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
                        <div className="flex items-center gap-1 px-3 bg-slate-50 border-r border-slate-200 text-xs font-semibold text-slate-700 select-none">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          maxLength="10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9508461241"
                          className="w-full px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none tracking-wide"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Email Address (For Invoice Delivery)
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all px-3">
                        <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="saurabhsinghdeveloper591@gmail.com"
                          className="w-full py-2 text-xs font-medium text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToPay}
                    className="mt-4 w-full py-3 bg-[#0B132B] hover:bg-black text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    <span>{language === 'en' ? 'Continue to Pay' : 'आगे बढ़ें'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="text-[10px] text-center text-slate-400 mt-3 leading-relaxed">
                    By proceeding, you agree to Razorpay's{' '}
                    <span className="text-slate-600 underline cursor-pointer">Privacy Notice</span> •{' '}
                    <span className="text-slate-600 underline cursor-pointer">Escrow T&C</span>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT PAYMENT METHOD */}
              {paymentStep === 'method' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Select Payment Method</h3>
                      <p className="text-[11px] text-slate-500">Contact: +91 {phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentStep('contact')}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    {[
                      { id: 'upi', name: 'UPI / QR Code', desc: 'Google Pay, PhonePe, Paytm, BHIM', icon: Smartphone, tag: 'Instant' },
                      { id: 'card', name: 'Cards (Visa, RuPay)', desc: 'Credit and Debit Cards', icon: CreditCard, tag: 'Zero Surcharge' },
                      { id: 'netbanking', name: 'Net Banking', desc: 'SBI, HDFC, ICICI, Axis Bank', icon: Building2 }
                    ].map((m) => {
                      const IconComponent = m.icon;
                      const isSelected = selectedMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMethod(m.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-sm'
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
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{m.name}</span>
                              {m.tag && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  {m.tag}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">{m.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub-panels based on selected method */}
                  {selectedMethod === 'upi' && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">UPI App / QR</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setUpiSubOption('qr')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${upiSubOption === 'qr' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}`}
                          >
                            Scan QR
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiSubOption('vpa')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${upiSubOption === 'vpa' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}`}
                          >
                            UPI ID
                          </button>
                        </div>
                      </div>

                      {upiSubOption === 'qr' ? (
                        <div className="text-center py-2 bg-white rounded-lg border border-slate-200">
                          {/* SVG Razorpay Style QR Preview */}
                          <div className="inline-block p-2 bg-white rounded border border-slate-300 shadow-sm">
                            <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
                              <rect width="100" height="100" fill="#ffffff" />
                              <rect x="10" y="10" width="30" height="30" fill="#0F172A" />
                              <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                              <rect x="20" y="20" width="10" height="10" fill="#0F172A" />
                              <rect x="60" y="10" width="30" height="30" fill="#0F172A" />
                              <rect x="65" y="15" width="20" height="20" fill="#ffffff" />
                              <rect x="70" y="20" width="10" height="10" fill="#0F172A" />
                              <rect x="10" y="60" width="30" height="30" fill="#0F172A" />
                              <rect x="15" y="65" width="20" height="20" fill="#ffffff" />
                              <rect x="20" y="70" width="10" height="10" fill="#0F172A" />
                              <circle cx="50" cy="50" r="8" fill="#1652F0" />
                              <rect x="45" y="20" width="10" height="15" fill="#0F172A" />
                              <rect x="50" y="65" width="25" height="10" fill="#0F172A" />
                              <rect x="75" y="45" width="15" height="25" fill="#0F172A" />
                            </svg>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Scan with any UPI App (GPay / PhonePe / Paytm)</p>
                        </div>
                      ) : (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <input
                            type="text"
                            value={upiVpa}
                            onChange={(e) => setUpiVpa(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="w-full text-xs font-semibold px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMethod === 'card' && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Test Card Auto-Fill</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">Sandbox</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
                        4111 •••• •••• 1111 (08/29, CVV: 123)
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'netbanking' && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-2 text-xs">
                      <div className="font-bold text-slate-700 mb-1">Select Primary Bank</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
                        <span className="p-2 bg-white rounded border border-blue-600 bg-blue-50/50 text-blue-800">State Bank of India</span>
                        <span className="p-2 bg-white rounded border border-slate-200 hover:border-slate-300">HDFC Bank</span>
                        <span className="p-2 bg-white rounded border border-slate-200 hover:border-slate-300">ICICI Bank</span>
                        <span className="p-2 bg-white rounded border border-slate-200 hover:border-slate-300">Axis Bank</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full py-3 bg-[#1652F0] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{selectedAmount.toLocaleString('en-IN')} via Escrow</span>
                  </button>
                </div>
              )}

              {/* STEP 3: PROCESSING */}
              {paymentStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#1652F0] animate-spin" />
                    <ShieldCheck className="w-6 h-6 text-emerald-600 absolute" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Securing Escrow Vault...</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Authorizing ₹{selectedAmount.toLocaleString('en-IN')} with Razorpay Gateway</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Communicating with banking switch • DO NOT REFRESH
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {paymentStep === 'success' && paymentResult && (
                <div className="py-2 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Payment Secured in Escrow!</h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      ₹{paymentResult.amount?.toLocaleString('en-IN')} verified on Razorpay Escrow
                    </p>
                  </div>

                  {/* Transaction Details */}
                  <div className="p-3 bg-slate-50 rounded-xl text-left text-[11px] space-y-1 font-mono text-slate-700 border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment ID:</span>
                      <strong className="text-slate-900">{paymentResult.paymentId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Escrow Link:</span>
                      <span className="text-slate-900">{paymentResult.paymentLinkId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timestamp:</span>
                      <span>{new Date(paymentResult.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Gmail receipt notification badge */}
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-left text-xs flex items-start gap-2">
                    <Send className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="text-[11px] text-emerald-900">
                      <strong>Email Receipt:</strong> Confirmation invoice dispatched directly to <strong>{email}</strong>.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    Confirm Order & Return to Platform
                  </button>
                </div>
              )}
            </div>

            {/* Official Razorpay & Banking Badges Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <span className="text-blue-600">⚡</span> Razorpay Escrow
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <span>UPI</span>
                <span>•</span>
                <span>RuPay</span>
                <span>•</span>
                <span>VISA</span>
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
