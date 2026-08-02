import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ClosingCashModal from './ClosingCashModal';
import { 
  Smartphone, Plus, CheckCircle, DollarSign, UserCheck, Scissors, Heart, 
  Sparkles, CreditCard, Wallet, Banknote, AlertCircle, Clock, Trash2, Lock, 
  User, CheckCircle2, Award, Calendar, CheckSquare 
} from 'lucide-react';

export default function StaffPortal() {
  const { services, staff, transactions, addTransaction, deleteTransaction, currency } = useApp();

  // Active Staff Member Logged In
  const activeStaffList = useMemo(() => staff.filter(s => s.active), [staff]);

  const [activeStaffId, setActiveStaffId] = useState(() => {
    const defaultTherapist = activeStaffList.find(s => s.role === 'Massage Therapist');
    return defaultTherapist ? defaultTherapist.id : (activeStaffList[0]?.id || '');
  });

  const activeStaff = useMemo(() => {
    return staff.find(s => s.id === activeStaffId) || activeStaffList[0];
  }, [staff, activeStaffId, activeStaffList]);

  // Form State for Entry
  const [clientName, setClientName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [selectedMassageTherapistId, setSelectedMassageTherapistId] = useState('');
  const [barberTip, setBarberTip] = useState('');
  const [massageTip, setMassageTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [notes, setNotes] = useState('');

  // UI State
  const [successMessage, setSuccessMessage] = useState('');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [staffTab, setStaffTab] = useState('entry'); // 'entry' | 'my_dashboard'

  // Filter Active Staff by Role
  const barbers = staff.filter(s => (s.role === 'Barber' || s.role === 'Dual') && s.active);
  const massageTherapists = staff.filter(s => (s.role === 'Massage Therapist' || s.role === 'Dual') && s.active);

  // --- PRIVATE DASHBOARD STATS FOR LOGGED IN STAFF MEMBER ---
  const personalStats = useMemo(() => {
    if (!activeStaff) return { totalTips: 0, paidTips: 0, pendingTips: 0, count: 0, totalServiceRev: 0, history: [] };

    let totalTips = 0;
    let paidTips = 0;
    let pendingTips = 0;
    let count = 0;
    let totalServiceRev = 0;
    const history = [];

    transactions.forEach(t => {
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
        totalServiceRev += t.serviceTotal;
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

    return { totalTips, paidTips, pendingTips, count, totalServiceRev, history };
  }, [activeStaff, transactions]);

  // --- RECENT ACTIVITY LIST RELEVANT TO CURRENT STAFF (RECORDER OR ASSIGNED) ---
  const recentActivitiesForStaff = useMemo(() => {
    if (!activeStaff) return [];

    return transactions.filter(t => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedServiceIds.length === 0) {
      alert('Please select at least one service performed.');
      return;
    }

    const barberObj = staff.find(s => s.id === selectedBarberId);
    const massageObj = staff.find(s => s.id === selectedMassageTherapistId);

    const txPayload = {
      clientName: clientName.trim() || 'Walk-in Client',
      services: selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price, category: s.category })),
      loggedByStaffId: activeStaff ? activeStaff.id : null,
      loggedByStaffName: activeStaff ? activeStaff.name : 'Staff',
      barberId: selectedBarberId || null,
      barberName: barberObj ? barberObj.name : null,
      massageTherapistId: selectedMassageTherapistId || null,
      massageTherapistName: massageObj ? massageObj.name : null,
      serviceTotal: serviceSubtotal,
      barberTip: numBarberTip,
      massageTip: numMassageTip,
      grandTotal: grandTotal,
      paymentMethod: paymentMethod,
      notes: notes.trim()
    };

    addTransaction(txPayload);

    setSuccessMessage(`Transaction logged by ${activeStaff ? activeStaff.name : 'you'} successfully!`);
    
    // Reset Form
    setClientName('');
    setSelectedServiceIds([]);
    setSelectedBarberId('');
    setSelectedMassageTherapistId('');
    setBarberTip('');
    setMassageTip('');
    setNotes('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 pb-20">
      
      {/* 1. ACTIVE STAFF PROFILE SELECTOR HEADER */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold text-xl flex items-center justify-center shadow-md shrink-0">
            {activeStaff ? activeStaff.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Currently Logged In:</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                STAFF PROFILE
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mt-0.5">
              <select
                value={activeStaffId}
                onChange={(e) => setActiveStaffId(e.target.value)}
                className="bg-slate-900 border border-amber-500/50 text-white font-bold text-base sm:text-lg rounded-xl px-3 py-1 focus:outline-none focus:border-amber-400"
              >
                {activeStaffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SHIFT CLOSING BUTTON (AUTOMATICALLY RECORDS LOGGED IN STAFF) */}
        <button
          onClick={() => setIsClosingModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center space-x-2"
        >
          <Lock className="w-4 h-4 stroke-[2.5]" />
          <span>At Closing Time (Shift Reconciliation)</span>
        </button>
      </div>

      {/* STAFF PORTAL SUB-NAVIGATION TABS */}
      <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-1">
        <button
          onClick={() => setStaffTab('entry')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            staffTab === 'entry'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📝 Record New Activity & Payment
        </button>

        <button
          onClick={() => setStaffTab('my_dashboard')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            staffTab === 'my_dashboard'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👤 My Private Tips & Performance
        </button>
      </div>

      {/* TAB 1: RECORD NEW TRANSACTION FORM */}
      {staffTab === 'entry' && (
        <div className="space-y-6">
          
          {/* SUCCESS TOAST */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center space-x-3 shadow-xl animate-fade-in">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 border border-slate-800">
            
            {/* 1. Client Info & Payment Method */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
                <span>Client & Payment Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Client Name / Reference
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Mr. Kamau / Chair #2"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Payment Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'M-Pesa', icon: Wallet, label: 'M-Pesa' },
                      { id: 'Cash', icon: Banknote, label: 'Cash' },
                      { id: 'Card', icon: CreditCard, label: 'Card' }
                    ].map(pm => {
                      const IconComp = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <IconComp className="w-4 h-4 mb-1" />
                          <span>{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Select Services Performed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
                  <span>Select Activities / Services Performed</span>
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedServiceIds.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((srv) => {
                  const isSelected = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => toggleService(srv.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h3 className="text-xs sm:text-sm font-bold">{srv.name}</h3>
                        <p className="text-[11px] text-amber-400 font-serif font-semibold">
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
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Service Subtotal:</span>
                  <span className="font-semibold text-white">{currency} {serviceSubtotal.toLocaleString()}</span>
                </div>
                {numBarberTip > 0 && (
                  <div className="flex justify-between text-xs text-amber-400">
                    <span>Barber Tip:</span>
                    <span className="font-semibold">+{currency} {numBarberTip.toLocaleString()}</span>
                  </div>
                )}
                {numMassageTip > 0 && (
                  <div className="flex justify-between text-xs text-amber-400">
                    <span>Massage Therapist Tip:</span>
                    <span className="font-semibold">+{currency} {numMassageTip.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-white uppercase">Grand Total Paid ({paymentMethod}):</span>
                  <span className="text-2xl font-bold font-serif gold-gradient-text">
                    {currency} {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 hover:scale-[1.01] transition-transform flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>Submit Transaction to System</span>
              </button>
            </div>

          </form>

          {/* RECENT ACTIVITIES LIST (RECORDER & ASSIGNED STAFF REFLECTION) */}
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

                // Determine tip to display for this staff member (Privacy Enforced)
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
                        
                        {/* Attribution Badge */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                          Recorded by: <strong>{tx.loggedByStaffName || 'Staff'}</strong> at {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        {tx.services.map(s => s.name).join(', ')}
                      </p>

                      {/* Customized Context Line */}
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
                      {/* Show ONLY this staff member's tip if assigned */}
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
                        onClick={() => deleteTransaction(tx.id)}
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

      {/* TAB 2: MY PRIVATE DASHBOARD & TIPS (PRIVACY ENFORCED) */}
      {staffTab === 'my_dashboard' && (
        <div className="space-y-6">
          
          {/* PRIVATE DASHBOARD KPI METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* My Tips Earned */}
            <div className="glass-card rounded-3xl p-5 border border-amber-500/40 bg-amber-500/5 space-y-2">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                My Total Tips Earned (This Month)
              </span>
              <h3 className="text-3xl font-serif font-bold gold-gradient-text">
                {currency} {personalStats.totalTips.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400">
                Reflects only tips assigned to {activeStaff ? activeStaff.name : 'you'}
              </p>
            </div>

            {/* Paid vs Pending Tips */}
            <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Tip Payout Status
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
            <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                My Services Completed
              </span>
              <h3 className="text-2xl font-bold text-white">
                {personalStats.count} Sessions
              </h3>
              <p className="text-[11px] text-slate-400">
                Service revenue generated: {currency} {personalStats.totalServiceRev.toLocaleString()}
              </p>
            </div>

          </div>

          {/* MY PERSONAL SERVICE & TIP HISTORY LIST (PRIVACY ENFORCED) */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>My Private Service & Tip Ledger ({personalStats.history.length})</span>
              </h3>
              <span className="text-xs text-amber-400 font-medium">Privacy Protected</span>
            </div>

            {personalStats.history.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No recorded services for {activeStaff ? activeStaff.name : 'this staff member'} yet.
              </div>
            ) : (
              <div className="space-y-3">
                {personalStats.history.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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

      {/* CLOSING MODAL */}
      <ClosingCashModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        activeStaff={activeStaff}
      />

    </div>
  );
}
