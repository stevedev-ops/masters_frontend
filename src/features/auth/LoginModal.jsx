import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, User, KeyRound, AlertCircle, X, Scissors, 
  Sparkles, ArrowRight, Eye, EyeOff, Fingerprint, 
  ShieldCheck, Smartphone, Check 
} from 'lucide-react';
import { 
  isBiometricsAvailable, 
  getSavedBiometricProfile, 
  enrollBiometrics, 
  authenticateWithBiometrics,
  removeBiometricProfile 
} from '../../utils/biometrics';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberBiometrics, setRememberBiometrics] = useState(true);
  
  const [isBioSupported, setIsBioSupported] = useState(false);
  const [savedBioProfile, setSavedBioProfile] = useState(null);
  const [bioLoading, setBioLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      
      // Check device biometrics support & stored enrollment
      isBiometricsAvailable().then((supported) => {
        setIsBioSupported(supported);
      });
      
      const profile = getSavedBiometricProfile();
      setSavedBioProfile(profile);
      if (profile?.username && !username) {
        setUsername(profile.username);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Password Login Handler (100% reliable fallback)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    try {
      const userObj = await login(cleanUser, cleanPass);
      
      // If user opted to enable fingerprint on this device
      if (rememberBiometrics) {
        try {
          await enrollBiometrics(cleanUser, cleanPass, userObj?.name || cleanUser);
        } catch (bioErr) {
          console.warn('Biometric registration optional skipped:', bioErr);
        }
      }

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please check your username and password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Phone Fingerprint / Touch ID 1-Tap Login Handler
  const handleBiometricLogin = async () => {
    setErrorMessage('');
    setBioLoading(true);

    try {
      const credentials = await authenticateWithBiometrics();
      if (credentials?.username && credentials?.password) {
        setUsername(credentials.username);
        setPassword(credentials.password);
        setSuccessMessage('Fingerprint verified! Logging in...');
        
        await login(credentials.username, credentials.password);
        setTimeout(() => {
          onClose();
        }, 300);
      }
    } catch (err) {
      console.warn('Biometric login error:', err);
      setErrorMessage(err.message || 'Fingerprint verification failed. Please enter your password below.');
    } finally {
      setBioLoading(false);
    }
  };

  const handleClearBiometrics = (e) => {
    e.stopPropagation();
    removeBiometricProfile();
    setSavedBioProfile(null);
    setSuccessMessage('Fingerprint shortcut cleared from this device.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto max-h-screen">
      <div 
        className="relative w-full max-w-md glass-panel p-5 sm:p-7 rounded-3xl border border-amber-500/30 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Scissors className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center justify-center space-x-1.5">
              <h2 className="font-serif font-bold text-xl sm:text-2xl tracking-tight gold-gradient-text">
                THE MASTERS
              </h2>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <p className="text-[11px] sm:text-xs text-amber-300/80 uppercase tracking-widest font-semibold mt-0.5">
              Staff & Boss Portal Login
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. BIOMETRIC QUICK LOGIN BUTTON (If previously enrolled) */}
        {savedBioProfile && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                Saved Device Fingerprint
              </span>
              <button 
                type="button"
                onClick={handleClearBiometrics}
                className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                title="Remove fingerprint shortcut from this device"
              >
                Clear
              </button>
            </div>

            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={bioLoading || isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4 stroke-[2.5]" />
              <span>
                {bioLoading ? 'Scanning Fingerprint...' : `1-Tap Login as ${savedBioProfile.displayName || savedBioProfile.username}`}
              </span>
            </button>
          </div>
        )}

        {/* Divider if fingerprint button is shown */}
        {savedBioProfile && (
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-[#0f1420] px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500 shrink-0">
              Or Use Password
            </span>
          </div>
        )}

        {/* 2. STANDARD USERNAME & PASSWORD FORM (Always available & fully reliable) */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Username or Email</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. james or admin"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Biometrics Toggle for Next Login */}
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-0.5 select-none">
            <input 
              type="checkbox" 
              checked={rememberBiometrics}
              onChange={(e) => setRememberBiometrics(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950"
            />
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
              Enable Phone Fingerprint / Touch ID for this device
            </span>
          </label>

          {/* Submit with Password */}
          <button
            type="submit"
            disabled={isLoading || bioLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Password...</span>
            ) : (
              <>
                <span>Sign In with Password</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

        </form>

        {/* Quick Demo Autofill Pill Helpers */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 block text-center">
            ⚡ Quick Test Credentials:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'masters2026!')}
              className="p-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors text-center font-semibold"
            >
              👑 Boss (Admin)
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('james', 'masters123')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-center font-semibold"
            >
              ✂️ James (Barber)
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('sarah', 'masters123')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-center font-semibold"
            >
              💆‍♀️ Sarah (Spa)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
