import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  FileText
} from 'lucide-react';
import { adminVerificationsApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const Verifications = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending'); // default to pending queue
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedReq, setSelectedReq] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await adminVerificationsApi.getVerifications({
        page,
        pageSize: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load verifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVerifications();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleApprove = async () => {
    if (!selectedReq) return;
    try {
      setActionLoading(true);
      await adminVerificationsApi.approveVerification(selectedReq.id);
      notify.success(`Farmer ${selectedReq.farmerName} has been approved as Verified!`, 'Verification Approved');
      setApproveModalOpen(false);
      setSelectedReq(null);
      fetchVerifications();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to approve verification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!selectedReq) return;
    try {
      setActionLoading(true);
      await adminVerificationsApi.rejectVerification(selectedReq.id, reason);
      notify.info(`Verification request for ${selectedReq.farmerName} was rejected.`, 'Verification Rejected');
      setRejectModalOpen(false);
      setSelectedReq(null);
      fetchVerifications();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reject verification.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Farmer / Farm',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.farmerName}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{r.farmName || 'No farm name'}</div>
        </div>
      )
    },
    {
      header: 'Documents Submitted',
      render: (r) => (
        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
          <div>ID: <strong>{r.idType || 'Aadhaar'}</strong> ({r.idNumber ? `••••${r.idNumber.slice(-4)}` : 'Submitted'})</div>
          <div>Land: <strong>{r.landDocType || '7/12 Extract'}</strong></div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (r) => {
        const isApp = r.status === 'Approved';
        const isRej = r.status === 'Rejected';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isApp ? '#DCFCE7' : isRej ? '#FEE2E2' : '#E0F2FE',
              color: isApp ? '#15803D' : isRej ? '#B91C1C' : '#0369A1'
            }}
          >
            {r.status}
          </span>
        );
      }
    },
    {
      header: 'Submitted',
      render: (r) => (
        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
          {new Date(r.submittedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => navigate(`/admin/verifications/${r.id}`)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Eye size={13} /> Review Docs
          </button>

          {r.status === 'Pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedReq(r);
                  setApproveModalOpen(true);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={13} /> Approve
              </button>
              <button
                onClick={() => {
                  setSelectedReq(r);
                  setRejectModalOpen(true);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <XCircle size={13} /> Reject
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
          Farmer Verification Queue
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
          Examine government identity proofs, land records, and farm documentation before granting the Verified Farmer trust badge.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search farmer or farm name..."
        isLoading={loading}
        toolbarActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {['Pending', 'Approved', 'Rejected', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: statusFilter === st ? '1px solid #0284C7' : '1px solid #CBD5E1',
                  backgroundColor: statusFilter === st ? '#E0F2FE' : '#FFFFFF',
                  color: statusFilter === st ? '#0284C7' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {st === 'all' ? 'All Requests' : st}
              </button>
            ))}
          </div>
        }
      />

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={approveModalOpen}
        title={`Approve Farmer Verification: ${selectedReq?.farmerName}`}
        message="Are you confident that the identity documents and land records submitted are genuine? Approving will grant this producer the official Verified badge across the marketplace."
        confirmText="Approve Verification"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => {
          setApproveModalOpen(false);
          setSelectedReq(null);
        }}
      />

      {/* Reject Modal */}
      <ReasonModal
        isOpen={rejectModalOpen}
        title={`Reject Verification: ${selectedReq?.farmerName}`}
        description="Explain why this request is being rejected (e.g. illegible land document, mismatched identity name, blurry photo). The farmer will be notified to resubmit."
        placeholder="Reason for rejection..."
        confirmText="Reject Application"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setSelectedReq(null);
        }}
      />
    </div>
  );
};

export default Verifications;
