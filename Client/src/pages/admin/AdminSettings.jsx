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
  RefreshCw
} from 'lucide-react';
import { adminSettingsApi } from '../../services/adminApi';
import { notify } from '../../context/NotificationContext';

export const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const s = await adminSettingsApi.getSettings();
      setSettings(s);
      if (s) {
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
      }
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load platform settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminSettingsApi.updateSettings({
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
      });
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
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Platform Configuration...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
          Platform Settings & Configuration
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
          Configure market fee schedules, emergency operational modes, transaction switches, and customer support channels.
        </p>
      </div>

      {maintenanceModeEnabled && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertTriangle size={24} color="#DC2626" />
          <div>
            <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>
              Maintenance Mode is Currently Active
            </div>
            <div style={{ color: '#7F1D1D', fontSize: '0.82rem' }}>
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
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B4D3E', margin: '0 0 1rem 0' }}>
            Fee Schedules & Taxation
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Deducted from completed farmer orders</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Fixed Platform Fee (₹)
              </label>
              <input
                type="number"
                step="1"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Per order platform technology fee</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Default Delivery Base (₹)
              </label>
              <input
                type="number"
                step="1"
                value={defaultDeliveryFee}
                onChange={(e) => setDefaultDeliveryFee(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Base logistics charge per delivery</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Tax / GST (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Applicable statutory GST rate</span>
            </div>
          </div>
        </div>

        {/* Section 2: Platform Controls & Toggles */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B4D3E', margin: '0 0 1rem 0' }}>
            Operational Controls
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Maintenance Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.9rem' }}>Maintenance Mode</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Temporarily disable new purchases for scheduled system updates</div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceModeEnabled}
                onChange={(e) => setMaintenanceModeEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            {/* Negotiations Enabled */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.9rem' }}>Allow Price Negotiations</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Enable buyer-seller live produce bidding and counter-offers</div>
              </div>
              <input
                type="checkbox"
                checked={negotiationsEnabled}
                onChange={(e) => setNegotiationsEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            {/* Cash on Delivery */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.9rem' }}>Cash on Delivery (COD)</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Allow physical payment on delivery arrival at buyer location</div>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            {/* Verified-only Marketplace */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.9rem' }}>Verified Farmers Only Marketplace</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Require approved ID verification before any crop listing goes live</div>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnlyMarketplace}
                onChange={(e) => setVerifiedOnlyMarketplace(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            {/* New Registrations */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.9rem' }}>Allow New User Registrations</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Permit new farmers and buyers to sign up</div>
              </div>
              <input
                type="checkbox"
                checked={newRegistrationsEnabled}
                onChange={(e) => setNewRegistrationsEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Support Channels */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B4D3E', margin: '0 0 1rem 0' }}>
            Customer Support Channels
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Support Helpline Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+91 1800-FARMER"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Support Helpdesk Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@farmerbandh.in"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.75rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(27,77,62,0.25)'
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
