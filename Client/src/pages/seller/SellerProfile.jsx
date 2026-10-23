import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  RefreshCw,
  Building,
  Bell,
  Wallet,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
  Camera,
  Edit3
} from 'lucide-react';
import { sellerProfileApi } from '../../services/sellerProfileApi';
import { uploadApi } from '../../services/uploadApi';
import { VerificationBadge } from '../../components/seller/VerificationBadge';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';
import { useAuth } from '../../context/AuthContext';

export const SellerProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verificationStatus, refreshDashboard } = useSeller();
  const { updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile | password | settings
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialProfileForm, setInitialProfileForm] = useState(null);

  // Password visibility states
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef(null);

  // Tab 1: Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    farmName: '',
    location: '',
    district: '',
    state: '',
    phone: '',
    bio: '',
    profilePictureUrl: ''
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

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePwd, setShowDeletePwd] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === 'true') {
      setActiveTab('profile');
      setIsEditing(true);
    }
  }, [location.search]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [prof, setts] = await Promise.all([
          sellerProfileApi.getProfile(),
          sellerProfileApi.getSettings()
        ]);

        if (prof) {
          const loaded = {
            fullName: prof.name || prof.fullName || '',
            email: prof.email || '',
            farmName: prof.farmName || '',
            location: prof.location || '',
            district: prof.district || '',
            state: prof.state || '',
            phone: prof.phone || '+919508461241',
            bio: prof.bio || '',
            profilePictureUrl: prof.profilePictureUrl || prof.avatarUrl || ''
          };
          setProfileForm(loaded);
          setInitialProfileForm(loaded);
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

  const handleStartEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      const input = document.querySelector('input[name="fullName"]');
      if (input) input.focus();
    }, 50);
  };

  const handleCancelEdit = () => {
    if (initialProfileForm) {
      setProfileForm({ ...initialProfileForm });
    }
    setIsEditing(false);
    notify.info('Edits cancelled. Reverted to saved farm profile.');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notify.error('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    try {
      setUploadingPhoto(true);
      const res = await uploadApi.uploadImage(file);
      const photoUrl = res.url || res.relativeUrl;
      setProfileForm((prev) => ({ ...prev, profilePictureUrl: photoUrl }));
      setInitialProfileForm((prev) => (prev ? { ...prev, profilePictureUrl: photoUrl } : prev));

      await sellerProfileApi.updateProfile({
        farmName: profileForm.farmName.trim() || 'My Farm',
        fullName: profileForm.fullName.trim() || undefined,
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || '+919508461241',
        location: profileForm.location.trim(),
        district: profileForm.district.trim(),
        state: profileForm.state.trim(),
        bio: profileForm.bio.trim() || undefined,
        profilePictureUrl: photoUrl
      });

      updateUser({
        profilePictureUrl: photoUrl
      });

      notify.success('Seller profile picture updated successfully!');
      refreshDashboard();
    } catch (err) {
      console.error('Photo upload failed:', err);
      notify.error(err?.response?.data?.message || err?.message || 'Failed to upload seller picture.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      setProfileForm((prev) => ({ ...prev, profilePictureUrl: '' }));
      setInitialProfileForm((prev) => (prev ? { ...prev, profilePictureUrl: '' } : prev));

      await sellerProfileApi.updateProfile({
        farmName: profileForm.farmName.trim() || 'My Farm',
        fullName: profileForm.fullName.trim() || undefined,
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || '+919508461241',
        location: profileForm.location.trim(),
        district: profileForm.district.trim(),
        state: profileForm.state.trim(),
        bio: profileForm.bio.trim() || undefined,
        profilePictureUrl: ''
      });

      updateUser({
        profilePictureUrl: null
      });

      notify.success('Seller picture removed. Reverted to default.');
      refreshDashboard();
    } catch (err) {
      console.error('Photo removal failed:', err);
      notify.error(err?.response?.data?.message || err?.message || 'Failed to remove picture.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!profileForm.farmName.trim()) {
      notify.error('Farm name is required.');
      return;
    }
    if (!profileForm.email.trim()) {
      notify.error('Gmail / Email address is required.');
      return;
    }

    try {
      setSaving(true);
      await sellerProfileApi.updateProfile({
        farmName: profileForm.farmName.trim(),
        fullName: profileForm.fullName.trim() || undefined,
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || '+919508461241',
        location: profileForm.location.trim(),
        district: profileForm.district.trim(),
        state: profileForm.state.trim(),
        bio: profileForm.bio.trim() || undefined,
        profilePictureUrl: profileForm.profilePictureUrl || undefined
      });

      updateUser({
        email: profileForm.email.trim(),
        fullName: profileForm.fullName.trim(),
        profilePictureUrl: profileForm.profilePictureUrl || null
      });

      setInitialProfileForm({ ...profileForm });
      setIsEditing(false);
      notify.success('Farm profile saved in database successfully.');
      refreshDashboard();
    } catch (err) {
      console.error('Error updating profile:', err);
      notify.error(err?.response?.data?.message || err?.message || 'Failed to update profile');
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

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Please enter your current password to confirm deletion.');
      return;
    }
    if (!deleteConfirmed) {
      setDeleteError('Please check the confirmation box to acknowledge account deletion.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');
      await sellerProfileApi.deleteAccount({
        password: deletePassword,
        reason: deleteReason || undefined
      });

      notify.success('Your farmer account has been closed and deleted successfully.');
      setShowDeleteModal(false);

      try {
        await logout();
      } catch (logoutErr) {
        console.warn('Logout after delete:', logoutErr);
      }
      navigate('/auth');
    } catch (err) {
      console.error('Error deleting account:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete account. Please verify your password and ensure all orders and payouts are settled.';
      setDeleteError(msg);
      notify.error(msg);
    } finally {
      setDeleting(false);
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
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontSize: '1.85rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
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
          { id: 'password', label: 'Account Security & Deletion', icon: Lock },
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
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Form Header: Status Badge & Quick Action Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #F3F4F6'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Farm & Seller Information
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  {isEditing
                    ? 'Editing mode active — make your updates and click "Save in DB".'
                    : 'Viewing saved information from the database. Click "Edit Profile" to modify.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEditing ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A'
                    }}
                  >
                    <Edit3 size={12} /> Editing Mode Active
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      border: '1px solid #A7F3D0'
                    }}
                  >
                    <CheckCircle2 size={12} /> Saved in Database
                  </span>
                )}

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      color: '#1B4D3E',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      border: '1.5px solid #1B4D3E',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to edit farm information"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#F3F4F6',
                      color: '#4B5563',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      border: '1px solid #D1D5DB',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                    title="Discard changes"
                  >
                    <X size={14} /> Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || !isEditing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: isEditing ? '#1B4D3E' : '#E5E7EB',
                    color: isEditing ? '#FFFFFF' : '#9CA3AF',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    border: 'none',
                    cursor: saving || !isEditing ? 'not-allowed' : 'pointer',
                    boxShadow: isEditing ? '0 2px 4px rgba(27,77,62,0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={isEditing ? 'Save changes to database' : 'Profile is already saved in database'}
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save in DB'}
                </button>
              </div>
            </div>

            {/* Seller / Farm Profile Picture Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                backgroundColor: '#F9FAFB',
                borderRadius: '10px',
                border: '1px solid #E5E7EB'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />

              <div style={{ position: 'relative', flexShrink: 0 }}>
                {profileForm.profilePictureUrl ? (
                  <img
                    src={profileForm.profilePictureUrl}
                    alt={profileForm.farmName || profileForm.fullName}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      backgroundColor: '#1B4D3E',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {(profileForm.farmName || profileForm.fullName || 'F').charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#1B4D3E',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                  title="Upload / Change Photo"
                >
                  {uploadingPhoto ? <RefreshCw size={12} className="spin-animate" /> : <Camera size={12} />}
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                  Farm & Seller Profile Photo
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px', lineHeight: 1.4 }}>
                  This picture appears in buyer negotiation chats, your product listing badges, and order details.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: '#1B4D3E',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {uploadingPhoto ? 'Uploading...' : (profileForm.profilePictureUrl ? 'Change Photo' : 'Upload Photo')}
                  </button>
                  {profileForm.profilePictureUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  disabled={!isEditing}
                  placeholder="e.g. Ramesh Patel"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                    color: isEditing ? '#111827' : '#4B5563',
                    cursor: isEditing ? 'text' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={14} color="#059669" /> Gmail / Email Address *
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                    Login & Receipts
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={!isEditing}
                  placeholder="e.g. farmer@gmail.com"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                    color: isEditing ? '#111827' : '#4B5563',
                    cursor: isEditing ? 'text' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Editable Gmail address for your Farmer account credentials & order summaries.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Farm Name *
                </label>
                <input
                  type="text"
                  name="farmName"
                  required
                  disabled={!isEditing}
                  placeholder="e.g. Ramesh Farms, Patel Agro Lands"
                  value={profileForm.farmName}
                  onChange={(e) => setProfileForm({ ...profileForm, farmName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                    color: isEditing ? '#111827' : '#4B5563',
                    cursor: isEditing ? 'text' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Smartphone size={14} color="#2563EB" /> Contact Phone Number *
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 600, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1px 6px', borderRadius: '4px' }}>
                    ⚡ Razorpay Linked
                  </span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  disabled={!isEditing}
                  placeholder="+919508461241"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                    color: isEditing ? '#111827' : '#4B5563',
                    cursor: isEditing ? 'text' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Integrated with Razorpay payment checkout & buyer coordination.
                  </span>
                  {isEditing && profileForm.phone !== '+919508461241' && (
                    <button
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, phone: '+919508461241' })}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#2563EB',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Use Razorpay (+919508461241)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Farm Village / Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  disabled={!isEditing}
                  placeholder="e.g. Sanand, Bavla"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                    color: isEditing ? '#111827' : '#4B5563',
                    cursor: isEditing ? 'text' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  required
                  disabled={!isEditing}
                  placeholder="e.g. Ahmedabad"
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                    color: isEditing ? '#111827' : '#4B5563',
                    cursor: isEditing ? 'text' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  disabled={!isEditing}
                  placeholder="e.g. Gujarat"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                    color: isEditing ? '#111827' : '#4B5563',
                    cursor: isEditing ? 'text' : 'not-allowed',
                    transition: 'all 0.15s ease'
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
                name="bio"
                maxLength={1000}
                disabled={!isEditing}
                placeholder="Share your farming journey, organic cultivation methods, soil health practices, family legacy..."
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: isEditing ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: isEditing ? '#FFFFFF' : '#F9FAFB',
                  color: isEditing ? '#111827' : '#4B5563',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  transition: 'all 0.15s ease'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                {profileForm.bio.length} / 1000 characters
              </div>
            </div>

            {/* Bottom Action Bar: Edit, Cancel, Save in DB & Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #E5E7EB'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1.6rem',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      color: '#1B4D3E',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: '1.5px solid #1B4D3E',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to edit farm information"
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '8px',
                      backgroundColor: '#F3F4F6',
                      color: '#4B5563',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      border: '1px solid #D1D5DB',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Discard changes and revert to saved data"
                  >
                    <X size={16} /> Discard & Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || !isEditing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    backgroundColor: isEditing ? '#1B4D3E' : '#E5E7EB',
                    color: isEditing ? '#FFFFFF' : '#9CA3AF',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    border: 'none',
                    cursor: saving || !isEditing ? 'not-allowed' : 'pointer',
                    boxShadow: isEditing ? '0 2px 5px rgba(27,77,62,0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={isEditing ? 'Save changes to database' : 'Profile is currently saved in database'}
                >
                  <Save size={16} /> {saving ? 'Saving in DB...' : 'Save in DB'}
                </button>
              </div>

              {/* Status Indicator */}
              <div>
                {isEditing ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A'
                    }}
                  >
                    <Edit3 size={13} /> Editing Mode Active · Click "Save in DB" when done
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      border: '1px solid #A7F3D0'
                    }}
                  >
                    <CheckCircle2 size={13} /> Saved in Database (Read Only)
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Quick Link to Account Deletion */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                Account Closure & Produce Delisting
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                Need to close your store or permanently delete your farmer account?
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
              <span>Go to Account Deletion</span>
            </button>
          </div>
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    paddingRight: '2.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  aria-label={showCurrentPwd ? 'Hide current password' : 'Show current password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                New Password (Min 6 Characters) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    paddingRight: '2.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  aria-label={showNewPwd ? 'Hide new password' : 'Show new password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    paddingRight: '2.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  aria-label={showConfirmPwd ? 'Hide confirm password' : 'Show confirm password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              <Lock size={16} /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {/* Danger Zone: Account Deletion */}
          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid #F3F4F6'
            }}
          >
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '12px',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626'
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#991B1B' }}>
                    Danger Zone: Delete Farmer Account
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#B91C1C' }}>
                    Permanently close your store, delist produce, and delete your account.
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.83rem',
                  color: '#4B5563',
                  lineHeight: 1.5
                }}
              >
                <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: '4px' }}>
                  Important terms before requesting account deletion:
                </div>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>All active crop listings will be immediately delisted from the marketplace.</li>
                  <li>You cannot delete your account while you have unfulfilled orders or pending return requests.</li>
                  <li>Any pending payouts must be settled before closure.</li>
                  <li>Linked bank accounts and credentials will be permanently disconnected.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteError('');
                  setDeletePassword('');
                  setDeleteConfirmed(false);
                  setDeleteReason('');
                  setShowDeleteModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.7rem 1.4rem',
                  borderRadius: '8px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                }}
              >
                <Trash2 size={16} />
                <span>Delete My Farmer Account</span>
              </button>
            </div>
          </div>
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              boxSizing: 'border-box',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626'
                  }}
                >
                  <Trash2 size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>
                    Delete Farmer Account
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#6B7280' }}>
                    Confirm your identity to close your store
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error banner if any */}
            {deleteError && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #F87171',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  fontSize: '0.83rem',
                  color: '#92400E',
                  lineHeight: 1.45
                }}
              >
                <strong>Warning:</strong> Deleting your account will immediately delist all your crops, revoke login access, and remove your registered bank details. This action cannot be reversed.
              </div>

              {/* Password Verification */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Current Account Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showDeletePwd ? 'text' : 'password'}
                    required
                    placeholder="Enter your current password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      paddingRight: '2.5rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePwd(!showDeletePwd)}
                    aria-label={showDeletePwd ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#6B7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.2rem'
                    }}
                  >
                    {showDeletePwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Reason for Deletion */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Reason for Leaving (Optional)
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <option value="">Please select a reason (optional)</option>
                  <option value="Seasonal break / no current produce">Seasonal break / no current produce</option>
                  <option value="Retiring / closing farm business">Retiring / closing farm business</option>
                  <option value="Using a different sales channel">Using a different sales channel</option>
                  <option value="Payment or payout preferences">Payment or payout preferences</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Confirmation Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  color: '#374151'
                }}
              >
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#DC2626' }}
                />
                <span>
                  I understand that this action is permanent, all my product listings will be removed, and I will be signed out immediately.
                </span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || !deletePassword || !deleteConfirmed}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: deleting || !deletePassword || !deleteConfirmed ? '#FCA5A5' : '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: deleting || !deletePassword || !deleteConfirmed ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  {deleting ? (
                    <>
                      <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Confirm & Delete</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
