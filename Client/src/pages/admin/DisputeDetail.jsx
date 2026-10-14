import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquareWarning,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  RefreshCw,
  User,
  ShieldAlert
} from 'lucide-react';
import { adminDisputesApi } from '../../services/adminApi';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { notify } from '../../context/NotificationContext';

export const DisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Message box state
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Resolve Modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolution, setResolution] = useState('FavorBuyer'); // FavorBuyer, FavorSeller, NeutralSplit
  const [resolutionNote, setResolutionNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [resolving, setResolving] = useState(false);

  // Close / Escalate
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const res = await adminDisputesApi.getDisputeDetail(id);
      setDispute(res);
      if (res) {
        setRefundAmount(res.orderAmount?.toString() || '');
      }
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load dispute.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDispute();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSendingMsg(true);
      await adminDisputesApi.postMessage(id, message.trim(), isInternal);
      setMessage('');
      notify.success('Arbitrator message added.');
      fetchDispute();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to post message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      notify.error('Please enter a resolution note explaining your ruling.');
      return;
    }

    let parsedRefund = null;
    if (resolution === 'FavorBuyer' || resolution === 'NeutralSplit') {
      parsedRefund = parseFloat(refundAmount);
      if (isNaN(parsedRefund) || parsedRefund <= 0) {
        notify.error('Please specify a valid refund amount.');
        return;
      }
    }

    try {
      setResolving(true);
      await adminDisputesApi.resolveDispute(id, resolution, resolutionNote.trim(), parsedRefund);
      notify.success('Dispute resolved successfully with binding platform ruling.', 'Dispute Resolved');
      setResolveModalOpen(false);
      fetchDispute();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to resolve dispute.');
    } finally {
      setResolving(false);
    }
  };

  const handleEscalate = async () => {
    try {
      setActionLoading(true);
      await adminDisputesApi.escalateDispute(id);
      notify.warning('Dispute marked as Escalated for priority handling.');
      setEscalateModalOpen(false);
      fetchDispute();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to escalate dispute.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      setActionLoading(true);
      await adminDisputesApi.closeDispute(id);
      notify.info('Dispute closed.');
      setCloseModalOpen(false);
      fetchDispute();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to close dispute.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Dispute Thread & Evidence...</div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Dispute Not Found</h2>
        <button
          onClick={() => navigate('/admin/disputes')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: '#0F172A', color: '#FFF' }}
        >
          Back to Disputes
        </button>
      </div>
    );
  }

  const isResolved = dispute.status === 'Resolved';
  const isClosed = dispute.status === 'Closed';

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' }}>
      <button
        onClick={() => navigate('/admin/disputes')}
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
        <ArrowLeft size={16} /> Back to Disputes
      </button>

      {/* Header Banner */}
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
                {dispute.subject}
              </h1>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: isResolved ? '#DCFCE7' : isClosed ? '#F1F5F9' : '#FEF3C7',
                  color: isResolved ? '#15803D' : isClosed ? '#475569' : '#B45309'
                }}
              >
                {dispute.status}
              </span>
            </div>
            <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
              Order: <strong>{dispute.orderNumber}</strong> (₹{dispute.orderAmount?.toLocaleString()}) • Opened on{' '}
              {new Date(dispute.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isResolved && !isClosed && (
              <>
                <button
                  onClick={() => setEscalateModalOpen(true)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Escalate
                </button>
                <button
                  onClick={() => setResolveModalOpen(true)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Scale size={14} /> Resolve Dispute
                </button>
                <button
                  onClick={() => setCloseModalOpen(true)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>

        {/* Resolution Note if resolved */}
        {dispute.resolutionNote && (
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '0.85rem 1rem'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Official Arbitration Ruling
            </div>
            <div style={{ fontSize: '0.875rem', color: '#14532D', marginTop: '3px', lineHeight: 1.5 }}>
              {dispute.resolutionNote}
            </div>
          </div>
        )}
      </div>

      {/* Discussion Timeline */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
          Evidence & Discussion Thread
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {dispute.messages?.map((msg) => {
            const isArbitrator = msg.isArbitrator || msg.senderRole === 'Admin';
            return (
              <div
                key={msg.id}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: isArbitrator ? '#F0FDF4' : '#F8FAFC',
                  border: isArbitrator ? '1px solid #BBF7D0' : '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>
                      {msg.senderName || 'Participant'}
                    </strong>
                    {isArbitrator && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        Platform Arbitrator
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {msg.messageText || msg.body}
                </div>
              </div>
            );
          })}
        </div>

        {/* Post Arbitrator Ruling / Message Form */}
        {!isResolved && !isClosed && (
          <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Post Arbitrator Statement or Request Proofs
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Post official instructions or referee observations visible to both parties..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                Internal admin note (only visible to staff)
              </label>

              <button
                type="submit"
                disabled={sendingMsg || !message.trim()}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: sendingMsg ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} /> {sendingMsg ? 'Posting...' : 'Post Message'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Escalate Modal */}
      <ConfirmModal
        isOpen={escalateModalOpen}
        title="Escalate Dispute"
        message="Escalate this dispute to high priority? This highlights it in red on the admin dashboard."
        confirmText="Escalate"
        type="warning"
        isLoading={actionLoading}
        onConfirm={handleEscalate}
        onCancel={() => setEscalateModalOpen(false)}
      />

      {/* Close Modal */}
      <ConfirmModal
        isOpen={closeModalOpen}
        title="Close Dispute"
        message="Close this dispute without issuing refunds or penalties? Both parties will be informed that the matter is settled."
        confirmText="Close Dispute"
        type="info"
        isLoading={actionLoading}
        onConfirm={handleClose}
        onCancel={() => setCloseModalOpen(false)}
      />

      {/* Resolve Modal */}
      {resolveModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setResolveModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '520px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>Issue Binding Dispute Ruling</h3>
            <form onSubmit={handleResolve}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Arbitration Verdict
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1rem' }}
              >
                <option value="FavorBuyer">Favor Buyer (Auto-issue refund to buyer)</option>
                <option value="FavorSeller">Favor Seller (Dismiss dispute, release payout)</option>
                <option value="NeutralSplit">Compromise / Partial Refund</option>
              </select>

              {(resolution === 'FavorBuyer' || resolution === 'NeutralSplit') && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Refund Amount to Buyer (₹) (Max: ₹{dispute.orderAmount})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={dispute.orderAmount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              )}

              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Arbitration Judgment & Ruling Explanation
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={4}
                placeholder="State the official factual grounds for this decision..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1.25rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#FFF', fontWeight: 600 }}
                >
                  {resolving ? 'Executing Ruling...' : 'Enforce Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeDetail;
