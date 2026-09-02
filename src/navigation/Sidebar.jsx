import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Scissors, Sparkles, Smartphone, Crown, LogOut, KeyRound, 
  BarChart3, Calendar, CheckSquare, Receipt, History, UserPlus, 
  Settings, Lock, Globe, UserCheck, ShieldCheck, Plus, X, 
  CheckCircle2, Clock
} from 'lucide-react';

export default function Sidebar() {
  const { 
    currentView, switchView, 
    bossTab, setBossTab, 
    staffTab, setStaffTab, 
    setIsStaffModalOpen, setIsServiceModalOpen,
    isSettingsModalOpen, setIsSettingsModalOpen,
    setSettingsTab,
    currency, setCurrency, 
    isBackendConnected, 
    authUser, logout, 
    setIsLoginModalOpen, setIsChangePasswordOpen,
    appointments, transactions, expenses,
    isMobileSidebarOpen, setIsMobileSidebarOpen
  } = useApp();

  const isBoss = authUser?.role === 'boss';

  // Stats for badges
  const pendingAppointmentsCount = (appointments || []).filter(a => a.status === 'pending').length;

  const totalPendingTips = transactions.reduce((acc, t) => {
    let sum = acc;
    if (!t.barberTipPaid) sum += (t.barberTip || 0);
    if (!t.massageTipPaid) sum += (t.massageTip || 0);
    return sum;
  }, 0);

  const pendingStaffBookings = (appointments || []).filter(a => {
    if (!authUser?.staffProfile) return a.status === 'pending';
    return a.status === 'pending' && (
      a.preferredStaffId === authUser.staffProfile.id || 
      (!a.assignedStaffId && (!a.preferredStaffId || a.preferredStaffId === ''))
    );
  }).length;

  const handlePortalSwitch = (view) => {
    switchView(view);
    setIsMobileSidebarOpen(false);
  };

  const handleBossTabSwitch = (tab) => {
    setBossTab(tab);
    if (currentView !== 'boss') {
      switchView('boss');
    }
    setIsMobileSidebarOpen(false);
  };

  const handleStaffTabSwitch = (tab) => {
    setStaffTab(tab);
    if (currentView !== 'staff') {
      switchView('staff');
    }
    setIsMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#0c1018] text-slate-200 border-r border-amber-500/20 font-sans">
      
      {/* 1. TOP BRAND HEADER */}
      <div className="p-5 border-b border-slate-800/80">
        <div 
          onClick={() => handlePortalSwitch('customer')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Scissors className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="overflow-hidden">
            <span className="font-serif font-bold text-base tracking-wider text-white flex items-center gap-1.5 truncate">
              THE MASTERS
              <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-80 shrink-0" />
            </span>
            <span className="text-[9px] tracking-widest uppercase text-amber-400/90 block font-semibold truncate">
              Barber & Executive Spa
            </span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SCROLLABLE NAVIGATION AREA */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* CONTEXTUAL BOSS NAVIGATION (Visible when in Boss View) */}
        {currentView === 'boss' && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block px-3 mb-2 flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Boss Navigation</span>
            </span>

            {[
              { id: 'overview', label: "Overview", icon: BarChart3 },
              { id: 'appointments', label: "Online Bookings", icon: Calendar, badge: pendingAppointmentsCount },
              { id: 'reports', label: "Reports & Analytics", icon: History },
              { id: 'payouts', label: "Tip Payoffs", icon: CheckSquare, badge: totalPendingTips > 0 ? `${currency} ${totalPendingTips.toLocaleString()}` : null },
              { id: 'expenses', label: "Shop Expenses", icon: Receipt, badge: (expenses || []).length },
              { id: 'ledger', label: "Audit Ledger", icon: History, badge: transactions.length },
            ].map(item => {
              const Icon = item.icon;
              const isActive = bossTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleBossTabSwitch(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-300 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Unified Settings Navigation */}
            <div className="pt-2 border-t border-slate-800/60">
              <button
                onClick={() => {
                  setSettingsTab('staff');
                  setIsSettingsModalOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900/80 border border-slate-800/60 transition-all font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* CONTEXTUAL STAFF NAVIGATION (Visible when in Staff View) */}
        {currentView === 'staff' && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block px-3 mb-2 flex items-center space-x-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Workspace</span>
            </span>

            {[
              { id: 'entry', label: "Record Activity", icon: Plus },
              { id: 'bookings', label: "Online Bookings", icon: Calendar, badge: pendingStaffBookings },
              { id: 'my_dashboard', label: "My Tips & Stats", icon: UserCheck },
              { id: 'expenses', label: "Shop Expense", icon: Receipt },
            ].map(item => {
              const Icon = item.icon;
              const isActive = staffTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleStaffTabSwitch(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-300 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}



      </div>

      {/* 3. PINNED BOTTOM UTILITY BAR (Always at bottom!) */}
      <div className="p-4 border-t border-slate-800/90 bg-[#080c14] space-y-3 shrink-0">
        
        {/* Currency Selector Row */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center space-x-2 w-full">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-amber-400 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none w-full"
            >
              <option value="KSh">KSh (Kenya)</option>
              <option value="UGX">UGX (Uganda)</option>
              <option value="R">R (SAR)</option>
              <option value="$">$ (USD)</option>
            </select>
          </div>
        </div>

        {/* LOGOUT BUTTON (Always anchored at the very bottom) */}
        {authUser ? (
          <button
            onClick={() => {
              logout();
              setIsMobileSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition-colors flex items-center justify-center space-x-2 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setIsLoginModalOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <span>Portal Log In</span>
          </button>
        )}

      </div>

    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* 2. MOBILE OFF-CANVAS DRAWER */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" 
          />

          {/* Drawer container */}
          <div className="relative w-4/5 max-w-xs h-full z-10 shadow-2xl animate-slide-in">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white z-20"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
