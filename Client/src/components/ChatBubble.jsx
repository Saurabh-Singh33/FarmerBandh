import React from 'react';
import { User, Sprout, ShoppingBag, Shield, Trash2, Ban } from 'lucide-react';

export default function ChatBubble({ msg, isCurrentUser, onOpenDeleteModal }) {
  if (!msg) return null;

  const content = msg.body || msg.message || msg.text || '';
  if (!content.trim()) return null;

  const isDeleted = content === '[deleted]' || msg.isDeleted;

  const formattedTime = msg.createdAt
    ? new Date(msg.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const role = (msg.senderRole || '').toLowerCase();
  const isFarmer = role === 'farmer' || role === 'seller';
  const isBuyer = role === 'buyer';

  const getRoleBadge = () => {
    if (isFarmer) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Farmer',
        icon: <Sprout className="w-3 h-3 text-emerald-700" />,
      };
    }
    if (isBuyer) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Buyer',
        icon: <ShoppingBag className="w-3 h-3 text-amber-700" />,
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      label: msg.senderRole || (isCurrentUser ? 'Farmer' : 'User'),
      icon: <Shield className="w-3 h-3 text-slate-600" />,
    };
  };

  const badgeInfo = getRoleBadge();
  const displayName = msg.senderName || (isCurrentUser ? 'You' : (isFarmer ? 'Farmer' : 'Buyer'));
  const senderInitials = displayName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className={`flex gap-2.5 mb-3.5 group relative ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Sender Avatar */}
      <div
        style={{
          backgroundColor: isCurrentUser ? '#1B4D3E' : isFarmer ? '#DCFCE7' : '#FEF3C7',
          color: isCurrentUser ? '#FFFFFF' : isFarmer ? '#14532D' : '#92400E',
          borderColor: isCurrentUser ? '#143B2F' : isFarmer ? '#BBF7D0' : '#FDE68A',
        }}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs border ${
          isCurrentUser
            ? 'bg-[#1B4D3E] text-white border-[#143B2F]'
            : isFarmer
            ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
            : 'bg-amber-100 text-amber-900 border-amber-200'
        }`}
        title={msg.senderName || msg.senderRole}
      >
        {senderInitials}
      </div>

      <div className={`flex flex-col max-w-[80%] sm:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Name and Meta */}
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-800">
            {isCurrentUser ? 'You' : msg.senderName || (isFarmer ? 'Farmer Ramesh' : 'Buyer')}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${badgeInfo.bg}`}
          >
            {badgeInfo.icon}
            {badgeInfo.label}
          </span>
          {formattedTime && <span className="text-[10px] text-slate-400 font-medium ml-1">{formattedTime}</span>}
        </div>

        {/* Bubble Message Box */}
        <div className="relative group/bubble flex items-center">
          {/* Quick Trash Trigger (WhatsApp style on hover) */}
          {!isDeleted && onOpenDeleteModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeleteModal(msg);
              }}
              className={`opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 ${
                isCurrentUser ? 'order-first mr-1.5' : 'order-last ml-1.5'
              }`}
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            style={{
              backgroundColor: isDeleted ? '#F1F5F9' : isCurrentUser ? '#1B4D3E' : '#FFFFFF',
              color: isDeleted ? '#64748B' : isCurrentUser ? '#FFFFFF' : '#1E293B',
              borderColor: isDeleted ? '#E2E8F0' : isCurrentUser ? '#1B4D3E' : '#E2E8F0',
            }}
            className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-xs transition-shadow ${
              isDeleted
                ? 'border border-dashed border-slate-300 italic'
                : isCurrentUser
                ? 'bg-[#1B4D3E] text-white rounded-tr-xs shadow-emerald-900/10'
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-slate-200/50 hover:border-slate-300'
            }`}
          >
            {isDeleted ? (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 italic py-0.5 select-none">
                <Ban className="w-3.5 h-3.5 text-slate-400" />
                {isCurrentUser ? 'You deleted this message' : 'This message was deleted'}
              </span>
            ) : (
              <p className="whitespace-pre-wrap break-words">{content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
