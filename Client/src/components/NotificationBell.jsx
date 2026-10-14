import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCheck, Settings, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationIcon } from './NotificationIcon';

// Helper for relative time formatting
const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  const now = new Date();
  const date = new Date(isoDate);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const NotificationBell = () => {
  const { unreadCount, recent, loading, fetchRecent, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggleDropdown = () => {
    if (!open) {
      fetchRecent();
    }
    setOpen(!open);
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      await markRead(notif.id);
    }
    setOpen(false);
    const targetUrl = notif.link || notif.actionUrl;
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const handleMarkAll = async (e) => {
    e.stopPropagation();
    await markAllRead();
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: open ? '#E8F5E9' : '#F3F4F6',
          border: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: open ? '#1B4D3E' : '#374151',
          transition: 'all 0.15s ease',
          outline: 'none',
          padding: 0
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = '#E5E7EB';
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = '#F3F4F6';
        }}
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              borderRadius: '9999px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '1px 5px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px #FFFFFF',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          role="region"
          aria-label="Recent notifications"
          style={{
            position: 'absolute',
            right: 0,
            top: '48px',
            width: '380px',
            maxWidth: 'calc(100vw - 24px)',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            boxShadow: '0 12px 32px -4px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)',
            zIndex: 120,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '520px'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAFAF9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.98rem' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#E8F5E9',
                    color: '#1B4D3E',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '9999px'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  title="Mark all as read"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '4px 6px',
                    borderRadius: '6px'
                  }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              <Link
                to="/notifications/preferences"
                onClick={() => setOpen(false)}
                title="Notification Settings"
                style={{
                  color: '#6B7280',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Settings size={16} />
              </Link>
            </div>
          </div>

          {/* List Area */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '380px',
              padding: '0.25rem 0'
            }}
          >
            {loading && recent.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
                Loading updates...
              </div>
            ) : recent.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    color: '#9CA3AF'
                  }}
                >
                  <Bell size={22} />
                </div>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                  All caught up!
                </div>
                <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '4px' }}>
                  No recent notifications to show.
                </div>
              </div>
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleItemClick(n);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #F9FAFB',
                    backgroundColor: n.isRead ? '#FFFFFF' : '#F0FDF4',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = n.isRead ? '#F9FAFB' : '#DCFCE7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = n.isRead ? '#FFFFFF' : '#F0FDF4';
                  }}
                >
                  <NotificationIcon type={n.type} size={18} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontWeight: n.isRead ? 600 : 700,
                          color: '#111827',
                          fontSize: '0.88rem',
                          lineHeight: '1.25'
                        }}
                      >
                        {n.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#6B7280',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '0.8rem',
                        color: '#4B5563',
                        lineHeight: '1.35',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {n.body || n.message}
                    </p>
                  </div>

                  {!n.isRead && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#16A34A',
                        flexShrink: 0,
                        marginTop: '6px'
                      }}
                      title="Unread"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: '#FAFAF9',
              borderTop: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              style={{
                textDecoration: 'none',
                color: '#1B4D3E',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              View all notifications <ExternalLink size={13} />
            </Link>

            <Link
              to="/notifications/preferences"
              onClick={() => setOpen(false)}
              style={{
                textDecoration: 'none',
                color: '#6B7280',
                fontSize: '0.78rem',
                fontWeight: 500
              }}
            >
              Preferences
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
