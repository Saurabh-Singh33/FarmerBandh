import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Lock,
  ShieldCheck,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle2,
  Sparkles,
  Edit3,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { buyerProfileApi } from '../../services/buyerProfileApi';
import { notify } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const BuyerProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser, logout } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('personal'); // personal | address | security
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialProfile, setInitialProfile] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === 'true') {
      setActiveTab('personal');
      setIsEditing(true);
      setTimeout(() => {
        const input = document.querySelector('input[name="fullName"]');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    } else if (params.get('tab')) {
      setActiveTab(params.get('tab'));
    }
  }, [location.search]);

  // Profile Form state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    defaultAddressLine: '',
    city: '',
    state: '',
    district: '',
    pincode: '',
    preferredState: '',
    preferredDistrict: '',
    memberSince: null,
    totalOrders: 0
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete Account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePwd, setShowDeletePwd] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await buyerProfileApi.getProfile();
      if (data) {
        const loaded = {
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          defaultAddressLine: data.defaultAddressLine || '',
          city: data.city || '',
          state: data.state || '',
          district: data.district || '',
          pincode: data.pincode || '',
          preferredState: data.preferredState || '',
          preferredDistrict: data.preferredDistrict || '',
          memberSince: data.memberSince,
          totalOrders: data.totalOrders || 0
        };
        setProfile(loaded);
        setInitialProfile(loaded);
      }
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleStartEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      const input = document.querySelector('input[name="fullName"]');
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    if (initialProfile) {
      setProfile({ ...initialProfile });
    }
    setIsEditing(false);
    notify.info('Edits cancelled. Reverted to saved profile.');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!profile.fullName.trim()) {
      notify.error('Full Name is required.');
      return;
    }
    if (!profile.email.trim()) {
      notify.error('Email is required.');
      return;
    }

    try {
      setSaving(true);
      const updated = await buyerProfileApi.updateProfile({
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        defaultAddressLine: profile.defaultAddressLine.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        district: profile.district.trim(),
        pincode: profile.pincode.trim(),
        preferredState: profile.preferredState.trim(),
        preferredDistrict: profile.preferredDistrict.trim()
      });

      // Synchronize frontend auth user context immediately so Navbar updates
      if (updateUser) {
        updateUser({
          fullName: updated.fullName,
          email: updated.email,
          state: updated.state,
          district: updated.district,
          city: updated.city
        });
      }

      notify.success('Profile details saved in database successfully!', 'Profile Saved');
      const savedProfile = {
        ...profile,
        fullName: updated.fullName || profile.fullName,
        email: updated.email || profile.email,
        phone: updated.phone || profile.phone,
        defaultAddressLine: updated.defaultAddressLine || profile.defaultAddressLine,
        city: updated.city || profile.city,
        state: updated.state || profile.state,
        district: updated.district || profile.district,
        pincode: updated.pincode || profile.pincode,
        preferredState: updated.preferredState || profile.preferredState,
        preferredDistrict: updated.preferredDistrict || profile.preferredDistrict
      };
      setProfile(savedProfile);
      setInitialProfile(savedProfile);
      setIsEditing(false); // Successfully saved in database, return to view mode
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };



  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      notify.error('Current password is required.');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      notify.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify.error('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await buyerProfileApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      notify.success('Your password has been changed successfully.', 'Security Updated');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
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
      await buyerProfileApi.deleteAccount({
        password: deletePassword,
        reason: deleteReason || undefined
      });

      notify.success('Your buyer account has been deleted successfully.');
      setShowDeleteModal(false);

      try {
        await logout();
      } catch (logoutErr) {
        console.warn('Logout after delete:', logoutErr);
      }
      navigate('/auth');
    } catch (err) {
      console.error('Error deleting account:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete account. Please verify your password and ensure all orders are delivered.';
      setDeleteError(msg);
      notify.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const formattedDate = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'October 2026';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="spin-animate text-[#1B4D3E] mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F9FBF8] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif tracking-tight">
              My Profile & Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your personal details, contact phone, delivery address, and login credentials.
            </p>
          </div>
        </div>

        {/* User Identity Overview Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm ring-4 ring-emerald-50">
              {getInitials(profile.fullName || authUser?.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
                  {profile.fullName || 'Buyer Name'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  <ShieldCheck size={13} strokeWidth={2.5} /> Verified Buyer
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mt-1 text-xs sm:text-sm text-slate-500 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" /> {profile.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <Calendar size={14} /> Member since {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center flex-wrap justify-end">
            {/* Database Persistence Status Badge */}
            {isEditing ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                <Edit3 size={12} /> Editing Mode Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={12} /> Saved in Database
              </span>
            )}

            {/* Profile Action Controls: Edit and Save */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                  title="Edit profile details"
                >
                  <Edit3 size={15} className="text-[#1B4D3E]" /> Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  title="Discard changes"
                >
                  <X size={15} /> Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving || !isEditing}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  isEditing
                    ? 'bg-[#1B4D3E] text-white hover:bg-[#143B2F] ring-2 ring-emerald-500/20 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                title={isEditing ? "Save changes to database" : "Profile is already saved in database"}
              >
                {saving ? (
                  <>
                    <RefreshCw size={15} className="spin-animate" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save
                  </>
                )}
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-1.5 text-center min-w-[75px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Orders</span>
              <span className="text-lg font-bold text-[#1B4D3E]">{profile.totalOrders}</span>
            </div>
            <button
              type="button"
              onClick={fetchProfile}
              title="Refresh profile details from database"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Refined Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-4 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`inline-flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-[#1B4D3E] text-[#1B4D3E] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
            }`}
          >
            <User size={16} /> Personal Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`inline-flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'address'
                ? 'border-[#1B4D3E] text-[#1B4D3E] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
            }`}
          >
            <MapPin size={16} /> Delivery & Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`inline-flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#1B4D3E] text-[#1B4D3E] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
            }`}
          >
            <Lock size={16} /> Password & Security
          </button>
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === 'personal' && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                  Personal Information
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Update your identity details, email address, and active phone number for orders.
                </p>
              </div>
              <div>
                {isEditing ? (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <Edit3 size={12} /> Editable
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Read Only (Saved)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    required
                    placeholder="e.g. Saurabh Singh"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                      isEditing
                        ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                        : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                    }`}
                  />
                </div>
              </div>

              {/* Email / Gmail */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    Email Address / Gmail <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    Login & Invoices
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    required
                    placeholder="e.g. saurabh@buyer.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                      isEditing
                        ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                        : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Used for order receipts, password resets, and notifications.
                </span>
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    Contact Phone Number
                  </label>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Delivery Calls
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Phone size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                      isEditing
                        ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                        : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Used by delivery partners to coordinate drop-offs.
                </span>
              </div>

              {/* Preferred Marketplace State */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  Preferred Market State
                </label>
                <div className="relative flex items-center">
                  <MapPin size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="preferredState"
                    value={profile.preferredState}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    placeholder="e.g. Gujarat, Punjab, Maharashtra"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                      isEditing
                        ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                        : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Tailors marketplace fresh crop recommendations to your region.
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-slate-500">
                {isEditing
                  ? 'Editing active: Click Save to update database with new details.'
                  : 'Profile is saved in database. Click Edit to make changes.'}
              </div>
              <div className="flex items-center gap-2.5">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    <Edit3 size={16} className="text-[#1B4D3E]" /> Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-semibold transition-all cursor-pointer"
                  >
                    <X size={16} /> Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || !isEditing}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    isEditing
                      ? 'bg-[#1B4D3E] text-white hover:bg-[#143B2F] cursor-pointer ring-2 ring-emerald-500/20'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" /> Saving to Database...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Delivery & Address */}
        {activeTab === 'address' && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                  Default Delivery Address
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Set your primary shipping destination for 1-click checkout.
                </p>
              </div>
              <div>
                {isEditing ? (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <Edit3 size={12} /> Editable
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Read Only (Saved)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Address Line */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  Street / House / Warehouse Address
                </label>
                <div className="relative">
                  <Home size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={3}
                    name="defaultAddressLine"
                    value={profile.defaultAddressLine}
                    onChange={handleProfileChange}
                    readOnly={!isEditing}
                    placeholder="e.g. Warehouse 4B, APMC Market Yard, Highway 8"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm resize-y ${
                      isEditing
                        ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                        : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                    }`}
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  City / Town
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleProfileChange}
                  readOnly={!isEditing}
                  placeholder="e.g. Surat, Ahmedabad"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                    isEditing
                      ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                      : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                  }`}
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={profile.district}
                  onChange={handleProfileChange}
                  readOnly={!isEditing}
                  placeholder="e.g. Rajkot, Vadodara"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                    isEditing
                      ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                      : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                    }`}
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleProfileChange}
                  readOnly={!isEditing}
                  placeholder="e.g. Gujarat"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                    isEditing
                      ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                      : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                  }`}
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  Postal / Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleProfileChange}
                  readOnly={!isEditing}
                  placeholder="e.g. 395007"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all shadow-sm ${
                    isEditing
                      ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15'
                      : 'border-slate-200 bg-slate-50/80 text-slate-800 cursor-default select-text'
                  }`}
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-slate-500">
                {isEditing
                  ? 'Editing active: Click Save to update default shipping destination in database.'
                  : 'Address is saved in database. Click Edit to make changes.'}
              </div>
              <div className="flex items-center gap-2.5">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    <Edit3 size={16} className="text-[#1B4D3E]" /> Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-semibold transition-all cursor-pointer"
                  >
                    <X size={16} /> Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || !isEditing}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    isEditing
                      ? 'bg-[#1B4D3E] text-white hover:bg-[#143B2F] cursor-pointer ring-2 ring-emerald-500/20'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" /> Saving to Database...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <form
              onSubmit={handleSavePassword}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                  Password & Account Security
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Update your credentials regularly to keep your buyer orders and payments secure.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-start">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-sm font-semibold hover:bg-[#143B2F] transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Danger Zone: Delete Buyer Account */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-900 tracking-tight">
                    Danger Zone: Delete Buyer Account
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-700 mt-0.5">
                    Permanently close and delete your Buyer account.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-rose-100 rounded-xl p-4 mb-5 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5">
                <div className="font-semibold text-slate-800">
                  Please review these details before requesting deletion:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  <li>You cannot delete your account if you have active orders currently in progress or out for delivery.</li>
                  <li>Open return or dispute requests must be resolved first.</li>
                  <li>Saved delivery addresses and checkout preferences will be permanently wiped.</li>
                  <li>You will be logged out immediately and will not be able to sign in with this account.</li>
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm shadow-rose-600/20 cursor-pointer"
              >
                <Trash2 size={16} /> Delete Buyer Account
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Delete Buyer Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Delete Buyer Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm your credentials to permanently close your account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error banner if any */}
            {deleteError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 text-xs sm:text-sm text-rose-700 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Notice:</span> Deleting your account is permanent. All pending login sessions will be terminated and your profile will be deactivated.
              </div>

              {/* Password Verification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showDeletePwd ? 'text' : 'password'}
                    required
                    placeholder="Enter your current password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePwd(!showDeletePwd)}
                    aria-label={showDeletePwd ? 'Hide password' : 'Show password'}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showDeletePwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Reason for Deletion */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
                  Reason for Leaving (Optional)
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/15 transition-all shadow-sm"
                >
                  <option value="">Please select a reason (optional)</option>
                  <option value="No longer ordering farm produce">No longer ordering farm produce</option>
                  <option value="Moving to a different location">Moving to a different location</option>
                  <option value="Found an alternative marketplace">Found an alternative marketplace</option>
                  <option value="Creating a new account">Creating a new account</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 pt-1">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 accent-rose-600"
                />
                <span>
                  I confirm that I want to permanently delete my buyer account and understand this action cannot be undone.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || !deletePassword || !deleteConfirmed}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm shadow-rose-600/20 cursor-pointer disabled:bg-rose-300 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" /> Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} /> Confirm & Delete
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
