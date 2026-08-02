import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import CustomerView from './components/CustomerView';
import StaffPortal from './components/StaffPortal';
import OwnerDashboard from './components/OwnerDashboard';

function MainContent() {
  const { currentView } = useApp();

  return (
    <main>
      {currentView === 'customer' && <CustomerView />}
      {currentView === 'staff' && <StaffPortal />}
      {currentView === 'boss' && <OwnerDashboard />}
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        
        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
          <p className="font-serif font-bold gold-gradient-text text-sm">THE MASTERS BARBER & EXECUTIVE SPA</p>
          <p>© {new Date().getFullYear()} The Masters Grooming Lounge. All rights reserved.</p>
        </footer>
      </div>
    </AppProvider>
  );
}
