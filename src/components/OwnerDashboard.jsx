import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StaffManagementModal from './StaffManagementModal';
import ServiceManagementModal from './ServiceManagementModal';
import ExecutiveReports from './ExecutiveReports';
import { 
  Crown, TrendingUp, TrendingDown, DollarSign, Users, Scissors, Heart, 
  CheckSquare, Square, Wallet, Banknote, CreditCard, Calendar, Filter, 
  Download, Sparkles, UserPlus, Settings, CheckCircle2, AlertCircle, 
  ArrowUpRight, ArrowDownRight, BarChart3, SlidersHorizontal, History 
} from 'lucide-react';

export default function OwnerDashboard() {
  const { 
    transactions, staff, services, currency, closingRecords,
    toggleTipPayoff, payOffAllStaffTips, deleteTransaction 
  } = useApp();

  // Active Tab View in Boss Dashboard
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reports' | 'payouts' | 'ledger'

  // Default: Compare is OFF by default. Boss sees This Month's totals cleanly.
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);
  const [rangePreset, setRangePreset] = useState('this_month'); // 'today' | 'this_week' | 'this_month' | 'all'

  // Modals state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Filters state for audit ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [payoutFilter, setPayoutFilter] = useState('All');

  // --- DATE RANGE & METRICS MATH LOGIC ---
  const { currentTx, priorTx } = useMemo(() => {
    const now = new Date();
    const getStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (rangePreset === 'today') {
      const startOfToday = getStartOfDay(now);
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      const cur = transactions.filter(t => new Date(t.timestamp) >= startOfToday);
      const pri = transactions.filter(t => {
        const d = new Date(t.timestamp);
        return d >= startOfYesterday && d < startOfToday;
      });
      return { currentTx: cur, priorTx: pri };
    }

    if (rangePreset === 'this_week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - 7);
      const startOfPriorWeek = new Date();
      startOfPriorWeek.setDate(now.getDate() - 14);

      const cur = transactions.filter(t => new Date(t.timestamp) >= startOfWeek);
      const pri = transactions.filter(t => {
        const d = new Date(t.timestamp);
        return d >= startOfPriorWeek && d < startOfWeek;
      });
      return { currentTx: cur, priorTx: pri };
    }

    if (rangePreset === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const cur = transactions.filter(t => new Date(t.timestamp) >= startOfMonth);
      const pri = transactions.filter(t => {
        const d = new Date(t.timestamp);
        return d >= startOfLastMonth && d < startOfMonth;
      });
      return { currentTx: cur, priorTx: pri };
    }

    return { currentTx: transactions, priorTx: [] };
  }, [transactions, rangePreset]);

  // Aggregate Helper for a transaction list
  const calculateMetrics = (txList) => {
    let totalRevenue = 0;
    let serviceRevenue = 0;
    let totalBarberTips = 0;
    let totalMassageTips = 0;
    let mpesaTotal = 0;
    let cashTotal = 0;
    let cardTotal = 0;

    txList.forEach(t => {
      totalRevenue += t.grandTotal;
      serviceRevenue += t.serviceTotal;
      totalBarberTips += (t.barberTip || 0);
      totalMassageTips += (t.massageTip || 0);

      const cAmt = t.cashAmount !== undefined ? t.cashAmount : (t.paymentMethod === 'Cash' ? t.grandTotal : 0);
      const mAmt = t.mpesaAmount !== undefined ? t.mpesaAmount : (t.paymentMethod === 'M-Pesa' ? t.grandTotal : 0);
      const cardAmt = t.cardAmount !== undefined ? t.cardAmount : (t.paymentMethod === 'Card' ? t.grandTotal : 0);

      mpesaTotal += mAmt;
      cashTotal += cAmt;
      cardTotal += cardAmt;
    });

    return {
      totalRevenue,
      serviceRevenue,
      totalTips: totalBarberTips + totalMassageTips,
      totalBarberTips,
      totalMassageTips,
      mpesaTotal,
      cashTotal,
      cardTotal,
      count: txList.length
    };
  };

  const curMetrics = calculateMetrics(currentTx);
  const priMetrics = calculateMetrics(priorTx);

  const getGrowth = (currentVal, priorVal) => {
    if (!priorVal || priorVal === 0) return currentVal > 0 ? 100 : 0;
    return Math.round(((currentVal - priorVal) / priorVal) * 100);
  };

  // STAFF TIP UNPAID TAB ROLLUPS
  const staffPayoutSummaries = useMemo(() => {
    return staff.map(member => {
      let totalEarnedTips = 0;
      let paidTips = 0;
      let pendingUnpaidTips = 0;
      let servicesCount = 0;

      transactions.forEach(t => {
        if (t.barberId === member.id) {
          servicesCount++;
          if (t.barberTip > 0) {
            totalEarnedTips += t.barberTip;
            if (t.barberTipPaid) paidTips += t.barberTip;
            else pendingUnpaidTips += t.barberTip;
          }
        }
        if (t.massageTherapistId === member.id) {
          servicesCount++;
          if (t.massageTip > 0) {
            totalEarnedTips += t.massageTip;
            if (t.massageTipPaid) paidTips += t.massageTip;
            else pendingUnpaidTips += t.massageTip;
          }
        }
      });

      return {
        ...member,
        servicesCount,
        totalEarnedTips,
        paidTips,
        pendingUnpaidTips
      };
    });
  }, [staff, transactions]);

  const totalBusinessUnpaidTips = staffPayoutSummaries.reduce((sum, s) => sum + s.pendingUnpaidTips, 0);

  // Filtered Audit Ledger
  const filteredLedger = useMemo(() => {
    return transactions.filter(t => {
      if (paymentFilter !== 'All') {
        if (paymentFilter === 'Split (Cash + M-Pesa)' && t.paymentMethod !== 'Split (Cash + M-Pesa)' && !(t.cashAmount > 0 && t.mpesaAmount > 0)) return false;
        if (paymentFilter === 'M-Pesa' && t.paymentMethod !== 'M-Pesa') return false;
        if (paymentFilter === 'Cash' && t.paymentMethod !== 'Cash') return false;
        if (paymentFilter === 'Card' && t.paymentMethod !== 'Card') return false;
      }

      if (payoutFilter === 'Pending') {
        if (t.barberTipPaid && t.massageTipPaid) return false;
      } else if (payoutFilter === 'Paid') {
        if ((t.barberTip > 0 && !t.barberTipPaid) || (t.massageTip > 0 && !t.massageTipPaid)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = t.clientName.toLowerCase().includes(q);
        const matchesBarber = t.barberName && t.barberName.toLowerCase().includes(q);
        const matchesMassage = t.massageTherapistName && t.massageTherapistName.toLowerCase().includes(q);
        const matchesService = t.services.some(s => s.name.toLowerCase().includes(q));
        return matchesClient || matchesBarber || matchesMassage || matchesService;
      }

      return true;
    });
  }, [transactions, paymentFilter, payoutFilter, searchQuery]);

  // CSV Export
  const exportCSV = () => {
    const headers = ['ID,Timestamp,Client,Services,PaymentMethod,CashAmount,MpesaAmount,ServiceSubtotal,Barber,BarberTip,BarberTipPaid,MassageTherapist,MassageTip,MassageTipPaid,GrandTotal'];
    const rows = filteredLedger.map(t => [
      t.id,
      `"${t.timestamp}"`,
      `"${t.clientName}"`,
      `"${t.services.map(s => s.name).join(' + ')}"`,
      t.paymentMethod,
      t.cashAmount !== undefined ? t.cashAmount : (t.paymentMethod === 'Cash' ? t.grandTotal : 0),
      t.mpesaAmount !== undefined ? t.mpesaAmount : (t.paymentMethod === 'M-Pesa' ? t.grandTotal : 0),
      t.serviceTotal,
      `"${t.barberName || ''}"`,
      t.barberTip,
      t.barberTipPaid ? 'YES' : 'NO',
      `"${t.massageTherapistName || ''}"`,
      t.massageTip,
      t.massageTipPaid ? 'YES' : 'NO',
      t.grandTotal
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `The_Masters_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* 1. BOSS EXECUTIVE HEADER */}
      <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 shrink-0">
            <Crown className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">Owner & Boss Portal</h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                Executive Control
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Financial performance, M-Pesa vs Cash totals, staff payouts & business intelligence reports.
            </p>
          </div>
        </div>

        {/* Quick Management Modals & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Manage Staff</span>
          </button>

          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Set Prices</span>
          </button>
        </div>
      </div>

      {/* 2. SIDEBAR & MAIN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* EXECUTIVE SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-1">
          <div className="glass-panel p-3.5 rounded-3xl border border-amber-500/20 lg:sticky lg:top-24 space-y-3 shadow-xl">
            <div className="px-3 py-2 text-xs font-bold text-amber-400 uppercase tracking-wider hidden lg:flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Boss Navigation</span>
            </div>

            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none">
              {[
                { id: 'overview', label: "📊 This Month's Overview" },
                { id: 'reports', label: '📈 Reports & Analytics' },
                { id: 'payouts', label: `☑️ Tip Payoffs (${totalBusinessUnpaidTips > 0 ? `${currency} ${totalBusinessUnpaidTips.toLocaleString()} Pending` : 'All Paid'})` },
                { id: 'ledger', label: `📜 Audit Ledger (${filteredLedger.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left py-3 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between shrink-0 min-w-[180px] lg:min-w-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN DASHBOARD VIEW CONTENT */}
        <div className="lg:col-span-3 space-y-6">

          {/* TAB 1: FINANCIAL OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Compare Mode Header */}
              <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      {isCompareEnabled ? `Comparing (${rangePreset.replace('_', ' ').toUpperCase()})` : "This Month's Summary"}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isCompareEnabled ? 'Compare current performance against prior period' : 'Default view showing ongoing performance for this month'}
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <button
                    onClick={() => setIsCompareEnabled(!isCompareEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                      isCompareEnabled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span>{isCompareEnabled ? '✕ Disable Compare Mode' : '⚡ Compare Time Ranges'}</span>
                  </button>
                </div>
              </div>

              {/* Expanded Compare Controls */}
              {isCompareEnabled && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 animate-fade-in">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                    Select Comparison Range Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'this_month', label: 'This Month vs Last Month' },
                      { id: 'this_week', label: 'This Week vs Last Week' },
                      { id: 'today', label: 'Today vs Yesterday' },
                      { id: 'all', label: 'All Time Total' }
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setRangePreset(preset.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          rangePreset === preset.id
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MAIN KPI METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: Total Revenue */}
                <div className="glass-card rounded-2xl p-5 border border-amber-500/30 relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {isCompareEnabled ? 'Total Revenue' : "This Month's Total Revenue"}
                    </span>
                    {isCompareEnabled && rangePreset !== 'all' && (
                      <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        getGrowth(curMetrics.totalRevenue, priMetrics.totalRevenue) >= 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {getGrowth(curMetrics.totalRevenue, priMetrics.totalRevenue) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(getGrowth(curMetrics.totalRevenue, priMetrics.totalRevenue))}%</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif font-bold gold-gradient-text">
                      {currency} {curMetrics.totalRevenue.toLocaleString()}
                    </h3>
                    {isCompareEnabled && rangePreset !== 'all' ? (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Prior Period: {currency} {priMetrics.totalRevenue.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Services + Tips included
                      </p>
                    )}
                  </div>
                </div>

                {/* KPI 2: Service Revenue Breakdown */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Pure Service Sales</span>
                    <Scissors className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {currency} {curMetrics.serviceRevenue.toLocaleString()}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                      <span>Count: {curMetrics.count} sessions</span>
                    </p>
                  </div>
                </div>

                {/* KPI 3: Total Tips Collected */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Tips Collected</span>
                    <Heart className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-amber-400">
                      {currency} {curMetrics.totalTips.toLocaleString()}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                      <span>Barber: {currency} {curMetrics.totalBarberTips}</span>
                      <span>Massage: {currency} {curMetrics.totalMassageTips}</span>
                    </div>
                  </div>
                </div>

                {/* KPI 4: Pending Unpaid Tips Tab */}
                <div className="glass-card rounded-2xl p-5 border border-amber-500/40 bg-amber-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 uppercase">Staff Pending Tips Tab</span>
                    <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-300">
                      {currency} {totalBusinessUnpaidTips.toLocaleString()}
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Unpaid balance owed to staff for end-of-month payout tab.
                    </p>
                  </div>
                </div>

              </div>

              {/* PAYMENT CHANNELS BREAKDOWN */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span>Payment Channel Breakdown ({isCompareEnabled ? rangePreset.replace('_', ' ') : 'This Month'})</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-6 h-6 text-emerald-400" />
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">M-Pesa Received</span>
                        <span className="text-xl font-bold text-emerald-300">{currency} {curMetrics.mpesaTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Banknote className="w-6 h-6 text-amber-400" />
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">Cash in Hand</span>
                        <span className="text-xl font-bold text-amber-300">{currency} {curMetrics.cashTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-sky-400" />
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">Card Payments</span>
                        <span className="text-xl font-bold text-sky-300">{currency} {curMetrics.cardTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STAFF SHIFT CLOSING LOGS AUDIT (SUBMITTED BY STAFF) */}
              {closingRecords.length > 0 && (
                <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>Staff Submitted Shift Closing Audit Logs ({closingRecords.length})</span>
                  </h2>

                  <div className="space-y-3">
                    {closingRecords.map(rec => (
                      <div key={rec.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{rec.date}</span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                              Submitted by: {rec.submittedBy}
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            rec.totalDiff < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {rec.totalDiff < 0 ? `⚠️ Net Shortage: -${currency} ${Math.abs(rec.totalDiff)}` : rec.totalDiff > 0 ? `Net Overage: +${currency} ${rec.totalDiff}` : 'Perfect Match (0)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Cash Drawer Status */}
                          <div className={`p-3 rounded-xl border ${
                            rec.cashDiff < 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950 border-slate-800'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-400 font-bold uppercase">Cash Drawer</span>
                              {rec.cashDiff < 0 && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">SHORTAGE</span>}
                            </div>
                            <p className="text-slate-300">Expected: {currency} {rec.expectedCash} | Actual: {currency} {rec.actualCash}</p>
                            <span className={`block font-bold mt-1 ${rec.cashDiff < 0 ? 'text-rose-300' : 'text-emerald-400'}`}>
                              Cash Difference: {rec.cashDiff > 0 ? '+' : ''}{currency} {rec.cashDiff || 0}
                            </span>
                          </div>

                          {/* M-Pesa Statement Status */}
                          <div className={`p-3 rounded-xl border ${
                            rec.mpesaDiff < 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950 border-slate-800'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-400 font-bold uppercase">M-Pesa Statement</span>
                              {rec.mpesaDiff < 0 && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">SHORTAGE</span>}
                            </div>
                            <p className="text-slate-300">Expected: {currency} {rec.expectedMpesa} | Actual: {currency} {rec.actualMpesa}</p>
                            <span className={`block font-bold mt-1 ${rec.mpesaDiff < 0 ? 'text-rose-300' : 'text-emerald-400'}`}>
                              M-Pesa Difference: {rec.mpesaDiff > 0 ? '+' : ''}{currency} {rec.mpesaDiff || 0}
                            </span>
                          </div>
                        </div>

                        {rec.notes && (
                          <p className="text-xs text-amber-300/90 italic pt-1 border-t border-slate-800/60">
                            Reason/Notes: "{rec.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <ExecutiveReports />
          )}

          {/* TAB 3: STAFF TIP PAYOFFS & END-OF-MONTH PENDING TABS */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              
              <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 space-y-2">
                <h2 className="text-lg font-serif font-bold text-white">Staff Tip Payoff & Tab Manager</h2>
                <p className="text-xs text-slate-300">
                  Tick off tips you have paid out to your barbers and massage therapists. Any un-ticked tips remain in the staff's accumulated end-of-month payout balance.
                </p>
              </div>

              {/* Staff Payout Roster Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffPayoutSummaries.map(member => (
                  <div 
                    key={member.id}
                    className={`glass-card p-5 rounded-3xl border transition-all ${
                      member.pendingUnpaidTips > 0 
                        ? 'border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/10' 
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold flex items-center justify-center">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-white">{member.name}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{member.servicesCount} services logged</p>
                        </div>
                      </div>

                      {member.pendingUnpaidTips > 0 ? (
                        <button
                          onClick={() => payOffAllStaffTips(member.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                        >
                          Pay Off All ({currency} {member.pendingUnpaidTips})
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>All Paid</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Total Earned Tips</span>
                        <span className="font-bold text-white">{currency} {member.totalEarnedTips.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Paid Off Tips</span>
                        <span className="font-bold text-emerald-400">{currency} {member.paidTips.toLocaleString()}</span>
                      </div>
                      <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                        <span className="text-amber-300 block text-[10px]">Unpaid Pending Tab</span>
                        <span className="font-bold text-yellow-300">{currency} {member.pendingUnpaidTips.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* INDIVIDUAL TIP TICK-OFF CHECKLIST */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Tick Off Individual Tips Paid</span>
                </h3>

                <div className="space-y-3">
                  {transactions.filter(t => t.barberTip > 0 || t.massageTip > 0).map(t => (
                    <div key={t.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{t.clientName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-xs text-amber-400 font-bold">{t.paymentMethod}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Barber Tip Checkbox */}
                        {t.barberTip > 0 && (
                          <div 
                            onClick={() => toggleTipPayoff(t.id, 'barber')}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              t.barberTipPaid 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-semibold uppercase block opacity-80">Barber Tip ({t.barberName})</span>
                              <span className="text-sm font-bold">{currency} {t.barberTip}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-bold text-xs">
                              {t.barberTipPaid ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-amber-400" />}
                              <span>{t.barberTipPaid ? 'PAID OFF' : 'TICK TO PAY'}</span>
                            </div>
                          </div>
                        )}

                        {/* Massage Therapist Tip Checkbox */}
                        {t.massageTip > 0 && (
                          <div 
                            onClick={() => toggleTipPayoff(t.id, 'massage')}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              t.massageTipPaid 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-semibold uppercase block opacity-80">Massage Therapist Tip ({t.massageTherapistName})</span>
                              <span className="text-sm font-bold">{currency} {t.massageTip}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-bold text-xs">
                              {t.massageTipPaid ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-amber-400" />}
                              <span>{t.massageTipPaid ? 'PAID OFF' : 'TICK TO PAY'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AUDIT TRANSACTION LEDGER & CSV EXPORT */}
          {activeTab === 'ledger' && (
            <div className="space-y-6">
              
              {/* Controls Bar */}
              <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-72">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search client, staff, service..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs text-amber-300 rounded-xl px-3 py-2 focus:outline-none"
                    >
                      <option value="All">All Payment Methods</option>
                      <option value="M-Pesa">M-Pesa Only</option>
                      <option value="Cash">Cash Only</option>
                      <option value="Card">Card Only</option>
                      <option value="Split (Cash + M-Pesa)">Split (Cash + M-Pesa) Only</option>
                    </select>

                    <select
                      value={payoutFilter}
                      onChange={(e) => setPayoutFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs text-amber-300 rounded-xl px-3 py-2 focus:outline-none"
                    >
                      <option value="All">All Payout Statuses</option>
                      <option value="Pending">Has Pending Tips</option>
                      <option value="Paid">All Tips Paid</option>
                    </select>

                    <button
                      onClick={exportCSV}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* LEDGER TABLE / CARDS */}
              <div className="space-y-3">
                {filteredLedger.map(t => (
                  <div key={t.id} className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-bold text-white text-sm">{t.clientName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                            {t.paymentMethod === 'Split (Cash + M-Pesa)' || (t.cashAmount > 0 && t.mpesaAmount > 0)
                              ? `Split: Cash (${currency} ${t.cashAmount}) + M-Pesa (${currency} ${t.mpesaAmount})`
                              : t.paymentMethod}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            Recorded by: <strong>{t.loggedByStaffName || 'Staff'}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          Time Logged: {new Date(t.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Total Bill</span>
                        <span className="text-xl font-bold font-serif gold-gradient-text">
                          {currency} {t.grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 font-semibold block mb-0.5">Services Rendered:</span>
                        <p>{t.services.map(s => `${s.name} (${currency} ${s.price})`).join(' + ')}</p>
                      </div>

                      <div className="space-y-1">
                        {t.barberName && (
                          <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                            <span>Barber: <strong>{t.barberName}</strong></span>
                            <span className={`font-semibold ${t.barberTipPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                              Tip: {currency} {t.barberTip} ({t.barberTipPaid ? 'Paid Off' : 'Pending'})
                            </span>
                          </div>
                        )}
                        {t.massageTherapistName && (
                          <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                            <span>Massage: <strong>{t.massageTherapistName}</strong></span>
                            <span className={`font-semibold ${t.massageTipPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                              Tip: {currency} {t.massageTip} ({t.massageTipPaid ? 'Paid Off' : 'Pending'})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODALS */}
      <StaffManagementModal 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)} 
      />

      <ServiceManagementModal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
      />

    </div>
  );
}
