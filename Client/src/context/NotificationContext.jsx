import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

// Global notification dispatcher for use anywhere (even outside components)
let globalNotifyHandler = null;

export const notify = (message, type = 'info', title = '') => {
  if (globalNotifyHandler) {
    globalNotifyHandler(message, type, title);
  } else {
    console.log(`[Notification - ${type.toUpperCase()}] ${title ? title + ': ' : ''}${message}`);
  }
};

notify.success = (message, title = 'Success') => notify(message, 'success', title);
notify.error = (message, title = 'Error') => notify(message, 'error', title);
notify.warning = (message, title = 'Warning') => notify(message, 'warning', title);
notify.info = (message, title = 'Information') => notify(message, 'info', title);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newNotification = {
      id,
      message,
      type,
      title: title || (type.charAt(0).toUpperCase() + type.slice(1)),
      timestamp: Date.now()
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4200);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    globalNotifyHandler = addNotification;
    return () => {
      globalNotifyHandler = null;
    };
  }, [addNotification]);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          titleColor: '#065F46',
          msgColor: '#047857',
          iconColor: '#059669',
          Icon: CheckCircle2
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          titleColor: '#991B1B',
          msgColor: '#B91C1C',
          iconColor: '#DC2626',
          Icon: AlertCircle
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          titleColor: '#92400E',
          msgColor: '#B45309',
          iconColor: '#D97706',
          Icon: AlertTriangle
        };
      case 'info':
      default:
        return {
          bg: '#F0F9FF',
          border: '#BAE6FD',
          titleColor: '#075985',
          msgColor: '#0369A1',
          iconColor: '#0284C7',
          Icon: Info
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ notify, addNotification, removeNotification }}>
      {children}

      {/* Global Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100vw - 40px)',
          pointerEvents: 'none'
        }}
      >
        {notifications.map((n) => {
          const style = getNotificationStyle(n.type);
          const IconComponent = style.Icon;

          return (
            <div
              key={n.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'slideInRight 0.25s ease-out',
                position: 'relative'
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px', color: style.iconColor }}>
                <IconComponent size={20} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {n.title && (
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: style.titleColor,
                      marginBottom: '2px'
                    }}
                  >
                    {n.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: style.msgColor,
                    lineHeight: 1.4,
                    wordBreak: 'break-word'
                  }}
                >
                  {n.message}
                </div>
              </div>

              <button
                onClick={() => removeNotification(n.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: style.iconColor,
                  opacity: 0.7,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return { notify };
  }
  return context;
};
