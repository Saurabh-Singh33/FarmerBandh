import React, { useState } from 'react';

const DEFAULT_PALETTE = ['#1B4D3E', '#2E7D32', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

export const DonutChart = ({
  data = [],
  size = 200,
  strokeWidth = 32,
  centerTitle = 'Total',
  centerSubtitle = '',
  palette = DEFAULT_PALETTE
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const validData = (data || []).filter((d) => (d.value || d.revenue || d.count || 0) > 0);
  const total = validData.reduce((sum, d) => sum + (d.value != null ? d.value : (d.revenue != null ? d.revenue : (d.count || 0))), 0);

  if (validData.length === 0 || total === 0) {
    return (
      <div
        style={{
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '0.88rem',
          backgroundColor: '#FAFAF9',
          borderRadius: '8px',
          border: '1px dashed #E5E7EB'
        }}
      >
        No breakdown data available
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const slices = validData.map((d, i) => {
    const val = d.value != null ? d.value : (d.revenue != null ? d.revenue : (d.count || 0));
    const pct = d.percentage != null ? d.percentage : (total > 0 ? (val / total) * 100 : 0);
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (pct / 100) * circumference;

    return {
      name: d.name || d.categoryName || d.status || `Item ${i + 1}`,
      value: val,
      percentage: pct,
      color: d.color || palette[i % palette.length],
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
      {/* SVG Circle */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              style={{
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.6 : 1
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center Label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
            {activeSlice ? activeSlice.name : centerTitle}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
            {activeSlice
              ? `${activeSlice.percentage.toFixed(1)}%`
              : (typeof total === 'number' && total > 100 ? `₹${Math.round(total).toLocaleString('en-IN')}` : total)}
          </div>
          {centerSubtitle && !activeSlice && (
            <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{centerSubtitle}</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px', flex: 1 }}>
        {slices.map((s, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: '6px',
              backgroundColor: hoveredIdx === idx ? '#F3F4F6' : 'transparent',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: s.color,
                  flexShrink: 0
                }}
              />
              <span style={{ color: '#374151', fontWeight: 500 }}>{s.name}</span>
            </div>
            <span style={{ fontWeight: 700, color: '#111827' }}>
              {s.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
