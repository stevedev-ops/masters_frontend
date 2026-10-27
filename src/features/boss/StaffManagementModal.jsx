import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, UserCheck, UserX, Shield, Phone, Edit, Check, X, Trash2, Users, Key, Briefcase, User } from 'lucide-react';

export default function StaffManagementModal({ isOpen, onClose }) {
  const { staff, addStaff, updateStaff, deleteStaff, clearAllStaff, toggleStaffStatus } = useApp();

  // Add Staff State (3 distinct name fields: 1st Name, 2nd Name, Surname optional)
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [surname, setSurname] = useState('');
  const [role, setRole] = useState('Massage Therapist');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Full Edit State: Allow editing ANY staff attribute
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editSecondName, setEditSecondName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editRole, setEditRole] = useState('Massage Therapist');
  const [editPhone, setEditPhone] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editActive, setEditActive] = useState(true);

  if (!isOpen) return null;

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !secondName.trim()) {
      alert('Please enter both 1st Name and 2nd Name.');
      return;
    }

    const fullName = [firstName.trim(), secondName.trim(), surname.trim()].filter(Boolean).join(' ');

    addStaff({
      firstName: firstName.trim(),
      secondName: secondName.trim(),
      surname: surname.trim() || '',
      name: fullName,
      role: role,
      phone: phone.trim() || '+254 700 000 000',
      title: title.trim() || `${role} Specialist`,
      username: (username.trim() || firstName.trim()).toLowerCase(),
      password: password.trim() || 'masters123'
    });

    setFirstName('');
    setSecondName('');
    setSurname('');
    setPhone('');
    setTitle('');
    setUsername('');
    setPassword('');
  };

  const startEdit = (st) => {
    setEditingStaffId(st.id);
    let fn = st.firstName || '';
    let sn = st.secondName || '';
    let sur = st.surname || '';
    if (!fn && st.name) {
      const parts = st.name.trim().split(/\s+/);
      fn = parts[0] || '';
      sn = parts[1] || '';
      sur = parts.slice(2).join(' ') || '';
    }
    setEditFirstName(fn);
    setEditSecondName(sn);
    setEditSurname(sur);
    setEditRole(st.role || 'Massage Therapist');
    setEditPhone(st.phone || '');
    setEditTitle(st.title || '');
    setEditUsername(st.username || fn.toLowerCase() || '');
    setEditPassword(st.password || 'masters123');
    setEditActive(st.active !== false);
  };

  const saveEdit = (stId) => {
    if (!editFirstName.trim() || !editSecondName.trim()) {
      alert('1st Name and 2nd Name are required.');
      return;
    }
    const fullName = [editFirstName.trim(), editSecondName.trim(), editSurname.trim()].filter(Boolean).join(' ');
    updateStaff(stId, {
      firstName: editFirstName.trim(),
      secondName: editSecondName.trim(),
      surname: editSurname.trim() || '',
      name: fullName,
      role: editRole,
      phone: editPhone.trim() || '+254 700 000 000',
      title: editTitle.trim() || `${editRole} Specialist`,
      username: (editUsername.trim() || editFirstName.trim()).toLowerCase(),
      password: editPassword.trim() || 'masters123',
      active: editActive
    });
    setEditingStaffId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-3xl w-full rounded-3xl p-5 sm:p-7 space-y-6 border border-amber-500/30 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Staff Roster & Credentials</h2>
              <p className="text-xs text-amber-400 font-medium">Add team members with 1st, 2nd, and Surname. Either name can be used to log in.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Form: Add New Staff */}
        <form onSubmit={handleCreateStaff} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll New Team Member</span>
            </h3>
            <span className="text-[10px] text-slate-400">Surname is optional</span>
          </div>

          {/* 3 Distinct Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                1st Name (First Name) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Dennis"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                2nd Name (Middle Name) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
                placeholder="e.g. Mwangi"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Surname <span className="text-slate-500 text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="e.g. Kariuki"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
            💡 <strong>Login flexibility:</strong> Worker can sign in using their <strong>1st Name</strong>, <strong>2nd Name</strong>, <strong>Surname</strong>, or username with their password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Title / Specialty</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Tissue Therapist"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Custom Username (Optional)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Defaults to 1st Name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Login Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Default: masters123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform"
          >
            + Add Staff Member to System
          </button>
        </form>

        {/* Existing Staff Roster List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Staff Roster ({staff.length})
            </h3>
            {staff.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset staff list to clean (0 staff)? You can then add your actual workers.')) {
                    clearAllStaff();
                  }
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all"
              >
                Reset Roster (0 Staff)
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {staff.length === 0 && (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                <Users className="w-8 h-8 text-amber-400/60 mx-auto" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Team Members Enrolled Yet</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Enter your workers using the form above. Once saved, they can sign in using either of their names and track their sessions and tips.
                </p>
              </div>
            )}
            {staff.map((st) => (
              <div 
                key={st.id} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  editingStaffId === st.id 
                    ? 'bg-slate-900/95 border-amber-500 shadow-xl' 
                    : st.active 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                {editingStaffId === st.id ? (
                  /* FULL EDIT FORM: USER CAN EDIT ANYTHING */
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit All Fields for {st.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingStaffId(null)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Name Edits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">1st Name *</label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">2nd Name *</label>
                        <input
                          type="text"
                          value={editSecondName}
                          onChange={(e) => setEditSecondName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Surname (Optional)</label>
                        <input
                          type="text"
                          value={editSurname}
                          onChange={(e) => setEditSurname(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                    </div>

                    {/* Role & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Role</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        >
                          <option value="Massage Therapist">Massage Therapist</option>
                          <option value="Barber">Barber</option>
                          <option value="Dual">Dual</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Phone</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                    </div>

                    {/* Title, Username, Password, Active */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Job Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Login Username</label>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-semibold">Login Password</label>
                        <input
                          type="text"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span>Active Team Member</span>
                      </label>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingStaffId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(st.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1 shadow-md shadow-emerald-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save All Changes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* NORMAL DISPLAY CARD */
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/30 shrink-0">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{st.name}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            st.role === 'Massage Therapist' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                            st.role === 'Barber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {st.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{st.phone}</span>
                          <span>•</span>
                          <span className="text-amber-400/80">User: {st.username || st.name.split(' ')[0].toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => startEdit(st)}
                        className="px-2.5 py-1 text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center space-x-1"
                        title="Edit any field"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
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

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Permanently remove ${st.name} from the staff roster and delete their login access?`)) {
                            deleteStaff(st.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Permanently remove staff member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
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
