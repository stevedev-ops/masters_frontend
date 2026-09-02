import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, UserCheck, UserX, Shield, Phone, Edit, Check, X } from 'lucide-react';

export default function StaffManagementModal({ isOpen, onClose }) {
  const { staff, addStaff, updateStaff, toggleStaffStatus } = useApp();

  const [name, setName] = useState('');
  const [role, setRole] = useState('Massage Therapist');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');

  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  if (!isOpen) return null;

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStaff({
      name: name.trim(),
      role: role,
      phone: phone.trim() || '+254 700 000 000',
      title: title.trim() || `${role} Specialist`
    });

    setName('');
    setPhone('');
    setTitle('');
  };

  const startEdit = (st) => {
    setEditingStaffId(st.id);
    setEditName(st.name);
    setEditRole(st.role);
  };

  const saveEdit = (stId) => {
    updateStaff(stId, { name: editName, role: editRole });
    setEditingStaffId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/30 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Staff & Role Management</h2>
              <p className="text-xs text-amber-400 font-medium">Add new team members & assign Barber / Massage Therapist roles</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Form: Add New Staff */}
        <form onSubmit={handleCreateStaff} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Add New Staff Member
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mary Wanjiku"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Massage Therapist">Massage Therapist ("Massage Girl")</option>
                <option value="Barber">Barber</option>
                <option value="Dual">Dual Specialist (Barber & Massage)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 712 345 678"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Title / Specialty</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Massage Specialist"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform"
          >
            + Add Staff Member to System
          </button>
        </form>

        {/* Existing Staff Roster List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Current Staff Roster ({staff.length})
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {staff.map((st) => (
              <div 
                key={st.id} 
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  st.active ? 'bg-slate-900 border-slate-800' : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                {editingStaffId === st.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-slate-950 border border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5 flex-1"
                    />
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="bg-slate-950 border border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                    >
                      <option value="Massage Therapist">Massage Therapist</option>
                      <option value="Barber">Barber</option>
                      <option value="Dual">Dual</option>
                    </select>
                    <button onClick={() => saveEdit(st.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingStaffId(null)} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/30">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{st.name}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            st.role === 'Massage Therapist' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                            st.role === 'Barber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {st.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{st.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(st)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Edit Role or Name"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          const action = st.active ? 'deactivate' : 'reactivate';
                          if (window.confirm(`Are you sure you want to ${action} ${st.name} (${st.role})?`)) {
                            toggleStaffStatus(st.id);
                          }
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          st.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {st.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
