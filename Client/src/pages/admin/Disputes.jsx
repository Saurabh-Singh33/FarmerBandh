import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareWarning,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search
} from 'lucide-react';
import { adminDisputesApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { notify } from '../../context/NotificationContext';

export const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await adminDisputesApi.getDisputes({
        page,
        pageSize: 20,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setDisputes(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load disputes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDisputes();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const columns = [
    {
      header: 'Dispute / Subject',
      render: (d) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{d.subject}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Order: {d.orderNumber}</div>
        </div>
      )
    },
    {
      header: 'Parties',
      render: (d) => (
        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
          <div>Raised by: <strong>{d.raisedByName}</strong></div>
          <div style={{ color: '#64748B' }}>Against: <strong>{d.againstName}</strong></div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (d) => {
        const isEscalated = d.status === 'Escalated';
        const isResolved = d.status === 'Resolved';
        const isClosed = d.status === 'Closed';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isEscalated ? '#FEE2E2' : isResolved ? '#DCFCE7' : isClosed ? '#F1F5F9' : '#FEF3C7',
              color: isEscalated ? '#B91C1C' : isResolved ? '#15803D' : isClosed ? '#475569' : '#B45309'
            }}
          >
            {d.status}
          </span>
        );
      }
    },
    {
      header: 'Opened At',
      render: (d) => (
        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
          {new Date(d.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <button
          onClick={() => navigate(`/admin/disputes/${d.id}`)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#334155',
            cursor: 'pointer',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Eye size={12} /> Arbitrate
        </button>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
          Disputes Arbitration
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
          Act as neutral platform referee, review evidence, issue binding dispute rulings, and trigger auto-refunds.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={disputes}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search dispute subject or order #..."
        isLoading={loading}
        toolbarActions={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
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
            <option value="all">All Disputes</option>
            <option value="Escalated">Escalated (Urgent)</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        }
      />
    </div>
  );
};

export default Disputes;
