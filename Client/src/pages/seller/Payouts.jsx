import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  IndianRupee,
  Building,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Clock,
  RefreshCw,
  Edit2,
  Trash2
} from 'lucide-react';
import { payoutApi } from '../../services/payoutApi';
import { bankAccountApi } from '../../services/bankAccountApi';
import { PayoutRow } from '../../components/seller/PayoutRow';
import { KpiCard } from '../../components/seller/KpiCard';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';

export const Payouts = () => {
  const { refreshDashboard } = useSeller();

  const [summary, setSummary] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Payout request form
  const [requestAmount, setRequestAmount] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Bank account modal / form
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [submittingBank, setSubmittingBank] = useState(false);

  // Payout history filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sum, bank, list] = await Promise.all([
        payoutApi.getSummary(),
        bankAccountApi.getBankAccount(),
        payoutApi.getPayouts({
          page,
          pageSize: 10,
          status: statusFilter === 'All' ? undefined : statusFilter
        })
      ]);
      setSummary(sum);
      setBankAccount(bank);
      setPayouts(list?.items || []);
      setPayoutTotal(list?.total || 0);

      if (bank) {
        setBankForm({
          accountHolderName: bank.accountHolderName || '',
          bankName: bank.bankName || '',
          accountNumber: '',
          confirmAccountNumber: '',
          ifscCode: bank.ifscCode || '',
          upiId: bank.upiId || ''
        });
      }
    } catch (err) {
      console.error('Error loading payouts:', err);
      notify.error('Could not load payout data');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Payout Request
  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amount = parseFloat(requestAmount);
    const minPayout = summary?.minimumPayoutAmount || 500;
    const available = summary?.availableForPayout || 0;

    if (!bankAccount) {
      notify.error('Please add and verify your Bank Account before requesting a payout.');
      setShowBankModal(true);
      return;
    }

    if (isNaN(amount) || amount < minPayout) {
      notify.error(`Minimum withdrawal amount is ₹${minPayout}.`);
      return;
    }

    if (amount > available) {
      notify.error(`Requested amount exceeds available balance of ₹${available.toFixed(2)}.`);
      return;
    }

    try {
      setSubmittingPayout(true);
      await payoutApi.requestPayout({
        amount,
        notes: requestNotes.trim() || undefined
      });
      notify.success('Payout request submitted successfully! Processing in 1-2 business days.');
      setRequestAmount('');
      setRequestNotes('');
      loadData();
      refreshDashboard();
    } catch (err) {
      console.error('Error requesting payout:', err);
      notify.error(err?.response?.data?.message || 'Failed to request payout');
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Handle Mock Process Payout (Dev Simulation)
  const handleMockProcess = async (id) => {
    try {
      setProcessingId(id);
      await payoutApi.mockProcessPayout(id);
      notify.success('Dev Simulation: Payout has been marked as Paid! Funds transferred.');
      loadData();
      refreshDashboard();
    } catch (err) {
      console.error('Error mock processing payout:', err);
      notify.error(err?.response?.data?.message || 'Failed to mock process payout');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Bank Form Save
  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (!bankForm.accountHolderName.trim()) {
      notify.error('Account holder name is required.');
      return;
    }
    if (!bankForm.bankName.trim()) {
      notify.error('Bank name is required.');
      return;
    }
    if (!bankForm.accountNumber.trim()) {
      notify.error('Account number is required.');
      return;
    }
    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      notify.error('Account numbers do not match.');
      return;
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
    if (!ifscRegex.test(bankForm.ifscCode.trim())) {
      notify.error('Please enter a valid 11-character IFSC code (e.g. HDFC0001234).');
      return;
    }

    try {
      setSubmittingBank(true);
      await bankAccountApi.upsertBankAccount({
        accountHolderName: bankForm.accountHolderName.trim(),
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        ifscCode: bankForm.ifscCode.trim().toUpperCase(),
        upiId: bankForm.upiId.trim() || undefined
      });
      notify.success('Bank details saved successfully for payout disbursements.');
      setShowBankModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving bank account:', err);
      notify.error(err?.response?.data?.message || 'Failed to save bank account');
    } finally {
      setSubmittingBank(false);
    }
  };

  const available = summary?.availableForPayout || 0;
  const minPayout = summary?.minimumPayoutAmount || 500;
  const canRequest = bankAccount && available >= minPayout;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '1.85rem',
            fontWeight: 700,
            color: '#1B4D3E',
            margin: 0
          }}
        >
          Earnings & Payouts
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
          Transparent earnings breakdown, direct bank account settlements, and withdrawal history.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <KpiCard
          title="Available for Payout"
          value={`₹${available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtext={`Delivered orders ready for withdrawal`}
          icon={IndianRupee}
          accentColor="#059669"
          badgeText={available >= minPayout ? 'Ready' : 'Below Min'}
          badgeBg={available >= minPayout ? '#ECFDF5' : '#FEF2F2'}
          badgeColor={available >= minPayout ? '#065F46' : '#DC2626'}
        />

        <KpiCard
          title="Total Lifetime Earned"
          value={`₹${(summary?.totalEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtext="Delivered order volume"
          icon={Wallet}
          accentColor="#1B4D3E"
        />

        <KpiCard
          title="Total Paid Out"
          value={`₹${(summary?.totalPaidOut || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtext="Disbursed to bank account"
          icon={CheckCircle2}
          accentColor="#16A34A"
        />

        <KpiCard
          title="In-Processing Payouts"
          value={`₹${(summary?.pendingPayoutAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtext="Pending / clearance queue"
          icon={Clock}
          accentColor="#2563EB"
        />
      </div>

      {/* 2-Column Section: Bank Details & Payout Request Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Card 1: Bank Account Details */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#065F46'
                  }}
                >
                  <Building size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                  Settlement Bank Account
                </h3>
              </div>

              {bankAccount && (
                <button
                  onClick={() => setShowBankModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={13} /> Edit Details
                </button>
              )}
            </div>

            {bankAccount ? (
              <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                      Bank Name
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                      {bankAccount.bankName}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      height: 'fit-content'
                    }}
                  >
                    ✓ Linked
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Account Holder</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{bankAccount.accountHolderName}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Account Number</div>
                    <div style={{ fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.04em' }}>
                      {bankAccount.accountNumberMasked}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>IFSC Code</div>
                    <div style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                      {bankAccount.ifscCode}
                    </div>
                  </div>
                  {bankAccount.upiId && (
                    <div>
                      <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>UPI ID</div>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{bankAccount.upiId}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '2rem 1.5rem',
                  border: '1px dashed #D1D5DB',
                  borderRadius: '10px',
                  textAlign: 'center',
                  backgroundColor: '#FAFAF9'
                }}
              >
                <AlertCircle size={32} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                  No Bank Account Added Yet
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '4px 0 1rem 0' }}>
                  Add your primary savings or current account to receive payouts directly.
                </p>
                <button
                  onClick={() => setShowBankModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.55rem 1.1rem',
                    backgroundColor: '#1B4D3E',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle size={15} /> Add Bank Account
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#6B7280' }}>
            🔒 Bank account details are secured and used exclusively for direct NEFT/RTGS disbursements.
          </div>
        </div>

        {/* Card 2: Request Payout Form */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1D4ED8'
                }}
              >
                <Wallet size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                Request Withdrawal
              </h3>
            </div>

            <form onSubmit={handleRequestPayout}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                    Withdrawal Amount (₹)
                  </label>
                  <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                    Max: ₹{available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6B7280',
                      fontWeight: 700
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    min={minPayout}
                    max={available}
                    step="1"
                    placeholder={`Min. ₹${minPayout}`}
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#111827',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px' }}>
                  {[500, 2000, 5000].map((preset) => (
                    preset <= available && (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRequestAmount(String(preset))}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#F9FAFB',
                          fontSize: '0.75rem',
                          color: '#4B5563',
                          cursor: 'pointer'
                        }}
                      >
                        ₹{preset}
                      </button>
                    )
                  ))}
                  {available >= minPayout && (
                    <button
                      type="button"
                      onClick={() => setRequestAmount(String(Math.floor(available)))}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #A7F3D0',
                        backgroundColor: '#ECFDF5',
                        fontSize: '0.75rem',
                        color: '#065F46',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Withdraw Full Balance
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Withdrawal Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. October harvest disbursement"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingPayout || !canRequest}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: canRequest ? '#1B4D3E' : '#9CA3AF',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: canRequest ? 'pointer' : 'not-allowed',
                  boxShadow: canRequest ? '0 2px 5px rgba(27,77,62,0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {submittingPayout ? (
                  'Submitting...'
                ) : (
                  <>
                    <IndianRupee size={16} /> Request Withdrawal
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
            Withdrawals are credited directly to your registered bank account. Minimum ₹{minPayout} required.
          </div>
        </div>
      </div>

      {/* Payout History Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
              Payout History & Audit Log
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Complete record of all withdrawals, timestamps, and settlement transaction IDs.
            </span>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['All', 'Pending', 'Processing', 'Paid', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: statusFilter === status ? 700 : 500,
                  backgroundColor: statusFilter === status ? '#1B4D3E' : '#F3F4F6',
                  color: statusFilter === status ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {payouts.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.88rem' }}>
            No payouts found for this filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Payout ID / Req</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Method / Target</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Paid Date / Ref</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Dev Simulation</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((po) => (
                  <PayoutRow
                    key={po.id}
                    payout={po}
                    onMockProcess={handleMockProcess}
                    isProcessing={processingId === po.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bank Account Modal */}
      {showBankModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1B4D3E' }}>
                {bankAccount ? 'Update Settlement Bank Account' : 'Add Bank Account'}
              </h3>
              <button
                onClick={() => setShowBankModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9CA3AF' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Account Holder Name (As in Bank Passbook) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India, HDFC Bank"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Account Number *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account #"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Confirm Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Re-enter account #"
                    value={bankForm.confirmAccountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="e.g. HDFC0001234"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ramesh@okaxis"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBank}
                  style={{
                    padding: '0.6rem 1.3rem',
                    borderRadius: '6px',
                    backgroundColor: '#1B4D3E',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submittingBank ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingBank ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
