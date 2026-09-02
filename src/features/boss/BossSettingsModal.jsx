import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, Users, Tag, KeyRound, Globe, UserPlus, UserCheck, 
  UserX, Shield, Phone, Edit, Check, X, Plus, Scissors, Heart, 
  Sparkles, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

export default function BossSettingsModal({ isOpen, onClose }) {
  const { 
    staff, addStaff, updateStaff, toggleStaffStatus,
    services, addService, updateService, 
    currency, setCurrency, isBackendConnected,
    authUser, changePassword,
    settingsTab, setSettingsTab
  } = useApp();

  // --- STAFF STATE ---
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Massage Therapist');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffTitle, setStaffTitle] = useState('');
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffRole, setEditStaffRole] = useState('');

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
    if (!staffName.trim()) return;

    addStaff({
      name: staffName.trim(),
      role: staffRole,
      phone: staffPhone.trim() || '+254 700 000 000',
      title: staffTitle.trim() || `${staffRole} Specialist`
    });

    setStaffName('');
    setStaffPhone('');
    setStaffTitle('');
  };

  const saveEditStaff = (id) => {
    updateStaff(id, { name: editStaffName, role: editStaffRole });
    setEditingStaffId(null);
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
              <form onSubmit={handleCreateStaff} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add New Team Member</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dennis Mutua"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Primary Role</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Barber">Barber</option>
                      <option value="Massage Therapist">Massage Therapist</option>
                      <option value="Dual">Dual (Barber & Spa Therapist)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Phone Number</label>
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
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {staff.filter(s => s.active).length} Active
                  </span>
                </div>

                <div className="space-y-2">
                  {staff.map((st) => (
                    <div 
                      key={st.id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                    >
                      {editingStaffId === st.id ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          <input
                            type="text"
                            value={editStaffName}
                            onChange={(e) => setEditStaffName(e.target.value)}
                            className="bg-slate-950 border border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                          <select
                            value={editStaffRole}
                            onChange={(e) => setEditStaffRole(e.target.value)}
                            className="bg-slate-950 border border-amber-500 rounded-lg px-2 py-1 text-xs text-white"
                          >
                            <option value="Barber">Barber</option>
                            <option value="Massage Therapist">Massage Therapist</option>
                            <option value="Dual">Dual</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-xs">{st.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                                {st.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-500" />
                              <span>{st.phone}</span>
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        {editingStaffId === st.id ? (
                          <>
                            <button
                              onClick={() => saveEditStaff(st.id)}
                              className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-xs font-bold"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStaffId(null)}
                              className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStaffId(st.id);
                              setEditStaffName(st.name);
                              setEditStaffRole(st.role);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

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
                      </div>
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

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">System Connection Status</span>
                  <span className={`font-bold flex items-center space-x-1.5 ${isBackendConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{isBackendConnected ? 'Live & Connected' : 'Local Offline Mode'}</span>
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
