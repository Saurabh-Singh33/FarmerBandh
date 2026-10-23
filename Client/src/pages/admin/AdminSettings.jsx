import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  AlertTriangle,
  ShieldCheck,
  Percent,
  IndianRupee,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Edit3,
  X,
  Lock,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { adminSettingsApi } from '../../services/adminApi';
import { notify } from '../../context/NotificationContext';

export const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [commissionPercent, setCommissionPercent] = useState('5.0');
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState('150');
  const [platformFee, setPlatformFee] = useState('25');
  const [taxPercent, setTaxPercent] = useState('0');
  const [codEnabled, setCodEnabled] = useState(true);
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);
  const [newRegistrationsEnabled, setNewRegistrationsEnabled] = useState(true);
  const [negotiationsEnabled, setNegotiationsEnabled] = useState(true);
  const [verifiedOnlyMarketplace, setVerifiedOnlyMarketplace] = useState(false);
  const [maxDeliverySlotsPerDay, setMaxDeliverySlotsPerDay] = useState('100');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  const populateFields = (s) => {
    if (!s) return;
    setCommissionPercent(s.commissionPercent?.toString() || '5.0');
    setDefaultDeliveryFee(s.defaultDeliveryFee?.toString() || '150');
    setPlatformFee(s.platformFee?.toString() || '25');
    setTaxPercent(s.taxPercent?.toString() || '0');
    setCodEnabled(!!s.codEnabled);
    setMaintenanceModeEnabled(!!s.maintenanceModeEnabled);
    setNewRegistrationsEnabled(s.newRegistrationsEnabled !== false);
    setNegotiationsEnabled(s.negotiationsEnabled !== false);
    setVerifiedOnlyMarketplace(!!s.verifiedOnlyMarketplace);
    setMaxDeliverySlotsPerDay(s.maxDeliverySlotsPerDay?.toString() || '100');
    setSupportEmail(s.supportEmail || '');
    setSupportPhone(s.supportPhone || '');
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const s = await adminSettingsApi.getSettings();
      setSettings(s);
      setInitialSettings(s);
      populateFields(s);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load platform settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleStartEdit = () => {
    setIsEditing(true);
    notify.info('Edit mode enabled. You can now adjust fee schedules and operational controls.');
  };

  const handleCancelEdit = () => {
    populateFields(initialSettings);
    setIsEditing(false);
    notify.info('Changes discarded. Restored saved platform configuration.');
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isEditing) return;

    try {
      setSaving(true);
      const payload = {
        commissionPercent: parseFloat(commissionPercent) || 0,
        defaultDeliveryFee: parseFloat(defaultDeliveryFee) || 0,
        platformFee: parseFloat(platformFee) || 0,
        taxPercent: parseFloat(taxPercent) || 0,
        codEnabled,
        maintenanceModeEnabled,
        newRegistrationsEnabled,
        negotiationsEnabled,
        verifiedOnlyMarketplace,
        maxDeliverySlotsPerDay: parseInt(maxDeliverySlotsPerDay, 10) || 100,
        supportEmail: supportEmail.trim() || null,
        supportPhone: supportPhone.trim() || null
      };

      await adminSettingsApi.updateSettings(payload);
      setInitialSettings({ ...initialSettings, ...payload });
      setIsEditing(false);
      notify.success('Platform configuration saved and applied across system.', 'Settings Updated');
      fetchSettings();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to update platform settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#64748B', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <RefreshCw size={32} className="spin-animate" style={{ margin: '0 auto 1rem auto', color: '#1B4D3E' }} />
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading Platform Configuration...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2.5rem 2rem 5rem 2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Page Header with 2-Button Action Bar */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#1B4D3E',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.2
              }}
            >
              Platform Settings & Configuration
            </h1>
            {isEditing && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sliders size={11} /> Editing Mode
              </span>
            )}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
            Configure market fee schedules, emergency operational modes, transaction switches, and customer support channels.
          </p>
        </div>

        {/* Action Buttons: Edit and Save as usual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#1E293B',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#94A3B8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              title="Click to enable editing settings"
            >
              <Edit3 size={15} color="#1B4D3E" /> Edit Settings
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Discard changes and restore saved settings"
            >
              <X size={15} /> Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isEditing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.35rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isEditing ? '#1B4D3E' : '#E2E8F0',
              color: isEditing ? '#FFFFFF' : '#94A3B8',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: saving || !isEditing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isEditing ? '0 2px 8px rgba(27, 77, 62, 0.25)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (isEditing && !saving) e.currentTarget.style.backgroundColor = '#2D6A4F';
            }}
            onMouseLeave={(e) => {
              if (isEditing && !saving) e.currentTarget.style.backgroundColor = '#1B4D3E';
            }}
            title={isEditing ? 'Save settings to database' : 'Click Edit Settings first to modify'}
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </div>

      {maintenanceModeEnabled && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>
              Maintenance Mode is Currently Active
            </div>
            <div style={{ color: '#7F1D1D', fontSize: '0.82rem', marginTop: '2px' }}>
              New buyer checkouts and negotiations may be restricted while maintenance mode is toggled on.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Section 1: Financial & Fee Schedules */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', pb: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B4D3E', margin: 0, letterSpacing: '-0.015em' }}>
              Fee Schedules & Taxation
            </h2>
            {!isEditing && (
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> Read-only
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                disabled={!isEditing}
                readOnly={!isEditing}
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                  color: isEditing ? '#0F172A' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              />
              <span style={{ fontSize: '0.73rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Deducted from completed farmer orders
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Fixed Platform Fee (₹)
              </label>
              <input
                type="number"
                step="1"
                disabled={!isEditing}
                readOnly={!isEditing}
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                  color: isEditing ? '#0F172A' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              />
              <span style={{ fontSize: '0.73rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Per order platform technology fee
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Default Delivery Base (₹)
              </label>
              <input
                type="number"
                step="1"
                disabled={!isEditing}
                readOnly={!isEditing}
                value={defaultDeliveryFee}
                onChange={(e) => setDefaultDeliveryFee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                  color: isEditing ? '#0F172A' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              />
              <span style={{ fontSize: '0.73rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Base logistics charge per delivery
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tax / GST (%)
              </label>
              <input
                type="number"
                step="0.1"
                disabled={!isEditing}
                readOnly={!isEditing}
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                  color: isEditing ? '#0F172A' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              />
              <span style={{ fontSize: '0.73rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Applicable statutory GST rate
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Platform Controls & Toggles */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', pb: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B4D3E', margin: 0, letterSpacing: '-0.015em' }}>
              Operational Controls
            </h2>
            {!isEditing && (
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> Read-only
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Maintenance Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid #F8FAFC' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.92rem' }}>Maintenance Mode</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Temporarily disable new purchases for scheduled system updates
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={maintenanceModeEnabled}
                onChange={(e) => setMaintenanceModeEnabled(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: isEditing ? 'pointer' : 'not-allowed',
                  opacity: isEditing ? 1 : 0.65,
                  accentColor: '#1B4D3E'
                }}
              />
            </div>

            {/* Negotiations Enabled */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid #F8FAFC' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.92rem' }}>Allow Price Negotiations</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Enable buyer-seller live produce bidding and counter-offers
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={negotiationsEnabled}
                onChange={(e) => setNegotiationsEnabled(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: isEditing ? 'pointer' : 'not-allowed',
                  opacity: isEditing ? 1 : 0.65,
                  accentColor: '#1B4D3E'
                }}
              />
            </div>

            {/* Cash on Delivery */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid #F8FAFC' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.92rem' }}>Cash on Delivery (COD)</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Allow physical payment on delivery arrival at buyer location
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: isEditing ? 'pointer' : 'not-allowed',
                  opacity: isEditing ? 1 : 0.65,
                  accentColor: '#1B4D3E'
                }}
              />
            </div>

            {/* Verified-only Marketplace */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid #F8FAFC' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.92rem' }}>Verified Farmers Only Marketplace</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Require approved ID verification before any crop listing goes live
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={verifiedOnlyMarketplace}
                onChange={(e) => setVerifiedOnlyMarketplace(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: isEditing ? 'pointer' : 'not-allowed',
                  opacity: isEditing ? 1 : 0.65,
                  accentColor: '#1B4D3E'
                }}
              />
            </div>

            {/* New Registrations */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.92rem' }}>Allow New User Registrations</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Permit new farmers and buyers to sign up
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={newRegistrationsEnabled}
                onChange={(e) => setNewRegistrationsEnabled(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: isEditing ? 'pointer' : 'not-allowed',
                  opacity: isEditing ? 1 : 0.65,
                  accentColor: '#1B4D3E'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Support Channels */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', pb: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B4D3E', margin: 0, letterSpacing: '-0.015em' }}>
              Customer Support Channels
            </h2>
            {!isEditing && (
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> Read-only
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Support Helpline Phone
              </label>
              <input
                type="text"
                disabled={!isEditing}
                readOnly={!isEditing}
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+91 1800-FARMER"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                  color: isEditing ? '#0F172A' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Support Helpdesk Email
              </label>
              <input
                type="email"
                disabled={!isEditing}
                readOnly={!isEditing}
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@farmerbandh.in"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                  color: isEditing ? '#0F172A' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Save & Cancel Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.7rem 1.4rem',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#1E293B',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <Edit3 size={15} color="#1B4D3E" /> Edit Settings
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.7rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <X size={15} /> Discard Changes
            </button>
          )}

          <button
            type="submit"
            disabled={saving || !isEditing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.7rem 1.85rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isEditing ? '#1B4D3E' : '#E2E8F0',
              color: isEditing ? '#FFFFFF' : '#94A3B8',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: saving || !isEditing ? 'not-allowed' : 'pointer',
              boxShadow: isEditing ? '0 2px 8px rgba(27,77,62,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
