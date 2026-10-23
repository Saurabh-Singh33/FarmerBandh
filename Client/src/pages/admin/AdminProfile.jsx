import React, { useEffect, useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Save, 
  Lock, 
  RefreshCw, 
  Camera, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { adminProfileApi } from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../context/NotificationContext';

export const AdminProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminProfileApi.getProfile();
      setProfile(res);
      if (res) {
        setFullName(res.fullName || '');
        setPhotoUrl(res.profilePictureUrl || authUser?.profilePictureUrl || '');
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
    setFullName(profile?.fullName || '');
    setPhotoUrl(profile?.profilePictureUrl || authUser?.profilePictureUrl || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFullName(profile?.fullName || '');
    setPhotoUrl(profile?.profilePictureUrl || authUser?.profilePictureUrl || '');
    setIsEditing(false);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.error('Image size must be less than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setPhotoUrl(dataUrl);
      setUploadingPhoto(false);
      notify.success('Photo chosen. Click "Save Profile" to commit changes.');
    };
    reader.onerror = () => {
      setUploadingPhoto(false);
      notify.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    notify.info('Photo removed. Click "Save Profile" to commit changes.');
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!fullName.trim()) {
      notify.error('Display Name cannot be empty.');
      return;
    }

    try {
      setSavingProfile(true);
      await adminProfileApi.updateProfile({
        fullName: fullName.trim(),
        profilePictureUrl: photoUrl || ''
      });

      // Update auth context so avatar and name update across the admin header
      if (updateUser) {
        updateUser({
          fullName: fullName.trim(),
          profilePictureUrl: photoUrl || null
        });
      }

      setProfile((prev) => ({
        ...prev,
        fullName: fullName.trim(),
        profilePictureUrl: photoUrl || ''
      }));

      setIsEditing(false);
      notify.success('Admin profile saved successfully in database!', 'Profile Saved');
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      notify.error('Password must be at least 8 characters.');
      return;
    }

    try {
      setChangingPassword(true);
      await adminProfileApi.changePassword({
        currentPassword,
        newPassword
      });
      notify.success('Password changed successfully.', 'Security Updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw size={28} className="animate-spin text-emerald-800" />
        <div className="text-xs font-semibold">Loading Admin Profile...</div>
      </div>
    );
  }

  const currentDisplayPhoto = isEditing ? photoUrl : (profile?.profilePictureUrl || authUser?.profilePictureUrl);
  const initials = (profile?.fullName || authUser?.fullName || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-12 font-sans space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4D3E] tracking-tight">
            Admin Profile & Security
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your administrative credentials, display identity, and login credentials.
          </p>
        </div>

        {/* Action Buttons: Edit and Save as usual */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Edit profile details"
            >
              <Edit3 size={14} className="text-[#1B4D3E]" /> Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Discard changes"
            >
              <X size={14} /> Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={savingProfile || !isEditing}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isEditing
                ? 'bg-[#1B4D3E] text-white hover:bg-[#143B2F] ring-2 ring-emerald-500/20 cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
            title={isEditing ? 'Save changes to database' : 'Click Edit Profile to make changes'}
          >
            {savingProfile ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account Identity Card with Photo Upload */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar / Photo with upload controls */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden border-2 border-emerald-500/30">
              {currentDisplayPhoto ? (
                <img
                  src={currentDisplayPhoto}
                  alt={profile?.fullName || 'Admin'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Photo Action Overlay in Edit Mode */}
            {isEditing && (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1B4D3E] font-bold text-[10px] border border-emerald-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                  title="Upload administrative photo"
                >
                  <Camera size={11} /> {currentDisplayPhoto ? 'Change' : 'Upload'}
                </button>
                {currentDisplayPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                    title="Remove photo"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {profile?.fullName || 'System Admin'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-700" /> Platform Administrator
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {profile?.email || 'admin@farmerbandh.com'}
            </p>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
              <span>Admin ID: <strong className="font-mono text-slate-700">{profile?.id?.substring(0, 8)}...</strong></span>
              <span>•</span>
              <span>Active Role: <strong className="text-slate-700">{profile?.role || 'Admin'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick status pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center min-w-[120px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Security Level</span>
          <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
            <CheckCircle2 size={13} className="text-emerald-600" /> Super Admin
          </span>
        </div>
      </div>

      {/* Personal Information Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-[#1B4D3E]" />
            <h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>
          </div>
          {isEditing && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Editing Enabled
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Display Name {isEditing && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full administrative name..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  isEditing
                    ? 'border-[#1B4D3E] bg-white text-slate-900 focus:ring-2 focus:ring-[#1B4D3E]/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/80 text-slate-700 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-slate-400 font-normal">(Immutable)</span>
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border border-slate-200 bg-slate-100/70 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Form Actions Footer inside the card */}
          {isEditing && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingProfile}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile || !fullName.trim()}
                className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={13} /> Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock size={16} className="text-emerald-700" />
          <h3 className="font-bold text-slate-900 text-sm">Update Password & Security Credentials</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Administrative Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter existing password..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password (Min. 8 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {changingPassword ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Updating Password...
                </>
              ) : (
                <>
                  <Key size={13} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
