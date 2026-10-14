import React from 'react';

export default function StatusPill({ status }) {
  const getStyle = (s) => {
    const key = (s || '').toLowerCase().replace(/[\s_-]+/g, '');
    switch (key) {
      case 'delivered':
      case 'resolved':
      case 'approved':
      case 'refunded':
      case 'completed':
      case 'accepted':
        return {
          pill: 'bg-emerald-50 text-[#14532D] border-emerald-300',
          dot: 'bg-emerald-500',
          style: { backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }
        };
      case 'outfordelivery':
      case 'inprogress':
      case 'underreview':
      case 'awaitingseller':
      case 'awaitingfarmer':
      case 'packed':
      case 'confirmed':
        return {
          pill: 'bg-sky-50 text-[#075985] border-sky-300',
          dot: 'bg-sky-500',
          style: { backgroundColor: '#F0F9FF', color: '#0369A1', borderColor: '#BAE6FD' }
        };
      case 'pending':
      case 'requested':
      case 'open':
        return {
          pill: 'bg-emerald-50 text-[#14532D] border-emerald-300',
          dot: 'bg-emerald-500',
          style: { backgroundColor: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }
        };
      case 'awaitingbuyer':
      case 'awaitingbuyerresponse':
      case 'countered':
        return {
          pill: 'bg-amber-50 text-[#92400E] border-amber-300',
          dot: 'bg-amber-500',
          style: { backgroundColor: '#FFFBEB', color: '#B45309', borderColor: '#FDE68A' }
        };
      case 'escalated':
        return {
          pill: 'bg-purple-50 text-[#581C87] border-purple-300',
          dot: 'bg-purple-500',
          style: { backgroundColor: '#FAF5FF', color: '#7E22CE', borderColor: '#E9D5FF' }
        };
      case 'rejected':
      case 'cancelled':
      case 'closed':
        return {
          pill: 'bg-rose-50 text-[#9F1239] border-rose-300',
          dot: 'bg-rose-500',
          style: { backgroundColor: '#FFF1F2', color: '#BE123C', borderColor: '#FECDD3' }
        };
      case 'expired':
      case 'withdrawn':
        return {
          pill: 'bg-slate-100 text-[#475569] border-slate-300',
          dot: 'bg-slate-400',
          style: { backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1' }
        };
      default:
        return {
          pill: 'bg-slate-50 text-[#334155] border-slate-300',
          dot: 'bg-slate-400',
          style: { backgroundColor: '#F8FAFC', color: '#475569', borderColor: '#E2E8F0' }
        };
    }
  };

  const getLabel = (s) => {
    if (!s) return '';
    const key = s.toLowerCase().replace(/[\s_-]+/g, '');
    if (key === 'awaitingbuyer' || key === 'awaitingbuyerresponse') return 'Awaiting Buyer Response';
    if (key === 'awaitingseller' || key === 'awaitingfarmer') return 'Awaiting Farmer Response';
    if (key === 'underreview') return 'Under Review';
    return s;
  };

  const styleConfig = getStyle(status);

  return (
    <span
      style={styleConfig.style}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs ${styleConfig.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${styleConfig.dot}`} />
      {getLabel(status)}
    </span>
  );
}
