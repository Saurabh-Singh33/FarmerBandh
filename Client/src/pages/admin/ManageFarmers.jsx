import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Tractor,
  UserCheck,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  Check,
  X,
  Filter,
  Sparkles,
  Store
} from 'lucide-react';
import { adminUsersApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const ManageFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all'); // 'all' | 'Pending' | 'Approved' | 'Rejected'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Active' | 'Suspended'
  const [loading, setLoading] = useState(true);

  // Modals state
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminUsersApi.getUsers({
        page,
        pageSize: 20,
        role: 'Farmer',
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        verificationStatus: verificationFilter !== 'all' ? verificationFilter : undefined
      });
      setFarmers(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load farmers.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, verificationFilter, search]);

  useEffect(() => {
    fetchFarmers();
  }, [page, statusFilter, verificationFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFarmers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Actions
  const handleConfirmApprove = async () => {
    if (!approveTarget?.farmerId) {
      notify.error('Farmer profile identifier not found.');
      return;
    }
    try {
      setActionLoading(true);
      await adminUsersApi.approveSeller(approveTarget.farmerId);
      notify.success(`"${approveTarget.fullName}" approved as seller! Their listings are now public.`);
      setApproveTarget(null);
      fetchFarmers();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to approve seller.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectTarget?.farmerId) {
      notify.error('Farmer profile identifier not found.');
      return;
    }
    try {
      setActionLoading(true);
      await adminUsersApi.rejectSeller(rejectTarget.farmerId, reason);
      notify.info(`Seller request for "${rejectTarget.fullName}" rejected. Products remain hidden.`);
      setRejectTarget(null);
      fetchFarmers();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reject seller.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRevoke = async (reason) => {
    if (!revokeTarget?.farmerId) {
      notify.error('Farmer profile identifier not found.');
      return;
    }
    try {
      setActionLoading(true);
      await adminUsersApi.revokeSeller(revokeTarget.farmerId, reason);
      notify.warning(`Selling privileges revoked for "${revokeTarget.fullName}". Listings are now hidden.`);
      setRevokeTarget(null);
      fetchFarmers();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to revoke seller privileges.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to determine verification status
  const getVerificationInfo = (f) => {
    const status = f.farmerVerifiedStatus || (f.farmerVerified === 2 ? 'Approved' : f.farmerVerified === 1 ? 'Pending' : 'Rejected');
    if (status === 'Approved' || f.farmerVerified === 2) {
      return {
        label: 'Approved Seller',
        badgeBg: '#DCFCE7',
        badgeColor: '#15803D',
        borderColor: '#86EFAC',
        icon: CheckCircle2,
        sub: 'Can sell • Listings visible to buyers'
      };
    }
    if (status === 'Pending' || f.farmerVerified === 1) {
      return {
        label: 'Pending Approval',
        badgeBg: '#FEF3C7',
        badgeColor: '#B45309',
        borderColor: '#FDE68A',
        icon: Clock,
        sub: 'Awaiting admin • Listings hidden'
      };
    }
    return {
      label: 'Seller Rejected / Revoked',
      badgeBg: '#FEE2E2',
      badgeColor: '#B91C1C',
      borderColor: '#FECACA',
      icon: XCircle,
      sub: 'Selling blocked • Listings hidden'
    };
  };

  const columns = [
    {
      header: 'Farmer / Farm Name',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {f.fullName}
          </div>
          {f.farmName && (
            <div style={{ fontSize: '0.78rem', color: '#1B4D3E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Tractor size={12} /> {f.farmName}
            </div>
          )}
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
            {f.email} {f.phone ? `• ${f.phone}` : ''}
          </div>
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
      header: 'Seller Verification',
      render: (f) => {
        const info = getVerificationInfo(f);
        const Icon = info.icon;
        return (
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: info.badgeBg,
                color: info.badgeColor,
                border: `1px solid ${info.borderColor}`
              }}
            >
              <Icon size={13} /> {info.label}
            </span>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
              {info.sub}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Account Status',
      render: (f) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: f.status === 'Active' ? '#F0FDF4' : '#FEF2F2',
            color: f.status === 'Active' ? '#166534' : '#991B1B',
            border: `1px solid ${f.status === 'Active' ? '#BBF7D0' : '#FECACA'}`
          }}
        >
          {f.status}
        </span>
      )
    },
    {
      header: 'Catalog & Activity',
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
      header: 'Seller Verification Actions',
      align: 'right',
      render: (f) => {
        const isApproved = f.farmerVerified === 2 || f.farmerVerifiedStatus === 'Approved';
        const isPending = f.farmerVerified === 1 || f.farmerVerifiedStatus === 'Pending';
        const isRejected = f.farmerVerified === 0 || f.farmerVerifiedStatus === 'Rejected';

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
            {/* If pending or rejected -> show Approve button */}
            {(!isApproved && f.farmerId) && (
              <button
                onClick={() => setApproveTarget(f)}
                title="Approve farmer to sell on marketplace"
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(5,150,105,0.2)'
                }}
              >
                <Check size={13} /> Approve Seller
              </button>
            )}

            {/* If pending -> show Reject button */}
            {(isPending && f.farmerId) && (
              <button
                onClick={() => setRejectTarget(f)}
                title="Reject seller registration"
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: '1px solid #FCA5A5',
                  backgroundColor: '#FEF2F2',
                  color: '#B91C1C',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <X size={13} /> Reject
              </button>
            )}

            {/* If approved -> show Revoke button */}
            {(isApproved && f.farmerId) && (
              <button
                onClick={() => setRevokeTarget(f)}
                title="Revoke seller privileges and hide listings"
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FFFFFF',
                  color: '#DC2626',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Ban size={13} /> Revoke Seller
              </button>
            )}

            {/* View Profile */}
            <button
              onClick={() => navigate(`/admin/users/${f.id}`)}
              style={{
                padding: '4px 9px',
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
              <Eye size={13} /> View
            </button>
          </div>
        );
      }
    }
  ];

  const filterTabs = [
    { id: 'all', label: 'All Farmers' },
    { id: 'Pending', label: 'Pending Approval', countColor: '#D97706' },
    { id: 'Approved', label: 'Approved Sellers', countColor: '#15803D' },
    { id: 'Rejected', label: 'Rejected / Revoked', countColor: '#DC2626' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Top Page Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
              Farmer & Seller Directory
            </h1>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              Seller Approval Flow
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Farmers register freely and can add produce listings, but their listings remain hidden from buyers until Admin approves their seller account.
          </p>
        </div>

        <Link
          to="/admin/verifications"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(2,132,199,0.25)'
          }}
        >
          <UserCheck size={16} /> Verifications Queue
        </Link>
      </div>

      {/* Seller Verification Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '1.25rem'
        }}
      >
        {filterTabs.map((tab) => {
          const isActive = verificationFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setVerificationFilter(tab.id);
                setPage(1);
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: isActive ? '1px solid #1B4D3E' : '1px solid #E2E8F0',
                backgroundColor: isActive ? '#1B4D3E' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 4px rgba(27,77,62,0.15)' : 'none'
              }}
            >
              {tab.id === 'Pending' && <Clock size={14} color={isActive ? '#FEF3C7' : '#D97706'} />}
              {tab.id === 'Approved' && <CheckCircle2 size={14} color={isActive ? '#DCFCE7' : '#15803D'} />}
              {tab.id === 'Rejected' && <XCircle size={14} color={isActive ? '#FEE2E2' : '#DC2626'} />}
              {tab.label}
            </button>
          );
        })}
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
        searchPlaceholder="Search by farmer name, farm name, email, or region..."
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
            <option value="all">All User Accounts</option>
            <option value="Active">Active Accounts</option>
            <option value="Suspended">Suspended Accounts</option>
          </select>
        }
      />

      {/* Confirm Approve Modal */}
      <ConfirmModal
        isOpen={!!approveTarget}
        title="Approve Farmer as Verified Seller"
        message={`Are you sure you want to approve "${approveTarget?.fullName}" (${approveTarget?.farmName || 'Farmer'}) as an authorized seller? Their active listings will immediately appear for all buyers on the public marketplace.`}
        confirmText="Approve Seller"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleConfirmApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Reject Reason Modal */}
      <ReasonModal
        isOpen={!!rejectTarget}
        title="Reject Seller Account"
        description={`Provide a reason for rejecting the seller privileges for "${rejectTarget?.fullName}". The farmer can still manage their dashboard, but their products will NOT show on the marketplace.`}
        confirmText="Reject Seller"
        placeholder="Enter rejection reason (e.g. Incomplete farm verification, land details mismatch)..."
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Revoke Reason Modal */}
      <ReasonModal
        isOpen={!!revokeTarget}
        title="Revoke Seller Privileges"
        description={`State the reason for revoking seller approval for "${revokeTarget?.fullName}". Their crop listings will be immediately hidden from the public marketplace.`}
        confirmText="Revoke Selling Privileges"
        placeholder="Enter reason for revoking seller status (e.g. policy violation, inactive farm)..."
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleConfirmRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
};

export default ManageFarmers;

