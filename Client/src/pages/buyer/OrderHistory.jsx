import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  ArrowRight,
  RotateCcw,
  XCircle,
  Clock,
  CheckCircle2,
  Truck,
  RefreshCw,
  UserCheck,
  BadgeCheck,
  ShoppingBag,
  CreditCard,
  Calendar,
  MessageSquareWarning,
  PackageSearch,
  Star,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

import { orderApi } from '../../services/orderApi';
import { returnApi } from '../../services/returnApi';
import { reviewApi } from '../../services/reviewApi';
import { useCart } from '../../context/CartContext';
import { notify } from '../../context/NotificationContext';
import DisputeModal from '../../components/DisputeModal';
import ReturnModal from '../../components/ReturnModal';
import ReviewModal from '../../components/ReviewModal';


export const OrderHistory = () => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [returnsMap, setReturnsMap] = useState({});
  const [reviewsMap, setReviewsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [disputingOrder, setDisputingOrder] = useState(null);
  const [returningOrder, setReturningOrder] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewingExisting, setReviewingExisting] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {

    loadOrders();
  }, [activeTab]);

  const loadOrders = async (queryOverride) => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'All' ? null : activeTab;
      const searchToUse = queryOverride !== undefined ? queryOverride : searchTerm;
      const trimmedSearch = (searchToUse || '').trim();
      const [res, returnsRes] = await Promise.all([
        orderApi.getBuyerOrders({
          status: statusParam,
          search: trimmedSearch || undefined,
          page: 1,
          pageSize: 50
        }),
        returnApi.getBuyerReturns().catch(() => [])
      ]);
      const itemsList = res.items || [];
      setOrders(itemsList);

      const rList = Array.isArray(returnsRes) ? returnsRes : (returnsRes?.items || []);
      const rMap = {};
      rList.forEach((r) => {
        if (r.orderId) rMap[r.orderId] = r;
      });
      setReturnsMap(rMap);

      // Load reviews for delivered orders to show "Rate & Review" or "Edit Review"
      try {
        const deliveredOrders = itemsList.filter((o) => o.status === 'Delivered');
        const revPromises = deliveredOrders.map((o) =>
          reviewApi.getOrderReviews(o.id).then((rList) => ({ orderId: o.id, reviews: rList })).catch(() => null)
        );
        const revResults = await Promise.all(revPromises);
        const revMap = {};
        revResults.filter(Boolean).forEach(({ orderId, reviews }) => {
          if (Array.isArray(reviews) && reviews.length > 0) {
            revMap[orderId] = reviews[0];
          }
        });
        setReviewsMap(revMap);
      } catch (e) {
        console.warn('Failed to load reviews map in order history:', e);
      }
    } catch (err) {
      console.error('Failed to load buyer orders:', err);
      notify.error('Could not load orders. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewOrder = async (ord) => {
    try {
      let fullOrder = ord;
      if (!ord.items || !ord.items.length) {
        fullOrder = await orderApi.getBuyerOrderById(ord.id);
      }
      const revs = await reviewApi.getOrderReviews(ord.id).catch(() => []);
      const primaryItem = fullOrder.items?.[0] || null;
      if (!primaryItem) {
        notify.warning('No items found to review.');
        return;
      }
      const existing = revs.find(
        (r) => r.productId === primaryItem.productId || r.productId === primaryItem.id
      );
      setReviewingOrder(fullOrder);
      setReviewingItem(primaryItem);
      setReviewingExisting(existing || null);
    } catch (err) {
      console.error('Failed to prepare review modal:', err);
      notify.error('Could not load order details for review.');
    }
  };

  const handleConfirmDeleteOrder = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      await orderApi.deleteOrder(deletingOrder.id);
      notify.success(
        `Order #${deletingOrder.orderNumber} and all produce records deleted successfully.`,
        'Order Deleted'
      );
      setDeletingOrder(null);
      await loadOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
      notify.error(err.response?.data?.message || 'Failed to delete order. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };



  const handleSearchChange = (e) => {

    const val = e.target.value;
    setSearchTerm(val);
    // When removing all text from search bar, immediately reset to default and show all orders
    if (!val.trim()) {
      loadOrders('');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadOrders('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders(searchTerm);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setActionLoadingId(orderId);
    try {
      await orderApi.cancelOrder(orderId, 'Cancelled by buyer from order history');
      notify.success('Order has been cancelled successfully.', 'Order Cancelled');
      await loadOrders();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to cancel order.', 'Cancellation Error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReorder = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await orderApi.reorder(orderId);
      notify.success('Items from this order have been added to your cart!', 'Cart Updated');
      await fetchCart();
      navigate('/cart');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to reorder items.', 'Reorder Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute summary stats
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Packed' || o.status === 'InTransit'
    ).length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    return { total, active, delivered };
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <Clock size={13} color="#D97706" /> Pending Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#E0F2FE',
              color: '#075985',
              border: '1px solid #BAE6FD',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <CheckCircle2 size={13} color="#0284C7" /> Order Confirmed
          </span>
        );
      case 'Packed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#F3E8FF',
              color: '#6B21A8',
              border: '1px solid #E9D5FF',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <Package size={13} color="#9333EA" /> Packed & Ready
          </span>
        );
      case 'InTransit':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#EEF2FF',
              color: '#3730A3',
              border: '1px solid #C7D2FE',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <Truck size={13} color="#4F46E5" /> In Transit
          </span>
        );
      case 'Delivered':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <CheckCircle2 size={13} color="#059669" /> Delivered
          </span>
        );
      case 'Cancelled':
      case 'Rejected':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <XCircle size={13} color="#DC2626" /> Cancelled
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {status}
          </span>
        );
    }
  };

  const tabs = [
    { id: 'All', label: 'All Orders' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Confirmed', label: 'Confirmed' },
    { id: 'Packed', label: 'Packed' },
    { id: 'InTransit', label: 'In Transit' },
    { id: 'Delivered', label: 'Delivered' },
    { id: 'Cancelled', label: 'Cancelled' }
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        padding: '1.5rem 1.5rem',
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Top Welcome / Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.85rem',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: 0
              }}
            >
              My Purchase Orders
            </h1>
            <span
              style={{
                backgroundColor: '#E8F5E9',
                color: '#1B4D3E',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid #C8E6C9'
              }}
            >
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
          <p style={{ color: '#6B7280', margin: '0.4rem 0 0 0', fontSize: '0.92rem' }}>
            Track fresh farm produce shipments, manage fulfillment timelines, and request returns or support.
          </p>
        </div>

        {/* Quick Actions & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={loadOrders}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '24px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
            title="Refresh order history"
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <Link
            to="/returns"
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: '24px',
              border: '1px solid #D97706',
              backgroundColor: '#FFFBEB',
              color: '#B45309',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
          >
            <RotateCcw size={14} /> My Returns {Object.keys(returnsMap).length > 0 && `(${Object.keys(returnsMap).length})`}
          </Link>

          <Link
            to="/marketplace"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '24px',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 5px rgba(27,77,62,0.2)'
            }}
          >
            <ShoppingBag size={14} /> Shop Fresh Crops
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Controls Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingBottom: '4px',
            flex: '1 1 auto'
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '24px',
                  border: isActive ? '1px solid #1B4D3E' : '1px solid #E5E7EB',
                  backgroundColor: isActive ? '#1B4D3E' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 6px rgba(27,77,62,0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: '0 1 320px',
            minWidth: '260px'
          }}
        >
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search by order # or farm..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '0.6rem 2.2rem 0.6rem 2.4rem',
                borderRadius: '24px',
                border: '1px solid #E5E7EB',
                fontSize: '0.88rem',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
                title="Clear search"
              >
                <XCircle size={15} />
              </button>
            )}
          </div>
          <button
            type="submit"
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '24px',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders List Container */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '1.75rem',
                height: '140px',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <div style={{ height: '20px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '40%', marginBottom: '1rem' }} />
              <div style={{ height: '16px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '25%', marginBottom: '1.5rem' }} />
              <div style={{ height: '24px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '20%' }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <PackageSearch size={56} color="#1B4D3E" strokeWidth={1.5} />
          </div>
          <h3
            style={{
              color: '#1B4D3E',
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.4rem',
              margin: '0 0 0.5rem 0'
            }}
          >
            No Orders Found
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            {searchTerm
              ? `No purchase orders match "${searchTerm}". Try resetting search or checking other status filters.`
              : `You have no ${activeTab === 'All' ? '' : activeTab.toLowerCase()} orders placed yet. Explore fresh produce listed by verified farmers.`}
          </p>
          <Link
            to="/marketplace"
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '24px',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShoppingBag size={16} /> Explore Marketplace
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((ord) => (
            <div
              key={ord.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
              }}
            >
              {/* Card Header Bar */}
              <div
                style={{
                  padding: '1.15rem 1.5rem',
                  borderBottom: '1px solid #F3F4F6',
                  backgroundColor: '#FAFAF9',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                {/* Left: Order Number & Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.98rem',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Package size={14} color="#1B4D3E" />
                    <span>{ord.orderNumber}</span>
                  </div>

                  <div style={{ color: '#6B7280', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} color="#9CA3AF" />
                    <span>
                      {new Date(ord.placedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {new Date(ord.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Right: Status Badge */}
                <div>{getStatusBadge(ord.status)}</div>
              </div>

              {/* Card Body */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem'
                }}
              >
                {/* Middle Left: Farmer Seller & Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Farmer Seller:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#1B4D3E',
                        fontSize: '0.92rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <UserCheck size={15} color="#1B4D3E" />
                      {ord.sellerName || 'Verified Farm'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: '#2E7D32',
                        backgroundColor: '#E8F5E9',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <BadgeCheck size={12} color="#2E7D32" /> Verified
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#4B5563' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <ShoppingBag size={14} color="#6B7280" />
                      <strong>{ord.itemsCount}</strong> item{ord.itemsCount > 1 ? 's' : ''} in shipment
                    </span>

                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <CreditCard size={14} color="#6B7280" />
                      Payment: <strong style={{ color: '#111827' }}>{ord.paymentMethod}</strong>{' '}
                      <span
                        style={{
                          backgroundColor: ord.paymentStatus?.toLowerCase() === 'paid' ? '#ECFDF5' : '#FEF3C7',
                          color: ord.paymentStatus?.toLowerCase() === 'paid' ? '#065F46' : '#92400E',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {ord.paymentStatus}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Middle Right: Total Amount */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Order Value
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      color: '#1B4D3E',
                      lineHeight: 1.2,
                      marginTop: '2px'
                    }}
                  >
                    ₹
                    {Number(ord.totalAmount).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div
                style={{
                  padding: '0.95rem 1.5rem',
                  borderTop: '1px solid #F3F4F6',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                {/* Primary CTA: Track Shipment & Timeline */}
                <Link
                  to={`/orders/${ord.id}`}
                  style={{
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    color: '#1B4D3E',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#E8F5E9',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#C8E6C9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E8F5E9';
                  }}
                >
                  Track Shipment & Details <ArrowRight size={15} />
                </Link>

                {/* Secondary Actions Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {ord.status === 'Delivered' && (
                    returnsMap[ord.id] ? (
                      <Link
                        to={`/returns/${returnsMap[ord.id].id}`}
                        style={{
                          padding: '0.45rem 0.95rem',
                          border: '1px solid #10B981',
                          backgroundColor: '#ECFDF5',
                          color: '#047857',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#D1FAE5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ECFDF5';
                        }}
                      >
                        <RotateCcw size={13} /> Return: {returnsMap[ord.id].status}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReturningOrder(ord)}
                        style={{
                          padding: '0.45rem 0.95rem',
                          border: '1px solid #D97706',
                          backgroundColor: '#FFFBEB',
                          color: '#B45309',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEF3C7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFBEB';
                        }}
                      >
                        <RotateCcw size={13} /> Request Return
                      </button>
                    )
                  )}

                  {ord.status === 'Delivered' && (
                    reviewsMap[ord.id] ? (
                      <button
                        type="button"
                        onClick={() => handleOpenReviewOrder(ord)}
                        style={{
                          padding: '0.45rem 0.95rem',
                          border: '1px solid #FCD34D',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FDE68A';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEF3C7';
                        }}
                        title="Click to edit or update your review"
                      >
                        <Star size={13} fill="#F59E0B" color="#F59E0B" />
                        Edit Review ({reviewsMap[ord.id].rating}★)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenReviewOrder(ord)}
                        style={{
                          padding: '0.45rem 0.95rem',
                          border: '1px solid #BBF7D0',
                          backgroundColor: '#F0FDF4',
                          color: '#15803D',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#DCFCE7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F0FDF4';
                        }}
                      >
                        <Star size={13} color="#15803D" /> Rate & Review
                      </button>
                    )
                  )}


                  <button
                    type="button"
                    onClick={() => setDisputingOrder(ord)}
                    style={{
                      padding: '0.45rem 0.95rem',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#4B5563',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FBF8';
                      e.currentTarget.style.borderColor = '#15803D';
                      e.currentTarget.style.color = '#15803D';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#4B5563';
                    }}
                  >
                    <MessageSquareWarning size={13} /> Dispute
                  </button>

                  {(ord.status === 'Pending' || ord.status === 'Confirmed') && (
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      disabled={actionLoadingId === ord.id}
                      style={{
                        padding: '0.45rem 0.95rem',
                        border: '1px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <XCircle size={13} /> Cancel Order
                    </button>
                  )}

                  <button
                    onClick={() => handleReorder(ord.id)}
                    disabled={actionLoadingId === ord.id}
                    style={{
                      padding: '0.45rem 0.95rem',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#374151',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FBF8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <RefreshCw size={13} /> Reorder
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingOrder(ord)}
                    disabled={actionLoadingId === ord.id}
                    style={{
                      padding: '0.45rem 0.95rem',
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEE2E2';
                      e.currentTarget.style.borderColor = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                      e.currentTarget.style.borderColor = '#FECACA';
                    }}
                    title="Permanently delete this order and all associated product records"
                  >
                    <Trash2 size={13} /> Delete
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Same-Window Dispute Modal Popup */}
      <DisputeModal
        isOpen={!!disputingOrder}
        order={disputingOrder}
        onClose={() => setDisputingOrder(null)}
        onSuccess={(result) => {
          loadOrders();
          if (result?.id) {
            navigate(`/disputes/${result.id}`);
          } else {
            navigate('/disputes');
          }
        }}
      />

      {/* Same-Window Return Modal Popup */}
      <ReturnModal
        isOpen={!!returningOrder}
        order={returningOrder}
        onClose={() => setReturningOrder(null)}
        onSuccess={(result) => {
          loadOrders();
          if (result?.id) {
            navigate(`/returns/${result.id}`);
          }
        }}
      />

      {/* Same-Window Review & Edit Modal Popup */}
      <ReviewModal
        isOpen={!!reviewingOrder}
        order={reviewingOrder}
        item={reviewingItem}
        existingReview={reviewingExisting}
        onClose={() => {
          setReviewingOrder(null);
          setReviewingItem(null);
          setReviewingExisting(null);
        }}
        onSuccess={() => {
          loadOrders();
        }}
      />

      {/* Delete Order & Produce Records Confirmation Modal */}
      {deletingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setDeletingOrder(null);
            }
          }}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Delete Order & Product Records?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete order{' '}
                  <strong className="text-slate-900 font-mono">#{deletingOrder.orderNumber}</strong>?
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1.5 mt-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Everything removed for this produce:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-0.5">
                    <li>This purchase order from your history</li>
                    <li>All item records for this produce</li>
                    <li>Any associated return requests & chat history</li>
                    <li>Any disputes, refunds & buyer reviews</li>
                  </ul>
                </div>
                <p className="text-[11px] text-rose-600 font-semibold pt-1">
                  This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingOrder(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteOrder}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {isDeleting ? 'Deleting Everything...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default OrderHistory;
