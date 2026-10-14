import React, { useState } from 'react';

export const AccordionItem = ({ title, children, isOpen, onToggle, id }) => {
  const contentId = `accordion-content-${id}`;
  const headerId = `accordion-header-${id}`;

  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        marginBottom: '0.75rem',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: isOpen ? '0 2px 8px rgba(27,77,62,0.06)' : 'none'
      }}
    >
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '1.15rem 1.25rem',
          backgroundColor: isOpen ? '#F9FBF8' : '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          outline: 'none',
          transition: 'background-color 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = '#F9FAFB';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: isOpen ? '#1B4D3E' : '#1F2937',
            lineHeight: 1.4
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: isOpen ? '#E8F5E9' : '#F3F4F6',
            color: isOpen ? '#1B4D3E' : '#6B7280',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease, background-color 0.2s ease'
          }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          style={{
            padding: '1rem 1.25rem 1.25rem',
            borderTop: '1px solid #F3F4F6',
            color: '#4B5563',
            fontSize: '0.94rem',
            lineHeight: 1.6,
            backgroundColor: '#FFFFFF'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion = ({ items = [], allowMultiple = false }) => {
  const [openIndexes, setOpenIndexes] = useState([0]);

  const toggleIndex = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id || index}
          id={item.id || index}
          title={item.title}
          isOpen={openIndexes.includes(index)}
          onToggle={() => toggleIndex(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};
