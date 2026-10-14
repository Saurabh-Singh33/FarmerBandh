import React, { useEffect, useState } from 'react';
import {
  Activity,
  Download,
  Eye,
  Filter,
  Search,
  ShieldCheck,
  User,
  Clock,
  Terminal,
  X
} from 'lucide-react';
import { adminActivityApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { CsvExportButton } from '../../components/admin/CsvExportButton';
import { notify } from '../../context/NotificationContext';

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminActivityApi.getLogs({
        page,
        pageSize: 20,
        search: search.trim() || undefined,
        targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined
      });
      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, targetTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const columns = [
    {
      header: 'Timestamp',
      render: (l) => (
        <span style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
          {new Date(l.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      header: 'Action',
      render: (l) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            fontFamily: 'monospace'
          }}
        >
          {l.action}
        </span>
      )
    },
    {
      header: 'Actor',
      render: (l) => (
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
          {l.actorName || 'System'}
        </span>
      )
    },
    {
      header: 'Target',
      render: (l) => (
        <div style={{ fontSize: '0.78rem' }}>
          <strong style={{ color: '#059669' }}>{l.targetType}</strong>
          {l.targetId && (
            <div style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              {l.targetId.slice(0, 8)}...
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Summary',
      render: (l) => (
        <div style={{ fontSize: '0.82rem', color: '#334155', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {l.summary}
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (l) => (
        <button
          onClick={() => setSelectedLog(l)}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#334155',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Eye size={12} /> Inspect
        </button>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
            Activity & Audit Logs
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Immutable administrative event trail recording security actions, financial approvals, and moderation decisions.
          </p>
        </div>

        <CsvExportButton
          onExport={() =>
            adminActivityApi.exportCsv({
              targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
              search: search.trim() || undefined
            })
          }
          filename={`audit_logs_${new Date().toISOString().slice(0, 10)}.csv`}
          label="Export Audit CSV"
        />
      </div>

      <DataTable
        columns={columns}
        data={logs}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search action, actor, or summary..."
        isLoading={loading}
        toolbarActions={
          <select
            value={targetTypeFilter}
            onChange={(e) => {
              setTargetTypeFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '0.8rem',
              color: '#334155',
              outline: 'none',
              fontWeight: 500
            }}
          >
            <option value="all">All Targets</option>
            <option value="User">User</option>
            <option value="Product">Product / Listing</option>
            <option value="Order">Order</option>
            <option value="VerificationRequest">Verification</option>
            <option value="Dispute">Dispute</option>
            <option value="Payout">Payout</option>
            <option value="Refund">Refund</option>
            <option value="Coupon">Coupon</option>
            <option value="PlatformSetting">Settings</option>
          </select>
        }
      />

      {/* Inspect Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLog(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 1rem 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="#059669" /> Audit Log Event Detail
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Action Code</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                  {selectedLog.action}
                </span>
              </div>

              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Summary</span>
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedLog.summary}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Actor</span>
                  <span style={{ color: '#0F172A' }}>{selectedLog.actorName || 'System'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Target</span>
                  <span style={{ color: '#0F172A' }}>
                    {selectedLog.targetType} ({selectedLog.targetId || 'N/A'})
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>IP Address</span>
                  <span style={{ fontFamily: 'monospace', color: '#0F172A' }}>
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Recorded Timestamp</span>
                  <span style={{ color: '#0F172A' }}>
                    {new Date(selectedLog.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Event Metadata Payload
                  </span>
                  <pre
                    style={{
                      margin: 0,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#0F172A',
                      color: '#34D399',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                      maxHeight: '180px'
                    }}
                  >
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.metadata), null, 2);
                      } catch {
                        return selectedLog.metadata;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
