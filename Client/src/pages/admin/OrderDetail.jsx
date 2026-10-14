import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  User,
  MapPin,
  Package,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  IndianRupee,
  SlidersHorizontal
} from 'lucide-react';
import { adminOrdersApi } from '../../services/adminApi';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [forceCompleteModalOpen, setForceCompleteModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  // Form states for modals
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [newStatus, setNewStatus] = useState('InTransit');
  const [overrideReason, setOverrideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await adminOrdersApi.getOrderDetail(id);
      setOrder(res);
      if (res) {
        setRefundAmount(res.totalAmount?.toString() || '');
      }
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetail();
  }, [id]);

  const handleForceComplete = async () => {
    try {
      setActionLoading(true);
      await adminOrdersApi.forceCompleteOrder(id);
      notify.success('Order completed.');
      setForceCompleteModalOpen(false);
      fetchOrderDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to complete order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    try {
      setActionLoading(true);
      await adminOrdersApi.cancelOrder(id, reason);
      notify.info('Order cancelled.');
      setCancelModalOpen(false);
      fetchOrderDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to cancel order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0 || amt > (order?.totalAmount || 0)) {
      notify.error('Please enter a valid refund amount.');
      return;
    }
    if (!refundReason.trim()) {
      notify.error('Please provide a reason for the refund.');
      return;
    }

    try {
      setActionLoading(true);
      await adminOrdersApi.refundOrder(id, {
        amount: amt,
        reason: refundReason.trim()
      });
      notify.success('Refund issued successfully.', 'Refund Created');
      setRefundModalOpen(false);
      setRefundReason('');
      fetchOrderDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to issue refund.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverrideStatus = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      notify.error('Please provide a reason for status override.');
      return;
    }

    try {
      setActionLoading(true);
      await adminOrdersApi.overrideStatus(id, newStatus, overrideReason.trim());
      notify.success(`Order status updated to ${newStatus}.`, 'Status Updated');
      setOverrideModalOpen(false);
      setOverrideReason('');
      fetchOrderDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to override status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Order Breakdown...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: '#0F172A', color: '#FFF' }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <button
        onClick={() => navigate('/admin/orders')}
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
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
              Order {order.orderNumber}
            </h1>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: isDelivered ? '#DCFCE7' : isCancelled ? '#FEE2E2' : '#FEF3C7',
                color: isDelivered ? '#15803D' : isCancelled ? '#B91C1C' : '#B45309'
              }}
            >
              {order.status}
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
              {order.paymentMethod} • {order.paymentStatus}
            </span>
          </div>
          <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Placed on{' '}
            {new Date(order.placedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Admin Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setOverrideModalOpen(true)}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <SlidersHorizontal size={14} /> Override Status
          </button>

          <button
            onClick={() => setRefundModalOpen(true)}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={14} /> Issue Refund
          </button>

          {!isDelivered && !isCancelled && (
            <>
              <button
                onClick={() => setForceCompleteModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Force Complete
              </button>
              <button
                onClick={() => setCancelModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* Two Column: Buyer/Seller & Address */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Parties Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
            Parties Involved
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Buyer
              </span>
              <strong style={{ color: '#0F172A' }}>{order.buyer?.name}</strong>
              <div style={{ color: '#64748B' }}>{order.buyer?.email}</div>
              {order.buyer?.phone && <div style={{ color: '#64748B' }}>{order.buyer.phone}</div>}
            </div>
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Seller / Farm
              </span>
              <strong style={{ color: '#0F172A' }}>{order.seller?.name}</strong>
              <div style={{ color: '#64748B' }}>{order.seller?.email}</div>
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
            Delivery Destination
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
            <div>{order.deliveryAddress?.addressLine1}</div>
            {order.deliveryAddress?.addressLine2 && <div>{order.deliveryAddress.addressLine2}</div>}
            <div>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
          Ordered Crop Items
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
              <th style={{ padding: '0.5rem 0' }}>Item</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Quantity</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Unit Price</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600, color: '#0F172A' }}>
                  {item.productName}
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  {item.quantityQuintal} Quintals
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  ₹{item.unitPricePerQuintal?.toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                  ₹{item.totalPrice?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pricing Summary */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '260px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Subtotal:</span>
              <span>₹{order.subtotalAmount?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Delivery Fee:</span>
              <span>₹{order.deliveryFee?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Platform Fee:</span>
              <span>₹{order.platformFee?.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                <span>Discount Applied:</span>
                <span>-₹{order.discountAmount?.toLocaleString()}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#0F172A',
                paddingTop: '6px',
                borderTop: '1px solid #CBD5E1'
              }}
            >
              <span>Total Paid:</span>
              <span>₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      {order.timeline?.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
            Lifecycle Timeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.timeline.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', marginTop: '6px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#0F172A' }}>{entry.status}</strong>
                    <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                      {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {entry.note && <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2px' }}>{entry.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      <ReasonModal
        isOpen={cancelModalOpen}
        title="Cancel Order"
        description="Provide a reason for administrative cancellation."
        confirmText="Cancel Order"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
      />

      {/* Force Complete Modal */}
      <ConfirmModal
        isOpen={forceCompleteModalOpen}
        title="Force Complete Order"
        message="Mark this order as Delivered and finalize transaction settlements?"
        confirmText="Force Complete"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleForceComplete}
        onCancel={() => setForceCompleteModalOpen(false)}
      />

      {/* Override Status Modal */}
      {overrideModalOpen && (
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
          onClick={() => setOverrideModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '460px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>Override Order Status</h3>
            <form onSubmit={handleOverrideStatus}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1rem' }}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="InTransit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Reason for Override
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={3}
                placeholder="State why this status is being administratively updated..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#FFF' }}
                >
                  {actionLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Refund Modal */}
      {refundModalOpen && (
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
          onClick={() => setRefundModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '460px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>Issue Administrative Refund</h3>
            <form onSubmit={handleIssueRefund}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Refund Amount (₹) (Max: ₹{order.totalAmount})
              </label>
              <input
                type="number"
                step="0.01"
                max={order.totalAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1rem' }}
              />

              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Refund Justification / Reason
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="Reason for issuing this refund..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#FFF' }}
                >
                  {actionLoading ? 'Processing...' : 'Issue Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
