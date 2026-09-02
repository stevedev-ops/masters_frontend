import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Calculator, AlertTriangle, CheckCircle, Save, History, DollarSign, Banknote, Wallet, User, X } from 'lucide-react';

export default function ClosingCashModal({ isOpen, onClose, activeStaff }) {
  const { transactions, closingRecords, saveClosingRecord, currency } = useApp();

  // Today's Start
  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Filter Today's Transactions by Payment Method
  const todayTx = useMemo(() => {
    return transactions.filter(t => new Date(t.timestamp) >= todayStart);
  }, [transactions, todayStart]);

  const expectedCash = useMemo(() => {
    return todayTx.reduce((sum, t) => {
      const cAmt = t.cashAmount !== undefined ? t.cashAmount : (t.paymentMethod === 'Cash' ? t.grandTotal : 0);
      return sum + cAmt;
    }, 0);
  }, [todayTx]);

  const expectedMpesa = useMemo(() => {
    return todayTx.reduce((sum, t) => {
      const mAmt = t.mpesaAmount !== undefined ? t.mpesaAmount : (t.paymentMethod === 'M-Pesa' ? t.grandTotal : 0);
      return sum + mAmt;
    }, 0);
  }, [todayTx]);

  const expectedTotal = expectedCash + expectedMpesa;

  // Input State
  const [actualCashInput, setActualCashInput] = useState('');
  const [actualMpesaInput, setActualMpesaInput] = useState('');
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Close modal on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const numActualCash = parseFloat(actualCashInput) || 0;
  const numActualMpesa = parseFloat(actualMpesaInput) || 0;

  const cashDiff = actualCashInput !== '' ? (numActualCash - expectedCash) : 0;
  const mpesaDiff = actualMpesaInput !== '' ? (numActualMpesa - expectedMpesa) : 0;
  const totalDiff = cashDiff + mpesaDiff;

  const handleSaveClosing = (e) => {
    e.preventDefault();
    if (actualCashInput === '' && actualMpesaInput === '') {
      alert('Please enter actual counted cash or M-Pesa till balance.');
      return;
    }

    const submitterName = activeStaff ? activeStaff.name : 'Shift Staff';

    saveClosingRecord({
      date: new Date().toISOString().slice(0, 10),
      submittedBy: submitterName,
      expectedCash,
      actualCash: numActualCash,
      cashDiff,
      expectedMpesa,
      actualMpesa: numActualMpesa,
      mpesaDiff,
      expectedTotal,
      actualTotal: numActualCash + numActualMpesa,
      totalDiff,
      txCount: todayTx.length,
      notes: notes.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 border border-amber-500/30 my-4 sm:my-8 relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Shift Closing & Discrepancy Check</h2>
              <p className="text-xs text-amber-400 font-medium">Reconcile Cash & M-Pesa drawer totals and record shortages</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center space-x-1 text-xs font-semibold"
            title="Cancel and close (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close (Esc)</span>
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-bold text-white">Shift Closing Saved!</h3>
            <p className="text-xs text-slate-300">
              Reconciliation report submitted automatically under <strong>{activeStaff ? activeStaff.name : 'Shift Staff'}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveClosing} className="space-y-6">
            
            {/* Auto-Recorded Staff Member Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3">
              <User className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 block font-semibold">Submitting Staff Member:</span>
                <span className="font-bold text-white text-sm">
                  {activeStaff ? `${activeStaff.name} (${activeStaff.role})` : 'System Staff'}
                </span>
              </div>
            </div>

            {/* Reconciliation Cards Grid (CASH & MPESA) */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              
              {/* SECTION A: CASH RECONCILIATION */}
              <div className="space-y-3 border-b border-slate-800 pb-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <Banknote className="w-4 h-4" />
                    <span>1. Cash Drawer Reconciliation</span>
                  </h3>
                  {actualCashInput !== '' && cashDiff !== 0 && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      cashDiff < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {cashDiff < 0 ? `⚠️ Cash Shortage: ${currency} ${Math.abs(cashDiff)}` : `Cash Overage: +${currency} ${cashDiff}`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-semibold">Expected System Cash:</span>
                    <span className="text-xl font-bold font-serif text-amber-300">{currency} {expectedCash.toLocaleString()}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Actual Counted Cash:</label>
                    <input
                      type="number"
                      step="50"
                      value={actualCashInput}
                      onChange={(e) => setActualCashInput(e.target.value)}
                      placeholder="e.g. 18500"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: M-PESA RECONCILIATION */}
              <div className="space-y-3 border-b border-slate-800 pb-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                    <Wallet className="w-4 h-4" />
                    <span>2. M-Pesa Till / Paybill Reconciliation</span>
                  </h3>
                  {actualMpesaInput !== '' && mpesaDiff !== 0 && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      mpesaDiff < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {mpesaDiff < 0 ? `⚠️ M-Pesa Shortage: ${currency} ${Math.abs(mpesaDiff)}` : `M-Pesa Overage: +${currency} ${mpesaDiff}`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-semibold">Expected System M-Pesa:</span>
                    <span className="text-xl font-bold font-serif text-emerald-300">{currency} {expectedMpesa.toLocaleString()}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Actual M-Pesa Till Balance:</label>
                    <input
                      type="number"
                      step="50"
                      value={actualMpesaInput}
                      onChange={(e) => setActualMpesaInput(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* OVERALL TOTAL DISCREPANCY SUMMARY */}
              {(actualCashInput !== '' || actualMpesaInput !== '') && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  totalDiff < 0 
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-200' 
                    : totalDiff > 0 
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' 
                    : 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {totalDiff < 0 ? (
                      <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 animate-pulse" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold uppercase block">
                        Net Discrepancy Summary:
                      </span>
                      <span className="text-xl font-bold font-serif">
                        {totalDiff < 0 ? `- ${currency} ${Math.abs(totalDiff).toLocaleString()} (Shortage Owed)` : totalDiff > 0 ? `+ ${currency} ${totalDiff.toLocaleString()} (Overage)` : '0 (Perfect Match)'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    totalDiff < 0 ? 'bg-rose-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {totalDiff < 0 ? 'SHORTAGE' : totalDiff > 0 ? 'OVERAGE' : 'BALANCED'}
                  </span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason for Shortage / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 250 Ksh cash shortage due to change error / M-Pesa pending reversal"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

            </div>

            {/* Bottom Actions: Cancel & Submit */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-2 active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Cancel & Dismiss</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-2/3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition-transform flex items-center justify-center space-x-2 active:scale-95"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Submit Shift Closing & Record Discrepancies</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
