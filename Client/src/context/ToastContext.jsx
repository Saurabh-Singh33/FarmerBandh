import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

// Global dispatcher so axios interceptors or non-React modules can dispatch toasts
let globalToastDispatcher = null;

export const toast = {
  success: (message, title = 'Success') => globalToastDispatcher?.(message, 'success', title),
  error: (message, title = 'Error') => globalToastDispatcher?.(message, 'error', title),
  warning: (message, title = 'Warning') => globalToastDispatcher?.(message, 'warning', title),
  info: (message, title = 'Information') => globalToastDispatcher?.(message, 'info', title)
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      message,
      type,
      title: title || (type.charAt(0).toUpperCase() + type.slice(1)),
      timestamp: Date.now()
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    globalToastDispatcher = addToast;
    return () => {
      globalToastDispatcher = null;
    };
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    success: (msg, title) => addToast(msg, 'success', title),
    error: (msg, title) => addToast(msg, 'error', title),
    warning: (msg, title) => addToast(msg, 'warning', title),
    info: (msg, title) => addToast(msg, 'info', title)
  };

  const renderToastPortal = () => {
    if (typeof document === 'undefined') return null;

    return createPortal(
      <div
        aria-live="polite"
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
        {toasts.map((item) => {
          const config = getToastConfig(item.type);
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              role="alert"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                color: config.text,
                transition: 'all 0.25s ease-in-out'
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                <Icon size={20} color={config.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {item.title && (
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px', color: config.titleColor }}>
                    {item.title}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', lineHeight: '1.4', color: config.textColor }}>
                  {item.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(item.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: config.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  opacity: 0.7,
                  transition: 'opacity 0.15s'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>,
      document.body
    );
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {renderToastPortal()}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

function getToastConfig(type) {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle2,
        bg: '#F0FDF4',
        border: '#BBF7D0',
        text: '#166534',
        titleColor: '#14532D',
        textColor: '#166534',
        iconColor: '#22C55E'
      };
    case 'error':
      return {
        icon: AlertCircle,
        bg: '#FEF2F2',
        border: '#FECACA',
        text: '#991B1B',
        titleColor: '#7F1D1D',
        textColor: '#991B1B',
        iconColor: '#EF4444'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        bg: '#FFFBEB',
        border: '#FDE68A',
        text: '#92400E',
        titleColor: '#78350F',
        textColor: '#92400E',
        iconColor: '#F59E0B'
      };
    case 'info':
    default:
      return {
        icon: Info,
        bg: '#EFF6FF',
        border: '#BFDBFE',
        text: '#1E40AF',
        titleColor: '#1E3A8A',
        textColor: '#1E40AF',
        iconColor: '#3B82F6'
      };
  }
}
