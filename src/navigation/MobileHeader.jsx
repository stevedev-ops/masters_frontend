import React from 'react';
import { useApp } from '../context/AppContext';
import { Scissors, Menu, Crown, Smartphone, LogIn, Sparkles } from 'lucide-react';

export default function MobileHeader() {
  const { currentView, switchView, authUser, setIsLoginModalOpen, setIsMobileSidebarOpen } = useApp();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#0c1018]/95 backdrop-blur-md border-b border-amber-500/20 px-4 h-16 flex items-center justify-between shadow-lg">
      
      {/* Brand logo */}
      <div 
        onClick={() => switchView('customer')}
        className="flex items-center space-x-2.5 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md">
          <Scissors className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-serif font-bold text-sm text-white flex items-center gap-1">
            THE MASTERS
            <Sparkles className="w-3 h-3 text-amber-400" />
          </span>
          <span className="text-[9px] tracking-widest uppercase text-amber-400 font-semibold block">
            Barber & Spa
          </span>
        </div>
      </div>

      {/* Center Current View Pill */}
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-300">
        {currentView === 'boss' && <Crown className="w-3 h-3 text-yellow-400" />}
        {currentView === 'staff' && <Smartphone className="w-3 h-3 text-amber-400" />}
        {currentView === 'customer' && <Scissors className="w-3 h-3 text-slate-400" />}
        <span className="capitalize">{currentView}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {!authUser ? (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-sm flex items-center space-x-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Login</span>
          </button>
        ) : null}

        {/* Hamburger Menu Trigger */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

    </header>
  );
}
