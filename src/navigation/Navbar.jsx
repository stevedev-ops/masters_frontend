import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Crown, Smartphone, User, LogIn, LogOut, Scissors, 
  Sparkles, Lock, ShieldCheck, UserCheck, KeyRound, Menu, X, 
  ChevronRight, Globe
} from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';

export default function Navbar() {
  const { 
    currentView, switchView, currency, setCurrency, 
    isBackendConnected, authUser, logout, setIsLoginModalOpen,
    setIsChangePasswordOpen
  } = useApp();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleNavClick = (view) => {
    switchView(view);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-amber-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* 1. BRAND LOGO */}
            <div 
              onClick={() => handleNavClick('customer')}
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-serif font-bold text-base sm:text-xl tracking-wider text-white flex items-center gap-1">
                  THE MASTERS
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-amber-400/90 block font-semibold">
                  Barber & Spa
                </span>
              </div>
            </div>

            {/* 2. DESKTOP NAVIGATION (Visible on md screens and up) */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              
              {/* Customer Landing Page Link */}
              <button
                onClick={() => switchView('customer')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'customer'
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 border border-transparent'
                }`}
              >
                Services Menu
              </button>

              {/* If NOT logged in: Single Clean "Portal Login" Trigger */}
              {!authUser && (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </button>
              )}

              {/* If LOGGED IN: Staff / Boss navigation */}
              {authUser && (
                <div className="flex items-center space-x-2">
                  
                  {/* Staff Portal Link */}
                  <button
                    onClick={() => switchView('staff')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentView === 'staff'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Staff Portal</span>
                  </button>

                  {/* Boss Dashboard Link (Only visible to Boss role) */}
                  {authUser.role === 'boss' && (
                    <button
                      onClick={() => switchView('boss')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        currentView === 'boss'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Boss View</span>
                    </button>
                  )}

                  {/* User Identity Pill */}
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs font-semibold text-amber-300">
                    {authUser.role === 'boss' ? (
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>
                      {authUser.staffProfile ? authUser.staffProfile.name : authUser.username}
                    </span>
                  </div>

                  {/* Change Password Button */}
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    title="Change your account password"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Password</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    title="Sign out of portal"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>

                </div>
              )}

              {/* Currency Selector */}
              <div className="flex items-center pl-2 border-l border-slate-800">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-amber-400 text-xs font-semibold rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="KSh">KSh (Kenya)</option>
                  <option value="UGX">UGX (Uganda)</option>
                  <option value="R">R (SAR)</option>
                  <option value="$">$ (USD)</option>
                </select>
              </div>



            </div>

            {/* 3. MOBILE HEADER CONTROLS (Right side on small screens) */}
            <div className="flex md:hidden items-center space-x-2">
              {!authUser ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 flex items-center space-x-1 shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-amber-500/30 text-[11px] font-semibold text-amber-300">
                    {authUser.role === 'boss' ? (
                      <Crown className="w-3 h-3 text-yellow-400" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-amber-400" />
                    )}
                    <span className="truncate max-w-[80px]">
                      {authUser.staffProfile ? authUser.staffProfile.name : authUser.username}
                    </span>
                  </div>
                </div>
              )}

              {/* Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
                aria-label="Toggle mobile menu"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-colors"
              >
                {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 4. MOBILE DRAWER OVERLAY & SLIDE-OUT MENU */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileDrawerOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-[#0c1018] border-l border-amber-500/25 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            
            {/* Top section */}
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Scissors className="w-5 h-5 text-amber-400" />
                  <span className="font-serif font-bold text-base text-white">THE MASTERS</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Card if logged in */}
              {authUser && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Logged in as
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {authUser.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-bold text-white text-sm">
                    {authUser.staffProfile ? authUser.staffProfile.name : authUser.username}
                  </p>
                  <p className="text-xs text-amber-400/80">{authUser.email || 'The Masters Team'}</p>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block px-1">
                  Portal Navigation
                </span>

                <button
                  onClick={() => handleNavClick('customer')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'customer'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                      : 'text-slate-300 bg-slate-900/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Scissors className="w-4 h-4" />
                    <span>Customer Services Menu</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavClick('staff')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'staff'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                      : 'text-slate-300 bg-slate-900/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Staff Activity & Tip Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                {authUser?.role === 'boss' && (
                  <button
                    onClick={() => handleNavClick('boss')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                      currentView === 'boss'
                        ? 'bg-yellow-500 text-slate-950 font-extrabold shadow-md'
                        : 'text-yellow-300 bg-slate-900/80 hover:bg-slate-800 border border-yellow-500/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span>Boss Executive Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                )}
              </div>

              {/* Preferences / Security */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block px-1">
                  Preferences & Security
                </span>

                {authUser && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    <div className="flex items-center space-x-2.5">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Change Account Password</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                )}

                {/* Mobile Currency Picker */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 text-xs">
                  <div className="flex items-center space-x-2.5 text-slate-300 font-semibold">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>Display Currency</span>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-amber-300 font-bold rounded-lg px-2.5 py-1 text-xs"
                  >
                    <option value="KSh">KSh (Kenya)</option>
                    <option value="UGX">UGX (Uganda)</option>
                    <option value="R">R (SAR)</option>
                    <option value="$">$ (USD)</option>
                  </select>
                </div>


              </div>

            </div>

            {/* Drawer Footer / Logout or Login */}
            <div className="pt-6 border-t border-slate-800">
              {authUser ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log in to Portal</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. STICKY MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav onOpenMenu={() => setIsMobileDrawerOpen(true)} />
    </>
  );
}
