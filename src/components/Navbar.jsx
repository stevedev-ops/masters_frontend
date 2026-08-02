import React from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Smartphone, User, RefreshCw, Scissors, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { currentView, setCurrentView, resetDemoData, currency, setCurrency } = useApp();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-amber-500/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setCurrentView('customer')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight gold-gradient-text">
                  THE MASTERS
                </span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <p className="text-[10px] sm:text-xs text-amber-300/70 font-medium tracking-widest uppercase">
                Barber & Executive Spa
              </p>
            </div>
          </div>

          {/* Quick Role Switcher Tabs */}
          <nav className="flex items-center bg-slate-900/90 p-1 sm:p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setCurrentView('customer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentView === 'customer'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Customer Site</span>
            </button>

            <button
              onClick={() => setCurrentView('staff')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentView === 'staff'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:text-amber-300" />
              <span>Staff Portal</span>
            </button>

            <button
              onClick={() => setCurrentView('boss')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentView === 'boss'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="font-bold">Boss View</span>
            </button>
          </nav>

          {/* Right Utils */}
          <div className="hidden md:flex items-center space-x-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-amber-400 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="KSh">KSh (Kenya)</option>
              <option value="UGX">UGX (Uganda)</option>
              <option value="R">R (SAR)</option>
              <option value="$">$ (USD)</option>
            </select>

            <button
              onClick={resetDemoData}
              title="Reset Demo Data"
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
