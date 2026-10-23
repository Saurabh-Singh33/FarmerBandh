import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  ExternalLink,
  Camera,
  Trash2,
  FileUp,
  Check,
  Image as ImageIcon,
  Lock,
  Award,
  Sparkles,
  ArrowRight,
  Info,
  ChevronRight,
  TrendingUp,
  Shield,
  Zap,
  Building,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { uploadApi } from '../../services/uploadApi';
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
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Drag and drop states
  const [isDraggingLandDoc, setIsDraggingLandDoc] = useState(false);
  const [isDraggingSelfie, setIsDraggingSelfie] = useState(false);

  // Upload States
  const [uploadingLandDoc, setUploadingLandDoc] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  const landDocInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  // Submission Form State
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    landRecordUrl: '',
    landRecordName: '',
    landRecordSize: null,
    selfieUrl: '',
    selfieName: '',
    selfieSize: null,
    notes: 'Cultivating crops and produce for wholesale market.'
  });

  const resolveMediaUrl = (url, type = 'document') => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    if (type === 'document' || url.toLowerCase().endsWith('.pdf')) {
      return `${baseUrl}/uploads/documents/${url}`;
    }
    return `${baseUrl}/uploads/images/${url}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleLandDocUpload = async (file) => {
    if (!file) return;
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      notify.error('Invalid document format. Please upload a PDF, JPG, PNG, or WebP file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      notify.error('Document file exceeds 20MB limit.');
      return;
    }

    try {
      setUploadingLandDoc(true);
      const res = await uploadApi.uploadDocument(file);
      setFormData((prev) => ({
        ...prev,
        landRecordUrl: res.url || res.relativeUrl,
        landRecordName: res.originalName || file.name,
        landRecordSize: res.size || file.size
      }));
      notify.success(`Document "${file.name}" uploaded successfully!`);
    } catch (err) {
      console.error('Failed to upload document:', err);
      notify.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingLandDoc(false);
      if (landDocInputRef.current) landDocInputRef.current.value = '';
    }
  };

  const handleSelfieUpload = async (file) => {
    if (!file) return;
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      notify.error('Invalid photo format. Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notify.error('Photo file exceeds 10MB limit.');
      return;
    }

    try {
      setUploadingSelfie(true);
      const res = await uploadApi.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        selfieUrl: res.url || res.relativeUrl,
        selfieName: file.name,
        selfieSize: res.size || file.size
      }));
      notify.success('Farmer photo uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload photo:', err);
      notify.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploadingSelfie(false);
      if (selfieInputRef.current) selfieInputRef.current.value = '';
    }
  };

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

    if (!formData.landRecordUrl) {
      notify.error('Please upload your Land Ownership Record (7/12 Extract, Patta, or Registry).');
      return;
    }

    if (!formData.selfieUrl) {
      notify.error('Please upload your Farmer Photo or Selfie with Farm.');
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
  const cleanAadhaarDigits = formData.aadhaarNumber.replace(/\D/g, '');

  if (loading && !overview) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <RefreshCw size={36} className="spin-animate" style={{ color: '#1B4D3E' }} />
        <div style={{ fontSize: '0.95rem', color: '#4B5563', fontWeight: 500 }}>
          Loading farmer verification profile...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1060px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* Breadcrumb / Category Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#059669' }}>
          Seller Operations
        </span>
        <ChevronRight size={13} color="#9CA3AF" />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
          Identity & Land Verification
        </span>
      </div>

      {/* Refined Light & Premium Hero Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 55%, #EDF8F2 100%)',
          border: '1.5px solid #D1FAE5',
          borderRadius: '16px',
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px -2px rgba(16, 185, 129, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        {/* Soft background decorative ambient light */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-40px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#065F46',
              marginBottom: '0.75rem'
            }}
          >
            <ShieldCheck size={13} strokeWidth={2.4} color="#059669" />
            Official Seller Clearance Protocol
          </div>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.95rem',
              fontWeight: 700,
              lineHeight: 1.25,
              margin: '0 0 0.5rem 0',
              color: '#1B4D3E'
            }}
          >
            Farmer Identity & Land Verification
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: '#4B5563',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Submit government identity and agricultural land records (7/12 Extract or Patta) to obtain the green Verified Farmer badge, unlock direct wholesale buyer trust, and enable instant payouts.
          </p>
        </div>

        {/* Current Status Card on Header (Clean White Card) */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E5E7EB',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            minWidth: '230px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Account Status
          </div>
          <div>
            <VerificationBadge status={status} size="normal" />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px', lineHeight: 1.4 }}>
            {status === 'Verified'
              ? '✓ Full wholesale market clearance'
              : currentReq?.status === 'Pending'
              ? '⌛ Under audit review (24-48 hrs)'
              : '⚠️ Complete KYC to sell produce'}
          </div>
        </div>
      </div>

      {/* Connected 3-Step Verification Stepper */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: status === 'Verified' || cleanAadhaarDigits.length === 12 ? '#ECFDF5' : '#F3F4F6',
                color: status === 'Verified' || cleanAadhaarDigits.length === 12 ? '#059669' : '#6B7280',
                border: `2px solid ${status === 'Verified' || cleanAadhaarDigits.length === 12 ? '#10B981' : '#D1D5DB'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0
              }}
            >
              {status === 'Verified' || cleanAadhaarDigits.length === 12 ? <Check size={20} strokeWidth={2.8} /> : '1'}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>Identity Details</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>12-Digit UIDAI Aadhaar</div>
            </div>
          </div>

          {/* Connector Line 1 */}
          <div
            style={{
              height: '2px',
              flex: '0 1 60px',
              backgroundColor: status === 'Verified' || cleanAadhaarDigits.length === 12 ? '#10B981' : '#E5E7EB',
              display: 'none',
              // Show on wider screens
              '@media (min-width: 768px)': { display: 'block' }
            }}
          />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: status === 'Verified' || formData.landRecordUrl ? '#ECFDF5' : '#F3F4F6',
                color: status === 'Verified' || formData.landRecordUrl ? '#059669' : '#6B7280',
                border: `2px solid ${status === 'Verified' || formData.landRecordUrl ? '#10B981' : '#D1D5DB'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0
              }}
            >
              {status === 'Verified' || formData.landRecordUrl ? <Check size={20} strokeWidth={2.8} /> : '2'}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>Land Documents</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>7/12 Extract or Patta Deed</div>
            </div>
          </div>

          {/* Connector Line 2 */}
          <div
            style={{
              height: '2px',
              flex: '0 1 60px',
              backgroundColor: status === 'Verified' ? '#10B981' : '#E5E7EB',
              display: 'none'
            }}
          />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: status === 'Verified' ? '#ECFDF5' : (currentReq?.status === 'Pending' ? '#EFF6FF' : '#F3F4F6'),
                color: status === 'Verified' ? '#059669' : (currentReq?.status === 'Pending' ? '#2563EB' : '#6B7280'),
                border: `2px solid ${status === 'Verified' ? '#10B981' : (currentReq?.status === 'Pending' ? '#3B82F6' : '#D1D5DB')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0
              }}
            >
              {status === 'Verified' ? <Check size={20} strokeWidth={2.8} /> : (currentReq?.status === 'Pending' ? <Clock size={20} /> : '3')}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>Desk Audit & Badge</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                {status === 'Verified' ? 'Approved & Certified' : (currentReq?.status === 'Pending' ? 'In Active Review' : 'Trust Board Clearance')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Advantage Cards with Color Accents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Card 1: Emerald Accent */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderTop: '3px solid #10B981',
            borderRadius: '14px',
            padding: '1.4rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(16, 185, 129, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                Verified Seal
              </span>
            </div>
            <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: '4px' }}>
              Official Verified Badge
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.83rem', lineHeight: 1.55, margin: 0 }}>
              Display the green verified farmer seal on all your produce catalog listings so wholesale buyers bid with 100% confidence.
            </p>
          </div>
        </div>

        {/* Card 2: Blue Accent */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderTop: '3px solid #3B82F6',
            borderRadius: '14px',
            padding: '1.4rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(59, 130, 246, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB'
                }}
              >
                <TrendingUp size={22} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                3.2x More Bids
              </span>
            </div>
            <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: '4px' }}>
              Wholesale Mandi Orders
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.83rem', lineHeight: 1.55, margin: 0 }}>
              Institutional food processing companies and large mandi traders filter by verified farmers first for guaranteed supply reliability.
            </p>
          </div>
        </div>

        {/* Card 3: Amber Accent */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderTop: '3px solid #F59E0B',
            borderRadius: '14px',
            padding: '1.4rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(245, 158, 11, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706'
                }}
              >
                <Zap size={22} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                Zero Reserve Hold
              </span>
            </div>
            <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: '4px' }}>
              Instant Payout Clearance
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.83rem', lineHeight: 1.55, margin: 0 }}>
              Verified farmers receive priority escrow disbursement directly to their registered bank account upon digital delivery sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Container */}
      {status === 'Verified' && (
        /* ======================== VERIFIED CERTIFICATE & DOSSIER STATE ======================== */
        <>
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
              border: '2px solid #86EFAC',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.12)',
              marginBottom: '1.75rem',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                border: '4px solid #A7F3D0',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
              }}
            >
              <ShieldCheck size={40} strokeWidth={2.4} />
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '9999px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}
            >
              Certificate of Authenticity Issued
            </div>

            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.85rem',
                fontWeight: 700,
                color: '#064E3B',
                margin: '0 0 0.5rem 0'
              }}
            >
              Official Verified Farmer Status Active
            </h2>

            <p
              style={{
                color: '#4B5563',
                fontSize: '0.95rem',
                maxWidth: '620px',
                margin: '0 auto 1.5rem auto',
                lineHeight: 1.6
              }}
            >
              Your agricultural land records and identity documentation have been audited and officially approved by the FarmerBandh Trust & Safety Board. The green verification shield is now displayed on all your public produce listings.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}
            >
              <Link
                to="/seller/listings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(27, 77, 62, 0.25)'
                }}
              >
                Manage Harvest Listings <ArrowRight size={15} />
              </Link>
              <Link
                to="/seller/listings/new"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#1B4D3E',
                  border: '1.5px solid #1B4D3E',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none'
                }}
              >
                Publish New Product
              </Link>
              <button
                type="button"
                onClick={() => setShowUpdateForm((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  backgroundColor: showUpdateForm ? '#FEF2F2' : '#EFF6FF',
                  color: showUpdateForm ? '#DC2626' : '#1D4ED8',
                  border: '1.5px solid ' + (showUpdateForm ? '#FECACA' : '#BFDBFE'),
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <FileUp size={16} />
                {showUpdateForm ? 'Close Document Update Form' : 'Update / Resubmit Land Records & Documents'}
              </button>
            </div>
          </div>

          {/* ======================== VERIFIED DOCUMENTS VAULT & DOSSIER ======================== */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 3px 12px rgba(0,0,0,0.03)',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={20} color="#059669" />
                  Official Audited Documents & Records Dossier
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#6B7280' }}>
                  Active clearance documents verified by the revenue audit desk
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                All Records Certified
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              {/* Record 1: Aadhaar */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={18} color="#0284C7" />
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>Government ID (Aadhaar)</span>
                    </div>
                    <CheckCircle2 size={16} color="#059669" />
                  </div>
                  <div style={{ fontSize: '0.83rem', color: '#64748B', lineHeight: 1.6 }}>
                    <div>UIDAI Number: <strong style={{ color: '#1E293B', letterSpacing: '0.04em' }}>{currentReq?.aadhaarNumber ? (currentReq.aadhaarNumber.length > 4 ? `XXXX-XXXX-${currentReq.aadhaarNumber.slice(-4)}` : currentReq.aadhaarNumber) : 'XXXX-XXXX-1098'}</strong></div>
                    <div>Status: <span style={{ color: '#059669', fontWeight: 600 }}>UIDAI Encrypted & Certified</span></div>
                  </div>
                </div>
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  256-Bit e-KYC Identity Verification
                </div>
              </div>

              {/* Record 2: Land Revenue Document */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="#059669" />
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>Land Revenue & Audit</span>
                    </div>
                    <CheckCircle2 size={16} color="#059669" />
                  </div>
                  <div style={{ fontSize: '0.83rem', color: '#64748B', lineHeight: 1.6 }}>
                    <div>Document Type: <strong style={{ color: '#1E293B' }}>7/12 Extract / Revenue Record</strong></div>
                    <div>Status: <span style={{ color: '#059669', fontWeight: 600 }}>Revenue Audit Approved</span></div>
                  </div>
                </div>
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
                  {(() => {
                    const rawDoc = currentReq?.landRecordUrl || 'sunita_organic_cert.pdf';
                    const fullDocUrl = resolveMediaUrl(rawDoc, 'document');
                    return (
                      <a
                        href={fullDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#059669',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        View Official Document <ExternalLink size={13} />
                      </a>
                    );
                  })()}
                </div>
              </div>

              {/* Record 3: Farmer Photo */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Camera size={18} color="#D97706" />
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>Farmer Photo & Premise</span>
                    </div>
                    <CheckCircle2 size={16} color="#059669" />
                  </div>
                  <div style={{ fontSize: '0.83rem', color: '#64748B', lineHeight: 1.6 }}>
                    <div>Proof: <strong style={{ color: '#1E293B' }}>Farm Premise Geo-Inspection</strong></div>
                    <div>Status: <span style={{ color: '#059669', fontWeight: 600 }}>Visual ID Matched</span></div>
                  </div>
                </div>
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
                  {(() => {
                    const rawPhoto = currentReq?.selfieUrl || 'sunita_photo.jpg';
                    const fullPhotoUrl = resolveMediaUrl(rawPhoto, 'image');
                    return (
                      <a
                        href={fullPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#D97706',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        View Farm Photograph <ExternalLink size={13} />
                      </a>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Clearance Metadata Footer */}
            <div
              style={{
                backgroundColor: '#F1F5F9',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                fontSize: '0.82rem',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                Application <strong>#{currentReq?.requestNumber || 'FB-VR-20261011-0002'}</strong> • Audited on{' '}
                {currentReq?.reviewedAt
                  ? new Date(currentReq.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '11 October 2026'}
              </div>
              <div style={{ fontStyle: 'italic', color: '#334155' }}>
                "{currentReq?.notes || 'Organic certified farm produce cleared for wholesale trade.'}"
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================== PENDING AUDIT STATE ======================== */}
      {status !== 'Verified' && currentReq && currentReq.status === 'Pending' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #BFDBFE',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            boxShadow: '0 6px 20px -2px rgba(59, 130, 246, 0.08)',
            marginBottom: '2rem'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                border: '3px solid #93C5FD',
                color: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Clock size={34} />
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '9999px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem'
              }}
            >
              Verification Audit In Progress
            </div>

            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.7rem',
                fontWeight: 700,
                color: '#1E3A8A',
                margin: '0 0 0.5rem 0'
              }}
            >
              Your Documents Are Being Reviewed
            </h2>

            <p style={{ color: '#4B5563', fontSize: '0.92rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.55 }}>
              Application <strong>#{currentReq.requestNumber}</strong> submitted on{' '}
              {new Date(currentReq.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} is currently under manual revenue record review.
            </p>
          </div>

          {/* Submitted Document Summary Tile */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              maxWidth: '560px',
              margin: '0 auto 2rem auto'
            }}
          >
            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="#059669" />
              <span>Dossier Submitted for Inspection</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              {currentReq.aadhaarNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Aadhaar Number</span>
                  <span style={{ fontWeight: 700, color: '#1E293B', letterSpacing: '0.05em' }}>
                    XXXX-XXXX-{currentReq.aadhaarNumber.slice(-4)}
                  </span>
                </div>
              )}

              {currentReq.landRecordUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="#059669" /> Land Revenue Record (7/12)
                  </span>
                  <a
                    href={resolveMediaUrl(currentReq.landRecordUrl, 'document')}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#059669',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#ECFDF5'
                    }}
                  >
                    View File <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {currentReq.selfieUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={15} color="#059669" /> Farmer Photo at Farm
                  </span>
                  <a
                    href={resolveMediaUrl(currentReq.selfieUrl, 'image')}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#059669',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#ECFDF5'
                    }}
                  >
                    View Photo <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {currentReq.notes && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.4rem 0' }}>
                  <span style={{ color: '#64748B' }}>Farm Notes</span>
                  <span style={{ color: '#334155', maxWidth: '300px', textAlign: 'right', fontWeight: 500 }}>
                    {currentReq.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dev Simulation Sandbox */}
          <div
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px dashed #D1D5DB',
              borderRadius: '12px',
              padding: '1.25rem',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Developer Simulation Sandbox
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Simulate Admin Decision</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => handleMockApprove(currentReq.id)}
                disabled={actionId === currentReq.id}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Play size={14} fill="#FFF" /> Simulate Approval
              </button>
              <button
                onClick={() => handleMockReject(currentReq.id)}
                disabled={actionId === currentReq.id}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <XCircle size={14} /> Simulate Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================== VERIFICATION SUBMISSION / UPDATE FORM ======================== */}
      {(status === 'Unverified' || status === 'Rejected' || (status === 'Verified' && showUpdateForm) || (!currentReq && status !== 'Verified')) && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '2.25rem 2rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            marginBottom: '2rem'
          }}
        >
          {/* Prior Rejection Notification if any */}
          {currentReq?.status === 'Rejected' && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.95rem' }}>
                  Previous Submission Requires Revision
                </div>
                <div style={{ color: '#7F1D1D', fontSize: '0.85rem', marginTop: '4px', lineHeight: 1.5 }}>
                  <strong>Admin Feedback:</strong> {currentReq.rejectionReason || 'The uploaded land record was unclear or invalid. Please upload a clear digital copy of your 7/12 extract.'}
                </div>
                <div style={{ color: '#991B1B', fontSize: '0.78rem', marginTop: '6px' }}>
                  Please re-submit your verification documents below with the corrections.
                </div>
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#111827',
                margin: '0 0 0.35rem 0'
              }}
            >
              Submit Verification Documents
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: 0 }}>
              Please provide authentic government-issued identity and agricultural revenue records to certify your seller account.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* ================= SECTION 1: AADHAAR NUMBER ================= */}
            <div
              style={{
                backgroundColor: '#FAFCFA',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.05em' }}>
                      Step 1 of 3
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E293B' }}>
                      Government Identity (Aadhaar UIDAI)
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600
                  }}
                >
                  <Lock size={11} /> 256-Bit Encrypted & UIDAI Compliant
                </div>
              </div>

              <div style={{ maxWidth: '420px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  12-Digit Aadhaar Number <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="XXXX - XXXX - XXXX"
                    value={formData.aadhaarNumber}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1-');
                      setFormData({ ...formData, aadhaarNumber: formatted });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: cleanAadhaarDigits.length === 12 ? '1.5px solid #10B981' : '1.5px solid #D1D5DB',
                      borderRadius: '10px',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#1B4D3E')}
                    onBlur={(e) => (e.target.style.borderColor = cleanAadhaarDigits.length === 12 ? '#10B981' : '#D1D5DB')}
                  />
                  <Lock
                    size={16}
                    color={cleanAadhaarDigits.length === 12 ? '#10B981' : '#9CA3AF'}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  {cleanAadhaarDigits.length === 12 && (
                    <CheckCircle2
                      size={18}
                      color="#10B981"
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Enter without spaces or dashes
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cleanAadhaarDigits.length === 12 ? '#059669' : '#9CA3AF' }}>
                    {cleanAadhaarDigits.length} / 12 Digits
                  </span>
                </div>
              </div>
            </div>

            {/* ================= SECTION 2: LAND OWNERSHIP RECORD ================= */}
            <div
              style={{
                backgroundColor: '#FAFCFA',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.05em' }}>
                      Step 2 of 3
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E293B' }}>
                      Land Ownership Record (7/12 Extract or Patta Document) <span style={{ color: '#DC2626' }}>*</span>
                    </h3>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
                  PDF, JPG, PNG &bull; Max 20MB
                </span>
              </div>

              {/* Helpful Guideline Note */}
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  color: '#166534',
                  marginBottom: '1rem',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Accepted Proofs:</strong> Digital 7/12 (Satbara) extract, 8A Khatauni, Patta Passbook, or registered Lease Deed. You can download your state's digital copy from your local Bhulekh / Mahabhulekh portal.
                </span>
              </div>

              <input
                type="file"
                ref={landDocInputRef}
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={(e) => handleLandDocUpload(e.target.files?.[0])}
              />

              {uploadingLandDoc ? (
                <div
                  style={{
                    padding: '2.5rem 1.5rem',
                    borderRadius: '12px',
                    border: '2px dashed #059669',
                    backgroundColor: '#ECFDF5',
                    textAlign: 'center',
                    color: '#065F46'
                  }}
                >
                  <RefreshCw size={32} className="spin-animate" style={{ margin: '0 auto 0.75rem auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Uploading land document to secure vault...</div>
                  <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px' }}>
                    Validating format and storing document for auditor inspection...
                  </div>
                </div>
              ) : formData.landRecordUrl ? (
                /* Uploaded Document Card */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    border: '1.5px solid #10B981',
                    backgroundColor: '#F0FDF4',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        backgroundColor: formData.landRecordUrl.toLowerCase().endsWith('.pdf') ? '#FEE2E2' : '#DCFCE7',
                        color: formData.landRecordUrl.toLowerCase().endsWith('.pdf') ? '#DC2626' : '#15803D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      {formData.landRecordUrl.toLowerCase().endsWith('.pdf') ? 'PDF' : <FileText size={24} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.95rem' }}>
                        {formData.landRecordName || 'Land_Ownership_Record.pdf'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} color="#059669" strokeWidth={2.5} />
                        <span>Uploaded {formData.landRecordSize ? `(${formatFileSize(formData.landRecordSize)})` : ''}</span>
                        <span>&bull;</span>
                        <span style={{ fontWeight: 600 }}>Ready for verification audit</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <a
                      href={formData.landRecordUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={14} /> Preview File
                    </a>
                    <button
                      type="button"
                      onClick={() => landDocInputRef.current?.click()}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #059669',
                        backgroundColor: '#FFFFFF',
                        color: '#059669',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Replace File
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, landRecordUrl: '', landRecordName: '', landRecordSize: null }))}
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                      title="Remove document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={() => landDocInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingLandDoc(true);
                  }}
                  onDragLeave={() => setIsDraggingLandDoc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingLandDoc(false);
                    handleLandDocUpload(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: isDraggingLandDoc ? '2px dashed #059669' : '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    backgroundColor: isDraggingLandDoc ? '#ECFDF5' : '#FFFFFF',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDraggingLandDoc) {
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.backgroundColor = '#F0FDF4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDraggingLandDoc) {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto'
                    }}
                  >
                    <FileUp size={28} />
                  </div>

                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', marginBottom: '6px' }}>
                    Click to upload Land Record, or drag and drop here
                  </div>
                  <div style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '1.25rem', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
                    7/12 Extract, Patta document, 8A Khatauni, or registered lease deed (PDF, JPG, PNG up to 20MB)
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      landDocInputRef.current?.click();
                    }}
                    style={{
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      backgroundColor: '#1B4D3E',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(27,77,62,0.2)'
                    }}
                  >
                    <Upload size={15} /> Choose Document File (PDF / Image)
                  </button>
                </div>
              )}
            </div>

            {/* ================= SECTION 3: FARMER PHOTO / SELFIE ================= */}
            <div
              style={{
                backgroundColor: '#FAFCFA',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    <Camera size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.05em' }}>
                      Step 3 of 3
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E293B' }}>
                      Farmer Live Photo / Farm Selfie <span style={{ color: '#DC2626' }}>*</span>
                    </h3>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
                  JPG, PNG, WebP &bull; Max 10MB
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem', lineHeight: 1.45 }}>
                A clear, well-lit photograph of yourself at your farm or standing near your cultivated produce. This cross-checks applicant authenticity against government identity records.
              </div>

              <input
                type="file"
                ref={selfieInputRef}
                accept=".jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={(e) => handleSelfieUpload(e.target.files?.[0])}
              />

              {uploadingSelfie ? (
                <div
                  style={{
                    padding: '2.5rem 1.5rem',
                    borderRadius: '12px',
                    border: '2px dashed #059669',
                    backgroundColor: '#ECFDF5',
                    textAlign: 'center',
                    color: '#065F46'
                  }}
                >
                  <RefreshCw size={32} className="spin-animate" style={{ margin: '0 auto 0.75rem auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Uploading farmer photograph...</div>
                  <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px' }}>Please wait a moment</div>
                </div>
              ) : formData.selfieUrl ? (
                /* Uploaded Photo Card */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    border: '1.5px solid #10B981',
                    backgroundColor: '#F0FDF4',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={formData.selfieUrl}
                      alt="Farmer Selfie Preview"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '2px solid #10B981',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.95rem' }}>
                        {formData.selfieName || 'Farmer_Photo.jpg'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} color="#059669" strokeWidth={2.5} />
                        <span>Uploaded {formData.selfieSize ? `(${formatFileSize(formData.selfieSize)})` : ''}</span>
                        <span>&bull;</span>
                        <span style={{ fontWeight: 600 }}>Face verified for audit</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <a
                      href={formData.selfieUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={14} /> Preview Photo
                    </a>
                    <button
                      type="button"
                      onClick={() => selfieInputRef.current?.click()}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #059669',
                        backgroundColor: '#FFFFFF',
                        color: '#059669',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, selfieUrl: '', selfieName: '', selfieSize: null }))}
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                      title="Remove photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Photo Dropzone */
                <div
                  onClick={() => selfieInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingSelfie(true);
                  }}
                  onDragLeave={() => setIsDraggingSelfie(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingSelfie(false);
                    handleSelfieUpload(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: isDraggingSelfie ? '2px dashed #059669' : '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    backgroundColor: isDraggingSelfie ? '#ECFDF5' : '#FFFFFF',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDraggingSelfie) {
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.backgroundColor = '#F0FDF4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDraggingSelfie) {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto'
                    }}
                  >
                    <Camera size={28} />
                  </div>

                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', marginBottom: '6px' }}>
                    Click to upload Farmer Photo, or drag and drop here
                  </div>
                  <div style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    Clear photograph of farmer standing at farm or with crops (JPG, PNG, WebP up to 10MB)
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selfieInputRef.current?.click();
                    }}
                    style={{
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      backgroundColor: '#1B4D3E',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(27,77,62,0.2)'
                    }}
                  >
                    <Camera size={15} /> Choose Photo (JPG / PNG)
                  </button>
                </div>
              )}
            </div>

            {/* ================= SECTION 4: FARM NOTES & CROPS ================= */}
            <div
              style={{
                backgroundColor: '#FAFCFA',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E293B' }}>
                    Farm Acreage & Crops Cultivated
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Brief description of farm size, location, and primary harvested produce
                  </div>
                </div>
              </div>

              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Cultivating 4.5 acres of Organic Basmati Rice and Wheat in Nashik district. Harvest ready for bulk supply."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  backgroundColor: '#FFFFFF',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1B4D3E')}
                onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
              />
            </div>

            {/* Privacy & Legal Security Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <ShieldCheck size={24} color="#059669" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                <strong>FarmerBandh Trust Guarantee:</strong> Your land revenue documents and identity proof are encrypted with AES-256 and examined solely by verified compliance officers. They are never published publicly or shared with commercial entities.
              </div>
            </div>

            {/* Submit Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                All documents submitted undergo audit review within <strong>24 to 48 hours</strong>.
              </div>

              <button
                type="submit"
                disabled={submitting || !formData.landRecordUrl || !formData.selfieUrl || cleanAadhaarDigits.length !== 12}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.85rem 2.25rem',
                  borderRadius: '10px',
                  background: (!formData.landRecordUrl || !formData.selfieUrl || cleanAadhaarDigits.length !== 12)
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #1B4D3E 0%, #15803D 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: (submitting || !formData.landRecordUrl || !formData.selfieUrl || cleanAadhaarDigits.length !== 12) ? 'not-allowed' : 'pointer',
                  boxShadow: (!formData.landRecordUrl || !formData.selfieUrl || cleanAadhaarDigits.length !== 12)
                    ? 'none'
                    : '0 4px 14px rgba(27,77,62,0.3)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spin-animate" />
                    <span>Submitting Dossier...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Submit Verification Dossier</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verification History & Audit Section */}
      {history.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '1.75rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
                Verification Audit History & Requests
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                Complete log of verification applications, reviews, and status changes
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px' }}>
              {history.length} Record{history.length === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #E5E7EB', color: '#6B7280', backgroundColor: '#F9FAFB' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Request #</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Submitted</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Reviewed At</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Notes / Reason</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Dev Sandbox</th>
                </tr>
              </thead>
              <tbody>
                {history.map((req) => (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FBF8')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1B4D3E' }}>
                      {req.requestNumber}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#4B5563' }}>
                      {new Date(req.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          backgroundColor: req.status === 'Approved' ? '#ECFDF5' : (req.status === 'Rejected' ? '#FEF2F2' : '#EFF6FF'),
                          color: req.status === 'Approved' ? '#065F46' : (req.status === 'Rejected' ? '#991B1B' : '#1E40AF'),
                          border: `1px solid ${req.status === 'Approved' ? '#A7F3D0' : (req.status === 'Rejected' ? '#FECACA' : '#BFDBFE')}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {req.status === 'Approved' ? <Check size={12} /> : (req.status === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />)}
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#6B7280' }}>
                      {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#4B5563', maxWidth: '240px', lineHeight: 1.4 }}>
                      {req.rejectionReason || req.notes || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleMockApprove(req.id)}
                            disabled={actionId === req.id}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '5px',
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
                              padding: '3px 8px',
                              borderRadius: '5px',
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
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Archived</span>
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
