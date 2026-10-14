import React from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  PackageCheck,
  Truck,
  Home,
  XCircle,
  MessageSquare,
  MessageCircle,
  Handshake,
  Clock,
  RotateCcw,
  AlertTriangle,
  MessageSquareWarning,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  AlertOctagon,
  FileText,
  Star,
  Bell
} from 'lucide-react';

export const getNotificationConfig = (type) => {
  // Support numeric enum value (1..24) or string name
  const t = typeof type === 'string' ? type.toLowerCase() : type;

  switch (t) {
    case 1:
    case 'orderplaced':
    case 'order_placed':
      return {
        icon: ShoppingCart,
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        label: 'Order Placed'
      };
    case 2:
    case 'orderconfirmed':
    case 'order_confirmed':
      return {
        icon: CheckCircle2,
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        label: 'Order Confirmed'
      };
    case 3:
    case 'orderpacked':
    case 'order_packed':
      return {
        icon: PackageCheck,
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '#BFDBFE',
        label: 'Order Packed'
      };
    case 4:
    case 'ordershipped':
    case 'order_shipped':
      return {
        icon: Truck,
        bg: '#EEF2FF',
        color: '#4F46E5',
        border: '#C7D2FE',
        label: 'Order Shipped'
      };
    case 5:
    case 'orderdelivered':
    case 'order_delivered':
      return {
        icon: Home,
        bg: '#F0FDF4',
        color: '#16A34A',
        border: '#BBF7D0',
        label: 'Delivered'
      };
    case 6:
    case 'ordercancelled':
    case 'order_cancelled':
      return {
        icon: XCircle,
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        label: 'Cancelled'
      };
    case 7:
    case 'negotiationstarted':
    case 'negotiation_started':
      return {
        icon: MessageSquare,
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
        label: 'Negotiation'
      };
    case 8:
    case 'negotiationreplied':
    case 'negotiation_replied':
      return {
        icon: MessageCircle,
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
        label: 'Offer Update'
      };
    case 9:
    case 'negotiationaccepted':
    case 'negotiation_accepted':
      return {
        icon: Handshake,
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        label: 'Deal Accepted'
      };
    case 10:
    case 'negotiationrejected':
    case 'negotiation_rejected':
      return {
        icon: XCircle,
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        label: 'Offer Declined'
      };
    case 11:
    case 'negotiationexpired':
    case 'negotiation_expired':
      return {
        icon: Clock,
        bg: '#F3F4F6',
        color: '#6B7280',
        border: '#E5E7EB',
        label: 'Offer Expired'
      };
    case 12:
    case 'returnrequested':
    case 'return_requested':
      return {
        icon: RotateCcw,
        bg: '#FFF7ED',
        color: '#EA580C',
        border: '#FFEDD5',
        label: 'Return Requested'
      };
    case 13:
    case 'returnapproved':
    case 'return_approved':
      return {
        icon: CheckCircle2,
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        label: 'Return Approved'
      };
    case 14:
    case 'returnrejected':
    case 'return_rejected':
      return {
        icon: XCircle,
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        label: 'Return Declined'
      };
    case 15:
    case 'disputeopened':
    case 'dispute_opened':
      return {
        icon: AlertTriangle,
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
        label: 'Dispute Opened'
      };
    case 16:
    case 'disputemessage':
    case 'dispute_message':
      return {
        icon: MessageSquareWarning,
        bg: '#FAF5FF',
        color: '#7C3AED',
        border: '#E9D5FF',
        label: 'Dispute Message'
      };
    case 17:
    case 'disputeresolved':
    case 'dispute_resolved':
      return {
        icon: ShieldCheck,
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '#BFDBFE',
        label: 'Dispute Resolved'
      };
    case 18:
    case 'payoutrequested':
    case 'payout_requested':
      return {
        icon: Wallet,
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '#BFDBFE',
        label: 'Payout Requested'
      };
    case 19:
    case 'payoutprocessed':
    case 'payout_processed':
      return {
        icon: CheckCircle2,
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        label: 'Payout Sent'
      };
    case 20:
    case 'payoutfailed':
    case 'payout_failed':
      return {
        icon: AlertOctagon,
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        label: 'Payout Issue'
      };
    case 21:
    case 'verificationsubmitted':
    case 'verification_submitted':
      return {
        icon: FileText,
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '#BFDBFE',
        label: 'KYC Submitted'
      };
    case 22:
    case 'verificationapproved':
    case 'verification_approved':
      return {
        icon: ShieldCheck,
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
        label: 'KYC Approved'
      };
    case 23:
    case 'verificationrejected':
    case 'verification_rejected':
      return {
        icon: ShieldAlert,
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        label: 'KYC Action Needed'
      };
    case 24:
    case 'reviewreceived':
    case 'review_received':
      return {
        icon: Star,
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
        label: 'New Review'
      };
    default:
      return {
        icon: Bell,
        bg: '#E8F5E9',
        color: '#1B4D3E',
        border: '#C8E6C9',
        label: 'Notice'
      };
  }
};

export const NotificationIcon = ({ type, size = 18 }) => {
  const config = getNotificationConfig(type);
  const IconComponent = config.icon;

  return (
    <div
      style={{
        width: `${size + 14}px`,
        height: `${size + 14}px`,
        borderRadius: '50%',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: config.color,
        flexShrink: 0
      }}
      title={config.label}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};
