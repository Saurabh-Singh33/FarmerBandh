import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  Key,
  ShieldCheck,
  Ban,
  CheckCircle,
  Eye,
  Filter,
  UserCheck,
  UserMinus
} from 'lucide-react';
import { adminUsersApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { notify } from '../../context/NotificationContext';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [resetPwdModalOpen, setResetPwdModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [demoteModalOpen, setDemoteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUsersApi.getUsers({
        page,
        pageSize: 20,
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (val) => {
    setSearch(val);
    setPage(1);
  };

  // Trigger search on debounce or Enter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Actions
  const handleSuspend = async (reason) => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      await adminUsersApi.suspendUser(selectedUser.id, reason);
      notify.success(`User ${selectedUser.fullName} has been suspended.`, 'Account Suspended');
      setSuspendModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to suspend user.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      await adminUsersApi.reactivateUser(selectedUser.id);
      notify.success(`User ${selectedUser.fullName} has been reactivated.`, 'Account Reactivated');
      setReactivateModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reactivate user.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      const res = await adminUsersApi.resetPassword(selectedUser.id);
      notify.info(
        `Temporary password for ${selectedUser.fullName}: ${res.temporaryPassword || 'Generated'}`,
        'Password Reset'
      );
      setResetPwdModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePromote = async (notes) => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      await adminUsersApi.promoteUser(selectedUser.id, 'Admin', notes);
      notify.success(`User ${selectedUser.fullName} promoted to Admin.`, 'Role Updated');
      setPromoteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to promote user.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDemote = async (reason) => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      await adminUsersApi.demoteUser(selectedUser.id, reason);
      notify.success(`Admin role revoked from ${selectedUser.fullName}.`, 'Role Updated');
      setDemoteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to demote user.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'User',
      render: (u) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{u.email}</div>
        </div>
      )
    },
    {
      header: 'Role',
      render: (u) => {
        const isAdm = u.role === 'Admin';
        const isFar = u.role === 'Farmer';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isAdm ? '#FEF3C7' : isFar ? '#DCFCE7' : '#E0F2FE',
              color: isAdm ? '#B45309' : isFar ? '#15803D' : '#0369A1'
            }}
          >
            {u.role}
          </span>
        );
      }
    },
    {
      header: 'Location',
      render: (u) => (
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
          {u.district && u.state ? `${u.district}, ${u.state}` : u.state || '—'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (u) => {
        const isSusp = u.status === 'Suspended';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isSusp ? '#FEE2E2' : '#DCFCE7',
              color: isSusp ? '#B91C1C' : '#15803D'
            }}
          >
            {u.status}
          </span>
        );
      }
    },
    {
      header: 'Activity',
      render: (u) => (
        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
          <div>{u.orderCount || 0} orders</div>
          {u.role === 'Farmer' && <div>{u.listingCount || 0} listings</div>}
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => navigate(`/admin/users/${u.id}`)}
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
            title="View User Details"
          >
            <Eye size={13} /> View
          </button>

          {u.status === 'Suspended' ? (
            <button
              onClick={() => {
                setSelectedUser(u);
                setReactivateModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #86EFAC',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Reactivate Account"
            >
              <CheckCircle size={13} /> Reactivate
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedUser(u);
                setSuspendModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Suspend Account"
            >
              <Ban size={13} /> Suspend
            </button>
          )}

          <button
            onClick={() => {
              setSelectedUser(u);
              setResetPwdModalOpen(true);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Reset Password"
          >
            <Key size={13} /> Reset
          </button>

          {u.role !== 'Admin' ? (
            <button
              onClick={() => {
                setSelectedUser(u);
                setPromoteModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #FDE68A',
                backgroundColor: '#FEFCE8',
                color: '#B45309',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Promote to Admin"
            >
              <UserCheck size={13} /> Promote
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedUser(u);
                setDemoteModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#64748B',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Revoke Admin Access"
            >
              <UserMinus size={13} /> Demote
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
          User Directory & Moderation
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
          Inspect user accounts, manage roles, suspend abusive profiles, and trigger password resets.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={handleSearchSubmit}
        searchPlaceholder="Search by name, email, or region..."
        isLoading={loading}
        toolbarActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
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
              <option value="all">All Roles</option>
              <option value="Buyer">Buyers</option>
              <option value="Farmer">Farmers</option>
              <option value="Admin">Admins</option>
            </select>

            {/* Status Filter */}
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
          </div>
        }
      />

      {/* Suspend User Modal */}
      <ReasonModal
        isOpen={suspendModalOpen}
        title={`Suspend Account: ${selectedUser?.fullName}`}
        description="Suspending this account will revoke login access, hide active listings, and cancel open negotiations. Provide a clear reason."
        confirmText="Suspend User"
        type="danger"
        isLoading={isActionLoading}
        onConfirm={handleSuspend}
        onCancel={() => {
          setSuspendModalOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Reactivate User Modal */}
      <ConfirmModal
        isOpen={reactivateModalOpen}
        title={`Reactivate Account: ${selectedUser?.fullName}`}
        message="Are you sure you want to restore full platform access for this user?"
        confirmText="Reactivate"
        type="success"
        isLoading={isActionLoading}
        onConfirm={handleReactivate}
        onCancel={() => {
          setReactivateModalOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Reset Password Modal */}
      <ConfirmModal
        isOpen={resetPwdModalOpen}
        title={`Reset Password: ${selectedUser?.fullName}`}
        message="This will invalidate their existing credentials and generate a temporary password. Are you sure you wish to continue?"
        confirmText="Generate New Password"
        type="warning"
        isLoading={isActionLoading}
        onConfirm={handleResetPassword}
        onCancel={() => {
          setResetPwdModalOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Promote to Admin Modal */}
      <ReasonModal
        isOpen={promoteModalOpen}
        title={`Promote to Administrator: ${selectedUser?.fullName}`}
        description="CAUTION: Granting administrator privileges gives full control over the marketplace, user data, dispute arbitration, and financial transactions. Enter reason/justification."
        placeholder="Enter justification for granting admin rights..."
        confirmText="Grant Admin Rights"
        type="warning"
        isLoading={isActionLoading}
        onConfirm={handlePromote}
        onCancel={() => {
          setPromoteModalOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Demote from Admin Modal */}
      <ReasonModal
        isOpen={demoteModalOpen}
        title={`Revoke Administrator Rights: ${selectedUser?.fullName}`}
        description="Are you sure you want to revoke admin permissions from this user? They will return to standard user permissions."
        placeholder="Reason for revoking admin rights..."
        confirmText="Revoke Admin Access"
        type="danger"
        isLoading={isActionLoading}
        onConfirm={handleDemote}
        onCancel={() => {
          setDemoteModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default ManageUsers;
