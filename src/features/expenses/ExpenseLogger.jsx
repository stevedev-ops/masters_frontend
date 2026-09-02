import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, Plus, Banknote, Wallet, AlertCircle, CheckCircle2, 
  Trash2, User, Clock, ArrowRight, Layers, Split 
} from 'lucide-react';

const CATEGORIES = [
  'Shop Supplies',
  'Laundry & Cleaning',
  'Utilities / Power',
  'Refreshments',
  'Equipment / Maintenance',
  'Other',
];

export default function ExpenseLogger() {
  const { 
    currency, 
    expenses, 
    addExpense, 
    deleteExpense, 
    staff, 
    authUser 
  } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'M-Pesa' | 'Both'
  const [cashAmount, setCashAmount] = useState('');
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(
    authUser?.staffProfile?.id || (staff && staff.length > 0 ? staff[0].id : '')
  );
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle switching to 'Both' (Split)
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'Both') {
      const total = parseFloat(amount) || 0;
      if (total > 0) {
        const half = Math.round(total / 2);
        setCashAmount(String(half));
        setMpesaAmount(String(total - half));
      } else {
        setCashAmount('');
        setMpesaAmount('');
      }
    }
  };

  // When editing cash/mpesa in split mode, auto-update total amount
  const handleCashSplitChange = (val) => {
    setCashAmount(val);
    const c = parseFloat(val) || 0;
    const m = parseFloat(mpesaAmount) || 0;
    if (c + m > 0) {
      setAmount(String(c + m));
    }
  };

  const handleMpesaSplitChange = (val) => {
    setMpesaAmount(val);
    const c = parseFloat(cashAmount) || 0;
    const m = parseFloat(val) || 0;
    if (c + m > 0) {
      setAmount(String(c + m));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedTotal = parseFloat(amount);
    if (!title.trim() || isNaN(parsedTotal) || parsedTotal <= 0) {
      alert('Please enter a valid expense title and amount.');
      return;
    }

    if (paymentMethod === 'Both') {
      const c = parseFloat(cashAmount) || 0;
      const m = parseFloat(mpesaAmount) || 0;
      if (c <= 0 || m <= 0) {
        alert('Please specify both Cash Drawer and M-Pesa Till amounts for a split payment.');
        return;
      }
    }

    const assignedStaff = staff.find(s => s.id === selectedStaffId);
    const staffName = assignedStaff ? assignedStaff.name : (authUser?.username || 'Staff Member');

    let finalNotes = notes.trim();
    if (paymentMethod === 'Both') {
      const splitBreakdown = `[Split Payment: ${currency} ${cashAmount} Cash + ${currency} ${mpesaAmount} M-Pesa]`;
      finalNotes = finalNotes ? `${finalNotes} • ${splitBreakdown}` : splitBreakdown;
    }

    addExpense({
      title: title.trim(),
      amount: parsedTotal,
      category,
      paymentMethod,
      cashPortion: paymentMethod === 'Both' ? parseFloat(cashAmount) : (paymentMethod === 'Cash' ? parsedTotal : 0),
      mpesaPortion: paymentMethod === 'Both' ? parseFloat(mpesaAmount) : (paymentMethod === 'M-Pesa' ? parsedTotal : 0),
      loggedByStaffId: selectedStaffId,
      loggedByStaffName: staffName,
      notes: finalNotes,
    });

    setTitle('');
    setAmount('');
    setCashAmount('');
    setMpesaAmount('');
    setNotes('');
    setSuccessMsg(`✅ Expense of ${currency} ${parsedTotal.toLocaleString()} logged from ${paymentMethod === 'Both' ? 'Both (Cash & M-Pesa)' : paymentMethod === 'Cash' ? 'Cash Drawer' : 'M-Pesa Till'}!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const sortedExpenses = [...(expenses || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* 1. EXPENSE RECORDING FORM */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-3xl border border-amber-500/30 shadow-xl space-y-3 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Receipt className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white tracking-tight">
                Record Shop Expense / Payout
              </h2>
              <p className="text-xs text-slate-400">
                Log daily purchases, cleaning supplies, and bills paid from shop funds
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Recorded By
            </span>
            <span className="text-xs font-bold text-amber-300">
              {authUser?.username || 'Staff'}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title / Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Item / Reason for Expense <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5x Dorco Razor Blade Boxes & Disinfectant"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Total Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Total Amount ({currency}) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  {currency}
                </span>
                <input
                  type="number"
                  step="10"
                  min="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (paymentMethod === 'Both') {
                      const total = parseFloat(e.target.value) || 0;
                      const half = Math.round(total / 2);
                      setCashAmount(String(half));
                      setMpesaAmount(String(total - half));
                    }
                  }}
                  placeholder="e.g. 450"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Channel (Cash Drawer / M-Pesa Till / Both) */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Paid Out From:</span>
                <span className="text-[11px] text-amber-400/80 font-normal">
                  Select single source or split across both
                </span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Cash Drawer */}
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('Cash')}
                  className={`py-3 px-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'Cash'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 scale-[1.01]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-400" />
                  <span>Cash Drawer</span>
                </button>

                {/* 2. M-Pesa Till */}
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('M-Pesa')}
                  className={`py-3 px-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'M-Pesa'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10 scale-[1.01]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>M-Pesa Till / Paybill</span>
                </button>

                {/* 3. Both / Split (Cash & M-Pesa) */}
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('Both')}
                  className={`py-3 px-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'Both'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10 scale-[1.01]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Split className="w-4 h-4 text-cyan-400" />
                  <span>Both (Cash & M-Pesa)</span>
                </button>
              </div>

              {/* DUAL INPUTS IF 'BOTH' IS SELECTED */}
              {paymentMethod === 'Both' && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeIn mt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-amber-400" />
                      Cash Drawer Portion ({currency}):
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={cashAmount}
                      onChange={(e) => handleCashSplitChange(e.target.value)}
                      placeholder="e.g. 200"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      M-Pesa Till Portion ({currency}):
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={mpesaAmount}
                      onChange={(e) => handleMpesaSplitChange(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 text-right text-[11px] text-cyan-300/80 font-semibold">
                    Combined Total: {currency} {((parseFloat(cashAmount) || 0) + (parseFloat(mpesaAmount) || 0)).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Optional Notes */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Notes / Supplier / Receipt Details (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bought from River Road cosmetics wholesaler, receipt #4892"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Save & Record Expense to Shop Ledger</span>
          </button>

        </form>
      </div>

      {/* 2. RECENT EXPENSES AUDIT FEED */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-3xl border border-slate-800 space-y-2.5 sm:space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Recent Shop Expenses Logged</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {sortedExpenses.length} Total Logged
          </span>
        </div>

        {sortedExpenses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No expenses logged yet. All shop purchases recorded will appear here and in the Boss dashboard.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">{item.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.paymentMethod === 'Cash' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : item.paymentMethod === 'M-Pesa'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {item.paymentMethod === 'Both' ? 'Both (Cash & M-Pesa)' : item.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>
                      Recorded by: <strong className="text-slate-300">{item.loggedByStaffName || 'Staff'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span className="text-base font-bold text-rose-400 font-serif">
                    - {currency} {Number(item.amount).toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the expense "${item.title}" (${currency} ${item.amount})? This will remove it from the shop ledger.`)) {
                        deleteExpense(item.id);
                      }
                    }}
                    title="Remove expense"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
