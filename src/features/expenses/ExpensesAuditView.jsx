import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, Download, Search, Calendar, Filter, 
  Trash2, User, ArrowUpDown, Clock, Banknote, Wallet, 
  Tag, BarChart3, TrendingUp, Layers, Split 
} from 'lucide-react';
import PeriodFilterDropdown from '../../components/common/PeriodFilterDropdown';
import { getDateRange, filterItemsByDate } from '../../utils/dateRange';

const CATEGORIES = [
  'All',
  'Shop Supplies',
  'Laundry & Cleaning',
  'Utilities / Power',
  'Refreshments',
  'Equipment / Maintenance',
  'Other',
];

export default function ExpensesAuditView() {
  const { 
    currency, 
    expenses, 
    deleteExpense, 
    staff,
  } = useApp();

  // Independent Period Filter state for Expenses Audit
  const [expensePreset, setExpensePreset] = useState('today');
  const [expenseStart, setExpenseStart] = useState(new Date().toISOString().slice(0, 10));
  const [expenseEnd, setExpenseEnd] = useState(new Date().toISOString().slice(0, 10));

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All'); // 'All' | 'Cash' | 'M-Pesa' | 'Both'
  const [selectedStaff, setSelectedStaff] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. FILTER EXPENSES BASED ON CRITERIA
  const filteredExpenses = useMemo(() => {
    const range = getDateRange(expensePreset, expenseStart, expenseEnd);
    const inRange = filterItemsByDate(expenses || [], range.start, range.end, 'timestamp');

    return inRange.filter((exp) => {
      // Category filter
      if (selectedCategory !== 'All' && exp.category !== selectedCategory) {
        return false;
      }

      // Payment Method filter
      if (selectedPaymentMethod !== 'All' && exp.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      // Staff filter
      if (selectedStaff !== 'All' && exp.loggedByStaffName !== selectedStaff) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = exp.title?.toLowerCase().includes(q);
        const notesMatch = exp.notes?.toLowerCase().includes(q);
        const staffMatch = exp.loggedByStaffName?.toLowerCase().includes(q);
        const catMatch = exp.category?.toLowerCase().includes(q);
        if (!titleMatch && !notesMatch && !staffMatch && !catMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [expenses, expensePreset, expenseStart, expenseEnd, selectedCategory, selectedPaymentMethod, selectedStaff, searchQuery]);

  // 2. AGGREGATE SUMMARY METRICS
  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const cashSpent = useMemo(() => {
    return filteredExpenses
      .reduce((sum, e) => {
        if (e.paymentMethod === 'Cash') return sum + (parseFloat(e.amount) || 0);
        if (e.paymentMethod === 'Both' && e.cashPortion) return sum + parseFloat(e.cashPortion);
        return sum;
      }, 0);
  }, [filteredExpenses]);

  const mpesaSpent = useMemo(() => {
    return filteredExpenses
      .reduce((sum, e) => {
        if (e.paymentMethod === 'M-Pesa') return sum + (parseFloat(e.amount) || 0);
        if (e.paymentMethod === 'Both' && e.mpesaPortion) return sum + parseFloat(e.mpesaPortion);
        return sum;
      }, 0);
  }, [filteredExpenses]);

  // 3. EXPORT AS CSV
  const exportCSV = () => {
    if (!filteredExpenses.length) {
      alert('No records to export in the current selection.');
      return;
    }

    const headers = ['Date', 'Time', 'Expense Title', 'Category', 'Paid Out From', 'Cash Portion', 'M-Pesa Portion', 'Amount (KSh)', 'Recorded By', 'Notes'];
    const rows = filteredExpenses.map(e => [
      new Date(e.timestamp).toLocaleDateString(),
      new Date(e.timestamp).toLocaleTimeString(),
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.category || ''}"`,
      e.paymentMethod || 'Cash',
      e.cashPortion || (e.paymentMethod === 'Cash' ? e.amount : 0),
      e.mpesaPortion || (e.paymentMethod === 'M-Pesa' ? e.amount : 0),
      e.amount || 0,
      `"${e.loggedByStaffName || 'Staff'}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `the_masters_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER & KPI CARDS */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-red-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Receipt className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white tracking-tight">
                Shop Expenses & Payouts Audit
              </h2>
              <p className="text-xs text-slate-400">
                Detailed ledger of all operational shop costs, supplies, and staff payouts
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Filtered Records
            </span>
            <span className="text-xs font-bold text-rose-300">
              {filteredExpenses.length} entries
            </span>
          </div>
        </div>

        {/* 3 KPI Summary Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400">Total Filtered Expenses</span>
              <Receipt className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-rose-400">
              - {currency} {totalSpent.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {filteredExpenses.length} transactions in period
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400">Paid from Cash Drawer</span>
              <Banknote className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-amber-300">
              - {currency} {cashSpent.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Physical cash deductions
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400">Paid from M-Pesa Till</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-300">
              - {currency} {mpesaSpent.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Till / Paybill payouts
            </span>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY DISTRIBUTION */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Category Distribution (Filtered Period)
        </span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(c => c !== 'All').map((cat) => {
            const catTotal = filteredExpenses
              .filter(e => e.category === cat)
              .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
            
            if (catTotal === 0) return null;

            return (
              <div
                key={cat}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-xs"
              >
                <span className="text-slate-300 font-semibold">{cat}:</span>
                <span className="font-bold text-rose-400 font-serif">
                  {currency} {catTotal.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FILTERS & SEARCH TOOLBAR */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl relative z-30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses by item, staff member, or notes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Independent Shop Expenses Period Filter */}
            <PeriodFilterDropdown
              preset={expensePreset}
              onChangePreset={setExpensePreset}
              customStart={expenseStart}
              customEnd={expenseEnd}
              onApplyCustom={(s, e) => {
                setExpenseStart(s);
                setExpenseEnd(e);
                setExpensePreset('custom');
              }}
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-amber-400 focus:outline-none focus:border-amber-400"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* Payment Channel Filter */}
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-amber-400 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Payment Channels</option>
              <option value="Cash">Cash Drawer</option>
              <option value="M-Pesa">M-Pesa Till</option>
              <option value="Both">Both (Split Cash & M-Pesa)</option>
            </select>

            {/* Staff Filter */}
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-amber-400 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Staff Members</option>
              {(staff || []).map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
              ))}
            </select>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        {/* 4. EXPENSE AUDIT TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Expense Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No expense records matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(exp.timestamp).toLocaleDateString()}{' '}
                      <span className="text-slate-500 text-[11px]">
                        {new Date(exp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-500 font-normal italic">
                          "{exp.notes}"
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exp.paymentMethod === 'Cash'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : exp.paymentMethod === 'M-Pesa'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {exp.paymentMethod === 'Both' ? 'Both (Cash & M-Pesa)' : exp.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold">{exp.loggedByStaffName || 'Staff'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-rose-400 font-serif text-sm whitespace-nowrap">
                      - {currency} {Number(exp.amount).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete expense "${exp.title}" (${currency} ${exp.amount})?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        title="Delete expense"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Count */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <span>Showing {filteredExpenses.length} of {(expenses || []).length} expenses</span>
          <span className="font-semibold text-rose-300">
            Filtered Subtotal: - {currency} {totalSpent.toLocaleString()}
          </span>
        </div>

      </div>

    </div>
  );
}
