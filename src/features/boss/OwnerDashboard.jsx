import ErrorBoundary from '../../components/common/ErrorBoundary';
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import StaffManagementModal from './StaffManagementModal';
import ServiceManagementModal from './ServiceManagementModal';
import ExecutiveReports from './ExecutiveReports';
import ExpensesAuditView from '../expenses/ExpensesAuditView';
import BossSettingsModal from './BossSettingsModal';
import PeriodFilterDropdown from '../../components/common/PeriodFilterDropdown';
import { getDateRange, filterItemsByDate } from '../../utils/dateRange';
import AppointmentsManager from '../appointments/AppointmentsManager';
import { 
  Crown, TrendingUp, TrendingDown, DollarSign, Users, Scissors, Heart, 
  CheckSquare, Square, Wallet, Banknote, CreditCard, Calendar, Filter, 
  Download, Sparkles, UserPlus, Settings, CheckCircle2, AlertCircle, 
  ArrowUpRight, ArrowDownRight, BarChart3, SlidersHorizontal, History,
  Menu, ChevronDown, ChevronUp, Receipt 
} from 'lucide-react';

export default function OwnerDashboard() {
  const { 
    transactions, staff, services, currency, closingRecords,
    toggleTipPayoff, payOffAllStaffTips, deleteTransaction, expenses, appointments, authUser, setIsLoginModalOpen,
    bossTab: activeTab, setBossTab: setActiveTab,
    isStaffModalOpen, setIsStaffModalOpen,
    isServiceModalOpen, setIsServiceModalOpen,
    isSettingsModalOpen, setIsSettingsModalOpen,
    setSettingsTab,
    periodPreset,
    setPeriodPreset,
    customStartDate,
    customEndDate
  } = useApp();

  // Default: Compare is OFF by default. Boss sees This Month's totals cleanly.
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);
  const [revertConfirmModal, setRevertConfirmModal] = useState(null);

  const handleTipToggleClick = (t, role) => {
    const isPaid = role === 'barber' ? t.barberTipPaid : t.massageTipPaid;
    const staffName = role === 'barber' ? t.barberName : t.massageTherapistName;
    const tipAmount = role === 'barber' ? t.barberTip : t.massageTip;

    if (isPaid) {
      // Confirmation required before unticking a paid-off tip
      setRevertConfirmModal({
        txId: t.id,
        role: role,
        staffName: staffName || (role === 'barber' ? 'Barber' : 'Massage Therapist'),
        amount: tipAmount,
        clientName: t.clientName || 'Walk-in Client'
      });
    } else {
      // Ticking marks as paid off immediately
      toggleTipPayoff(t.id, role);
    }
  };

  // Filters state for audit ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [payoutFilter, setPayoutFilter] = useState('All');

  // --- 1. FINANCIAL OVERVIEW INDEPENDENT PERIOD MATH ---
  const [overviewPreset, setOverviewPreset] = useState('this_month');
  const [overviewStart, setOverviewStart] = useState('');
  const [overviewEnd, setOverviewEnd] = useState('');

  const activeOverviewRange = useMemo(() => {
    return getDateRange(overviewPreset, overviewStart, overviewEnd);
  }, [overviewPreset, overviewStart, overviewEnd]);

  // Filtered Transactions for Financial Overview only
  const overviewTx = useMemo(() => {
    return filterItemsByDate(transactions, activeOverviewRange.start, activeOverviewRange.end, 'timestamp');
  }, [transactions, activeOverviewRange]);

  const priorOverviewTx = useMemo(() => {
    if (!activeOverviewRange.priorStart || !activeOverviewRange.priorEnd) return [];
    return filterItemsByDate(transactions, activeOverviewRange.priorStart, activeOverviewRange.priorEnd, 'timestamp');
  }, [transactions, activeOverviewRange]);

  // Filtered Expenses for Financial Overview only
  const overviewExpenses = useMemo(() => {
    return filterItemsByDate(expenses || [], activeOverviewRange.start, activeOverviewRange.end, 'timestamp');
  }, [expenses, activeOverviewRange]);

  const priorOverviewExpenses = useMemo(() => {
    if (!activeOverviewRange.priorStart || !activeOverviewRange.priorEnd) return [];
    return filterItemsByDate(expenses || [], activeOverviewRange.priorStart, activeOverviewRange.priorEnd, 'timestamp');
  }, [expenses, activeOverviewRange]);

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

  const curMetrics = calculateMetrics(overviewTx);
  const priMetrics = calculateMetrics(priorOverviewTx);

  const curTotalExpenses = overviewExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const priTotalExpenses = priorOverviewExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const totalExpenses = curTotalExpenses;
  const netProfit = curMetrics.serviceRevenue - curTotalExpenses;
  const priNetProfit = priMetrics.serviceRevenue - priTotalExpenses;

  const periodLabels = useMemo(() => {
    return {
      current: activeOverviewRange.label,
      prior: activeOverviewRange.priorLabel
    };
  }, [activeOverviewRange]);

  // --- 2. MASTER TRANSACTION LEDGER INDEPENDENT PERIOD MATH ---
  const [ledgerPreset, setLedgerPreset] = useState('all_time');
  const [ledgerStart, setLedgerStart] = useState('');
  const [ledgerEnd, setLedgerEnd] = useState('');

  const activeLedgerRange = useMemo(() => {
    return getDateRange(ledgerPreset, ledgerStart, ledgerEnd);
  }, [ledgerPreset, ledgerStart, ledgerEnd]);

  const ledgerTx = useMemo(() => {
    return filterItemsByDate(transactions, activeLedgerRange.start, activeLedgerRange.end, 'timestamp');
  }, [transactions, activeLedgerRange]);

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
    return ledgerTx.filter(t => {
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

  // Restricted Access Guard
  if (!authUser || authUser.role !== 'boss') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-yellow-400">
          <Crown className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white">Boss Dashboard Restricted</h2>
          <p className="text-xs text-slate-400">
            This executive dashboard is restricted to The Masters business owners and managers. Please log in with your administrative account.
          </p>
        </div>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
        >
          Sign In as Boss (Admin)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
      
      {/* 1. MODERN SLEEK EXECUTIVE TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {activeTab === 'overview' && "Financial Overview & Performance"}
            {activeTab === 'appointments' && "Online Bookings & Assignment"}
            {activeTab === 'reports' && "Executive Intelligence & Reports"}
            {activeTab === 'payouts' && "Staff Tip Payoffs & Balances"}
            {activeTab === 'expenses' && "Operational Expenses Audit"}
            {activeTab === 'ledger' && "Master Transaction Ledger"}
          </h1>
        </div>

        {/* Clean Executive Top Bar: Settings Only */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setSettingsTab('staff');
              setIsSettingsModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-amber-500/40 text-xs font-semibold transition-all flex items-center space-x-2 shadow-sm active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN EXECUTIVE CONTENT */}
      <div className="space-y-3 sm:space-y-6">

          {/* TAB 1: FINANCIAL OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3 sm:space-y-6">
              
              {/* Compare Mode Header */}
              <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-30">
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      {isCompareEnabled ? `Comparing (${periodLabels.current} vs ${periodLabels.prior})` : `${periodLabels.current} Summary`}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isCompareEnabled ? 'Compare current performance against prior period' : 'Default view showing ongoing performance for this month'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  {/* Independent Overview Period Filter */}
                  <PeriodFilterDropdown
                    preset={overviewPreset}
                    onChangePreset={setOverviewPreset}
                    customStart={overviewStart}
                    customEnd={overviewEnd}
                    onApplyCustom={(s, e) => {
                      setOverviewStart(s);
                      setOverviewEnd(e);
                      setOverviewPreset('custom');
                    }}
                  />

                  <button
                    onClick={() => setIsCompareEnabled(!isCompareEnabled)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border shrink-0 ${
                      isCompareEnabled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isCompareEnabled ? '✕ Disable' : '⚡ Compare'}</span>
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
                      { id: 'all_time', label: 'All Time Total' }
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setOverviewPreset(preset.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          overviewPreset === preset.id
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                
                {/* KPI 1: Total Revenue */}
                <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-amber-500/30 relative overflow-hidden space-y-1.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {isCompareEnabled ? `Revenue (${periodLabels.current})` : "This Month's Total Revenue"}
                    </span>
                    {isCompareEnabled && overviewPreset !== 'all_time' && (
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
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold gold-gradient-text">
                      {currency} {curMetrics.totalRevenue.toLocaleString()}
                    </h3>
                    {isCompareEnabled && overviewPreset !== 'all_time' ? (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 mt-2 border-t border-slate-800">
                        <span className="text-slate-400">Benchmark ({periodLabels.prior}):</span>
                        <span className="font-bold text-slate-300">{currency} {priMetrics.totalRevenue.toLocaleString()}</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Services + Tips included
                      </p>
                    )}
                  </div>
                </div>

                {/* KPI 2: Service Revenue Breakdown */}
                <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-800 space-y-1.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {isCompareEnabled ? `Service Sales (${periodLabels.current})` : "Pure Service Sales"}
                    </span>
                    {isCompareEnabled && overviewPreset !== 'all_time' ? (
                      <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        getGrowth(curMetrics.serviceRevenue, priMetrics.serviceRevenue) >= 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {getGrowth(curMetrics.serviceRevenue, priMetrics.serviceRevenue) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(getGrowth(curMetrics.serviceRevenue, priMetrics.serviceRevenue))}%</span>
                      </span>
                    ) : (
                      <Scissors className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {currency} {curMetrics.serviceRevenue.toLocaleString()}
                    </h3>
                    {isCompareEnabled && overviewPreset !== 'all_time' ? (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 mt-2 border-t border-slate-800">
                        <span className="text-slate-400">Benchmark ({periodLabels.prior}):</span>
                        <span className="font-bold text-slate-300">{currency} {priMetrics.serviceRevenue.toLocaleString()}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">Count: {curMetrics.count} sessions</p>
                    )}
                  </div>
                </div>

                {/* KPI 3: Total Tips Collected */}
                <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-800 space-y-1.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {isCompareEnabled ? `Tips (${periodLabels.current})` : "Tips Collected"}
                    </span>
                    {isCompareEnabled && overviewPreset !== 'all_time' ? (
                      <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        getGrowth(curMetrics.totalTips, priMetrics.totalTips) >= 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {getGrowth(curMetrics.totalTips, priMetrics.totalTips) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(getGrowth(curMetrics.totalTips, priMetrics.totalTips))}%</span>
                      </span>
                    ) : (
                      <Heart className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-amber-400">
                      {currency} {curMetrics.totalTips.toLocaleString()}
                    </h3>
                    {isCompareEnabled && overviewPreset !== 'all_time' ? (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 mt-2 border-t border-slate-800">
                        <span className="text-slate-400">Benchmark ({periodLabels.prior}):</span>
                        <span className="font-bold text-slate-300">{currency} {priMetrics.totalTips.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>Barber: {currency} {curMetrics.totalBarberTips}</span>
                        <span>Massage: {currency} {curMetrics.totalMassageTips}</span>
                      </div>
                    )}
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

              {/* DEDICATED SIDE-BY-SIDE PERIOD COMPARISON TABLE */}
              {isCompareEnabled && overviewPreset !== 'all_time' && (
                <div className="glass-card rounded-3xl p-5 sm:p-6 border border-amber-500/30 space-y-4 animate-fade-in shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Side-by-Side Comparison: {periodLabels.current} vs. {periodLabels.prior}
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 self-start sm:self-auto">
                      {activeOverviewRange.label.toUpperCase()} BENCHMARK
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 px-3 font-semibold">Business Metric</th>
                          <th className="py-2.5 px-3 font-bold text-amber-300">{periodLabels.current} (Current)</th>
                          <th className="py-2.5 px-3 font-semibold text-slate-400">{periodLabels.prior} (Benchmark)</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Net Change</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {[
                          {
                            label: 'Gross Business Revenue',
                            current: `${currency} ${curMetrics.totalRevenue.toLocaleString()}`,
                            prior: `${currency} ${priMetrics.totalRevenue.toLocaleString()}`,
                            diff: `${curMetrics.totalRevenue >= priMetrics.totalRevenue ? '+' : '-'}${currency} ${Math.abs(curMetrics.totalRevenue - priMetrics.totalRevenue).toLocaleString()}`,
                            growth: getGrowth(curMetrics.totalRevenue, priMetrics.totalRevenue),
                            isPositive: curMetrics.totalRevenue >= priMetrics.totalRevenue
                          },
                          {
                            label: 'Pure Service Sales',
                            current: `${currency} ${curMetrics.serviceRevenue.toLocaleString()}`,
                            prior: `${currency} ${priMetrics.serviceRevenue.toLocaleString()}`,
                            diff: `${curMetrics.serviceRevenue >= priMetrics.serviceRevenue ? '+' : '-'}${currency} ${Math.abs(curMetrics.serviceRevenue - priMetrics.serviceRevenue).toLocaleString()}`,
                            growth: getGrowth(curMetrics.serviceRevenue, priMetrics.serviceRevenue),
                            isPositive: curMetrics.serviceRevenue >= priMetrics.serviceRevenue
                          },
                          {
                            label: 'Customer Volume / Sessions',
                            current: `${curMetrics.count} clients`,
                            prior: `${priMetrics.count} clients`,
                            diff: `${curMetrics.count >= priMetrics.count ? '+' : ''}${curMetrics.count - priMetrics.count} clients`,
                            growth: getGrowth(curMetrics.count, priMetrics.count),
                            isPositive: curMetrics.count >= priMetrics.count
                          },
                          {
                            label: 'Tips Collected',
                            current: `${currency} ${curMetrics.totalTips.toLocaleString()}`,
                            prior: `${currency} ${priMetrics.totalTips.toLocaleString()}`,
                            diff: `${curMetrics.totalTips >= priMetrics.totalTips ? '+' : '-'}${currency} ${Math.abs(curMetrics.totalTips - priMetrics.totalTips).toLocaleString()}`,
                            growth: getGrowth(curMetrics.totalTips, priMetrics.totalTips),
                            isPositive: curMetrics.totalTips >= priMetrics.totalTips
                          },
                          {
                            label: 'M-Pesa Mobile Payments',
                            current: `${currency} ${curMetrics.mpesaTotal.toLocaleString()}`,
                            prior: `${currency} ${priMetrics.mpesaTotal.toLocaleString()}`,
                            diff: `${curMetrics.mpesaTotal >= priMetrics.mpesaTotal ? '+' : '-'}${currency} ${Math.abs(curMetrics.mpesaTotal - priMetrics.mpesaTotal).toLocaleString()}`,
                            growth: getGrowth(curMetrics.mpesaTotal, priMetrics.mpesaTotal),
                            isPositive: curMetrics.mpesaTotal >= priMetrics.mpesaTotal
                          },
                          {
                            label: 'Cash in Hand',
                            current: `${currency} ${curMetrics.cashTotal.toLocaleString()}`,
                            prior: `${currency} ${priMetrics.cashTotal.toLocaleString()}`,
                            diff: `${curMetrics.cashTotal >= priMetrics.cashTotal ? '+' : '-'}${currency} ${Math.abs(curMetrics.cashTotal - priMetrics.cashTotal).toLocaleString()}`,
                            growth: getGrowth(curMetrics.cashTotal, priMetrics.cashTotal),
                            isPositive: curMetrics.cashTotal >= priMetrics.cashTotal
                          },
                          {
                            label: 'Operational Shop Expenses',
                            current: `- ${currency} ${curTotalExpenses.toLocaleString()}`,
                            prior: `- ${currency} ${priTotalExpenses.toLocaleString()}`,
                            diff: `${curTotalExpenses <= priTotalExpenses ? 'Saved ' : 'Increased '}${currency} ${Math.abs(curTotalExpenses - priTotalExpenses).toLocaleString()}`,
                            growth: getGrowth(curTotalExpenses, priTotalExpenses),
                            // For expenses, lower is better
                            isPositive: curTotalExpenses <= priTotalExpenses
                          },
                          {
                            label: 'Net Operating Profit',
                            current: `${currency} ${netProfit.toLocaleString()}`,
                            prior: `${currency} ${priNetProfit.toLocaleString()}`,
                            diff: `${netProfit >= priNetProfit ? '+' : '-'}${currency} ${Math.abs(netProfit - priNetProfit).toLocaleString()}`,
                            growth: getGrowth(netProfit, priNetProfit),
                            isPositive: netProfit >= priNetProfit
                          }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-white">{row.label}</td>
                            <td className="py-2.5 px-3 font-bold font-serif text-amber-300">{row.current}</td>
                            <td className="py-2.5 px-3 text-slate-400 font-serif">{row.prior}</td>
                            <td className={`py-2.5 px-3 text-right font-semibold font-serif ${row.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {row.diff}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                row.isPositive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {row.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                <span>{row.growth}%</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* OPERATIONAL EXPENSES & NET PROFIT BANNER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block">Total Shop Expenses</span>
                    <div className="text-2xl font-bold font-serif text-rose-300">
                      - {currency} {totalExpenses.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {(expenses || []).length} purchases logged by staff
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold transition-all border border-rose-500/30 flex items-center space-x-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Audit</span>
                  </button>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">Net Shop Profit (Sales - Expenses)</span>
                    <div className={`text-2xl font-bold font-serif ${netProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                      {currency} {netProfit.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Pure service sales ({currency} {curMetrics.serviceRevenue.toLocaleString()}) minus expenses
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {netProfit >= 0 ? 'PROFITABLE' : 'NET LOSS'}
                  </span>
                </div>
              </div>

              {/* PAYMENT CHANNELS BREAKDOWN */}
              <div className="glass-card rounded-xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 space-y-2.5 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span>Payment Channel Breakdown ({isCompareEnabled ? `${periodLabels.current} vs ${periodLabels.prior}` : 'This Month'})</span>
                  </h2>
                  {isCompareEnabled && overviewPreset !== 'all_time' && (
                    <span className="text-[11px] text-slate-400">
                      Comparing payment receipts between periods
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs text-slate-300 font-bold">M-Pesa Received</span>
                      </div>
                      {isCompareEnabled && overviewPreset !== 'all_time' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          getGrowth(curMetrics.mpesaTotal, priMetrics.mpesaTotal) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {getGrowth(curMetrics.mpesaTotal, priMetrics.mpesaTotal) >= 0 ? '+' : ''}{getGrowth(curMetrics.mpesaTotal, priMetrics.mpesaTotal)}%
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-300">{currency} {curMetrics.mpesaTotal.toLocaleString()}</span>
                      {isCompareEnabled && overviewPreset !== 'all_time' && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Prior ({periodLabels.prior}): {currency} {priMetrics.mpesaTotal.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Banknote className="w-5 h-5 text-amber-400" />
                        <span className="text-xs text-slate-300 font-bold">Cash in Hand</span>
                      </div>
                      {isCompareEnabled && overviewPreset !== 'all_time' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          getGrowth(curMetrics.cashTotal, priMetrics.cashTotal) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {getGrowth(curMetrics.cashTotal, priMetrics.cashTotal) >= 0 ? '+' : ''}{getGrowth(curMetrics.cashTotal, priMetrics.cashTotal)}%
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-serif font-bold text-amber-300">{currency} {curMetrics.cashTotal.toLocaleString()}</span>
                      {isCompareEnabled && overviewPreset !== 'all_time' && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Prior ({periodLabels.prior}): {currency} {priMetrics.cashTotal.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <CreditCard className="w-5 h-5 text-sky-400" />
                        <span className="text-xs text-slate-300 font-bold">Card Payments</span>
                      </div>
                      {isCompareEnabled && overviewPreset !== 'all_time' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          getGrowth(curMetrics.cardTotal, priMetrics.cardTotal) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {getGrowth(curMetrics.cardTotal, priMetrics.cardTotal) >= 0 ? '+' : ''}{getGrowth(curMetrics.cardTotal, priMetrics.cardTotal)}%
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-serif font-bold text-sky-300">{currency} {curMetrics.cardTotal.toLocaleString()}</span>
                      {isCompareEnabled && overviewPreset !== 'all_time' && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Prior ({periodLabels.prior}): {currency} {priMetrics.cardTotal.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STAFF SHIFT CLOSING LOGS AUDIT (SUBMITTED BY STAFF) */}
              {closingRecords.length > 0 && (
                <div className="glass-card rounded-xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 space-y-2.5 sm:space-y-4">
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
            <ErrorBoundary name="Executive Analytics & Reports">
              <ExecutiveReports />
            </ErrorBoundary>
          )}

          {/* TAB 3: STAFF TIP PAYOFFS & END-OF-MONTH PENDING TABS */}
          {activeTab === 'payouts' && (
            <div className="space-y-3 sm:space-y-6">
              
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
              <div className="glass-card rounded-xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 space-y-2.5 sm:space-y-4">
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
                            onClick={() => handleTipToggleClick(t, 'barber')}
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
                            onClick={() => handleTipToggleClick(t, 'massage')}
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


          {/* TAB: ONLINE CUSTOMER APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <ErrorBoundary name="Appointments Management">
              <AppointmentsManager mode="boss" />
            </ErrorBoundary>
          )}

          {/* TAB: OPERATIONAL EXPENSES AUDIT */}
          {activeTab === 'expenses' && (
            <ErrorBoundary name="Shop Expenses Audit">
              <ExpensesAuditView />
            </ErrorBoundary>
          )}

          {/* TAB 4: AUDIT TRANSACTION LEDGER & CSV EXPORT */}
          {activeTab === 'ledger' && (
            <div className="space-y-3 sm:space-y-6">
              
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

      {/* CONFIRMATION MODAL BEFORE UNTICKING A PAID OFF TIP */}
      {revertConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-amber-500/40 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Revert Tip to Pending?</h3>
                <p className="text-xs text-slate-400">Untick Confirmation</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Staff Specialist:</span>
                <span className="font-bold text-white">{revertConfirmModal.staffName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Client:</span>
                <span className="font-medium text-white">{revertConfirmModal.clientName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tip Amount:</span>
                <span className="font-bold font-serif text-emerald-400">{currency} {revertConfirmModal.amount}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 leading-relaxed">
                This tip is currently marked as <strong className="text-emerald-400 font-bold">PAID OFF</strong>. Are you sure you want to untick it? Unticking will reopen {currency} {revertConfirmModal.amount} back into {revertConfirmModal.staffName}'s unpaid balance tab.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setRevertConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel (Keep Paid Off)
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleTipPayoff(revertConfirmModal.txId, revertConfirmModal.role);
                  setRevertConfirmModal(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors shadow-sm"
              >
                Yes, Untick Tip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED EXECUTIVE SETTINGS MODAL */}
      <BossSettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />

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
