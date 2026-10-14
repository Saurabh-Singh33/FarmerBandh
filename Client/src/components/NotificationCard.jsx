import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2, ArrowUpRight, Clock } from 'lucide-react';
import { NotificationIcon, getNotificationConfig } from './NotificationIcon';

const formatDateTime = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const NotificationCard = ({
  notification,
  selected = false,
  onSelect,
  onMarkRead,
  onDelete
}) => {
  const navigate = useNavigate();
  const config = getNotificationConfig(notification.type);

  const targetUrl = notification.link || notification.actionUrl;
  const messageText = notification.body || notification.message;

  const handleRowClick = () => {
    if (targetUrl) {
      if (!notification.isRead && onMarkRead) {
        onMarkRead(notification.id);
      }
      navigate(targetUrl);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1rem 1.25rem',
        backgroundColor: notification.isRead ? '#FFFFFF' : '#F0FDF4',
        border: selected ? '1.5px solid #1B4D3E' : (notification.isRead ? '1px solid #E5E7EB' : '1px solid #BBF7D0'),
        borderRadius: '12px',
        marginBottom: '0.75rem',
        transition: 'all 0.15s ease',
        boxShadow: selected ? '0 2px 8px rgba(27,77,62,0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
        position: 'relative'
      }}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div style={{ paddingTop: '0.2rem' }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(notification.id, e.target.checked);
            }}
            aria-label={`Select notification: ${notification.title}`}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#1B4D3E'
            }}
          />
        </div>
      )}

      {/* Type Icon */}
      <div style={{ paddingTop: '0.15rem' }}>
        <NotificationIcon type={notification.type} size={20} />
      </div>

      {/* Main Content */}
      <div
        style={{ flex: 1, minWidth: 0, cursor: targetUrl ? 'pointer' : 'default' }}
        onClick={handleRowClick}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span
            style={{
              fontWeight: notification.isRead ? 600 : 700,
              fontSize: '0.96rem',
              color: '#111827'
            }}
          >
            {notification.title}
          </span>

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '1px 7px',
              borderRadius: '9999px',
              backgroundColor: config.bg,
              color: config.color,
              border: `1px solid ${config.border}`
            }}
          >
            {config.label}
          </span>

          {!notification.isRead && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#16A34A',
                display: 'inline-block'
              }}
              title="Unread"
            />
          )}
        </div>

        <p
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.86rem',
            color: '#4B5563',
            lineHeight: '1.45'
          }}
        >
          {messageText}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.76rem', color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} />
            {formatDateTime(notification.createdAt)}
          </span>

          {targetUrl && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                color: '#1B4D3E',
                fontWeight: 600
              }}
            >
              Take action <ArrowUpRight size={13} />
            </span>
          )}
        </div>
      </div>

      {/* Row Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexShrink: 0,
          paddingTop: '0.1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {onMarkRead && (
          <button
            onClick={() => onMarkRead(notification.id)}
            title={notification.isRead ? 'Already read' : 'Mark as read'}
            disabled={notification.isRead}
            aria-label="Mark notification as read"
            style={{
              background: 'none',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '6px',
              cursor: notification.isRead ? 'default' : 'pointer',
              color: notification.isRead ? '#9CA3AF' : '#16A34A',
              backgroundColor: notification.isRead ? '#F9FAFB' : '#FFFFFF',
              opacity: notification.isRead ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <Check size={15} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(notification.id)}
            title="Delete notification"
            aria-label="Delete notification"
            style={{
              background: 'none',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#DC2626',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2';
              e.currentTarget.style.borderColor = '#FECACA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
