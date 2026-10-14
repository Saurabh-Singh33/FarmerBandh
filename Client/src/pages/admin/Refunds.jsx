import React, { useEffect, useState } from 'react';
import { RotateCcw, CheckCircle2, XCircle, Search, IndianRupee } from 'lucide-react';
import { adminRefundsApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await adminRefundsApi.getRefunds({
        page,
        pageSize: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setRefunds(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load refunds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [page, statusFilter]);

  const handleProcess = async () => {
    if (!selectedRefund) return;
    try {
      setActionLoading(true);
      await adminRefundsApi.processRefund(selectedRefund.id);
      notify.success('Refund processed successfully.', 'Refund Paid');
      setProcessModalOpen(false);
      setSelectedRefund(null);
      fetchRefunds();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to process refund.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFail = async (reason) => {
    if (!selectedRefund) return;
    try {
      setActionLoading(true);
      await adminRefundsApi.failRefund(selectedRefund.id, reason);
      notify.warning('Refund marked as Failed.', 'Refund Failed');
      setFailModalOpen(false);
      setSelectedRefund(null);
      fetchRefunds();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to mark refund failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Refund & Order',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>Order: {r.orderNumber}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Ref: {r.reference || 'Auto Refund'}</div>
        </div>
      )
    },
    {
      header: 'Buyer',
      render: (r) => (
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
          {r.buyerName}
        </span>
      )
    },
    {
      header: 'Amount',
      render: (r) => (
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
          ₹{r.amount?.toLocaleString()}
        </div>
      )
    },
    {
      header: 'Status',
      render: (r) => {
        const isProc = r.status === 'Processed' || r.status === 'Paid';
        const isFailed = r.status === 'Failed';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isProc ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#FEF3C7',
              color: isProc ? '#15803D' : isFailed ? '#B91C1C' : '#B45309'
            }}
          >
            {r.status}
          </span>
        );
      }
    },
    {
      header: 'Date',
      render: (r) => (
        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          {r.status === 'Pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedRefund(r);
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
                Process Refund
              </button>
              <button
                onClick={() => {
                  setSelectedRefund(r);
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
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
          Refunds Processing
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
          Monitor and process customer repayments triggered by returned harvests, dispute arbitration, or order cancellations.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={refunds}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        isLoading={loading}
        toolbarActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {['Pending', 'Processed', 'Failed', 'all'].map((st) => (
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
                {st === 'all' ? 'All Refunds' : st}
              </button>
            ))}
          </div>
        }
      />

      {/* Process Modal */}
      <ConfirmModal
        isOpen={processModalOpen}
        title="Process Refund"
        message={`Confirm execution of ₹${selectedRefund?.amount?.toLocaleString()} refund to buyer ${selectedRefund?.buyerName}?`}
        confirmText="Execute Refund"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleProcess}
        onCancel={() => {
          setProcessModalOpen(false);
          setSelectedRefund(null);
        }}
      />

      {/* Fail Modal */}
      <ReasonModal
        isOpen={failModalOpen}
        title="Mark Refund Failed"
        description="Provide a reason for marking this refund transaction as failed."
        confirmText="Mark Failed"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleFail}
        onCancel={() => {
          setFailModalOpen(false);
          setSelectedRefund(null);
        }}
      />
    </div>
  );
};

export default Refunds;
