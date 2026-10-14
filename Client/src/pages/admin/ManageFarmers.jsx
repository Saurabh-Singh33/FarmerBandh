import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, UserCheck, ShieldCheck, Clock, AlertTriangle, Eye, Search } from 'lucide-react';
import { adminUsersApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { notify } from '../../context/NotificationContext';

export const ManageFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await adminUsersApi.getUsers({
        page,
        pageSize: 20,
        role: 'Farmer',
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setFarmers(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load farmers.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchFarmers();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFarmers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const columns = [
    {
      header: 'Farmer / Farm',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{f.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{f.email}</div>
        </div>
      )
    },
    {
      header: 'Location',
      render: (f) => (
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
          {f.district && f.state ? `${f.district}, ${f.state}` : f.state || '—'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (f) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: f.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
            color: f.status === 'Active' ? '#15803D' : '#B91C1C'
          }}
        >
          {f.status}
        </span>
      )
    },
    {
      header: 'Activity',
      render: (f) => (
        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
          <strong>{f.listingCount || 0}</strong> listings • <strong>{f.orderCount || 0}</strong> orders
        </div>
      )
    },
    {
      header: 'Joined',
      render: (f) => (
        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
          {new Date(f.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (f) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => navigate(`/admin/users/${f.id}`)}
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
            <Eye size={13} /> View
          </button>
        </div>
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
            Farmers Directory
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Browse verified agricultural producers, inspect farm operations, and monitor merchant activity.
          </p>
        </div>

        <Link
          to="/admin/verifications"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <UserCheck size={16} /> Verifications Queue
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={farmers}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by farm name, farmer, or region..."
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
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        }
      />
    </div>
  );
};

export default ManageFarmers;
