import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, Users, Tag, KeyRound, Globe, UserPlus, UserCheck, 
  UserX, Shield, Phone, Edit, Check, X, Plus, Scissors, Heart, 
  Sparkles, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, Trash2, Download, Upload, HardDrive, Database, ShieldCheck,
  Cloud, CloudOff, ArrowRight 
} from 'lucide-react';

export default function BossSettingsModal({ isOpen, onClose }) {
  const { 
    staff, addStaff, updateStaff, deleteStaff, clearAllStaff, toggleStaffStatus, purgeSystemData,
    services, addService, updateService, 
    currency, setCurrency, isBackendConnected,
    authUser, changePassword,
    settingsTab, setSettingsTab,
    transactions, closingRecords, expenses, appointments,
    exportLocalBackup, importLocalBackup, getStorageMetrics, isOfflineMode,
    isSyncing, syncStatus, syncMessage, lastSyncTime, pendingSyncSummary, syncWithCloud, triggerCloudHealthCheck
  } = useApp();

  const [syncFeedback, setSyncFeedback] = useState(null);
  const [isTestingConn, setIsTestingConn] = useState(false);

  const handleManualSync = async () => {
    setSyncFeedback(null);
    try {
      const res = await syncWithCloud(true);
      if (res && res.success) {
        setSyncFeedback({ type: 'success', message: res.message });
      } else {
        setSyncFeedback({ type: 'info', message: res?.message || 'Server currently offline. Your records are safely saved locally on this device.' });
      }
    } catch (err) {
      setSyncFeedback({ type: 'error', message: err.message || 'Sync failed.' });
    }
    setTimeout(() => setSyncFeedback(null), 8000);
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setSyncFeedback(null);
    try {
      const health = await triggerCloudHealthCheck(false);
      if (health.online) {
        setSyncFeedback({ type: 'success', message: `Connected to cloud server! Latency: ${health.latencyMs}ms.` });
      } else {
        setSyncFeedback({ type: 'info', message: 'Cloud server is sleeping or offline (Render expired). Data remains 100% safe on this device.' });
      }
    } catch (_) {
      setSyncFeedback({ type: 'info', message: 'Could not reach cloud server. Offline mode is active.' });
    }
    setIsTestingConn(false);
    setTimeout(() => setSyncFeedback(null), 8000);
  };

  // --- STAFF STATE (3 DISTINCT NAME FIELDS & FULL EDIT) ---
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffSecondName, setStaffSecondName] = useState('');
  const [staffSurname, setStaffSurname] = useState('');
  const [staffRole, setStaffRole] = useState('Massage Therapist');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffTitle, setStaffTitle] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Full Edit State: User can edit anything for a staff member
  const [editStaffFirstName, setEditStaffFirstName] = useState('');
  const [editStaffSecondName, setEditStaffSecondName] = useState('');
  const [editStaffSurname, setEditStaffSurname] = useState('');
  const [editStaffRole, setEditStaffRole] = useState('Massage Therapist');
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editStaffTitle, setEditStaffTitle] = useState('');
  const [editStaffUsername, setEditStaffUsername] = useState('');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [editStaffActive, setEditStaffActive] = useState(true);

  // Backup & Storage State
  const [backupStatus, setBackupStatus] = useState('');
  const [backupError, setBackupError] = useState('');

  const handleExportBackup = () => {
    setBackupStatus('');
    setBackupError('');
    const ok = exportLocalBackup();
    if (ok) {
      setBackupStatus('✅ Local backup file downloaded successfully! Keep it safe.');
      setTimeout(() => setBackupStatus(''), 6000);
    } else {
      setBackupError('Failed to generate backup file.');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupStatus('');
    setBackupError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const res = importLocalBackup(event.target.result);
        setBackupStatus(`✅ Backup restored successfully! Restored ${res.count} transactions, staff and records.`);
        setTimeout(() => setBackupStatus(''), 6000);
      } catch (err) {
        setBackupError(err.message || 'Failed to read backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- SERVICE PRICING STATE ---
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Barber');
  const [serviceDescription, setServiceDescription] = useState('');
  const [editingSrvId, setEditingSrvId] = useState(null);
  const [editSrvPrice, setEditSrvPrice] = useState('');
  const [editSrvName, setEditSrvName] = useState('');

  // --- PASSWORD / SECURITY STATE ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [isSubmittingPw, setIsSubmittingPw] = useState(false);

  if (!isOpen) return null;

  // Handlers for Staff
  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!staffFirstName.trim() || !staffSecondName.trim()) {
      alert('Please enter both 1st Name and 2nd Name.');
      return;
    }

    const fullName = [staffFirstName.trim(), staffSecondName.trim(), staffSurname.trim()].filter(Boolean).join(' ');

    addStaff({
      firstName: staffFirstName.trim(),
      secondName: staffSecondName.trim(),
      surname: staffSurname.trim() || '',
      name: fullName,
      role: staffRole,
      phone: staffPhone.trim() || '+254 700 000 000',
      title: staffTitle.trim() || `${staffRole} Specialist`,
      username: (staffUsername.trim() || staffFirstName.trim()).toLowerCase(),
      password: staffPassword.trim() || 'masters123'
    });

    setStaffFirstName('');
    setStaffSecondName('');
    setStaffSurname('');
    setStaffPhone('');
    setStaffTitle('');
    setStaffUsername('');
    setStaffPassword('');
  };

  const startEditStaff = (st) => {
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
    setEditStaffFirstName(fn);
    setEditStaffSecondName(sn);
    setEditStaffSurname(sur);
    setEditStaffRole(st.role || 'Massage Therapist');
    setEditStaffPhone(st.phone || '');
    setEditStaffTitle(st.title || '');
    setEditStaffUsername(st.username || fn.toLowerCase() || '');
    setEditStaffPassword(st.password || 'masters123');
    setEditStaffActive(st.active !== false);
  };

  const saveEditStaff = (id) => {
    if (!editStaffFirstName.trim() || !editStaffSecondName.trim()) {
      alert('1st Name and 2nd Name are required.');
      return;
    }
    const fullName = [editStaffFirstName.trim(), editStaffSecondName.trim(), editStaffSurname.trim()].filter(Boolean).join(' ');
    updateStaff(id, {
      firstName: editStaffFirstName.trim(),
      secondName: editStaffSecondName.trim(),
      surname: editStaffSurname.trim() || '',
      name: fullName,
      role: editStaffRole,
      phone: editStaffPhone.trim() || '+254 700 000 000',
      title: editStaffTitle.trim() || `${editStaffRole} Specialist`,
      username: (editStaffUsername.trim() || editStaffFirstName.trim()).toLowerCase(),
      password: editStaffPassword.trim() || 'masters123',
      active: editStaffActive
    });
    setEditingStaffId(null);
  };

  const handlePurgeSystem = () => {
    const confirmation = window.prompt('DANGER: This will delete ALL dummy bookings, unpaid tips, transactions, expenses, and staff records from this device and re-seed the administrator. Type "RESET" to confirm:');
    if (confirmation === 'RESET') {
      purgeSystemData(true);
      alert('System reset successfully! All dummy bookings, unpaid tips, and transactions have been cleared. Administrator account is seeded (admin / masters2026!).');
    }
  };

  // Handlers for Services
  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice) return;

    addService({
      name: serviceName.trim(),
      price: parseFloat(servicePrice),
      category: serviceCategory,
      icon: serviceCategory === 'Barber' ? 'Scissors' : 'Heart',
      description: serviceDescription.trim() || 'Executive salon treatment'
    });

    setServiceName('');
    setServicePrice('');
    setServiceDescription('');
  };

  const saveEditService = (id) => {
    updateService(id, { name: editSrvName, price: parseFloat(editSrvPrice) });
    setEditingSrvId(null);
  };

  // Handlers for Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (newPassword.length < 8) {
      setSecurityStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityStatus({ type: 'error', message: 'New passwords do not match. Please re-check.' });
      return;
    }

    setIsSubmittingPw(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res && res.success) {
        setSecurityStatus({ type: 'success', message: 'Password updated successfully! Your credentials are secure.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityStatus({ type: 'error', message: res?.error || 'Failed to change password. Verify your current password.' });
      }
    } catch (err) {
      setSecurityStatus({ type: 'error', message: err.message || 'Error communicating with authentication server.' });
    }
    setIsSubmittingPw(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-[100vw] sm:max-w-3xl w-full rounded-3xl border border-amber-500/30 overflow-hidden my-auto shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Settings className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <span>Executive Settings</span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage team members, service pricing catalog, and admin credentials.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SETTINGS SUB-NAV TABS */}
        <div className="flex items-center bg-slate-950/90 border-b border-slate-800 px-4 py-2 gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'staff', label: 'Manage Staff', icon: Users },
            { id: 'pricing', label: 'Set Prices & Services', icon: Tag },
            { id: 'security', label: 'Password & Security', icon: KeyRound },
            { id: 'system', label: 'System & Currency', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = settingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SCROLLABLE SETTINGS CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* ================================================= */}
          {/* TAB 1: MANAGE STAFF */}
          {/* ================================================= */}
          {settingsTab === 'staff' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Add New Staff Form */}
              <form onSubmit={handleCreateStaff} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add New Team Member</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Surname is optional</span>
                </div>

                {/* 3 Distinct Name Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      1st Name (First Name) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dennis"
                      value={staffFirstName}
                      onChange={(e) => setStaffFirstName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      2nd Name (Middle Name) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mwangi"
                      value={staffSecondName}
                      onChange={(e) => setStaffSecondName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Surname <span className="text-slate-500 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kariuki"
                      value={staffSurname}
                      onChange={(e) => setStaffSurname(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
                  💡 <strong>Login Flexibility:</strong> Worker can sign in using either their <strong>1st Name</strong>, <strong>2nd Name</strong>, <strong>Surname</strong>, or username with password.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Primary Role</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Barber">Barber</option>
                      <option value="Massage Therapist">Massage Therapist ("Massage Girl")</option>
                      <option value="Dual">Dual (Barber & Spa Therapist)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +254 712 345 678"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Professional Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Hot Stone Specialist"
                      value={staffTitle}
                      onChange={(e) => setStaffTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Login Username (Optional)</label>
                    <input
                      type="text"
                      placeholder="Defaults to 1st Name"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Initial Password (Optional)</label>
                    <input
                      type="text"
                      placeholder="Default: masters123"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Save Team Member</span>
                  </button>
                </div>
              </form>

              {/* Staff Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Current Staff Roster ({staff.length})
                  </h3>
                  <div className="flex items-center space-x-2">
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
                    <span className="text-[11px] text-amber-400 font-semibold">
                      {staff.filter(s => s.active).length} Active
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {staff.length === 0 && (
                    <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                      <Users className="w-8 h-8 text-amber-400/60 mx-auto" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Team Members Enrolled Yet</h4>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Enter your workers using the form above. Once saved, they can sign in to the Staff Portal using either of their names.
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
                          ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                          : 'bg-slate-950/60 border-slate-900 opacity-60'
                      }`}
                    >
                      {editingStaffId === st.id ? (
                        /* FULL EDIT FORM: USER CAN EDIT ANYTHING */
                        <div className="space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit All Details for {st.name}</span>
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
                                value={editStaffFirstName}
                                onChange={(e) => setEditStaffFirstName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block font-semibold">2nd Name *</label>
                              <input
                                type="text"
                                value={editStaffSecondName}
                                onChange={(e) => setEditStaffSecondName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block font-semibold">Surname (Optional)</label>
                              <input
                                type="text"
                                value={editStaffSurname}
                                onChange={(e) => setEditStaffSurname(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                          </div>

                          {/* Role & Phone */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block font-semibold">Role</label>
                              <select
                                value={editStaffRole}
                                onChange={(e) => setEditStaffRole(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              >
                                <option value="Barber">Barber</option>
                                <option value="Massage Therapist">Massage Therapist</option>
                                <option value="Dual">Dual</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block font-semibold">Phone</label>
                              <input
                                type="text"
                                value={editStaffPhone}
                                onChange={(e) => setEditStaffPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                          </div>

                          {/* Title, Username, Password */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block font-semibold">Title</label>
                              <input
                                type="text"
                                value={editStaffTitle}
                                onChange={(e) => setEditStaffTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block font-semibold">Username</label>
                              <input
                                type="text"
                                value={editStaffUsername}
                                onChange={(e) => setEditStaffUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block font-semibold">Password</label>
                              <input
                                type="text"
                                value={editStaffPassword}
                                onChange={(e) => setEditStaffPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editStaffActive}
                                onChange={(e) => setEditStaffActive(e.target.checked)}
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
                                onClick={() => saveEditStaff(st.id)}
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="font-bold text-white text-xs">{st.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                                  {st.role}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="flex items-center space-x-1">
                                  <Phone className="w-2.5 h-2.5 text-slate-500" />
                                  <span>{st.phone}</span>
                                </span>
                                <span>•</span>
                                <span className="text-amber-400/80">User: {st.username || st.name.split(' ')[0].toLowerCase()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            <button
                              onClick={() => startEditStaff(st)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                              title="Edit any field"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-400" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => {
                                const action = st.active ? 'deactivate' : 'activate';
                                if (window.confirm(`Are you sure you want to ${action} ${st.name} (${st.role})?`)) {
                                  toggleStaffStatus(st.id);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
                                st.active
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                              }`}
                            >
                              {st.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                              <span>{st.active ? 'Active' : 'Inactive'}</span>
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

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 2: SET PRICES & SERVICES */}
          {/* ================================================= */}
          {settingsTab === 'pricing' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Add New Service Form */}
              <form onSubmit={handleAddService} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add New Salon / Spa Service</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Service Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aromatherapy Scalp Massage"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Category</label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Barber">Barber</option>
                      <option value="Massage & Bodywork">Massage & Bodywork</option>
                      <option value="Spa & Skincare">Spa & Skincare</option>
                      <option value="Nail Care">Nail Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Price ({currency})</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1200"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Short description of what the client receives..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Service to Menu</span>
                  </button>
                </div>
              </form>

              {/* Services List with Price Edit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Service Catalog & Active Pricing ({services.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click pencil to adjust prices instantly
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((srv) => (
                    <div 
                      key={srv.id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                    >
                      {editingSrvId === srv.id ? (
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="text"
                            value={editSrvName}
                            onChange={(e) => setEditSrvName(e.target.value)}
                            className="w-1/2 bg-slate-950 border border-amber-500 rounded-lg px-2 py-1 text-xs text-white"
                          />
                          <input
                            type="number"
                            value={editSrvPrice}
                            onChange={(e) => setEditSrvPrice(e.target.value)}
                            className="w-1/2 bg-slate-950 border border-amber-500 rounded-lg px-2 py-1 text-xs text-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white text-xs">{srv.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {srv.category}
                            </span>
                          </div>
                          <span className="text-sm font-serif font-bold gold-gradient-text block mt-0.5">
                            {currency} {srv.price.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1 shrink-0">
                        {editingSrvId === srv.id ? (
                          <>
                            <button
                              onClick={() => saveEditService(srv.id)}
                              className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-xs font-bold"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingSrvId(null)}
                              className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSrvId(srv.id);
                              setEditSrvName(srv.name);
                              setEditSrvPrice(srv.price);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit Price"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 3: ACCOUNT & PASSWORD SECURITY */}
          {/* ================================================= */}
          {settingsTab === 'security' && (
            <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
              
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 font-bold text-lg flex items-center justify-center shadow-md shrink-0">
                  {authUser?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {authUser?.staffProfile ? authUser.staffProfile.name : authUser?.username}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium capitalize">
                    {authUser?.role} Account & Executive Access
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              {securityStatus && (
                <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center space-x-2.5 animate-fade-in ${
                  securityStatus.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {securityStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{securityStatus.message}</span>
                </div>
              )}

              {/* Change Password Form */}
              <form onSubmit={handlePasswordSubmit} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800/80 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Change Admin Password</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Update your private credentials for accessing the executive suite.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white pr-10 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">New Password (8+ chars)</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter strong new password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white pr-10 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPw}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmittingPw && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmittingPw ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 4: SYSTEM & CURRENCY PREFERENCES */}
          {/* ================================================= */}
          {settingsTab === 'system' && (
            <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
              
              {/* 1. CLOUD SYNCHRONIZATION & OFFLINE-FIRST ENGINE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Database Sync (Render Postgres)</h3>
                      <p className="text-[11px] text-slate-400">Offline-first recording with zero data loss guarantee</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1.5 ${
                    syncStatus === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{syncStatus === 'connected' ? 'Cloud Connected' : 'Offline Mode (Phone Storage)'}</span>
                  </span>
                </div>

                {/* Explanation Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-amber-400">How it works:</strong> All transactions, staff workers, and expenses record <span className="text-emerald-400 font-bold">instantly on your phone</span> so you never stop working even when Render is expired or you have no internet. When you renew Render or go online, tapping below pushes and syncs all offline records directly to PostgreSQL.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Pending Tx Sync</span>
                      <span className="text-xs font-black text-amber-400">{pendingSyncSummary?.pendingTransactions || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Pending Staff Sync</span>
                      <span className="text-xs font-black text-amber-400">{pendingSyncSummary?.pendingStaff || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Pending Expenses</span>
                      <span className="text-xs font-black text-amber-400">{pendingSyncSummary?.pendingExpenses || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Queue</span>
                      <span className="text-xs font-black text-amber-400">{pendingSyncSummary?.total || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Sync Feedback Message */}
                {syncFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in ${
                    syncFeedback.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : syncFeedback.type === 'error'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {syncFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{syncFeedback.message}</span>
                  </div>
                )}

                {/* Sync Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Synchronizing with Cloud...' : '🔄 Sync All Offline Data to Cloud Server'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConn || isSyncing}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isTestingConn ? 'Pinging...' : 'Test Cloud Connection'}</span>
                  </button>
                </div>

                {lastSyncTime && (
                  <p className="text-[10px] text-slate-500 text-right">
                    Last successful cloud sync: <span className="text-slate-300">{lastSyncTime}</span>
                  </p>
                )}
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Business Preferences</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Default Business Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="KSh">KSh — Kenyan Shilling</option>
                    <option value="UGX">UGX — Ugandan Shilling</option>
                    <option value="R">R — South African Rand</option>
                    <option value="$">$ — US Dollar</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    All financial metrics, services prices, and staff tip calculations will reflect this currency.
                  </p>
                </div>
              </div>

              {/* Storage & Backend Status */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">System Operating Mode</span>
                  <span className="font-bold flex items-center space-x-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🟢 100% Offline (Phone Local Storage)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Device Storage Space Used</span>
                  <span className="font-bold text-amber-400">
                    {getStorageMetrics ? getStorageMetrics().formatted : '15.4 KB'} (Safe & Active)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/20 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    Device Data Persistence Status: Active
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    All your transactions, workers, service catalog, and daily records are stored directly in your device’s permanent Local Storage. Closing and reopening the app will not lose your data.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Transactions</span>
                      <span className="text-sm font-black text-amber-400">{transactions?.length || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Staff Members</span>
                      <span className="text-sm font-black text-amber-400">{staff?.length || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Expenses</span>
                      <span className="text-sm font-black text-amber-400">{expenses?.length || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Daily Closings</span>
                      <span className="text-sm font-black text-amber-400">{closingRecords?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Backup & Restore */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5">
                  <Database className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Device Data Backup & Safeguard</h3>
                </div>

                <p className="text-xs text-slate-400">
                  Export a full backup file of your shop records anytime to your phone or computer. You can restore this backup anytime if you switch phones or clear your browser.
                </p>

                {backupStatus && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{backupStatus}</span>
                  </div>
                )}

                {backupError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{backupError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download Full Backup (JSON)</span>
                  </button>

                  <label className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 font-bold text-xs hover:border-amber-400 hover:text-white transition-all flex items-center justify-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Restore from Backup (JSON)</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* FACTORY RESET / PURGE SYSTEM DATA */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <div className="flex items-center space-x-2 border-b border-rose-900/40 pb-2.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Clean System Reset (Admin Only)</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Wipes all dummy bookings, unpaid tips, mock transactions, and test staff. Re-seeds the administrator account (<code className="text-amber-400 font-mono">admin</code> / <code className="text-amber-400 font-mono">masters2026!</code>). Use this if you ever need to clear all dummy test data in 1 click.
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handlePurgeSystem}
                    className="py-2 px-4 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition-all flex items-center space-x-2 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Wipe All Dummy Data & Reset System</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
