import ErrorBoundary from '../../components/common/ErrorBoundary';
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import ClosingCashModal from './ClosingCashModal';
import ExpenseLogger from '../expenses/ExpenseLogger';
import AppointmentsManager from '../appointments/AppointmentsManager';
import PeriodFilterDropdown from '../../components/common/PeriodFilterDropdown';
import { getDateRange, filterItemsByDate } from '../../utils/dateRange';
import { 
  Smartphone, Plus, CheckCircle, DollarSign, UserCheck, Scissors, Heart, 
  Sparkles, CreditCard, Wallet, Banknote, AlertCircle, Clock, Trash2, Lock, 
  User, CheckCircle2, Award, Calendar, CheckSquare, Filter 
} from 'lucide-react';

export default function StaffPortal() {
  const { services, staff, transactions, appointments, addTransaction, deleteTransaction, currency, authUser, setIsLoginModalOpen, staffTab, setStaffTab } = useApp();

  // Active Staff Member Logged In
  const activeStaffList = useMemo(() => staff.filter(s => s.active), [staff]);

  const [activeStaffId, setActiveStaffId] = useState(() => {
    const defaultTherapist = activeStaffList.find(s => s.role === 'Massage Therapist');
    return defaultTherapist ? defaultTherapist.id : (activeStaffList[0]?.id || '');
  });

  const activeStaff = useMemo(() => {
    if (authUser?.staffProfile) {
      return staff.find(s => s.id === authUser.staffProfile.id) || authUser.staffProfile;
    }
    return staff.find(s => s.id === activeStaffId) || activeStaffList[0];
  }, [staff, authUser, activeStaffId, activeStaffList]);

  // Form State for Entry
  const [clientName, setClientName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [selectedMassageTherapistId, setSelectedMassageTherapistId] = useState('');
  const [barberTip, setBarberTip] = useState('');
  const [massageTip, setMassageTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [splitMpesaAmount, setSplitMpesaAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Period Filter State for Staff Personal Dashboard (Today / This Month / Last Month / Custom Day)
  const [personalPreset, setPersonalPreset] = useState('this_month');
  const [personalStart, setPersonalStart] = useState(new Date().toISOString().slice(0, 10));
  const [personalEnd, setPersonalEnd] = useState(new Date().toISOString().slice(0, 10));

  const personalRange = useMemo(() => {
    return getDateRange(personalPreset, personalStart, personalEnd);
  }, [personalPreset, personalStart, personalEnd]);

  // Filter Active Staff by Role
  const barbers = staff.filter(s => (s.role === 'Barber' || s.role === 'Dual') && s.active);
  const massageTherapists = staff.filter(s => (s.role === 'Massage Therapist' || s.role === 'Dual') && s.active);

  // Unclaimed / assigned appointments relevant to active staff
  const pendingAppointmentsCount = useMemo(() => {
    return (appointments || []).filter(a => 
      a.status === 'pending' && 
      (a.preferredStaffId === activeStaff?.id || (!a.assignedStaffId && (!a.preferredStaffId || a.preferredStaffId === '')))
    ).length;
  }, [appointments, activeStaff]);

  // --- PRIVATE DASHBOARD STATS FOR LOGGED IN STAFF MEMBER WITH DATE FILTER ---
  const personalStats = useMemo(() => {
    if (!activeStaff) return { totalTips: 0, paidTips: 0, pendingTips: 0, count: 0, totalServiceRev: 0, history: [] };

    let totalTips = 0;
    let paidTips = 0;
    let pendingTips = 0;
    let count = 0;
    let totalServiceRev = 0;
    const history = [];

    // Filter transactions within the selected period (e.g. today, this month, last month, specific day)
    const filteredTx = filterItemsByDate(transactions || [], personalRange.start, personalRange.end, 'timestamp');

    filteredTx.forEach(t => {
      let isMyTx = false;
      let myTip = 0;
      let isMyTipPaid = false;

      if (t.barberId === activeStaff.id) {
        isMyTx = true;
        myTip += (t.barberTip || 0);
        isMyTipPaid = t.barberTipPaid;
      }

      if (t.massageTherapistId === activeStaff.id) {
        isMyTx = true;
        myTip += (t.massageTip || 0);
        if (!isMyTipPaid) isMyTipPaid = t.massageTipPaid;
      }

      if (isMyTx) {
        count++;
        totalServiceRev += (t.serviceTotal || 0);
        totalTips += myTip;
        if (isMyTipPaid) paidTips += myTip;
        else pendingTips += myTip;

        history.push({
          ...t,
          myTip,
          isMyTipPaid
        });
      }
    });

    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { totalTips, paidTips, pendingTips, count, totalServiceRev, history };
  }, [activeStaff, transactions, personalRange]);

  // --- RECENT ACTIVITY LIST RELEVANT TO CURRENT STAFF ---
  const recentActivitiesForStaff = useMemo(() => {
    if (!activeStaff) return [];

    return (transactions || []).filter(t => {
      const isRecorder = t.loggedByStaffId === activeStaff.id;
      const isAssignedBarber = t.barberId === activeStaff.id;
      const isAssignedMassage = t.massageTherapistId === activeStaff.id;
      return isRecorder || isAssignedBarber || isAssignedMassage;
    }).slice(0, 8);
  }, [transactions, activeStaff]);

  // Toggle Service Selection
  const toggleService = (srvId) => {
    setSelectedServiceIds(prev => 
      prev.includes(srvId) ? prev.filter(id => id !== srvId) : [...prev, srvId]
    );
  };

  // Selected Services Objects & Pricing Math
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const serviceSubtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const numBarberTip = parseFloat(barberTip) || 0;
  const numMassageTip = parseFloat(massageTip) || 0;
  const grandTotal = serviceSubtotal + numBarberTip + numMassageTip;

  // Split Payment helpers
  const handleCashSplitChange = (val) => {
    setSplitCashAmount(val);
    const c = parseFloat(val);
    if (!isNaN(c) && grandTotal > 0) {
      const rem = Math.max(0, grandTotal - c);
      setSplitMpesaAmount(rem.toString());
    } else if (val === '') {
      setSplitMpesaAmount(grandTotal > 0 ? grandTotal.toString() : '');
    }
  };

  const handleMpesaSplitChange = (val) => {
    setSplitMpesaAmount(val);
    const m = parseFloat(val);
    if (!isNaN(m) && grandTotal > 0) {
      const rem = Math.max(0, grandTotal - m);
      setSplitCashAmount(rem.toString());
    } else if (val === '') {
      setSplitCashAmount(grandTotal > 0 ? grandTotal.toString() : '');
    }
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();

    if (selectedServiceIds.length === 0) {
      alert('Please select at least one service performed.');
      return;
    }

    if (!selectedBarberId && !selectedMassageTherapistId) {
      alert('Please assign at least one staff member (Barber or Massage Therapist) who performed the work.');
      return;
    }

    const assignedBarber = staff.find(s => s.id === selectedBarberId);
    const assignedMassage = staff.find(s => s.id === selectedMassageTherapistId);
    const loggedByStaff = activeStaff ? activeStaff.name : 'Frontdesk';

    // Parse Split Amounts
    let finalCash = 0;
    let finalMpesa = 0;
    if (paymentMethod === 'Split (Cash + M-Pesa)') {
      finalCash = parseFloat(splitCashAmount) || 0;
      finalMpesa = parseFloat(splitMpesaAmount) || 0;
      if (finalCash + finalMpesa !== grandTotal) {
        if (!window.confirm(`Warning: The split amounts (${currency} ${finalCash} cash + ${currency} ${finalMpesa} m-pesa = ${finalCash+finalMpesa}) do not equal the Grand Total (${currency} ${grandTotal}). Submit anyway?`)) {
          return;
        }
      }
    } else if (paymentMethod === 'Cash') {
      finalCash = grandTotal;
    } else if (paymentMethod === 'M-Pesa') {
      finalMpesa = grandTotal;
    }

    const newTx = {
      clientName: clientName.trim() || 'Walk-in Client',
      services: selectedServices,
      serviceTotal: serviceSubtotal,
      barberId: selectedBarberId || null,
      barberName: assignedBarber ? assignedBarber.name : null,
      barberTip: numBarberTip,
      barberTipPaid: false,
      massageTherapistId: selectedMassageTherapistId || null,
      massageTherapistName: assignedMassage ? assignedMassage.name : null,
      massageTip: numMassageTip,
      massageTipPaid: false,
      paymentMethod,
      splitCashAmount: finalCash,
      splitMpesaAmount: finalMpesa,
      grandTotal,
      loggedByStaffId: activeStaff ? activeStaff.id : 'unknown',
      loggedByStaffName: loggedByStaff,
      timestamp: new Date().toISOString()
    };

    addTransaction(newTx);

    // Reset Form
    setClientName('');
    setSelectedServiceIds([]);
    setSelectedBarberId('');
    setSelectedMassageTherapistId('');
    setBarberTip('');
    setMassageTip('');
    setSplitCashAmount('');
    setSplitMpesaAmount('');
    setSuccessMessage(`Session saved! Total: ${currency} ${grandTotal.toLocaleString()}`);

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP EXECUTIVE GREETING & CONTEXT HEADER */}
      <div className="glass-panel p-3 sm:p-6 rounded-xl sm:rounded-3xl border border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
              Currently Logged In:
            </span>
            <span className="text-xs text-slate-400 font-semibold">STAFF PROFILE</span>
          </div>

          <div className="flex items-center space-x-3 pt-0.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
              ✂️
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                {activeStaff ? activeStaff.name : 'Staff Member'}
              </h1>
              <p className="text-xs text-amber-300/80 font-medium">
                {activeStaff ? `${activeStaff.role} • Station Active` : 'Operations Station'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Shift Closing & Auth Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsClosingModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all shadow-md flex items-center space-x-2 hover:scale-[1.02] active:scale-95"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>At Closing Time (Shift Reconciliation)</span>
          </button>

          {!authUser && (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Sign In Account
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: RECORD CLIENT ENTRY FORM */}
      {staffTab === 'entry' && (
        <div className="space-y-6">
          
          <form onSubmit={handleTransactionSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            
            {/* 1. Client Details & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Client Name / Walk-in Reference</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Michael K. (or leave blank for Walk-in)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Payment Method</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'M-Pesa', icon: Wallet, label: 'M-Pesa' },
                    { id: 'Cash', icon: Banknote, label: 'Cash' },
                    { id: 'Card', icon: CreditCard, label: 'Card' },
                    { id: 'Split (Cash + M-Pesa)', icon: DollarSign, label: 'Both (Cash+M-Pesa)' }
                  ].map(pm => {
                    const IconComp = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(pm.id);
                          if (pm.id === 'Split (Cash + M-Pesa)' && !splitCashAmount && !splitMpesaAmount && grandTotal > 0) {
                            setSplitCashAmount(Math.round(grandTotal / 2).toString());
                            setSplitMpesaAmount((grandTotal - Math.round(grandTotal / 2)).toString());
                          }
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-1" />
                        <span className="text-center text-[11px] leading-tight">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SPLIT PAYMENT CASH + M-PESA BREAKDOWN INPUTS */}
            {paymentMethod === 'Split (Cash + M-Pesa)' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Split Payment Breakdown (Both Cash & M-Pesa)</span>
                  </span>
                  <span className="text-[11px] text-amber-300/80 font-semibold">
                    Grand Total: {currency} {grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1">
                    <label className="text-xs font-semibold text-amber-300 flex items-center space-x-1">
                      <Banknote className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cash Amount ({currency})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={splitCashAmount}
                      onChange={(e) => handleCashSplitChange(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1">
                    <label className="text-xs font-semibold text-emerald-300 flex items-center space-x-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>M-Pesa Amount ({currency})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={splitMpesaAmount}
                      onChange={(e) => handleMpesaSplitChange(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="text-[11px] font-semibold flex items-center justify-between pt-1 text-slate-300">
                  <span>
                    {(parseFloat(splitCashAmount)||0) + (parseFloat(splitMpesaAmount)||0) === grandTotal ? (
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Split sum matches Grand Total ({currency} {grandTotal.toLocaleString()})</span>
                      </span>
                    ) : (
                      <span className="text-rose-400">
                        Remaining to allocate: {currency} {(grandTotal - ((parseFloat(splitCashAmount)||0) + (parseFloat(splitMpesaAmount)||0))).toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Select Services */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Services Performed</span>
                </label>
                <span className="text-xs text-amber-400 font-bold">
                  {selectedServices.length} Selected • {currency} {serviceSubtotal.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {services.map(srv => {
                  const isSelected = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => toggleService(srv.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10 scale-[1.01]'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block">{srv.name}</span>
                        <p className="text-[11px] text-amber-400 font-semibold font-serif">
                          {currency} {srv.price.toLocaleString()}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs ${
                        isSelected ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold' : 'border-slate-700'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Assign Staff Members */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">3</span>
                <span>Assign Staff Members</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>Assigned Barber</span>
                  </label>
                  <select
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- None / No Barber --</option>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-amber-400" />
                    <span>Assigned Massage Therapist</span>
                  </label>
                  <select
                    value={selectedMassageTherapistId}
                    onChange={(e) => setSelectedMassageTherapistId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- None / No Massage Therapist --</option>
                    {massageTherapists.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Tips Allocation */}
            <div className="space-y-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">4</span>
                  <span>Tip Allocation (Client Tips)</span>
                </h2>
                <span className="text-[11px] text-amber-300/80 font-medium">Supports tips for Barber, Massage Girl, or Both</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tip for Barber ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={barberTip}
                    onChange={(e) => setBarberTip(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tip for Massage Therapist ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={massageTip}
                    onChange={(e) => setMassageTip(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 5. Summary & Submit */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Total Transaction Amount:</span>
                <div className="text-2xl font-bold font-serif text-amber-300">
                  {currency} {grandTotal.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  (Services: {currency} {serviceSubtotal.toLocaleString()} + Tips: {currency} {(numBarberTip + numMassageTip).toLocaleString()})
                </span>
              </div>

              <button
                type="submit"
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>Submit Transaction to System</span>
              </button>
            </div>

          </form>

          {/* RECENT ACTIVITIES LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Recent Activity Feed ({activeStaff ? activeStaff.name : 'You'})</span>
              </h2>
              <span className="text-xs text-slate-400">
                Shows entries logged by or assigned to {activeStaff ? activeStaff.name : 'you'}
              </span>
            </div>

            <div className="space-y-3">
              {recentActivitiesForStaff.map((tx) => {
                const isRecorder = tx.loggedByStaffId === activeStaff?.id;
                const isBarberAssigned = tx.barberId === activeStaff?.id;
                const isMassageAssigned = tx.massageTherapistId === activeStaff?.id;

                let myTipPortion = 0;
                let myTipPaid = false;
                if (isBarberAssigned) {
                  myTipPortion = tx.barberTip || 0;
                  myTipPaid = tx.barberTipPaid;
                } else if (isMassageAssigned) {
                  myTipPortion = tx.massageTip || 0;
                  myTipPaid = tx.massageTipPaid;
                }

                return (
                  <div key={tx.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{tx.clientName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300">
                          {tx.paymentMethod}
                        </span>
                        
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                          Recorded by: <strong>{tx.loggedByStaffName || 'Staff'}</strong> at {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        {tx.services.map(s => s.name).join(', ')}
                      </p>

                      <div className="text-[11px] text-amber-400/90 flex flex-wrap gap-2">
                        {isRecorder && (
                          <span className="text-emerald-400 font-semibold">
                            ✓ You recorded this session (Barber: {tx.barberName || 'None'} | Massage: {tx.massageTherapistName || 'None'})
                          </span>
                        )}
                        {!isRecorder && isBarberAssigned && (
                          <span className="text-amber-300 font-semibold">
                            ✂️ Recorded for you by {tx.loggedByStaffName || 'a colleague'} (Barber Session)
                          </span>
                        )}
                        {!isRecorder && isMassageAssigned && (
                          <span className="text-pink-300 font-semibold">
                            💆‍♀️ Recorded for you by {tx.loggedByStaffName || 'a colleague'} (Massage Session)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      {(isBarberAssigned || isMassageAssigned) ? (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">Your Tip:</span>
                          <span className="text-sm font-bold text-amber-300">
                            {currency} {myTipPortion} ({myTipPaid ? 'Paid' : 'Pending'})
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Total Bill</span>
                          <span className="text-sm font-bold text-white">{currency} {tx.grandTotal.toLocaleString()}</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete this recorded entry for "${tx.clientName}" (${currency} ${tx.grandTotal})? This action cannot be undone.`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB: ONLINE BOOKINGS & OPEN POOL */}
      {staffTab === 'bookings' && (
        <ErrorBoundary name="Bookings & Claims Pool">
          <AppointmentsManager 
            mode="staff"
            activeStaff={activeStaff}
            onSelectForEntry={(apt) => {
              setClientName(apt.clientName);
              if (apt.serviceId) {
                setSelectedServiceIds([apt.serviceId]);
              }
              if (activeStaff?.role?.includes('Barber')) {
                setSelectedBarberId(activeStaff.id);
              }
              if (activeStaff?.role?.includes('Massage')) {
                setSelectedMassageTherapistId(activeStaff.id);
              }
              setStaffTab('entry');
            }}
          />
        </ErrorBoundary>
      )}

      {/* TAB 2: MY PRIVATE DASHBOARD & TIPS (HIGH Z-INDEX SO DROPDOWN NEVER RENDERS IN BACK) */}
      {staffTab === 'my_dashboard' && (
        <div className="space-y-6 relative z-10">
          
          {/* HEADER WITH PROMINENT TIME PERIOD FILTER TOOLBAR (Z-50 OVERFLOW VISIBLE) */}
          <div className="glass-panel p-3.5 sm:p-5 rounded-xl sm:rounded-3xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shadow-lg relative z-50 overflow-visible">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight">
                  {activeStaff ? activeStaff.name : 'Personal'} Tip & Performance Summary
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Filter and view earnings for: <strong className="text-amber-300">{personalRange.label}</strong>
              </p>
            </div>

            {/* PERIOD FILTER DROPDOWN */}
            <div className="flex items-center space-x-2 self-start sm:self-auto relative z-50">
              <PeriodFilterDropdown
                preset={personalPreset}
                onChangePreset={setPersonalPreset}
                customStart={personalStart}
                customEnd={personalEnd}
                onApplyCustom={(s, e) => {
                  setPersonalStart(s);
                  setPersonalEnd(e);
                  setPersonalPreset('custom');
                }}
              />
            </div>
          </div>

          {/* PRIVATE DASHBOARD KPI METRIC CARDS (Z-10) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 relative z-10">
            
            {/* My Tips Earned */}
            <div className="col-span-2 sm:col-span-1 glass-card rounded-xl sm:rounded-3xl p-3 sm:p-5 border border-amber-500/40 bg-amber-500/5 space-y-1 sm:space-y-2">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                My Total Tips Earned ({personalRange.label})
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold gold-gradient-text">
                {currency} {personalStats.totalTips.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400">
                Reflects only tips assigned to {activeStaff ? activeStaff.name : 'you'}
              </p>
            </div>

            {/* Paid vs Pending Tips */}
            <div className="glass-card rounded-xl sm:rounded-3xl p-3 sm:p-5 border border-slate-800 space-y-1 sm:space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Tip Payout Status ({personalRange.label})
              </span>
              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Paid Off by Boss</span>
                  <span className="text-xl font-bold text-emerald-400">{currency} {personalStats.paidTips.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Pending Payout</span>
                  <span className="text-xl font-bold text-yellow-300">{currency} {personalStats.pendingTips.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* My Services Volume */}
            <div className="glass-card rounded-xl sm:rounded-3xl p-3 sm:p-5 border border-slate-800 space-y-1 sm:space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                My Services Completed ({personalRange.label})
              </span>
              <h3 className="text-2xl font-bold text-white">
                {personalStats.count} Sessions
              </h3>
              <p className="text-[11px] text-slate-400">
                Service revenue generated: {currency} {personalStats.totalServiceRev.toLocaleString()}
              </p>
            </div>

          </div>

          {/* MY PERSONAL SERVICE & TIP HISTORY LIST (Z-10) */}
          <div className="glass-card rounded-xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 space-y-2.5 sm:space-y-4 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>My Private Service & Tip Ledger ({personalStats.history.length})</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300">
                  Period: {personalRange.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">Privacy Protected</span>
              </div>
            </div>

            {personalStats.history.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">
                No recorded services for {activeStaff ? activeStaff.name : 'this staff member'} during <strong className="text-slate-400">{personalRange.label}</strong>.
              </div>
            ) : (
              <div className="space-y-3">
                {personalStats.history.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{item.clientName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.paymentMethod}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.services.map(s => s.name).join(' + ')}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Recorded by: <strong>{item.loggedByStaffName || 'Staff'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                          My Tip Portion:
                        </span>
                        <span className="text-base font-bold text-amber-300">
                          {currency} {item.myTip}
                        </span>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        item.isMyTipPaid 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {item.isMyTipPaid ? 'PAID OFF' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: RECORD SHOP EXPENSE */}
      {staffTab === 'expenses' && (
        <ErrorBoundary name="Shop Expense Logger">
          <ExpenseLogger activeStaff={activeStaff} />
        </ErrorBoundary>
      )}

      {/* CLOSING MODAL */}
      <ClosingCashModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        activeStaff={activeStaff}
      />

      {/* MOBILE FLOATING ACTION BAR */}
      {staffTab === 'entry' && selectedServiceIds.length > 0 && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-30 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
              {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'Service' : 'Services'} Selected
            </span>
            <span className="text-base font-bold text-white font-serif">
              {currency} {grandTotal.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleTransactionSubmit}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 active:scale-95 transition-transform"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Entry</span>
          </button>
        </div>
      )}

    </div>
  );
}
