import React from 'react';
import { useApp } from '../context/AppContext';
import { Scissors, Smartphone, Crown, LogIn, Menu, User } from 'lucide-react';

export default function MobileBottomNav({ onOpenMenu }) {
  const { currentView, switchView, authUser, setIsLoginModalOpen } = useApp();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1018]/95 backdrop-blur-xl border-t border-amber-500/20 px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_25px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Services Menu / Customer Landing */}
        <button
          onClick={() => switchView('customer')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
            currentView === 'customer'
              ? 'text-amber-400 font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'customer' ? 'bg-amber-500/20 text-amber-300' : ''}`}>
            <Scissors className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Services</span>
        </button>

        {/* 2. Staff Portal */}
        <button
          onClick={() => switchView('staff')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
            currentView === 'staff'
              ? 'text-amber-400 font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'staff' ? 'bg-amber-500/20 text-amber-300' : ''}`}>
            <Smartphone className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Staff Portal</span>
        </button>

        {/* 3. Boss View (Only if logged in as Boss) */}
        {authUser?.role === 'boss' && (
          <button
            onClick={() => switchView('boss')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
              currentView === 'boss'
                ? 'text-yellow-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentView === 'boss' ? 'bg-yellow-500/20 text-yellow-300' : ''}`}>
              <Crown className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Boss View</span>
          </button>
        )}

        {/* 4. Login or Menu Toggle */}
        {!authUser ? (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-amber-400 font-bold transition-all duration-200 active:scale-95"
          >
            <div className="p-1 rounded-lg bg-amber-500/20">
              <LogIn className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Log In</span>
          </button>
        ) : (
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-neutral-400 hover:text-amber-300 transition-all duration-200 active:scale-95"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
          </button>
        )}

      </div>
    </nav>
  );
}
