import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ChangePasswordModal({ isOpen, onClose, isForced = false }) {
  const { changePassword, logout, user } = useApp();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword) {
      setError('Please enter your current/temporary password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword === oldPassword) {
      setError('New password must be different from your temporary password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please re-type carefully.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully! Unlocking your dashboard...');
      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c1a16] to-[#12110e] border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-neutral-100">
        
        {/* Glow accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            {isForced ? 'Set Your Private Password' : 'Change Password'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
            {isForced
              ? `Welcome ${user?.username || 'to The Masters'}! For security, please replace your temporary password before accessing the system.`
              : 'Update your account credentials to keep your portal secure.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Current / Temporary Password
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter temporary password"
                className="w-full px-4 py-2.5 bg-neutral-900/90 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 transition-colors"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              New Private Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 bg-neutral-900/90 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Must be minimum 8 characters.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-4 py-2.5 bg-neutral-900/90 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-neutral-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Saving Secure Password...' : 'Save & Unlock Portal'}</span>
          </button>
        </form>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          {isForced ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out instead</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
          )}

          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-500/70" />
            Encrypted with Django PBKDF2
          </span>
        </div>
      </div>
    </div>
  );
}
