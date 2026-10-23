import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';
import { notificationApi } from '../../services/notificationApi';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from '../../context/ToastContext';
import { NotificationCard } from '../../components/NotificationCard';
import { Skeleton } from '../../components/Skeleton';

const CATEGORIES = [
  { label: 'All', value: null },
  { label: 'Orders', value: 'Order' },
  { label: 'Negotiations', value: 'Negotiation' },
  { label: 'Returns & Disputes', value: 'ReturnDispute' },
  { label: 'Payouts', value: 'Payout' },
  { label: 'Verification', value: 'Verification' },
  { label: 'Reviews', value: 'Review' }
];

export const Notifications = () => {
  const { refresh: refreshContext, unreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Search debouncing (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.list({
        category: selectedCategory,
        unreadOnly,
        page,
        pageSize
      });
      setNotifications(data?.items || []);
      setTotalCount(data?.totalCount || 0);
      setSelectedIds(new Set());
    } catch (err) {
      if (err.response) {
        toast.error('Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, unreadOnly, page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Client-side search filtering over current page
  const filteredNotifications = useMemo(() => {
    if (!debouncedSearch.trim()) return notifications;
    const q = debouncedSearch.toLowerCase();
    return notifications.filter(
      (n) => n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q)
    );
  }, [notifications, debouncedSearch]);

  // Handlers
  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      refreshContext();
    } catch {
      toast.error('Could not mark as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      selectedIds.delete(id);
      setSelectedIds(new Set(selectedIds));
      refreshContext();
      toast.success('Notification removed.');
    } catch {
      toast.error('Could not delete notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      refreshContext();
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleClearRead = async () => {
    if (!window.confirm('Are you sure you want to delete all read notifications?')) return;
    try {
      await notificationApi.clearRead();
      await loadNotifications();
      refreshContext();
      toast.success('Read notifications cleared.');
    } catch {
      toast.error('Failed to clear read notifications.');
    }
  };

  // Bulk Handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id, checked) => {
    const updated = new Set(selectedIds);
    if (checked) updated.add(id);
    else updated.delete(id);
    setSelectedIds(updated);
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.size === 0) return;
    try {
      await notificationApi.bulkAction({
        notificationIds: Array.from(selectedIds),
        action: 'markRead'
      });
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.has(n.id) ? { ...n, isRead: true } : n))
      );
      setSelectedIds(new Set());
      refreshContext();
      toast.success(`Marked ${selectedIds.size} as read.`);
    } catch {
      toast.error('Failed to update selected items.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} notifications?`)) return;
    try {
      await notificationApi.bulkAction({
        notificationIds: Array.from(selectedIds),
        action: 'delete'
      });
      await loadNotifications();
      setSelectedIds(new Set());
      refreshContext();
      toast.success(`Deleted selected notifications.`);
    } catch {
      toast.error('Failed to delete selected items.');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isAllSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => selectedIds.has(n.id));

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1.25rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Top Header */}
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
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: '0 0 0.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <Bell size={26} color="#1B4D3E" />
            Notifications
          </h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
            Stay informed on orders, negotiations, returns, and platform updates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={loadNotifications}
            title="Refresh"
            aria-label="Refresh notifications"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '9999px',
              padding: '0.5rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#374151',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <Link
            to="/notifications/preferences"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '9999px',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#1B4D3E',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Settings size={15} />
            Preferences
          </Link>
        </div>
      </div>

      {/* Control Bar: Categories, Search, Unread Filter */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '1.5rem'
        }}
      >
        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '0.85rem',
            borderBottom: '1px solid #F3F4F6',
            scrollbarWidth: 'none'
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setPage(1);
                }}
                style={{
                  backgroundColor: isActive ? '#1B4D3E' : '#F3F4F6',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.4rem 0.95rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary controls: Search + Unread toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 260px',
              maxWidth: '400px'
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            />
            <input
              type="text"
              placeholder="Filter notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter notifications"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Unread Only Switch & Global Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.84rem',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setUnreadOnly(e.target.checked);
                  setPage(1);
                }}
                style={{ width: '16px', height: '16px', accentColor: '#1B4D3E', cursor: 'pointer' }}
              />
              Unread only
            </label>

            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <CheckCheck size={16} /> Mark all read
            </button>

            <button
              onClick={handleClearRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '0.84rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Trash2 size={15} /> Clear read
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Banner (when items selected) */}
      {selectedIds.size > 0 && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <span style={{ fontWeight: 600, color: '#065F46', fontSize: '0.88rem' }}>
            {selectedIds.size} notification{selectedIds.size > 1 ? 's' : ''} selected
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handleBulkMarkRead}
              style={{
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <CheckCheck size={14} /> Mark as Read
            </button>

            <button
              onClick={handleBulkDelete}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Trash2 size={14} /> Delete Selected
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: 'none',
                border: 'none',
                color: '#4B5563',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selection toolbar for visible items */}
      {!loading && filteredNotifications.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.5rem',
            marginBottom: '0.5rem',
            fontSize: '0.82rem',
            color: '#6B7280'
          }}
        >
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              aria-label="Select all notifications on page"
              style={{ width: '16px', height: '16px', accentColor: '#1B4D3E', cursor: 'pointer' }}
            />
            Select all on this page
          </label>

          <span>
            Showing {filteredNotifications.length} of {totalCount}
          </span>
        </div>
      )}

      {/* Notifications List / Skeleton / Empty State */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              <Skeleton width="36px" height="36px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="45%" height="18px" borderRadius="4px" style={{ marginBottom: '8px' }} />
                <Skeleton width="85%" height="14px" borderRadius="4px" style={{ marginBottom: '6px' }} />
                <Skeleton width="30%" height="12px" borderRadius="4px" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#9CA3AF'
            }}
          >
            <Bell size={28} />
          </div>

          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: '0 0 0.5rem 0'
            }}
          >
            No notifications found
          </h2>

          <p
            style={{
              color: '#6B7280',
              fontSize: '0.9rem',
              maxWidth: '420px',
              margin: '0 auto 1.5rem',
              lineHeight: '1.5'
            }}
          >
            {debouncedSearch
              ? `No notifications matched "${debouncedSearch}". Try a different search term or clear the filter.`
              : unreadOnly
              ? "You've read all your notifications! Turn off the unread filter to see past updates."
              : selectedCategory
              ? `No notifications in the ${selectedCategory} category right now.`
              : 'You have no notifications at the moment. As orders are placed, deals are made, or returns progress, alerts will show here.'}
          </p>

          {(debouncedSearch || unreadOnly || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setUnreadOnly(false);
                setSelectedCategory(null);
                setPage(1);
              }}
              style={{
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                padding: '0.6rem 1.4rem',
                borderRadius: '9999px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredNotifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              selected={selectedIds.has(n.id)}
              onSelect={handleToggleSelect}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1.5rem',
                padding: '1rem 0',
                borderTop: '1px solid #E5E7EB'
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1.1rem',
                  backgroundColor: page <= 1 ? '#F3F4F6' : '#FFFFFF',
                  color: page <= 1 ? '#9CA3AF' : '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span style={{ fontSize: '0.88rem', color: '#4B5563', fontWeight: 500 }}>
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1.1rem',
                  backgroundColor: page >= totalPages ? '#F3F4F6' : '#FFFFFF',
                  color: page >= totalPages ? '#9CA3AF' : '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
