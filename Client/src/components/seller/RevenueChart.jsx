import React, { useState } from 'react';

export const RevenueChart = ({ data = [], height = 240, color = '#1B4D3E', areaColor = '#E8F5E9' }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '0.9rem',
          backgroundColor: '#FAFAF9',
          borderRadius: '8px',
          border: '1px dashed #E5E7EB'
        }}
      >
        No revenue data in this period
      </div>
    );
  }

  const width = 640;
  const chartHeight = height - 50;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.revenue || d.amount || 0), 1000);
  const roundedMax = Math.ceil(maxVal / 1000) * 1000 * 1.15; // 15% headroom

  const points = data.map((d, i) => {
    const val = d.revenue != null ? d.revenue : (d.amount != null ? d.amount : 0);
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * innerWidth;
    const y = paddingTop + innerHeight - (val / roundedMax) * innerHeight;
    return {
      x,
      y,
      period: d.period || d.month || `P${i + 1}`,
      revenue: val,
      orders: d.orders || 0
    };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`
    : '';

  const yTicks = [0, roundedMax * 0.33, roundedMax * 0.66, roundedMax];

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
    return `₹${Math.round(amount)}`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <svg
        viewBox={`0 0 ${width} ${chartHeight}`}
        style={{ width: '100%', height: `${chartHeight}px`, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gridlines & Y-axis labels */}
        {yTicks.map((tick, idx) => {
          const y = paddingTop + innerHeight - (tick / roundedMax) * innerHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + innerWidth}
                y2={y}
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#9CA3AF"
                fontFamily="Inter, sans-serif"
              >
                {formatCurrency(tick)}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        {areaPath && <path d={areaPath} fill="url(#revenueGradient)" />}

        {/* Main Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Interactive Data Points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.period === p.period ? 6 : 4}
              fill="#FFFFFF"
              stroke={color}
              strokeWidth="2.5"
              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X-axis labels: show every Nth label to prevent clutter */}
            {(data.length <= 8 || idx % Math.ceil(data.length / 7) === 0 || idx === data.length - 1) && (
              <text
                x={p.x}
                y={paddingTop + innerHeight + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#6B7280"
                fontFamily="Inter, sans-serif"
              >
                {p.period}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / chartHeight) * 100}%`,
            transform: 'translate(-50%, -120%)',
            backgroundColor: '#111827',
            color: '#FFFFFF',
            padding: '0.4rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: 20
          }}
        >
          <div style={{ fontWeight: 600, color: '#9CA3AF', fontSize: '0.7rem' }}>{hoveredPoint.period}</div>
          <div style={{ fontWeight: 700, color: '#34D399', fontSize: '0.9rem' }}>
            ₹{hoveredPoint.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          {hoveredPoint.orders > 0 && (
            <div style={{ color: '#D1D5DB', fontSize: '0.72rem' }}>{hoveredPoint.orders} order(s)</div>
          )}
        </div>
      )}
    </div>
  );
};
