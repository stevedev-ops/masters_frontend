import React from 'react';
import { AppProvider, useApp } from './context/AppContext';

// 1. Modular Domain Features
import { CustomerView } from './features/customer';
import { StaffPortal } from './features/staff';
import { OwnerDashboard } from './features/boss';
import { LoginModal, ChangePasswordModal } from './features/auth';

// 2. Navigation & Layout Shell
import { Sidebar, Navbar, MobileHeader, MobileBottomNav } from './navigation';

// 3. Fault-Tolerant Resilience
import ErrorBoundary from './components/common/ErrorBoundary';

function AppShell() {
  const { 
    currentView, setCurrentView,
    isLoginModalOpen, setIsLoginModalOpen, 
    isChangePasswordOpen, setIsChangePasswordOpen, 
    authUser, setIsMobileSidebarOpen,
    isOnline, showPWAInstall, installPWA, dismissPWAInstall 
  } = useApp();

  const isCustomerHome = currentView === 'customer';

  // 1. PUBLIC HOME / CUSTOMER VIEW (Top Navbar Layout as originally designed)
  if (isCustomerHome) {
    return (
      <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
        
        {/* OFFLINE STATUS BANNER */}
        {!isOnline && (
          <div className="bg-rose-600 text-white text-center py-2 px-4 text-xs font-bold shadow-lg">
            📡 You are offline — browsing cached content. Booking requires internet.
          </div>
        )}

        {/* Top Navbar with Error Boundary */}
        <ErrorBoundary name="Public Navbar">
          <Navbar />
        </ErrorBoundary>

        {/* Customer Public Landing Page Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <ErrorBoundary name="Customer Treatment Catalog & Booking">
            <CustomerView />
          </ErrorBoundary>
        </main>

        {/* Public Footer */}
        <footer className="border-t border-slate-900/80 bg-[#080c14] py-8 px-4 text-center text-xs text-slate-500 space-y-2 pb-24 md:pb-8">
          <p className="font-serif font-bold gold-gradient-text text-sm">THE MASTERS BARBER & EXECUTIVE SPA</p>
          <p>© {new Date().getFullYear()} The Masters Grooming Lounge. All rights reserved.</p>
          <div className="pt-2">
            <button
              onClick={() => {
                setCurrentView('staff');
                setIsLoginModalOpen(true);
              }}
              className="text-slate-800 hover:text-slate-500 text-[10px] transition-colors inline-flex items-center space-x-1 cursor-pointer select-none"
              title="Employee Portal"
            >
              <span>🔒 Staff Portal</span>
            </button>
          </div>
        </footer>

        {/* Modals with Error Boundaries */}
        <ErrorBoundary name="Authentication Modal">
          <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
          />

          {/* TEMPORARILY DISABLED - RETURN LATER
          <ChangePasswordModal
            isOpen={isChangePasswordOpen}
            onClose={() => setIsChangePasswordOpen(false)}
            isForced={Boolean(authUser?.mustChangePassword)}
          />
          */}
        </ErrorBoundary>

      </div>
    );
  }

  // 2. AUTHENTICATED STAFF & BOSS PORTALS (Executive Left Sidebar Layout with Logout at Bottom)
  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* OFFLINE STATUS BANNER */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-rose-600 text-white text-center py-2 px-4 text-xs font-bold shadow-lg animate-fade-in">
          📡 You are offline — The Masters is running in local mode. Your data is saved and will sync when reconnected.
        </div>
      )}

      {/* PWA INSTALL PROMPT */}
      {showPWAInstall && (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[60] p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl animate-scale-in space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md shrink-0">✂️</div>
              <div>
                <p className="text-sm font-bold text-white">Install The Masters</p>
                <p className="text-[11px] text-slate-400">Add to home screen for instant offline access</p>
              </div>
            </div>
            <button onClick={dismissPWAInstall} className="text-slate-500 hover:text-white text-lg font-bold p-1">✕</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={installPWA} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md hover:scale-105 transition-transform">
              📲 Install App
            </button>
            <button onClick={dismissPWAInstall} className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white transition-colors">
              Not Now
            </button>
          </div>
        </div>
      )}

      {/* LUXURY FULL-HEIGHT LEFT SIDEBAR */}
      <ErrorBoundary name="Navigation Sidebar">
        <Sidebar />
      </ErrorBoundary>

      {/* MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Slim Top Bar on Mobile */}
        <MobileHeader />

        {/* Dynamic Portal View: Staff Portal or Boss Dashboard */}
        <main className="flex-1 p-2.5 sm:p-5 lg:p-8 pb-20 md:pb-8 min-w-0">
          {currentView === 'staff' && (
            <ErrorBoundary name="Worker Operations Portal">
              <StaffPortal />
            </ErrorBoundary>
          )}

          {currentView === 'boss' && (
            <ErrorBoundary name="Boss Executive Suite">
              <OwnerDashboard />
            </ErrorBoundary>
          )}
        </main>

        {/* Minimal Portal Footer */}
        <footer className="border-t border-slate-900/80 bg-[#080c14] py-6 px-4 text-center text-xs text-slate-500 space-y-1.5 pb-24 md:pb-6">
          <p className="font-serif font-bold gold-gradient-text text-sm">THE MASTERS BARBER & EXECUTIVE SPA</p>
          <p>© {new Date().getFullYear()} The Masters Grooming Lounge. All rights reserved.</p>
        </footer>

      </div>

      {/* MOBILE STICKY BOTTOM NAV BAR */}
      <MobileBottomNav onOpenMenu={() => setIsMobileSidebarOpen(true)} />

      {/* MODALS */}
      <ErrorBoundary name="Security Modals">
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />

        {/* TEMPORARILY DISABLED - RETURN LATER
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          isForced={Boolean(authUser?.mustChangePassword)}
        />
        */}
      </ErrorBoundary>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary name="Root Application Shell" showHome={true}>
        <AppShell />
      </ErrorBoundary>
    </AppProvider>
  );
}
