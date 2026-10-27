/* eslint-disable react/prop-types */
import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, Calculator, AlertTriangle, CheckCircle, Save, 
  Banknote, Wallet, X, CheckCircle2, ShieldCheck, Clock
} from 'lucide-react';

export default function ClosingCashModal({ isOpen, onClose, activeStaff }) {
  const { transactions, closingRecords, saveClosingRecord, currency } = useApp();

  // Today's Start (midnight local time)
  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const todayDateStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Check if today's shift has ALREADY been closed
  const existingClosing = useMemo(() => {
    return (closingRecords || []).find(rec => {
      if (rec.date === todayDateStr) return true;
      if (rec.timestamp && rec.timestamp.slice(0, 10) === todayDateStr) return true;
      return false;
    });
  }, [closingRecords, todayDateStr]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal on ESC key press
  useEffect(() => {
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
    if (existingClosing) {
      alert('Shift has already been closed for today. Shift closing cannot be done twice.');
      return;
    }

    if (actualCashInput === '' && actualMpesaInput === '') {
      alert('Please enter actual counted cash or M-Pesa till balance.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const submitterName = activeStaff ? activeStaff.name : 'Shift Staff';

    const result = saveClosingRecord({
      date: todayDateStr,
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

    if (result && result.error) {
      alert(result.error);
      setIsSubmitting(false);
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSubmitting(false);
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
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              existingClosing 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {existingClosing ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <span>{existingClosing ? 'Shift Closed for Today' : 'End-of-Shift Cash & M-Pesa Reconciliation'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {existingClosing 
                  ? `Shift audit finalized for ${todayDateStr}. Closing shift cannot be performed twice.`
                  : 'Reconcile counted physical cash drawer & M-Pesa till balance against system sales'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* CASE 1: SHIFT ALREADY CLOSED TODAY (DOUBLE CLOSING PREVENTED)   */}
        {/* ============================================================== */}
        {existingClosing ? (
          <div className="space-y-5">
            {/* Lock / Prevent Double Closing Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-300 block">
                  Shift Closing Already Finalized for Today ({todayDateStr})
                </span>
                <p className="text-slate-300">
                  Per strict audit and financial compliance rules, <strong>closing shift cannot be done twice</strong>.
                  This shift was finalized by <strong className="text-white">{existingClosing.submittedBy || 'Shift Staff'}</strong>
                  {existingClosing.timestamp && (
                    <span> at {new Date(existingClosing.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}.
                </p>
                <p className="text-slate-400 text-[11px] pt-1">
                  If cash or M-Pesa discrepancies require correction, please notify shop management to adjust audit logs from the Owner Dashboard.
                </p>
              </div>
            </div>

            {/* Read-Only Shift Closing Reconciliation Summary */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Recorded Reconciliation Summary</span>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                  existingClosing.totalDiff < 0 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : existingClosing.totalDiff > 0 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {existingClosing.totalDiff < 0 
                    ? `⚠️ Shortage: -${currency} ${Math.abs(existingClosing.totalDiff)}` 
                    : existingClosing.totalDiff > 0 
                    ? `Overage: +${currency} ${existingClosing.totalDiff}` 
                    : '✓ Balanced (Zero Discrepancy)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Cash Drawer */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cash Drawer:</span>
                  </span>
                  <div className="text-slate-200">
                    Expected: <strong className="text-white">{currency} {Number(existingClosing.expectedCash || 0).toLocaleString()}</strong>
                  </div>
                  <div className="text-slate-200">
                    Counted: <strong className="text-white">{currency} {Number(existingClosing.actualCash || 0).toLocaleString()}</strong>
                  </div>
                  <span className={`block font-bold text-[11px] ${existingClosing.cashDiff < 0 ? 'text-rose-400' : existingClosing.cashDiff > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Variance: {existingClosing.cashDiff > 0 ? '+' : ''}{currency} {Number(existingClosing.cashDiff || 0).toLocaleString()}
                  </span>
                </div>

                {/* M-Pesa Till */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>M-Pesa Till:</span>
                  </span>
                  <div className="text-slate-200">
                    Expected: <strong className="text-white">{currency} {Number(existingClosing.expectedMpesa || 0).toLocaleString()}</strong>
                  </div>
                  <div className="text-slate-200">
                    Actual: <strong className="text-white">{currency} {Number(existingClosing.actualMpesa || 0).toLocaleString()}</strong>
                  </div>
                  <span className={`block font-bold text-[11px] ${existingClosing.mpesaDiff < 0 ? 'text-rose-400' : existingClosing.mpesaDiff > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Variance: {existingClosing.mpesaDiff > 0 ? '+' : ''}{currency} {Number(existingClosing.mpesaDiff || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {existingClosing.notes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">Recorded Closing Notes:</span>
                  <p className="text-slate-300 italic">{existingClosing.notes}</p>
                </div>
              )}
            </div>

            {/* Bottom Actions for already closed state */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Shift Finalized & Locked (Closed)</span>
              </span>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-colors"
              >
                Close & Dismiss
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE 2: SHIFT OPEN (NOT YET CLOSED TODAY) -> RENDER ENTRY FORM   */
          /* ============================================================== */
          savedSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-scale-in">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white">Shift Closed Successfully!</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Today&apos;s financial totals and cash discrepancies have been audited and locked into shop records.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveClosing} className="space-y-6">

              {/* Today's Expected System Totals Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Today&apos;s Gross System Revenue ({todayTx.length} Transactions)</span>
                    <span className="text-lg font-bold font-serif text-white">{currency} {expectedTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Submitter:</span>
                  <span className="text-xs font-bold text-amber-300">
                    {activeStaff ? activeStaff.name : 'Shift Staff'}
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
                  disabled={isSubmitting}
                  className="w-full sm:w-2/3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition-transform flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Recording Shift Closing...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 stroke-[2.5]" />
                      <span>Submit Shift Closing & Record Discrepancies</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        )}

      </div>
    </div>
  );
}
