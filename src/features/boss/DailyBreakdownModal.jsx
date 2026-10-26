/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react';
import { 
  X, Download, Printer, Calendar, Banknote, Wallet, 
  Heart, User, FileSpreadsheet, TrendingUp, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDailyBreakdownData, downloadDailyBreakdownCSV } from '../../utils/dailyBreakdown';

export default function DailyBreakdownModal({ isOpen, onClose }) {
  const { transactions, staff, closingRecords, currency } = useApp();

  // Selected date defaults to today (local YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Compute live breakdown for selected date
  const breakdown = useMemo(() => {
    return getDailyBreakdownData({
      targetDateStr: selectedDate,
      transactions,
      staff,
      closingRecords,
      currency
    });
  }, [selectedDate, transactions, staff, closingRecords, currency]);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    downloadDailyBreakdownCSV(breakdown);
  };

  const handlePrint = () => {
    window.print();
  };

  const { financials, staffBreakdown, closing, transactions: dayTx } = breakdown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-6 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
                <span>Daily Financial & Staff Audit Breakdown</span>
              </h2>
              <p className="text-xs text-slate-400">
                Itemized breakdown of earnings, tips, payment channels & shift closing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5 print:hidden"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DATE SELECTOR CONTROLS */}
        <div className="p-4 sm:px-6 bg-slate-950/30 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Date:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === todayStr 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === yesterdayStr 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Yesterday
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Custom Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* MODAL SCROLLABLE BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">

          {/* 1. FINANCIAL SUMMARY METRIC CARDS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>1. Revenue & Payment Channel Totals</span>
              </h3>
              <span className="text-xs text-slate-400">
                Date: <strong className="text-white">{selectedDate}</strong> ({dayTx.length} visits logged)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Grand Total */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Gross Revenue</span>
                <span className="text-lg sm:text-2xl font-bold font-serif text-white">
                  {currency} {financials.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Services + Tips</span>
              </div>

              {/* Cash in Drawer */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-amber-300 uppercase">Cash Drawer</span>
                  <Banknote className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-lg sm:text-2xl font-bold font-serif text-amber-300">
                  {currency} {financials.totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-amber-400/80 block mt-1">
                  {financials.totalRevenue > 0 ? ((financials.totalCash / financials.totalRevenue) * 100).toFixed(0) : 0}% of revenue
                </span>
              </div>

              {/* M-Pesa Total */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase">M-Pesa Till</span>
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-lg sm:text-2xl font-bold font-serif text-emerald-300">
                  {currency} {financials.totalMpesa.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-1">
                  {financials.totalRevenue > 0 ? ((financials.totalMpesa / financials.totalRevenue) * 100).toFixed(0) : 0}% of revenue
                </span>
              </div>

              {/* Total Tips */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-pink-500/10 border border-pink-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-pink-300 uppercase">Tips Collected</span>
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <span className="text-lg sm:text-2xl font-bold font-serif text-pink-300">
                  {currency} {financials.totalTips.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-pink-400/80 block mt-1">100% to staff</span>
              </div>
            </div>

            {/* Split Breakdown Details */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4 flex-wrap text-slate-300">
                <span>Pure Services Sales: <strong className="text-white">{currency} {financials.serviceRevenue.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Staff Commissions (40%): <strong className="text-amber-300">{currency} {financials.totalCommissions.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Shop Retained (60%): <strong className="text-emerald-300">{currency} {financials.shopGrossRetained.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* 2. WHO EARNED WHAT: STAFF EARNINGS & TIPS BREAKDOWN */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>2. Who Earned What: Worker Commissions & Tips Breakdown</span>
              </h3>
              <span className="text-xs text-slate-400">
                {staffBreakdown.length} staff member{staffBreakdown.length === 1 ? '' : 's'}
              </span>
            </div>

            {staffBreakdown.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                No active staff configured in the system.
              </div>
            ) : (
              <div className="space-y-3">
                {staffBreakdown.map(s => (
                  <div key={s.id} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-sm">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{s.name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                              {s.role}
                            </span>
                            {s.title && <span className="text-xs text-slate-400 hidden sm:inline">• {s.title}</span>}
                          </div>
                          <span className="text-xs text-slate-400">
                            Services Rendered: <strong className="text-slate-200">{s.servicesCount}</strong> across <strong className="text-slate-200">{s.clientsCount}</strong> clients
                          </span>
                        </div>
                      </div>

                      <div className="text-right self-end sm:self-auto">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Worker Take-Home</span>
                        <span className="text-lg sm:text-xl font-bold font-serif text-amber-400">
                          {currency} {s.totalTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Worker Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {/* Service Sales Volume */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Gross Service Sales</span>
                        <span className="font-bold text-slate-200">{currency} {s.serviceTotal.toLocaleString()}</span>
                      </div>

                      {/* Commission (40%) */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Commission (40%)</span>
                          {s.commissionPending > 0 && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Pending</span>}
                        </div>
                        <span className="font-bold text-amber-300">{currency} {s.commission.toLocaleString()}</span>
                      </div>

                      {/* Tips Earned */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tips Earned</span>
                          {s.tipsPending > 0 && <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded">Pending</span>}
                        </div>
                        <span className="font-bold text-pink-300">{currency} {s.tips.toLocaleString()}</span>
                      </div>

                      {/* Payout Status */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Payout Status</span>
                        <span className={`font-semibold ${s.tipsPending === 0 && s.commissionPending === 0 && s.totalTakeHome > 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                          {s.totalTakeHome === 0 
                            ? 'No Activity' 
                            : (s.tipsPending === 0 && s.commissionPending === 0 ? '✓ Fully Cleared' : `Pending: ${currency} ${(s.tipsPending + s.commissionPending).toLocaleString()}`)}
                        </span>
                      </div>
                    </div>

                    {s.servicesList && s.servicesList.length > 0 && (
                      <div className="text-[11px] text-slate-400 pt-1">
                        Services: <span className="text-slate-300">{s.servicesList.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. SHIFT CLOSING RECONCILIATION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>3. Shift Closing Reconciliation & Drawer Audit</span>
              </h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                !closing.isClosed
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : closing.totalDiff < 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : closing.totalDiff > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {!closing.isClosed 
                  ? '⚠️ Shift Closing Pending' 
                  : closing.totalDiff < 0 
                  ? `Shortage: -${currency} ${Math.abs(closing.totalDiff)}` 
                  : closing.totalDiff > 0 
                  ? `Overage: +${currency} ${closing.totalDiff}` 
                  : '✓ Balanced (Zero Discrepancy)'}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs border-b border-slate-800 pb-3">
                <span className="text-slate-400">
                  Submitted By: <strong className="text-white">{closing.submittedBy}</strong>
                  {closing.timestamp && <span className="ml-2 text-slate-400">({new Date(closing.timestamp).toLocaleString()})</span>}
                </span>
                <span className="text-slate-400">
                  Audit State: <strong className="text-amber-300">{closing.status}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Cash Drawer Status */}
                <div className={`p-3.5 rounded-xl border ${
                  closing.cashDiff < 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cash Drawer</span>
                    </span>
                    {closing.cashDiff < 0 && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">SHORTAGE</span>}
                    {closing.cashDiff > 0 && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">OVERAGE</span>}
                  </div>
                  <p className="text-slate-300">
                    System Expected: <strong className="text-white">{currency} {closing.expectedCash.toLocaleString()}</strong> | Counted Actual: <strong className="text-white">{currency} {closing.actualCash.toLocaleString()}</strong>
                  </p>
                  <span className={`block font-bold mt-1.5 text-sm ${closing.cashDiff < 0 ? 'text-rose-300' : (closing.cashDiff > 0 ? 'text-emerald-400' : 'text-slate-300')}`}>
                    Cash Discrepancy: {closing.cashDiff > 0 ? '+' : ''}{currency} {closing.cashDiff.toLocaleString()}
                  </span>
                </div>

                {/* M-Pesa Statement Status */}
                <div className={`p-3.5 rounded-xl border ${
                  closing.mpesaDiff < 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>M-Pesa Till / Paybill</span>
                    </span>
                    {closing.mpesaDiff < 0 && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">SHORTAGE</span>}
                    {closing.mpesaDiff > 0 && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">OVERAGE</span>}
                  </div>
                  <p className="text-slate-300">
                    System Expected: <strong className="text-white">{currency} {closing.expectedMpesa.toLocaleString()}</strong> | Statement Actual: <strong className="text-white">{currency} {closing.actualMpesa.toLocaleString()}</strong>
                  </p>
                  <span className={`block font-bold mt-1.5 text-sm ${closing.mpesaDiff < 0 ? 'text-rose-300' : (closing.mpesaDiff > 0 ? 'text-emerald-400' : 'text-slate-300')}`}>
                    M-Pesa Discrepancy: {closing.mpesaDiff > 0 ? '+' : ''}{currency} {closing.mpesaDiff.toLocaleString()}
                  </span>
                </div>
              </div>

              {closing.notes && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-0.5">Closing Staff Notes:</span>
                  <p className="text-slate-300 italic">{closing.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* 4. DAY'S ITEMIZED TRANSACTIONS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>4. Itemized Transactions ({dayTx.length})</span>
              </h3>
            </div>

            {dayTx.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                No customer transactions recorded on {selectedDate}.
              </div>
            ) : (
              <div className="space-y-2">
                {dayTx.map(t => {
                  const staffName = [t.barberName, t.massageTherapistName].filter(Boolean).join(' & ') || 'Staff';
                  const cAmt = t.cashAmount !== undefined ? t.cashAmount : (t.paymentMethod === 'Cash' ? t.grandTotal : 0);
                  const mAmt = t.mpesaAmount !== undefined ? t.mpesaAmount : (t.paymentMethod === 'M-Pesa' ? t.grandTotal : 0);
                  const tipAmt = (Number(t.barberTip) || 0) + (Number(t.massageTip) || 0);

                  return (
                    <div key={t.id} className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-bold text-white">{t.clientName || 'Walk-in Client'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                            {t.paymentMethod}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Staff: <strong className="text-slate-200">{staffName}</strong>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Services: {(t.services || []).map(s => s.name).join(' + ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto text-right">
                        {tipAmt > 0 && (
                          <span className="text-pink-300 text-xs font-semibold">
                            Tip: {currency} {tipAmt}
                          </span>
                        )}
                        <div>
                          <span className="text-sm font-bold font-serif text-white block">
                            {currency} {Number(t.grandTotal || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Cash: {currency} {cAmt} | M-Pesa: {currency} {mAmt}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            Export includes complete revenue, worker earnings, tips, payment channels & closing reconciliation.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadCSV}
              type="button"
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download CSV Report</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}