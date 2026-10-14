import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ShoppingCart,
  MessageSquare,
  RotateCcw,
  Wallet,
  ShieldCheck,
  Star,
  Info,
  Check,
  ArrowLeft,
  Save,
  Sliders
} from 'lucide-react';
import { notificationApi } from '../../services/notificationApi';
import { toast } from '../../context/ToastContext';
import { Skeleton } from '../../components/Skeleton';

const PREFERENCE_FIELDS = [
  {
    key: 'orders',
    title: 'Orders & Shipments',
    desc: 'Receive alerts when orders are placed, packed, dispatched, and delivered.',
    icon: ShoppingCart,
    color: '#059669',
    bg: '#ECFDF5'
  },
  {
    key: 'negotiations',
    title: 'Negotiations & Bulk Offers',
    desc: 'Get notified of new counter-offers, deal acceptances, and expiring quotes.',
    icon: MessageSquare,
    color: '#D97706',
    bg: '#FFFBEB'
  },
  {
    key: 'returnsDisputes',
    title: 'Returns & Dispute Resolutions',
    desc: 'Stay informed on return requests, customer evidence, and mediation messages.',
    icon: RotateCcw,
    color: '#EA580C',
    bg: '#FFF7ED'
  },
  {
    key: 'payouts',
    title: 'Payouts & Earnings',
    desc: 'Alerts when funds are released, direct bank transfers initiate, or payout issues arise.',
    icon: Wallet,
    color: '#2563EB',
    bg: '#EFF6FF'
  },
  {
    key: 'verification',
    title: 'Farm KYC & Verification',
    desc: 'Status updates on farmer identity reviews, badge verifications, and compliance.',
    icon: ShieldCheck,
    color: '#16A34A',
    bg: '#F0FDF4'
  },
  {
    key: 'reviews',
    title: 'Reviews & Customer Feedback',
    desc: 'Be the first to know when buyers review your farm produce and rate quality.',
    icon: Star,
    color: '#D97706',
    bg: '#FFFBEB'
  },
  {
    key: 'system',
    title: 'System & Policy Notices',
    desc: 'Essential announcements regarding platform maintenance and security updates.',
    icon: Info,
    color: '#4B5563',
    bg: '#F3F4F6'
  }
];

export const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    orders: true,
    negotiations: true,
    returnsDisputes: true,
    payouts: true,
    verification: true,
    reviews: true,
    system: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await notificationApi.getPreferences();
        if (data) {
          setPreferences({
            orders: data.orders ?? data.orderUpdates ?? true,
            negotiations: data.negotiations ?? data.negotiationUpdates ?? true,
            returnsDisputes: data.returnsDisputes ?? data.returnDisputeUpdates ?? true,
            payouts: data.payouts ?? data.payoutUpdates ?? true,
            verification: data.verification ?? data.verificationUpdates ?? true,
            reviews: data.reviews ?? data.reviewUpdates ?? true,
            system: data.system ?? data.systemAnnouncements ?? true
          });
        }
      } catch (err) {
        toast.error('Unable to load notification preferences.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleSetAll = (value) => {
    setPreferences({
      orders: value,
      negotiations: value,
      returnsDisputes: value,
      payouts: value,
      verification: value,
      reviews: value,
      system: value
    });
    setHasChanges(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await notificationApi.updatePreferences({
        orderUpdates: preferences.orders,
        negotiationUpdates: preferences.negotiations,
        returnDisputeUpdates: preferences.returnsDisputes,
        payoutUpdates: preferences.payouts,
        verificationUpdates: preferences.verification,
        reviewUpdates: preferences.reviews,
        systemAnnouncements: preferences.system,
        orders: preferences.orders,
        negotiations: preferences.negotiations,
        returnsDisputes: preferences.returnsDisputes,
        payouts: preferences.payouts,
        verification: preferences.verification,
        reviews: preferences.reviews,
        system: preferences.system
      });
      setHasChanges(false);
      toast.success('Your notification preferences have been saved successfully.');
    } catch {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: '2.5rem 1.25rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Back button */}
      <Link
        to="/notifications"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#1B4D3E',
          textDecoration: 'none',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}
      >
        <ArrowLeft size={16} /> Back to notifications
      </Link>

      {/* Header */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: '0 0 0.35rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <Sliders size={26} color="#1B4D3E" />
              Notification Preferences
            </h1>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.92rem' }}>
              Choose which categories you would like to receive notifications and alerts for.
            </p>
          </div>

          {/* Quick toggle all */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleSetAll(true)}
              style={{
                backgroundColor: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => handleSetAll(false)}
              style={{
                backgroundColor: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Mute All
            </button>
          </div>
        </div>
      </div>

      {/* Preferences List */}
      <form onSubmit={handleSave}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton.Table rows={7} cols={2} />
            </div>
          ) : (
            PREFERENCE_FIELDS.map((field, idx) => {
              const Icon = field.icon;
              const isEnabled = preferences[field.key] ?? true;

              return (
                <div
                  key={field.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: idx === PREFERENCE_FIELDS.length - 1 ? 'none' : '1px solid #F3F4F6',
                    backgroundColor: isEnabled ? '#FFFFFF' : '#FAFAF9',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {/* Category Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: field.bg,
                        color: field.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.96rem',
                          color: '#111827',
                          marginBottom: '2px'
                        }}
                      >
                        {field.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: '1.4' }}>
                        {field.desc}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={`Toggle notifications for ${field.title}`}
                      onClick={() => handleToggle(field.key)}
                      style={{
                        width: '48px',
                        height: '26px',
                        borderRadius: '9999px',
                        backgroundColor: isEnabled ? '#1B4D3E' : '#D1D5DB',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        padding: '2px',
                        transition: 'background-color 0.2s ease',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          transform: isEnabled ? 'translateX(22px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease',
                          display: 'block'
                        }}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Footer Save Area */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#FAFAF9',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              {hasChanges ? 'You have unsaved changes.' : 'Preferences are currently saved.'}
            </span>

            <button
              type="submit"
              disabled={saving || !hasChanges}
              style={{
                backgroundColor: hasChanges ? '#1B4D3E' : '#9CA3AF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.65rem 1.6rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: hasChanges && !saving ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: hasChanges ? '0 2px 4px rgba(27,77,62,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences;
