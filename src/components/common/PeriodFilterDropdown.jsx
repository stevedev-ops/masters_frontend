import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Check, Clock, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import { getDateRange } from '../../utils/dateRange';

export default function PeriodFilterDropdown({
  preset: propPreset,
  onChangePreset: propOnChangePreset,
  customStart: propCustomStart,
  customEnd: propCustomEnd,
  onApplyCustom: propOnApplyCustom
}) {
  const ctx = useApp();
  
  // Use controlled props if provided, otherwise fall back to AppContext
  const activePreset = propPreset !== undefined ? propPreset : ctx.periodPreset;
  const setPreset = propOnChangePreset || ctx.setPeriodPreset;
  const activeCustomStart = propCustomStart !== undefined ? propCustomStart : ctx.customStartDate;
  const activeCustomEnd = propCustomEnd !== undefined ? propCustomEnd : ctx.customEndDate;
  const applyCustomRange = propOnApplyCustom || ((start, end) => {
    ctx.setCustomStartDate(start);
    ctx.setCustomEndDate(end);
    ctx.setPeriodPreset('custom');
  });

  const [isOpen, setIsOpen] = useState(false);
  const [localStart, setLocalStart] = useState(activeCustomStart || '');
  const [localEnd, setLocalEnd] = useState(activeCustomEnd || '');
  const [isCustomExpanded, setIsCustomExpanded] = useState(activePreset === 'custom');

  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const rangeInfo = getDateRange(activePreset, activeCustomStart, activeCustomEnd);

  const handleSelectPreset = (presetId) => {
    if (presetId === 'custom') {
      setIsCustomExpanded(true);
      return;
    }
    setPreset(presetId);
    setIsOpen(false);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!localStart || !localEnd) {
      alert('Please choose both a start date and an end date.');
      return;
    }
    if (new Date(localStart) > new Date(localEnd)) {
      alert('Start date must be before or equal to end date.');
      return;
    }

    applyCustomRange(localStart, localEnd);
    setIsOpen(false);
  };

  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
    { id: 'all_time', label: 'All Time' },
  ];

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-[9999]' : 'z-30'}`} ref={dropdownRef}>
      
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-amber-500/60 text-xs font-semibold transition-all flex items-center space-x-2 shadow-lg active:scale-95"
      >
        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate max-w-[125px] sm:max-w-none text-white font-bold">{rangeInfo.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
      </button>

      {/* FLOATING DROPDOWN POPOVER */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0c111c] border border-amber-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[99999] overflow-hidden animate-scale-in ring-2 ring-amber-500/20">
          
          {/* Header */}
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Select Time Period</span>
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-white p-0.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset Buttons List */}
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {presets.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
                  }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Section */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2.5">
            <button
              type="button"
              onClick={() => setIsCustomExpanded(!isCustomExpanded)}
              className="w-full flex items-center justify-between text-xs text-amber-400 font-bold hover:text-amber-300"
            >
              <div className="flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Custom Specific Day / Range</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">{isCustomExpanded ? 'Hide' : 'Pick Dates'}</span>
            </button>

            {isCustomExpanded && (
              <form onSubmit={handleApplyCustom} className="space-y-2.5 pt-1 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={localStart}
                      onChange={(e) => setLocalStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">End Date</label>
                    <input
                      type="date"
                      required
                      value={localEnd}
                      onChange={(e) => setLocalEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Apply Date Filter</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </form>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
