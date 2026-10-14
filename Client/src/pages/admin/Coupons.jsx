import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { adminCouponsApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { notify } from '../../context/NotificationContext';

export const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Percent');
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validTo, setValidTo] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [usageLimit, setUsageLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminCouponsApi.getCoupons({ page, pageSize: 20 });
      setCoupons(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !value) {
      notify.error('Code and Value are required.');
      return;
    }

    try {
      setSubmitting(true);
      await adminCouponsApi.createCoupon({
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        type,
        value: parseFloat(value),
        minOrderValue: parseFloat(minOrderValue) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive: true
      });
      notify.success(`Coupon ${code.toUpperCase()} created successfully!`, 'Coupon Created');
      setCreateModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setType('Percent');
    setValue('');
    setMinOrderValue('0');
    setMaxDiscount('');
    setUsageLimit('');
  };

  const handleToggle = async (coupon) => {
    try {
      await adminCouponsApi.toggleCoupon(coupon.id);
      notify.info(`Coupon ${coupon.code} status toggled.`);
      fetchCoupons();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to toggle coupon.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await adminCouponsApi.deleteCoupon(deleteTarget.id);
      notify.success(`Coupon ${deleteTarget.code} deleted.`);
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to delete coupon.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Code & Details',
      render: (c) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0F172A', letterSpacing: '0.04em' }}>
            {c.code}
          </div>
          {c.description && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.description}</div>}
        </div>
      )
    },
    {
      header: 'Discount',
      render: (c) => (
        <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.85rem' }}>
          {c.type === 'Percent' ? `${c.value}% Off` : `₹${c.value} Off`}
        </span>
      )
    },
    {
      header: 'Usage',
      render: (c) => (
        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
          {c.usedCount || 0} / {c.usageLimit != null ? c.usageLimit : '∞'} used
        </div>
      )
    },
    {
      header: 'Validity',
      render: (c) => (
        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
          <div>From: {new Date(c.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
          <div>To: {new Date(c.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (c) => (
        <button
          onClick={() => handleToggle(c)}
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: c.isActive ? '#DCFCE7' : '#FEE2E2',
            color: c.isActive ? '#15803D' : '#B91C1C'
          }}
          title="Click to toggle status"
        >
          {c.isActive ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <button
          onClick={() => setDeleteTarget(c)}
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
        >
          <Trash2 size={12} /> Delete
        </button>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
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
            Coupons & Discount Promotions
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Create discount vouchers, promotional incentives, and seasonal bulk harvest discounts.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#059669',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
          }}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        isLoading={loading}
      />

      {/* Create Modal */}
      {createModalOpen && (
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
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '500px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>Create New Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HARVEST20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  >
                    <option value="Percent">Percentage (%)</option>
                    <option value="Flat">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder={type === 'Percent' ? 'e.g. 15 for 15%' : 'e.g. 500 for ₹500'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Valid To
                  </label>
                  <input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Description / Campaign Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali festive harvest sale promo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#FFF', fontWeight: 600 }}
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Coupon"
        message={`Delete promo voucher ${deleteTarget?.code}? It can no longer be applied by buyers.`}
        confirmText="Delete Voucher"
        type="danger"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Coupons;
