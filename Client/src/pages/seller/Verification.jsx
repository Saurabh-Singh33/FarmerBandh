import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  UserCheck,
  RefreshCw,
  Play,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { verificationApi } from '../../services/verificationApi';
import { VerificationBadge } from '../../components/seller/VerificationBadge';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';

export const Verification = () => {
  const { refreshDashboard, refreshVerification } = useSeller();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Submission Form State
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    landRecordUrl: 'https://farmerbandh-mock.in/docs/7_12_extract.pdf',
    selfieUrl: 'https://farmerbandh-mock.in/photos/farm_selfie.jpg',
    notes: 'Cultivating 12 acres of wheat and pulses in Ahmedabad district.'
  });

  const loadVerification = useCallback(async () => {
    try {
      setLoading(true);
      const data = await verificationApi.getVerificationStatus();
      setOverview(data);
    } catch (err) {
      console.error('Error loading verification status:', err);
      notify.error('Could not load verification status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerification();
  }, [loadVerification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanAadhaar = formData.aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      notify.error('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    try {
      setSubmitting(true);
      await verificationApi.submitVerification({
        aadhaarNumber: cleanAadhaar,
        landRecordUrl: formData.landRecordUrl,
        selfieUrl: formData.selfieUrl,
        notes: formData.notes
      });
      notify.success('Verification documents submitted for review! Audit typically takes 24-48 hours.');
      await loadVerification();
      refreshDashboard();
      refreshVerification();
    } catch (err) {
      console.error('Error submitting verification:', err);
      notify.error(err?.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockApprove = async (id) => {
    try {
      setActionId(id);
      await verificationApi.mockApprove(id);
      notify.success('Dev Simulation: Verification Approved! Seller is now Verified.');
      await loadVerification();
      refreshDashboard();
      refreshVerification();
    } catch (err) {
      console.error('Error mock approving:', err);
      notify.error(err?.response?.data?.message || 'Mock approval failed');
    } finally {
      setActionId(null);
    }
  };

  const handleMockReject = async (id) => {
    const reason = window.prompt('Enter rejection reason for dev simulation:', 'Land record copy was blurry or incomplete.');
    if (!reason) return;

    try {
      setActionId(id);
      await verificationApi.mockReject(id, reason);
      notify.warning('Dev Simulation: Verification marked as Rejected with reason.');
      await loadVerification();
      refreshDashboard();
      refreshVerification();
    } catch (err) {
      console.error('Error mock rejecting:', err);
      notify.error(err?.response?.data?.message || 'Mock rejection failed');
    } finally {
      setActionId(null);
    }
  };

  const status = overview?.farmerVerified || 'Unverified';
  const canSubmit = overview?.canSubmit ?? true;
  const currentReq = overview?.currentRequest;
  const history = overview?.history || [];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: 0
            }}
          >
            Farmer Identity & Land Verification
          </h1>
          <VerificationBadge status={status} />
        </div>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
          Establish wholesale buyer trust, display the green Verified Farmer badge, and unlock instant payout clearance.
        </p>
      </div>

      {/* Trust & Benefits Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065F46', marginBottom: '0.75rem' }}>
            <ShieldCheck size={18} />
          </div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Verified Badge</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '2px' }}>
            Display official verification badge on all your marketplace listings.
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', marginBottom: '0.75rem' }}>
            <UserCheck size={18} />
          </div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>3.2x Higher Inquiries</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '2px' }}>
            Wholesale bulk buyers prioritize verified local farmer produce.
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400E', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Instant Settlements</div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '2px' }}>
            Priority automated payout approval directly into linked bank account.
          </div>
        </div>
      </div>

      {/* Main Status / Form Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '2rem'
        }}
      >
        {status === 'Verified' ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#065F46', margin: '0 0 0.5rem 0' }}>
              Your Account is Verified!
            </h2>
            <p style={{ color: '#4B5563', fontSize: '0.9rem', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
              Your farmer credentials and land identity have been verified by the FarmerBandh trust & safety board.
              The green verification badge is actively shown on all your harvest listings.
            </p>
          </div>
        ) : currentReq && currentReq.status === 'Pending' ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Clock size={32} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1E40AF', margin: '0 0 0.5rem 0' }}>
              Verification Request Under Review
            </h2>
            <p style={{ color: '#4B5563', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              Request reference <strong>{currentReq.requestNumber}</strong> was submitted on{' '}
              {new Date(currentReq.submittedAt).toLocaleDateString('en-IN')}. Our verification desk is reviewing your land records.
            </p>

            {/* Dev Controls to simulate approval / rejection */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px dashed #D1D5DB',
                borderRadius: '8px',
                padding: '1rem',
                maxWidth: '440px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                Dev Sandbox Controls
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={() => handleMockApprove(currentReq.id)}
                  disabled={actionId === currentReq.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    backgroundColor: '#1B4D3E',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Play size={12} fill="#FFF" /> Mock Approve
                </button>
                <button
                  onClick={() => handleMockReject(currentReq.id)}
                  disabled={actionId === currentReq.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <XCircle size={12} /> Mock Reject
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>
              Submit Verification Documents
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
              Submit government identity and agricultural land documentation to verify your farmer profile.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Aadhaar Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Aadhaar Number (12 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  placeholder="XXXX-XXXX-XXXX"
                  value={formData.aadhaarNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1-');
                    setFormData({ ...formData, aadhaarNumber: formatted });
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Land Record 7/12 Extract Mock */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Land Ownership Record (7/12 Extract or Patta Document) *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    value={formData.landRecordUrl}
                    onChange={(e) => setFormData({ ...formData, landRecordUrl: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.65rem 1rem',
                      backgroundColor: '#F3F4F6',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#4B5563'
                    }}
                  >
                    <FileText size={14} /> PDF
                  </span>
                </div>
              </div>

              {/* Farm Photo / Selfie */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Farmer Photo / Selfie with Farm *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    value={formData.selfieUrl}
                    onChange={(e) => setFormData({ ...formData, selfieUrl: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.65rem 1rem',
                      backgroundColor: '#F3F4F6',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#4B5563'
                    }}
                  >
                    <Upload size={14} /> JPG
                  </span>
                </div>
              </div>

              {/* Agricultural Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Farm Land Details & Crops Cultivated
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(27,77,62,0.2)'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Verification Request'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Verification History & Audit Section */}
      {history.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
            Verification History & Audit Trail
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Request #</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Submitted</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Reviewed At</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>Notes / Reason</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 600, textAlign: 'right' }}>Dev Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#1B4D3E' }}>
                      {req.requestNumber}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#4B5563' }}>
                      {new Date(req.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: req.status === 'Approved' ? '#ECFDF5' : (req.status === 'Rejected' ? '#FEF2F2' : '#EFF6FF'),
                          color: req.status === 'Approved' ? '#065F46' : (req.status === 'Rejected' ? '#991B1B' : '#1E40AF')
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6B7280' }}>
                      {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#4B5563', maxWidth: '200px' }}>
                      {req.rejectionReason || req.notes || '—'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {req.status === 'Pending' && (
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            onClick={() => handleMockApprove(req.id)}
                            disabled={actionId === req.id}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#ECFDF5',
                              color: '#065F46',
                              border: '1px solid #A7F3D0',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleMockReject(req.id)}
                            disabled={actionId === req.id}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
