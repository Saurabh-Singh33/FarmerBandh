import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  RefreshCw,
  Building,
  Bell,
  Wallet
} from 'lucide-react';
import { sellerProfileApi } from '../../services/sellerProfileApi';
import { VerificationBadge } from '../../components/seller/VerificationBadge';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';

export const SellerProfile = () => {
  const { verificationStatus, refreshDashboard } = useSeller();
  const [activeTab, setActiveTab] = useState('profile'); // profile | password | settings
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab 1: Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    farmName: '',
    location: '',
    district: '',
    state: '',
    phone: '',
    bio: ''
  });

  // Tab 2: Password form
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Tab 3: Settings form
  const [settingsForm, setSettingsForm] = useState({
    autoPayoutCadence: 'Manual',
    minimumPayoutAmount: 500,
    notifyOnNewOrder: true,
    notifyOnNegotiation: true,
    notifyOnReturn: true,
    notifyOnPayout: true
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [prof, setts] = await Promise.all([
          sellerProfileApi.getProfile(),
          sellerProfileApi.getSettings()
        ]);

        if (prof) {
          setProfileForm({
            fullName: prof.fullName || '',
            email: prof.email || '',
            farmName: prof.farmName || '',
            location: prof.location || '',
            district: prof.district || '',
            state: prof.state || '',
            phone: prof.phone || '',
            bio: prof.bio || ''
          });
        }

        if (setts) {
          setSettingsForm({
            autoPayoutCadence: setts.autoPayoutCadence || 'Manual',
            minimumPayoutAmount: setts.minimumPayoutAmount || 500,
            notifyOnNewOrder: setts.notifyOnNewOrder ?? true,
            notifyOnNegotiation: setts.notifyOnNegotiation ?? true,
            notifyOnReturn: setts.notifyOnReturn ?? true,
            notifyOnPayout: setts.notifyOnPayout ?? true
          });
        }
      } catch (err) {
        console.error('Error loading seller profile/settings:', err);
        notify.error('Could not load profile information');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.farmName.trim()) {
      notify.error('Farm name is required.');
      return;
    }
    try {
      setSaving(true);
      await sellerProfileApi.updateProfile({
        farmName: profileForm.farmName.trim(),
        location: profileForm.location.trim(),
        district: profileForm.district.trim(),
        state: profileForm.state.trim(),
        phone: profileForm.phone.trim() || undefined,
        bio: profileForm.bio.trim() || undefined
      });
      notify.success('Farm profile updated successfully.');
      refreshDashboard();
    } catch (err) {
      console.error('Error updating profile:', err);
      notify.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword) {
      notify.error('Current password is required.');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      notify.error('New password must be at least 6 characters long.');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      notify.error('New passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      await sellerProfileApi.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      notify.success('Account password updated successfully.');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      notify.error(err?.response?.data?.message || 'Password update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await sellerProfileApi.updateSettings({
        autoPayoutCadence: settingsForm.autoPayoutCadence,
        minimumPayoutAmount: parseFloat(settingsForm.minimumPayoutAmount) || 500,
        notifyOnNewOrder: settingsForm.notifyOnNewOrder,
        notifyOnNegotiation: settingsForm.notifyOnNegotiation,
        notifyOnReturn: settingsForm.notifyOnReturn,
        notifyOnPayout: settingsForm.notifyOnPayout
      });
      notify.success('Seller store and payout settings saved.');
      refreshDashboard();
    } catch (err) {
      console.error('Error saving settings:', err);
      notify.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading farm profile...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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
              Farm Profile & Store Settings
            </h1>
            <VerificationBadge status={verificationStatus} />
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Manage farm story, geographic location, account security, and payout settlement rules.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #E5E7EB',
          marginBottom: '2rem'
        }}
      >
        {[
          { id: 'profile', label: 'Farm Information', icon: Building },
          { id: 'password', label: 'Account Security', icon: Lock },
          { id: 'settings', label: 'Payout & Store Settings', icon: SettingsIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderBottom: isActive ? '3px solid #1B4D3E' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? '#1B4D3E' : '#6B7280',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Farm Profile */}
      {activeTab === 'profile' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={profileForm.fullName}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Farm Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Farms, Patel Agro Lands"
                  value={profileForm.farmName}
                  onChange={(e) => setProfileForm({ ...profileForm, farmName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Farm Village / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanand, Bavla"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmedabad"
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  State *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Farm Bio & Agricultural Story (Shown on Public Profile)
              </label>
              <textarea
                rows={4}
                maxLength={1000}
                placeholder="Share your farming journey, organic cultivation methods, soil health practices, family legacy..."
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                {profileForm.bio.length} / 1000 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.75rem 1.6rem',
                borderRadius: '8px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(27,77,62,0.2)'
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Update Farm Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'password' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            maxWidth: '560px'
          }}
        >
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Current Password *
              </label>
              <input
                type="password"
                required
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                New Password (Min 6 Characters) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.75rem 1.6rem',
                borderRadius: '8px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              <Lock size={16} /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Payout & Store Settings */}
      {activeTab === 'settings' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Payout Preferences */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Wallet size={18} color="#1B4D3E" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                  Payout Cadence & Thresholds
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Automated Payout Cadence
                  </label>
                  <select
                    value={settingsForm.autoPayoutCadence}
                    onChange={(e) => setSettingsForm({ ...settingsForm, autoPayoutCadence: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  >
                    <option value="Manual">Manual (On-demand withdrawal requests)</option>
                    <option value="Weekly">Weekly (Every Monday clearance)</option>
                    <option value="BiWeekly">Bi-Weekly (1st and 15th of month)</option>
                    <option value="Monthly">Monthly (End of month batch)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Minimum Payout Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={settingsForm.minimumPayoutAmount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minimumPayoutAmount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>
                    Withdrawals cannot be requested below this amount (Minimum platform rule is ₹500).
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Toggles */}
            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Bell size={18} color="#1B4D3E" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                  Operational Notification Preferences
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  {
                    key: 'notifyOnNewOrder',
                    title: 'New Buyer Orders',
                    desc: 'Notify instantly when a buyer places an order for your produce.'
                  },
                  {
                    key: 'notifyOnNegotiation',
                    title: 'Bundle & Price Counter Offers',
                    desc: 'Receive alerts when buyers propose or counter bulk produce negotiations.'
                  },
                  {
                    key: 'notifyOnReturn',
                    title: 'Return & Replacement Requests',
                    desc: 'Receive alerts when a buyer requests an exchange or product return.'
                  },
                  {
                    key: 'notifyOnPayout',
                    title: 'Payout Disbursement Updates',
                    desc: 'Receive settlement confirmations when funds are credited to your bank.'
                  }
                ].map((item) => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: '#F9FAFB'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={settingsForm[item.key]}
                      onChange={(e) => setSettingsForm({ ...settingsForm, [item.key]: e.target.checked })}
                      style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#1B4D3E' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.88rem' }}>{item.title}</div>
                      <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '1px' }}>{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.75rem 1.6rem',
                borderRadius: '8px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(27,77,62,0.2)'
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Operations Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
