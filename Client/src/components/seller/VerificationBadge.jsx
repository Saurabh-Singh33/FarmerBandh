import React from 'react';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export const VerificationBadge = ({ status = 'Unverified', size = 'normal', showIcon = true }) => {
  const norm = String(status || '').toLowerCase();
  const isVerified = norm === 'verified' || norm === '2' || norm === 'approved';
  const isPending = norm === 'pending' || norm === '1';
  const isRejected = norm === 'rejected' || norm === '0';

  const config = isVerified
    ? {
        label: 'Approved Seller',
        bg: '#ECFDF5',
        color: '#065F46',
        border: '#A7F3D0',
        Icon: ShieldCheck
      }
    : isPending
    ? {
        label: 'Pending Admin Verification',
        bg: '#FEF3C7',
        color: '#92400E',
        border: '#FDE68A',
        Icon: Clock
      }
    : {
        label: isRejected ? 'Seller Unapproved / Rejected' : 'Unverified Seller',
        bg: '#FEF2F2',
        color: '#991B1B',
        border: '#FECACA',
        Icon: AlertTriangle
      };

  const isSmall = size === 'small';
  const IconComponent = config.Icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '9999px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        fontSize: isSmall ? '0.72rem' : '0.8rem',
        fontWeight: 600,
        lineHeight: 1.2
      }}
    >
      {showIcon && <IconComponent size={isSmall ? 12 : 14} strokeWidth={2.2} />}
      <span>{config.label}</span>
    </span>
  );
};
