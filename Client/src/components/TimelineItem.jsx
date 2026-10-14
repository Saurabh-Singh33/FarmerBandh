import React from 'react';
import {
  Check,
  CheckCircle2,
  Package,
  Truck,
  Clock,
  XCircle,
  ShoppingBag,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

/**
 * Format timestamp safely into local time with 12-hour AM/PM
 */
const formatEventTime = (dateStr) => {
  if (!dateStr) return { full: '', time: '', relative: '' };
  let s = String(dateStr).trim();
  if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s += 'Z';
  }
  const date = new Date(s);
  if (isNaN(date.getTime())) return { full: String(dateStr), time: '', relative: '' };

  const full = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const time = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Relative time computation
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  let relative = '';
  if (diffSec < 60) {
    relative = 'Just now';
  } else if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    relative = `${mins}m ago`;
  } else if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    relative = `${hours}h ago`;
  } else {
    const days = Math.floor(diffSec / 86400);
    relative = `${days}d ago`;
  }

  return { full, time, relative };
};

export default function TimelineItem({ item, isLast = false }) {
  const statusKey = (item.statusLabel || item.newStatus || item.status || '').toString().toLowerCase();

  const getStatusConfig = () => {
    switch (statusKey) {
      case 'delivered':
      case '6':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-600',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Order Delivered',
          dot: 'bg-emerald-600 ring-emerald-100'
        };
      case 'intransit':
      case 'in transit':
      case 'outfordelivery':
      case 'out for delivery':
      case '4':
        return {
          icon: Truck,
          bg: 'bg-indigo-600',
          border: 'border-indigo-200',
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          label: 'Out for Delivery / In Transit',
          dot: 'bg-indigo-600 ring-indigo-100'
        };
      case 'packed':
      case '3':
        return {
          icon: Package,
          bg: 'bg-purple-600',
          border: 'border-purple-200',
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          label: 'Produce Packed & Tagged',
          dot: 'bg-purple-600 ring-purple-100'
        };
      case 'confirmed':
      case '2':
        return {
          icon: Check,
          bg: 'bg-blue-600',
          border: 'border-blue-200',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          label: 'Order Accepted by Farmer',
          dot: 'bg-blue-600 ring-blue-100'
        };
      case 'cancelled':
      case 'rejected':
      case '7':
        return {
          icon: XCircle,
          bg: 'bg-rose-600',
          border: 'border-rose-200',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Order Cancelled',
          dot: 'bg-rose-600 ring-rose-100'
        };
      case 'pending':
      case '1':
      default:
        return {
          icon: ShoppingBag,
          bg: 'bg-amber-600',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Order Placed by Buyer',
          dot: 'bg-amber-600 ring-amber-100'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const timeInfo = formatEventTime(item.createdAt);

  const actorRole = (item.changedByRole || '').toLowerCase();
  const actorName = item.changedByName || (actorRole === 'farmer' ? 'Farmer Seller' : actorRole === 'buyer' ? 'Buyer' : 'System');

  return (
    <div className="relative flex items-start space-x-4 pb-7 group">
      {/* Continuous Timeline Connector Line */}
      {!isLast && (
        <span
          className="absolute top-8 left-4 -ml-[1px] h-full w-[2px] bg-slate-200"
          aria-hidden="true"
        />
      )}

      {/* Status Icon Circle */}
      <div
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white ${config.bg}`}
      >
        <IconComponent size={15} strokeWidth={2.4} />
      </div>

      {/* Timeline Event Content Card */}
      <div className="min-w-0 flex-1 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
        {/* Top Header: Event Title & Timestamps */}
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.badgeBg}`}>
              {config.label}
            </span>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1.5">
              <Clock size={12} className="text-slate-400" />
              <span>{timeInfo.time || 'Time unavailable'}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end gap-1.5">
              <span>{timeInfo.full}</span>
              {timeInfo.relative && (
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium text-[10px]">
                  {timeInfo.relative}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Note / Details Description (Clean light styling, no dark mode clash) */}
        {item.note && (
          <p className="mt-2.5 text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-medium">
            {item.note}
          </p>
        )}

        {/* Actor / Attribution Footer */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            {actorRole === 'farmer' ? (
              <UserCheck size={13} className="text-emerald-700" />
            ) : actorRole === 'buyer' ? (
              <ShoppingBag size={13} className="text-blue-700" />
            ) : (
              <ShieldCheck size={13} className="text-slate-500" />
            )}
            <span>
              Updated by <strong className="text-slate-800">{actorName}</strong>
            </span>
          </span>

          {actorRole && (
            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider ${
              actorRole === 'farmer'
                ? 'bg-emerald-50 text-emerald-800'
                : actorRole === 'buyer'
                ? 'bg-blue-50 text-blue-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {item.changedByRole}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
