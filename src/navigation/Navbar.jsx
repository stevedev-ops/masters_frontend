import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Crown, Smartphone, User, LogIn, LogOut, Scissors, 
  Sparkles, Lock, ShieldCheck, UserCheck, KeyRound, Menu, X, 
  ChevronRight, Globe, Calendar, PhoneCall
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
      <nav className="sticky top-0 z-40 bg-[#090d14]/90 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-6 lg:px-8 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20">
          
          {/* 1. BRAND LOGO (Client Landing) */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => switchView('customer')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-serif font-black tracking-tight text-white block leading-tight flex items-center space-x-1.5">
                  <span>THE MASTERS</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-amber-400/90 block font-semibold">
                  Barber & Spa
                </span>
              </div>
            </div>
          </div>

          {/* 2. DESKTOP NAVIGATION (100% Customer Facing for Public Site) */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            
            {/* Services Menu link */}
            <a
              href="#services"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all"
            >
              Services Menu
            </a>

            {/* Book Appointment CTA for Customers */}
            <a
              href="#services"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Book Appointment</span>
            </a>

            {/* If a staff/boss member is ALREADY logged in on this device, give them an easy switch to portal */}
            {authUser && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => switchView(authUser.role === 'boss' ? 'boss' : 'staff')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800 transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Portal ({authUser.staffProfile ? authUser.staffProfile.name : authUser.username})</span>
                </button>
              </div>
            )}

            {/* Currency Picker */}
            <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="KSh">KSh (Kenya)</option>
                <option value="UGX">UGX (Uganda)</option>
                <option value="R">R (SAR)</option>
                <option value="$">$ (USD)</option>
              </select>
            </div>

          </div>

          {/* 3. MOBILE HAMBURGER BUTTON */}
          <div className="flex md:hidden items-center space-x-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-amber-300 font-bold rounded-lg px-2 py-1 text-xs"
            >
              <option value="KSh">KSh</option>
              <option value="UGX">UGX</option>
              <option value="R">R</option>
              <option value="$">$</option>
            </select>

            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </nav>

      {/* 4. MOBILE OFF-CANVAS DRAWER (100% Customer Facing) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
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

              {/* Navigation Links for Clients */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block px-1">
                  Menu & Reservations
                </span>

                <a
                  href="#services"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    <span>Treatments & Services Catalog</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </a>

                <a
                  href="#services"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>Book an Appointment</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </a>

                {/* If already logged in on this phone, show quick portal entry */}
                {authUser && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      switchView(authUser.role === 'boss' ? 'boss' : 'staff');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold text-amber-300 bg-slate-900 border border-amber-500/40"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>Back to Staff Portal</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                )}
              </div>

              {/* Preferences */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block px-1">
                  Preferences
                </span>

                {/* Mobile Currency Picker */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 text-xs border border-slate-800/80">
                  <div className="flex items-center space-x-2.5 text-slate-300 font-semibold">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>Currency</span>
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

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
              <p className="font-serif font-bold gold-gradient-text">THE MASTERS BARBER & SPA</p>
              <p className="pt-1">VIP Grooming & Executive Bodywork</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
