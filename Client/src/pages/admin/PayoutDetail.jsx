import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  CheckCircle2,
  XCircle,
  RotateCcw,
  IndianRupee,
  RefreshCw,
  Building,
  User
} from 'lucide-react';
import { adminPayoutsApi } from '../../services/adminApi';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const PayoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await adminPayoutsApi.getPayoutDetail(id);
      setPayout(res);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load payout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleProcess = async () => {
    try {
      setActionLoading(true);
      await adminPayoutsApi.processPayout(id);
      notify.success('Payout marked as Paid.');
      setProcessModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to process payout.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFail = async (reason) => {
    try {
      setActionLoading(true);
      await adminPayoutsApi.markFailed(id, reason);
      notify.warning('Payout marked as Failed.');
      setFailModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to mark payout failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setActionLoading(true);
      await adminPayoutsApi.retryPayout(id);
      notify.info('Payout reset to Pending.');
      setRetryModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to retry payout.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Payout Records...</div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Payout Not Found</h2>
        <button
          onClick={() => navigate('/admin/payouts')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: '#0F172A', color: '#FFF' }}
        >
          Back to Payouts
        </button>
      </div>
    );
  }

  const isPending = payout.status === 'Pending';
  const isPaid = payout.status === 'Paid';
  const isFailed = payout.status === 'Failed';

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' }}>
      <button
        onClick={() => navigate('/admin/payouts')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.4rem 0.8rem',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          backgroundColor: '#FFFFFF',
          color: '#475569',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Payouts
      </button>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                Payout {payout.payoutNumber}
              </h1>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: isPaid ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#FEF3C7',
                  color: isPaid ? '#15803D' : isFailed ? '#B91C1C' : '#B45309'
                }}
              >
                {payout.status}
              </span>
            </div>
            <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
              Farmer: <strong>{payout.farmerName}</strong> ({payout.farmName || 'Farm'}) • Method: <strong>{payout.method}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isPending && (
              <>
                <button
                  onClick={() => setProcessModalOpen(true)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => setFailModalOpen(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #FECACA',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Mark as Failed
                </button>
              </>
            )}

            {isFailed && (
              <button
                onClick={() => setRetryModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={14} /> Retry Payout
              </button>
            )}
          </div>
        </div>

        {/* Amount & Bank Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.85rem'
          }}
        >
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>Remittance Amount</span>
            <strong style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: 800 }}>
              ₹{payout.amount?.toLocaleString()}
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>Requested At</span>
            <strong style={{ color: '#0F172A' }}>
              {new Date(payout.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </strong>
          </div>
          {payout.paidAt && (
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Settled / Paid At</span>
              <strong style={{ color: '#15803D' }}>
                {new Date(payout.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </strong>
            </div>
          )}
          {payout.reference && (
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Transaction Reference</span>
              <strong style={{ color: '#0F172A' }}>{payout.reference}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Failure Reason */}
      {payout.failureReason && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991B1B',
            fontSize: '0.85rem'
          }}
        >
          <strong>Failure Reason:</strong> {payout.failureReason}
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={processModalOpen}
        title="Confirm Payout Settlement"
        message={`Confirm that ₹${payout.amount?.toLocaleString()} has been remitted to ${payout.farmerName}?`}
        confirmText="Confirm Paid"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleProcess}
        onCancel={() => setProcessModalOpen(false)}
      />

      <ReasonModal
        isOpen={failModalOpen}
        title="Mark Payout Failed"
        description="Specify why this payout remittance failed."
        confirmText="Mark Failed"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleFail}
        onCancel={() => setFailModalOpen(false)}
      />

      <ConfirmModal
        isOpen={retryModalOpen}
        title="Retry Payout"
        message="Reset status back to Pending for retry?"
        confirmText="Reset to Pending"
        type="info"
        isLoading={actionLoading}
        onConfirm={handleRetry}
        onCancel={() => setRetryModalOpen(false)}
      />
    </div>
  );
};

export default PayoutDetail;
