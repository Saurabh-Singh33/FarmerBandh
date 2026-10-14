import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const AdminStatCard = ({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  subtitle,
  icon: Icon,
  iconColor = '#059669',
  iconBg = '#ECFDF5',
  onClick
}) => {
  const isPositive = typeof trend === 'number' && trend > 0;
  const isNegative = typeof trend === 'number' && trend < 0;
  const isZero = typeof trend === 'number' && trend === 0;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor
            }}
          >
            <Icon size={19} color={iconColor} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1B4D3E', lineHeight: 1.1, marginBottom: '0.5rem' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {trend != null && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '6px',
              backgroundColor: isPositive ? '#DCFCE7' : isNegative ? '#FEE2E2' : '#F1F5F9',
              color: isPositive ? '#15803D' : isNegative ? '#B91C1C' : '#475569'
            }}
          >
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {isZero && <Minus size={12} />}
            {typeof trend === 'number' ? `${Math.abs(trend)}%` : trend}
          </span>
        )}
        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
          {subtitle || trendLabel}
        </span>
      </div>
    </div>
  );
};

export default AdminStatCard;
