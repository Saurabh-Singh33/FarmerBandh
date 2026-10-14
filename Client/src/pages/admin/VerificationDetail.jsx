import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  MapPin,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { adminVerificationsApi } from '../../services/adminApi';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const VerificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await adminVerificationsApi.getVerificationDetail(id);
      setData(res);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load verification detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await adminVerificationsApi.approveVerification(id);
      notify.success('Farmer verification approved successfully.', 'Verified');
      setApproveModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to approve verification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setActionLoading(true);
      await adminVerificationsApi.rejectVerification(id, reason);
      notify.info('Verification rejected with feedback sent to farmer.', 'Rejected');
      setRejectModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reject verification.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Verification Application...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Verification Record Not Found</h2>
        <button
          onClick={() => navigate('/admin/verifications')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#0F172A',
            color: '#FFF',
            cursor: 'pointer'
          }}
        >
          Back to Queue
        </button>
      </div>
    );
  }

  const isPending = data.status === 'Pending';
  const isApproved = data.status === 'Approved';
  const isRejected = data.status === 'Rejected';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <button
        onClick={() => navigate('/admin/verifications')}
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
        <ArrowLeft size={16} /> Back to Verifications
      </button>

      {/* Main Status & Action Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
              {data.farmerName} — Verification Application
            </h1>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#E0F2FE',
                color: isApproved ? '#15803D' : isRejected ? '#B91C1C' : '#0369A1'
              }}
            >
              {data.status}
            </span>
          </div>
          <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Farm: <strong>{data.farmName || 'N/A'}</strong> • Submitted on{' '}
            {new Date(data.submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Action Buttons if Pending */}
        {isPending && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setRejectModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <XCircle size={16} /> Reject Application
            </button>
            <button
              onClick={() => setApproveModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
              }}
            >
              <CheckCircle2 size={16} /> Approve & Verify
            </button>
          </div>
        )}
      </div>

      {/* Review Notes or Rejection Reason Banner if resolved */}
      {data.rejectionReason && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <AlertTriangle size={20} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.9rem' }}>
              Rejection Reason Recorded:
            </div>
            <div style={{ color: '#7F1D1D', fontSize: '0.85rem', marginTop: '2px' }}>
              {data.rejectionReason}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Documents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Identity Document Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <FileText size={18} color="#0284C7" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              Government ID Proof
            </h3>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.6 }}>
            <div>Document Type: <strong>{data.idType || 'Aadhaar / Voter ID'}</strong></div>
            <div>Document ID: <strong>{data.idNumber || 'Not provided'}</strong></div>
          </div>

          {data.idDocumentUrl ? (
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
              <img
                src={data.idDocumentUrl}
                alt="ID Document"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', textAlign: 'right' }}>
                <a
                  href={data.idDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: '#0284C7',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  View Full Image <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#94A3B8', fontSize: '0.85rem' }}>
              Document file not uploaded or recorded electronically.
            </div>
          )}
        </div>

        {/* Land Ownership Records */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <FileText size={18} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              Land Ownership Document
            </h3>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.6 }}>
            <div>Record Type: <strong>{data.landDocType || '7/12 Extract / Khasra'}</strong></div>
            <div>Registered Farm: <strong>{data.farmName || 'Owner operator'}</strong></div>
          </div>

          {data.landDocumentUrl ? (
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
              <img
                src={data.landDocumentUrl}
                alt="Land Document"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '0.5rem', backgroundColor: '#F8FAFC', textAlign: 'right' }}>
                <a
                  href={data.landDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: '#059669',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  View Full Image <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#94A3B8', fontSize: '0.85rem' }}>
              Land ownership document not uploaded.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={approveModalOpen}
        title="Approve Farmer Verification"
        message={`Grant verified producer status to ${data.farmerName}? They will receive a verified badge across all marketplace crop listings.`}
        confirmText="Approve & Grant Badge"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setApproveModalOpen(false)}
      />

      <ReasonModal
        isOpen={rejectModalOpen}
        title="Reject Application"
        description="Specify why this submission does not meet verification requirements."
        placeholder="Reason for rejection (e.g. invalid document, blurry scan, name mismatch)..."
        confirmText="Reject Application"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
      />
    </div>
  );
};

export default VerificationDetail;
