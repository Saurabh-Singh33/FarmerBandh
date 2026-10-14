import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Play } from 'lucide-react';

export const PayoutRow = ({ payout, onMockProcess, isProcessing }) => {
  const statusColors = {
    Paid: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', icon: CheckCircle2 },
    Pending: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', icon: Clock },
    Processing: { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', icon: Clock },
    Failed: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', icon: AlertCircle },
    Cancelled: { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', icon: AlertCircle }
  };

  const statusConfig = statusColors[payout.status] || statusColors.Pending;
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <tr style={{ borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.15s ease' }}>
      {/* Payout Reference & Date */}
      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.88rem' }}>
          {payout.payoutNumber}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
          Req: {formatDate(payout.requestedAt)}
        </div>
      </td>

      {/* Amount */}
      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
        <div style={{ fontWeight: 800, color: '#1B4D3E', fontSize: '1rem' }}>
          ₹{payout.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </td>

      {/* Method & Bank Info */}
      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
          {payout.method === 'UPI' ? 'UPI Transfer' : 'Bank NEFT/IMPS'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
          {payout.maskedUpiId || payout.maskedBankAccount || 'Primary Bank Account'}
        </div>
      </td>

      {/* Status Badge */}
      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
            border: `1px solid ${statusConfig.border}`
          }}
        >
          <StatusIcon size={12} />
          {payout.status}
        </span>
      </td>

      {/* Processed/Paid Date & Reference */}
      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '0.82rem', color: '#374151' }}>
          {payout.paidAt ? formatDate(payout.paidAt) : (payout.status === 'Paid' ? 'Completed' : 'Pending')}
        </div>
        {payout.reference && (
          <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontFamily: 'monospace', marginTop: '2px' }}>
            Ref: {payout.reference}
          </div>
        )}
      </td>

      {/* Action / Dev Mock */}
      <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right' }}>
        {payout.status !== 'Paid' && payout.status !== 'Cancelled' ? (
          <button
            onClick={() => onMockProcess(payout.id)}
            disabled={isProcessing}
            title="Dev simulation: Instantly process and mark payout as Paid"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.6 : 1
            }}
          >
            <Play size={11} fill="#065F46" /> Mock Pay
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Done</span>
        )}
      </td>
    </tr>
  );
};
