import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, 
  Sparkles, Scissors, Heart, ArrowRight, UserCheck, Check, 
  X, Filter, ShieldCheck, Crown, Hand
} from 'lucide-react';

export default function AppointmentsManager({ mode = 'staff', activeStaff = null, onSelectForEntry = null }) {
  const { 
    appointments, 
    staff, 
    currency, 
    claimAppointment, 
    assignAppointment, 
    updateAppointmentStatus 
  } = useApp();

  const [selectedAssignee, setSelectedAssignee] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionSuccess, setActionSuccess] = useState('');

  const activeStaffList = staff.filter(s => s.active);

  // --- STAFF MODE FILTERING ---
  // 1. Appointments specifically requested or assigned to this staff member
  const myAppointments = appointments.filter(a => {
    if (!activeStaff) return false;
    return a.preferredStaffId === activeStaff.id || a.assignedStaffId === activeStaff.id;
  });

  // 2. Open pool: Unassigned and no preferred staff (or preferred staff was unassigned)
  const openPoolAppointments = appointments.filter(a => {
    return (!a.assignedStaffId || a.assignedStaffId === '') && 
           (!a.preferredStaffId || a.preferredStaffId === '') &&
           a.status === 'pending';
  });

  // Role match check: Barber services for barbers, Massage for massage therapists
  const isServiceMatch = (serviceCategory) => {
    if (!activeStaff) return true;
    const role = (activeStaff.role || '').toLowerCase();
    const cat = (serviceCategory || '').toLowerCase();
    if (role.includes('dual') || role.includes('boss')) return true;
    if (role.includes('barber') && (cat.includes('barber') || cat.includes('nail'))) return true;
    if (role.includes('massage') && (cat.includes('massage') || cat.includes('spa') || cat.includes('skin'))) return true;
    return true; // Default allow if unspecified
  };

  const handleClaim = async (aptId) => {
    await claimAppointment(aptId);
    setActionSuccess('Appointment claimed successfully! It is now in your schedule.');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleBossAssign = async (aptId) => {
    const staffId = selectedAssignee[aptId];
    if (!staffId) {
      alert('Please select a staff member to assign.');
      return;
    }
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    await assignAppointment(aptId, staffMember.id, staffMember.name);
    setActionSuccess(`Assigned to ${staffMember.name} successfully!`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleStatusChange = async (aptId, newStatus) => {
    await updateAppointmentStatus(aptId, newStatus);
    setActionSuccess(`Appointment marked as ${newStatus}.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // ==========================================
  // 1. STAFF PORTAL VIEW
  // ==========================================
  if (mode === 'staff') {
    return (
      <div className="space-y-3 sm:space-y-6">
        
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2.5 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* SECTION 1: REQUESTED SPECIFICALLY FOR THIS STAFF MEMBER */}
        <div className="glass-card rounded-xl sm:rounded-3xl p-3.5 sm:p-6 border border-amber-500/30 space-y-2.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-white text-base sm:text-lg">
                Bookings Requested for You ({activeStaff ? activeStaff.name : 'Your Schedule'})
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 self-start sm:self-auto">
              {myAppointments.length} {myAppointments.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>

          {myAppointments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">No direct bookings currently requested for you.</p>
              <p className="text-[11px] text-slate-500">Check the Open Pool below to pick up customer requests!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAppointments.map(apt => (
                <div 
                  key={apt.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{apt.clientName}</span>
                        {apt.preferredStaffId === activeStaff?.id && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                            ⭐ Preffered You
                          </span>
                        )}
                      </div>
                      <a 
                        href={`tel:${apt.clientPhone}`}
                        className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center space-x-1 mt-1 font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{apt.clientPhone}</span>
                      </a>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      apt.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : apt.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    }`}>
                      {apt.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Service:</span>
                      <span className="font-semibold text-white">{apt.serviceName}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Date Requested:</span>
                      <span className="font-semibold text-amber-300">{apt.preferredDate || 'Today'}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Price:</span>
                      <span className="font-bold font-serif text-white">{currency} {apt.servicePrice?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                        className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Request</span>
                      </button>
                    )}

                    {onSelectForEntry && (
                      <button
                        onClick={() => onSelectForEntry(apt)}
                        className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center space-x-1 ml-auto"
                      >
                        <span>Start Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: OPEN BOOKINGS POOL ("Any Available Specialist") */}
        <div className="glass-card rounded-xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800 space-y-2.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Hand className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-serif font-bold text-white text-base sm:text-lg">
                  Open Appointments Pool (Available to Pick Up)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Clients booked "Any Available Specialist". Any qualified staff member can claim these!
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
              {openPoolAppointments.length} Available
            </span>
          </div>

          {openPoolAppointments.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              All incoming customer bookings are currently claimed or assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openPoolAppointments.map(apt => {
                const canClaim = isServiceMatch(apt.serviceCategory);
                return (
                  <div 
                    key={apt.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-white text-sm block">{apt.clientName}</span>
                        <a 
                          href={`tel:${apt.clientPhone}`}
                          className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center space-x-1 mt-0.5 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{apt.clientPhone}</span>
                        </a>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                        OPEN POOL
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-semibold text-white">{apt.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="text-amber-400">{apt.serviceCategory || 'General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requested Date:</span>
                        <span className="font-semibold text-amber-300">{apt.preferredDate || 'Today'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-sm font-bold font-serif gold-gradient-text">
                        {currency} {apt.servicePrice?.toLocaleString()}
                      </span>

                      <button
                        onClick={() => handleClaim(apt.id)}
                        className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5"
                      >
                        <Hand className="w-3.5 h-3.5" />
                        <span>Pick Up / Claim</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  }

  // ==========================================
  // 2. BOSS DASHBOARD VIEW
  // ==========================================
  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Header Bar */}
      <div className="glass-card p-3.5 sm:p-6 rounded-xl sm:rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-serif font-bold text-white">Online Customer Appointments & Assignment</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Review customer bookings, manage specialist preferences, and assign unassigned pool appointments.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs gap-1 max-w-full">
          {['all', 'pending', 'confirmed', 'completed'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all shrink-0 ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-3">
        {appointments
          .filter(a => filterStatus === 'all' || a.status === filterStatus)
          .map(apt => (
            <div 
              key={apt.id}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-white text-base">{apt.clientName}</span>
                    <a 
                      href={`tel:${apt.clientPhone}`}
                      className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center space-x-1 font-mono bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{apt.clientPhone}</span>
                    </a>
                    
                    {apt.preferredStaffName ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⭐ Requested: {apt.preferredStaffName}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Any Available Specialist
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 block mt-1">
                    Booked on: {new Date(apt.createdAt).toLocaleString()} | Scheduled for: <strong>{apt.preferredDate || 'Today'}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Service Fee</span>
                    <span className="text-lg font-serif font-bold text-white">
                      {currency} {apt.servicePrice?.toLocaleString()}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                    apt.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : apt.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}>
                    {apt.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Service & Assignment Controls */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs">
                <div className="text-slate-300">
                  <span className="text-slate-500 font-semibold block mb-0.5">Requested Treatment:</span>
                  <p className="font-medium text-white">{apt.serviceName} ({apt.serviceCategory || 'Service'})</p>
                </div>

                {/* Assignment Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Assigned To:</span>
                  </div>

                  {apt.assignedStaffName ? (
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      ✓ {apt.assignedStaffName}
                    </span>
                  ) : (
                    <span className="font-semibold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                      Unassigned (Open Pool)
                    </span>
                  )}

                  {/* Boss Assign / Reassign Dropdown */}
                  <div className="flex items-center space-x-1.5 ml-auto sm:ml-0">
                    <select
                      value={selectedAssignee[apt.id] || ''}
                      onChange={(e) => setSelectedAssignee({ ...selectedAssignee, [apt.id]: e.target.value })}
                      className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Choose Specialist --</option>
                      {activeStaffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleBossAssign(apt.id)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Assign
                    </button>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center space-x-1">
                    {apt.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'completed')}
                        title="Mark Completed"
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {apt.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to cancel the appointment for "${apt.clientName}" (${apt.serviceName})?`)) {
                            handleStatusChange(apt.id, 'cancelled');
                          }
                        }}
                        title="Cancel Appointment"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}

        {appointments.filter(a => filterStatus === 'all' || a.status === filterStatus).length === 0 && (
          <div className="glass-card p-4 sm:p-8 rounded-xl sm:rounded-2xl text-center text-slate-500 text-xs">
            No appointments found under the "{filterStatus}" filter.
          </div>
        )}
      </div>

    </div>
  );
}
