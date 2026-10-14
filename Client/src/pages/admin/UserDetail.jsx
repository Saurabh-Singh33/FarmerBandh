import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
  Key,
  Ban,
  CheckCircle,
  Tractor,
  Package,
  ClipboardList,
  IndianRupee,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { adminUsersApi } from '../../services/adminApi';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [resetPwdModalOpen, setResetPwdModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await adminUsersApi.getUserDetail(id);
      setUser(res);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleSuspend = async (reason) => {
    try {
      setActionLoading(true);
      await adminUsersApi.suspendUser(id, reason);
      notify.success('User has been suspended.');
      setSuspendModalOpen(false);
      fetchUser();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to suspend user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setActionLoading(true);
      await adminUsersApi.reactivateUser(id);
      notify.success('User has been reactivated.');
      setReactivateModalOpen(false);
      fetchUser();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reactivate user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setActionLoading(true);
      const res = await adminUsersApi.resetPassword(id);
      notify.info(`Temporary password: ${res.temporaryPassword || 'Generated'}`, 'Password Reset');
      setResetPwdModalOpen(false);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading User Profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <h2>User Not Found</h2>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#0F172A',
            color: '#FFF',
            cursor: 'pointer'
          }}
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const isSuspended = user.status === 'Suspended';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Back Button & Title */}
      <button
        onClick={() => navigate('/admin/users')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.4rem 0.8rem',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          backgroundColor: '#FFFFFF',
          color: '#475569',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Users
      </button>

      {/* Main Profile Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#0F172A',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800
              }}
            >
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                  {user.fullName}
                </h1>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: isSuspended ? '#FEE2E2' : '#DCFCE7',
                    color: isSuspended ? '#B91C1C' : '#15803D'
                  }}
                >
                  {user.status}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#F1F5F9',
                    color: '#475569'
                  }}
                >
                  {user.role}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '6px', color: '#64748B', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={14} /> {user.email}
                </span>
                {user.phone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} /> {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isSuspended ? (
              <button
                onClick={() => setReactivateModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <CheckCircle size={15} /> Reactivate Account
              </button>
            ) : (
              <button
                onClick={() => setSuspendModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Ban size={15} /> Suspend Account
              </button>
            )}

            <button
              onClick={() => setResetPwdModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Key size={15} /> Reset Password
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.85rem'
          }}
        >
          <div>
            <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Joined Platform</span>
            <strong style={{ color: '#0F172A' }}>{formatDate(user.joinedAt)}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Last Login</span>
            <strong style={{ color: '#0F172A' }}>{formatDate(user.lastLoginAt)}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Total Orders</span>
            <strong style={{ color: '#0F172A' }}>{user.orderCount || 0}</strong>
          </div>
          {user.role === 'Farmer' && (
            <div>
              <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Active Listings</span>
              <strong style={{ color: '#0F172A' }}>{user.listingCount || 0}</strong>
            </div>
          )}
        </div>
      </div>

      {/* If Farmer, Show Farmer Specifics */}
      {user.farmerProfile && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Tractor size={20} color="#059669" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Farmer & Operation Details
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              fontSize: '0.875rem'
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Farm Name</span>
              <strong style={{ color: '#0F172A' }}>{user.farmerProfile.farmName || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Verification Status</span>
              <strong
                style={{
                  color:
                    user.farmerProfile.verified === 'Verified'
                      ? '#15803D'
                      : user.farmerProfile.verified === 'Pending'
                      ? '#0284C7'
                      : '#D97706'
                }}
              >
                {user.farmerProfile.verified}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Farm Size</span>
              <strong style={{ color: '#0F172A' }}>
                {user.farmerProfile.acres ? `${user.farmerProfile.acres} Acres` : '—'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Soil Type</span>
              <strong style={{ color: '#0F172A' }}>{user.farmerProfile.soilType || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Primary Crops</span>
              <strong style={{ color: '#0F172A' }}>{user.farmerProfile.primaryCrops || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Bank Account Setup</span>
              <strong style={{ color: user.farmerProfile.hasBankAccount ? '#15803D' : '#DC2626' }}>
                {user.farmerProfile.hasBankAccount ? 'Configured' : 'Missing'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReasonModal
        isOpen={suspendModalOpen}
        title="Suspend Account"
        description="State the reason for suspending this account. This action will be audited."
        confirmText="Suspend User"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendModalOpen(false)}
      />

      <ConfirmModal
        isOpen={reactivateModalOpen}
        title="Reactivate Account"
        message="Restore full access for this user to buy, sell, and negotiate on the platform?"
        confirmText="Reactivate"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleReactivate}
        onCancel={() => setReactivateModalOpen(false)}
      />

      <ConfirmModal
        isOpen={resetPwdModalOpen}
        title="Reset Password"
        message="Generate a new temporary password for this user? This will log them out of all active sessions."
        confirmText="Generate Password"
        type="warning"
        isLoading={actionLoading}
        onConfirm={handleResetPassword}
        onCancel={() => setResetPwdModalOpen(false)}
      />
    </div>
  );
};

export default UserDetail;
