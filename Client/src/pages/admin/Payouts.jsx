import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  IndianRupee,
  Layers
} from 'lucide-react';
import { adminPayoutsApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Pending'); // default to pending queue
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await adminPayoutsApi.getPayouts({
        page,
        pageSize: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setPayouts(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load payouts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, statusFilter]);

  const handleProcess = async () => {
    if (!selectedPayout) return;
    try {
      setActionLoading(true);
      await adminPayoutsApi.processPayout(selectedPayout.id);
      notify.success(`Payout ${selectedPayout.payoutNumber} processed successfully.`, 'Payout Paid');
      setProcessModalOpen(false);
      setSelectedPayout(null);
      fetchPayouts();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to process payout.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFail = async (reason) => {
    if (!selectedPayout) return;
    try {
      setActionLoading(true);
      await adminPayoutsApi.markFailed(selectedPayout.id, reason);
      notify.warning(`Payout ${selectedPayout.payoutNumber} marked as Failed.`, 'Payout Failed');
      setFailModalOpen(false);
      setSelectedPayout(null);
      fetchPayouts();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to mark payout failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!selectedPayout) return;
    try {
      setActionLoading(true);
      await adminPayoutsApi.retryPayout(selectedPayout.id);
      notify.info(`Payout ${selectedPayout.payoutNumber} reset to Pending for retry.`, 'Payout Reset');
      setRetryModalOpen(false);
      setSelectedPayout(null);
      fetchPayouts();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to retry payout.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkProcess = async () => {
    try {
      setActionLoading(true);
      const pendingIds = payouts.filter((p) => p.status === 'Pending').map((p) => p.id);
      const res = await adminPayoutsApi.bulkProcess(pendingIds);
      notify.success(res.message || 'Bulk payouts processed successfully.', 'Bulk Settlement');
      setBulkModalOpen(false);
      fetchPayouts();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to process bulk payouts.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Payout #',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.payoutNumber}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Req: {new Date(p.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      )
    },
    {
      header: 'Farmer / Farm',
      render: (p) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.farmerName}</div>
          <div style={{ color: '#64748B' }}>{p.farmName || 'Farm'}</div>
        </div>
      )
    },
    {
      header: 'Amount',
      render: (p) => (
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
          ₹{p.amount?.toLocaleString()}
        </div>
      )
    },
    {
      header: 'Method',
      render: (p) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: '#F1F5F9',
            color: '#334155'
          }}
        >
          {p.method}
        </span>
      )
    },
    {
      header: 'Status',
      render: (p) => {
        const isPaid = p.status === 'Paid';
        const isFailed = p.status === 'Failed';
        return (
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
            {p.status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => navigate(`/admin/payouts/${p.id}`)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Eye size={12} /> View
          </button>

          {p.status === 'Pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedPayout(p);
                  setProcessModalOpen(true);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Mark Paid
              </button>
              <button
                onClick={() => {
                  setSelectedPayout(p);
                  setFailModalOpen(true);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Mark Failed
              </button>
            </>
          )}

          {p.status === 'Failed' && (
            <button
              onClick={() => {
                setSelectedPayout(p);
                setRetryModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <RotateCcw size={12} /> Retry
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
            Farmer Payouts Queue
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Process bank transfers & UPI remittances for farmer earnings from completed harvest deliveries.
          </p>
        </div>

        {statusFilter === 'Pending' && payouts.length > 0 && (
          <button
            onClick={() => setBulkModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
            }}
          >
            <Layers size={16} /> Bulk Process ({payouts.filter((p) => p.status === 'Pending').length})
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={payouts}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        isLoading={loading}
        toolbarActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {['Pending', 'Paid', 'Failed', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: statusFilter === st ? '1px solid #059669' : '1px solid #CBD5E1',
                  backgroundColor: statusFilter === st ? '#ECFDF5' : '#FFFFFF',
                  color: statusFilter === st ? '#059669' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {st === 'all' ? 'All Payouts' : st}
              </button>
            ))}
          </div>
        }
      />

      {/* Process Modal */}
      <ConfirmModal
        isOpen={processModalOpen}
        title={`Process Payout: ${selectedPayout?.payoutNumber}`}
        message={`Confirm remittance of ₹${selectedPayout?.amount?.toLocaleString()} to ${selectedPayout?.farmerName} via ${selectedPayout?.method}? This marks the withdrawal as Paid.`}
        confirmText="Confirm Payment"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleProcess}
        onCancel={() => {
          setProcessModalOpen(false);
          setSelectedPayout(null);
        }}
      />

      {/* Fail Modal */}
      <ReasonModal
        isOpen={failModalOpen}
        title={`Mark Payout Failed: ${selectedPayout?.payoutNumber}`}
        description="Specify why this remittance failed (e.g. invalid IFSC, beneficiary account frozen, bank network reject). Farmer will be notified."
        placeholder="Reason for payment failure..."
        confirmText="Mark as Failed"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleFail}
        onCancel={() => {
          setFailModalOpen(false);
          setSelectedPayout(null);
        }}
      />

      {/* Retry Modal */}
      <ConfirmModal
        isOpen={retryModalOpen}
        title={`Retry Payout: ${selectedPayout?.payoutNumber}`}
        message="Reset status back to Pending to attempt payment processing again?"
        confirmText="Reset to Pending"
        type="info"
        isLoading={actionLoading}
        onConfirm={handleRetry}
        onCancel={() => {
          setRetryModalOpen(false);
          setSelectedPayout(null);
        }}
      />

      {/* Bulk Process Modal */}
      <ConfirmModal
        isOpen={bulkModalOpen}
        title="Bulk Process Pending Payouts"
        message={`Mark all ${payouts.filter((p) => p.status === 'Pending').length} pending payouts on this page as Paid in one batch transaction?`}
        confirmText="Process All"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleBulkProcess}
        onCancel={() => setBulkModalOpen(false)}
      />
    </div>
  );
};

export default Payouts;
