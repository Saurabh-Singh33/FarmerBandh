import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox, RefreshCw } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  toolbarActions,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Table Header / Toolbar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          {onSearchChange && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                width: '100%',
                maxWidth: '360px'
              }}
            >
              <Search size={16} color="#64748B" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.85rem',
                  color: '#1F2937'
                }}
              />
            </div>
          )}
        </div>

        {toolbarActions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {toolbarActions}
          </div>
        )}
      </div>

      {/* Table Body */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FBF8', borderBottom: '1px solid #E5E7EB' }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '0.8rem 1rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    width: col.width || 'auto',
                    textAlign: col.align || 'left'
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} style={{ padding: '1rem' }}>
                      <div
                        style={{
                          height: '14px',
                          backgroundColor: '#E2E8F0',
                          borderRadius: '4px',
                          width: `${Math.max(40, (cIdx + 1) * 20)}%`,
                          animation: 'pulse 1.5s infinite ease-in-out'
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8'
                      }}
                    >
                      <Inbox size={24} />
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      {emptyMessage}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      Try adjusting your search or active filters.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '0.9rem 1rem',
                        color: '#1E293B',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle'
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key] != null ? String(row[col.key]) : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid #F1F5F9',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: '#64748B',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div>
          Showing {data.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, total)} of {total} records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: page <= 1 ? '#94A3B8' : '#334155',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <span style={{ fontWeight: 600, color: '#1B4D3E', padding: '0 4px' }}>
            {page} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: page >= totalPages ? '#94A3B8' : '#334155',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
