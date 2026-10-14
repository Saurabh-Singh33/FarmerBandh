import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  RefreshCw,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { adminOrdersApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { notify } from '../../context/NotificationContext';

export const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [forceCompleteModalOpen, setForceCompleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminOrdersApi.getOrders({
        page,
        pageSize: 20,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setOrders(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleForceComplete = async () => {
    if (!selectedOrder) return;
    try {
      setActionLoading(true);
      await adminOrdersApi.forceCompleteOrder(selectedOrder.id);
      notify.success(`Order ${selectedOrder.orderNumber} marked as Delivered / Completed.`, 'Order Completed');
      setForceCompleteModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to complete order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (reason) => {
    if (!selectedOrder) return;
    try {
      setActionLoading(true);
      await adminOrdersApi.cancelOrder(selectedOrder.id, reason);
      notify.info(`Order ${selectedOrder.orderNumber} cancelled by admin.`, 'Order Cancelled');
      setCancelModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to cancel order.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Order #',
      render: (o) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{o.orderNumber}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      header: 'Buyer & Seller',
      render: (o) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div>Buyer: <strong>{o.buyerName}</strong></div>
          <div style={{ color: '#64748B' }}>Seller: <strong>{o.sellerName}</strong></div>
        </div>
      )
    },
    {
      header: 'Total Amount',
      render: (o) => (
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
          ₹{o.totalAmount?.toLocaleString()}
        </div>
      )
    },
    {
      header: 'Status',
      render: (o) => {
        const isDelivered = o.status === 'Delivered';
        const isCancelled = o.status === 'Cancelled';
        const isDisputed = o.status === 'Disputed';
        const isInTransit = o.status === 'InTransit';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isDelivered ? '#DCFCE7' : isCancelled ? '#FEE2E2' : isDisputed ? '#FEF2F2' : isInTransit ? '#E0F2FE' : '#FEF3C7',
              color: isDelivered ? '#15803D' : isCancelled ? '#B91C1C' : isDisputed ? '#DC2626' : isInTransit ? '#0369A1' : '#B45309'
            }}
          >
            {o.status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => navigate(`/admin/orders/${o.id}`)}
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
            <Eye size={12} /> View
          </button>

          {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
            <>
              <button
                onClick={() => {
                  setSelectedOrder(o);
                  setForceCompleteModalOpen(true);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
                title="Force Complete Order"
              >
                Complete
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(o);
                  setCancelModalOpen(true);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
                title="Cancel Order"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
          Orders Management
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
          Inspect delivery lifecycle, override shipment states, resolve delivery deadlocks, and execute administrative cancellations.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by order #, buyer, or seller..."
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
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="InTransit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Disputed">Disputed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        }
      />

      {/* Force Complete Modal */}
      <ConfirmModal
        isOpen={forceCompleteModalOpen}
        title={`Force Complete Order: ${selectedOrder?.orderNumber}`}
        message="This will mark the shipment as Delivered, releasing seller payout eligibility and completing the transaction lifecycle."
        confirmText="Force Complete"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleForceComplete}
        onCancel={() => {
          setForceCompleteModalOpen(false);
          setSelectedOrder(null);
        }}
      />

      {/* Cancel Order Modal */}
      <ReasonModal
        isOpen={cancelModalOpen}
        title={`Cancel Order: ${selectedOrder?.orderNumber}`}
        description="Cancelling an order halts delivery and cancels payment settlements. State the administrative cancellation reason."
        placeholder="Reason for administrative cancellation..."
        confirmText="Cancel Order"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default ManageOrders;
