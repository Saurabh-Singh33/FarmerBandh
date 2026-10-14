import React from 'react';

// Inject keyframe animation dynamically if not present
if (typeof document !== 'undefined') {
  const styleId = 'fb-skeleton-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes fb-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .fb-skeleton-shimmer {
        background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 37%, #F3F4F6 63%);
        background-size: 400% 100%;
        animation: fb-shimmer 1.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = '6px',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`fb-skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        display: 'inline-block',
        ...style
      }}
      aria-hidden="true"
    />
  );
};

Skeleton.Text = ({ lines = 3, gap = '8px', lineHeight = '16px', lastLineWidth = '70%' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          borderRadius="4px"
        />
      ))}
    </div>
  );
};

Skeleton.Card = ({ height = '280px', borderRadius = '14px', style = {} }) => {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius,
        padding: '1rem',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        height,
        boxSizing: 'border-box',
        ...style
      }}
      aria-hidden="true"
    >
      <Skeleton height="60%" borderRadius="10px" />
      <Skeleton height="20px" width="80%" borderRadius="4px" />
      <Skeleton height="14px" width="55%" borderRadius="4px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <Skeleton height="24px" width="35%" borderRadius="6px" />
        <Skeleton height="32px" width="40%" borderRadius="9999px" />
      </div>
    </div>
  );
};

Skeleton.Table = ({ rows = 5, cols = 4, rowHeight = '44px' }) => {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        width: '100%'
      }}
      aria-hidden="true"
    >
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '1rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} height="16px" width="60%" borderRadius="4px" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '1rem',
            padding: '0.75rem 1rem',
            borderBottom: r === rows - 1 ? 'none' : '1px solid #F3F4F6',
            alignItems: 'center'
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              height="18px"
              width={c === 0 ? '75%' : (c === cols - 1 ? '40%' : '60%')}
              borderRadius="4px"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

Skeleton.Chart = ({ height = '220px', bars = 7 }) => {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '1.25rem',
        backgroundColor: '#FFFFFF',
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        boxSizing: 'border-box'
      }}
      aria-hidden="true"
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', gap: '8px' }}>
        {Array.from({ length: bars }).map((_, i) => {
          const pseudoHeights = ['45%', '70%', '30%', '85%', '60%', '95%', '50%'];
          return (
            <Skeleton
              key={i}
              height={pseudoHeights[i % pseudoHeights.length]}
              width={`${100 / (bars + 2)}%`}
              borderRadius="4px"
            />
          );
        })}
      </div>
      <Skeleton height="14px" width="100%" borderRadius="4px" />
    </div>
  );
};
