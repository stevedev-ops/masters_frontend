import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SERVICES, INITIAL_STAFF, INITIAL_TRANSACTIONS, INITIAL_EXPENSES } from '../data/initialData';
import { api } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current active portal view: 'customer' | 'staff' | 'boss'
  const [currentView, setCurrentView] = useState('customer'); // Default to Customer View for public site
  const [currency, setCurrency] = useState('KSh');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPWAPrompt, setDeferredPWAPrompt] = useState(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Online/Offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // PWA Install Prompt capture
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPWAPrompt(e);
      setShowPWAInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPWAPrompt) return;
    deferredPWAPrompt.prompt();
    const result = await deferredPWAPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowPWAInstall(false);
    }
    setDeferredPWAPrompt(null);
  };

  const dismissPWAInstall = () => {
    setShowPWAInstall(false);
  };

  // Authentication State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('masters_auth_token') || null);
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('masters_auth_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [bossTab, setBossTab] = useState('overview'); // 'overview' | 'appointments' | 'reports' | 'payouts' | 'expenses' | 'ledger'
  const [staffTab, setStaffTab] = useState('entry'); // 'entry' | 'bookings' | 'my_dashboard' | 'expenses'
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('staff'); // 'staff' | 'pricing' | 'security' | 'system'
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Universal Period Filter State for Executive Intelligence
  const [periodPreset, setPeriodPreset] = useState('all_time'); // 'this_month' | 'last_month' | 'today' | 'this_week' | 'this_year' | 'last_year' | 'all_time' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Persistent Domain States with LocalStorage fallback
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('masters_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('masters_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('masters_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [closingRecords, setClosingRecords] = useState(() => {
    const saved = localStorage.getItem('masters_closing_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('masters_expenses');
    return saved ? JSON.parse(saved) : (INITIAL_EXPENSES || []);
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('masters_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with LocalStorage as offline cache
  useEffect(() => {
    localStorage.setItem('masters_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('masters_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('masters_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('masters_closing_records', JSON.stringify(closingRecords));
  }, [closingRecords]);

  useEffect(() => {
    localStorage.setItem('masters_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('masters_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Initial load from Django API
  useEffect(() => {
    let isMounted = true;
    async function initFromBackend() {
      try {
        const [me, srv, stf, txs, cls, exps, apts] = await Promise.all([
          api.getMe().catch(() => null),
          api.getServices().catch(() => null),
          api.getStaff().catch(() => null),
          api.getTransactions().catch(() => null),
          api.getClosingRecords().catch(() => null),
          api.getExpenses().catch(() => null),
          api.getAppointments().catch(() => null),
        ]);
        if (isMounted) {
          if (me && me.authenticated && me.user) {
            setAuthUser(me.user);
            localStorage.setItem('masters_auth_user', JSON.stringify(me.user));
            // TEMPORARILY DISABLED - RETURN LATER
            // if (me.mustChangePassword || me.user?.mustChangePassword) {
            //   setIsChangePasswordOpen(true);
            // }
          }
          if (srv && srv.length > 0) setServices(srv);
          if (stf && stf.length > 0) setStaff(stf);
          if (txs && txs.length > 0) setTransactions(txs);
          if (cls) setClosingRecords(cls);
          if (exps) setExpenses(exps);
          if (apts) setAppointments(apts);
          setIsBackendConnected(true);
        }
      } catch (err) {
        console.info('Django API offline, running in local storage mode:', err.message);
        if (isMounted) setIsBackendConnected(false);
      }
    }
    initFromBackend();
    return () => { isMounted = false; };
  }, []);

  // --- AUTHENTICATION ACTIONS (WITH 100% OFFLINE FALLBACK) ---
  const login = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res && res.token) {
        localStorage.setItem('masters_auth_token', res.token);
        localStorage.setItem('masters_auth_user', JSON.stringify(res.user));
        setAuthToken(res.token);
        setAuthUser(res.user);

        if (res.user.role === 'boss') {
          setCurrentView('boss');
        } else {
          setCurrentView('staff');
        }

        // TEMPORARILY DISABLED - RETURN LATER
        // if (res.mustChangePassword || res.user?.mustChangePassword) {
        //   setIsChangePasswordOpen(true);
        // }

        try {
          const apts = await api.getAppointments();
          if (apts) setAppointments(apts);
        } catch (_) {}

        return res;
      }
    } catch (apiErr) {
      console.warn('Online login failed or network unavailable, attempting offline authentication fallback:', apiErr.message);
      
      const lowerUser = username.toLowerCase().trim();
      // Check for Boss offline fallback
      if ((lowerUser === 'admin' || lowerUser === 'boss') && (password === 'masters2026!' || password === 'admin' || password === 'boss123' || password === 'masters123')) {
        const offlineBoss = { id: 1, username: 'admin', role: 'boss', name: 'Master Executive (Offline Mode)' };
        const token = 'offline_token_boss_' + Date.now();
        localStorage.setItem('masters_auth_token', token);
        localStorage.setItem('masters_auth_user', JSON.stringify(offlineBoss));
        setAuthToken(token);
        setAuthUser(offlineBoss);
        setCurrentView('boss');
        return { token, user: offlineBoss, offline: true };
      }

      // Check for Staff offline fallback from local staff list
      const matchedStaff = (staff || []).find(s => s.name?.toLowerCase().includes(lowerUser) || s.id?.toLowerCase() === lowerUser || lowerUser === 'james' || lowerUser === 'sarah');
      if (matchedStaff && (password === 'masters123' || password.length >= 4)) {
        const offlineStaffUser = {
          id: matchedStaff.id,
          username: matchedStaff.name.toLowerCase().split(' ')[0],
          role: 'staff',
          staffProfile: matchedStaff
        };
        const token = 'offline_token_staff_' + Date.now();
        localStorage.setItem('masters_auth_token', token);
        localStorage.setItem('masters_auth_user', JSON.stringify(offlineStaffUser));
        setAuthToken(token);
        setAuthUser(offlineStaffUser);
        setCurrentView('staff');
        return { token, user: offlineStaffUser, offline: true };
      }

      // If user had previous cached login session
      const savedUserRaw = localStorage.getItem('masters_auth_user');
      if (savedUserRaw) {
        try {
          const savedUser = JSON.parse(savedUserRaw);
          if (savedUser.username?.toLowerCase() === lowerUser) {
            setAuthToken('offline_token_cached');
            setAuthUser(savedUser);
            setCurrentView(savedUser.role === 'boss' ? 'boss' : 'staff');
            return { token: 'offline_token_cached', user: savedUser, offline: true };
          }
        } catch (_) {}
      }

      throw new Error(apiErr.message || 'Invalid credentials or network unavailable.');
    }
    throw new Error('Authentication response invalid.');
  };

  const changePassword = async (oldPassword, newPassword) => {
    const res = await api.changePassword(oldPassword, newPassword);
    if (res && res.token) {
      localStorage.setItem('masters_auth_token', res.token);
      setAuthToken(res.token);
      setAuthUser((prev) => {
        const updated = { ...prev, mustChangePassword: false };
        localStorage.setItem('masters_auth_user', JSON.stringify(updated));
        return updated;
      });
      setIsChangePasswordOpen(false);
      return res;
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    localStorage.removeItem('masters_auth_token');
    localStorage.removeItem('masters_auth_user');
    setAuthToken(null);
    setAuthUser(null);
    setIsChangePasswordOpen(false);
    setCurrentView('customer');
  };

  const switchView = (targetView) => {
    if (targetView === 'customer') {
      setCurrentView('customer');
      return;
    }

    // Gated views require authentication
    if (!authUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (targetView === 'boss') {
      if (authUser.role === 'boss') {
        setCurrentView('boss');
      } else {
        alert('Access Denied: The Boss Dashboard is restricted to owner and administrative accounts.');
      }
      return;
    }

    if (targetView === 'staff') {
      setCurrentView('staff');
    }
  };

  // --- BUSINESS DOMAIN ACTIONS ---

  const addTransaction = (newTxData) => {
    const tempId = 'tx-' + Date.now();
    const newTx = {
      id: tempId,
      timestamp: new Date().toISOString(),
      barberTipPaid: false,
      massageTipPaid: false,
      ...newTxData,
    };
    setTransactions((prev) => [newTx, ...prev]);

    api.createTransaction(newTx).then((saved) => {
      if (saved && saved.id) {
        setTransactions((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
      }
    }).catch((err) => {
      console.warn('Backend sync failed for addTransaction:', err.message);
    });

    return newTx;
  };

  const saveClosingRecord = (record) => {
    const tempId = 'close-' + Date.now();
    const newRecord = {
      id: tempId,
      timestamp: new Date().toISOString(),
      ...record,
    };
    setClosingRecords((prev) => [newRecord, ...prev]);

    api.createClosingRecord(newRecord).then((saved) => {
      if (saved && saved.id) {
        setClosingRecords((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
      }
    }).catch((err) => {
      console.warn('Backend sync failed for saveClosingRecord:', err.message);
    });

    return newRecord;
  };

  const toggleTipPayoff = (txId, tipType) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          if (tipType === 'barber') {
            return { ...tx, barberTipPaid: !tx.barberTipPaid };
          }
          if (tipType === 'massage') {
            return { ...tx, massageTipPaid: !tx.massageTipPaid };
          }
        }
        return tx;
      })
    );

    api.toggleTipPayoff(txId, tipType).catch((err) => {
      console.warn('Backend sync failed for toggleTipPayoff:', err.message);
    });
  };

  const payOffAllStaffTips = (staffId) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        let updated = { ...tx };
        if (tx.barberId === staffId && !tx.barberTipPaid) {
          updated.barberTipPaid = true;
        }
        if (tx.massageTherapistId === staffId && !tx.massageTipPaid) {
          updated.massageTipPaid = true;
        }
        return updated;
      })
    );

    api.payAllStaffTips(staffId).catch((err) => {
      console.warn('Backend sync failed for payAllStaffTips:', err.message);
    });
  };

  const addStaff = (staffData) => {
    const tempId = 'stf-' + Date.now();
    const newMember = {
      id: tempId,
      active: true,
      ...staffData,
    };
    setStaff((prev) => [...prev, newMember]);

    api.createStaff(newMember).then((saved) => {
      if (saved && saved.id) {
        setStaff((prev) => prev.map((s) => (s.id === tempId ? saved : s)));
      }
    }).catch((err) => {
      console.warn('Backend sync failed for addStaff:', err.message);
    });

    return newMember;
  };

  const updateStaff = (staffId, updatedFields) => {
    setStaff((prev) =>
      prev.map((member) => (member.id === staffId ? { ...member, ...updatedFields } : member))
    );

    api.updateStaff(staffId, updatedFields).catch((err) => {
      console.warn('Backend sync failed for updateStaff:', err.message);
    });
  };

  const toggleStaffStatus = (staffId) => {
    setStaff((prev) =>
      prev.map((member) => (member.id === staffId ? { ...member, active: !member.active } : member))
    );

    api.toggleStaffStatus(staffId).catch((err) => {
      console.warn('Backend sync failed for toggleStaffStatus:', err.message);
    });
  };

  const addService = (serviceData) => {
    const tempId = 'srv-' + Date.now();
    const newSrv = {
      id: tempId,
      ...serviceData,
    };
    setServices((prev) => [...prev, newSrv]);

    api.createService(newSrv).then((saved) => {
      if (saved && saved.id) {
        setServices((prev) => prev.map((s) => (s.id === tempId ? saved : s)));
      }
    }).catch((err) => {
      console.warn('Backend sync failed for addService:', err.message);
    });
  };

  const updateService = (serviceId, updatedFields) => {
    setServices((prev) =>
      prev.map((srv) => (srv.id === serviceId ? { ...srv, ...updatedFields } : srv))
    );

    api.updateService(serviceId, updatedFields).catch((err) => {
      console.warn('Backend sync failed for updateService:', err.message);
    });
  };

  const deleteTransaction = (txId) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== txId));

    api.deleteTransaction(txId).catch((err) => {
      console.warn('Backend sync failed for deleteTransaction:', err.message);
    });
  };

  const addExpense = (expenseData) => {
    const tempId = 'exp-' + Date.now();
    const newExp = {
      id: tempId,
      timestamp: new Date().toISOString(),
      ...expenseData,
    };
    setExpenses((prev) => [newExp, ...prev]);

    api.createExpense(newExp).then((saved) => {
      if (saved && saved.id) {
        setExpenses((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
      }
    }).catch((err) => {
      console.warn('Backend sync failed for addExpense:', err.message);
    });

    return newExp;
  };

  const deleteExpense = (expId) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expId));

    api.deleteExpense(expId).catch((err) => {
      console.warn('Backend sync failed for deleteExpense:', err.message);
    });
  };

  // --- APPOINTMENT BOOKING ACTIONS ---
  const createAppointment = async (bookingData) => {
    const tempId = 'apt-' + Date.now();
    const newApt = {
      id: tempId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...bookingData,
    };
    setAppointments((prev) => [newApt, ...prev]);

    try {
      const saved = await api.createAppointment(bookingData);
      if (saved && saved.id) {
        setAppointments((prev) => prev.map((a) => (a.id === tempId ? saved : a)));
        return saved;
      }
    } catch (err) {
      console.warn('Backend appointment creation error, kept in local state:', err.message);
    }
    return newApt;
  };

  const claimAppointment = async (appointmentId) => {
    const staffMember = authUser?.staffProfile || staff.find((s) => s.id === authUser?.staffProfile?.id);
    const staffId = staffMember ? staffMember.id : (authUser ? `boss-${authUser.id}` : 'staff');
    const staffName = staffMember ? staffMember.name : (authUser ? authUser.username : 'Staff Member');

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, assignedStaffId: staffId, assignedStaffName: staffName, status: 'confirmed' }
          : apt
      )
    );

    try {
      const saved = await api.claimAppointment(appointmentId);
      if (saved && saved.id) {
        setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? saved : a)));
      }
    } catch (err) {
      console.warn('Backend claim appointment failed:', err.message);
    }
  };

  const assignAppointment = async (appointmentId, staffId, staffName) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, assignedStaffId: staffId, assignedStaffName: staffName, status: 'confirmed' }
          : apt
      )
    );

    try {
      const saved = await api.assignAppointment(appointmentId, staffId, staffName);
      if (saved && saved.id) {
        setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? saved : a)));
      }
    } catch (err) {
      console.warn('Backend assign appointment failed:', err.message);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt))
    );

    try {
      const saved = await api.updateAppointmentStatus(appointmentId, status);
      if (saved && saved.id) {
        setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? saved : a)));
      }
    } catch (err) {
      console.warn('Backend update appointment status failed:', err.message);
    }
  };

  const resetDemoData = async () => {
    setServices(INITIAL_SERVICES);
    setStaff(INITIAL_STAFF);
    setTransactions(INITIAL_TRANSACTIONS);
    setClosingRecords([]);
    setExpenses(INITIAL_EXPENSES || []);
    setAppointments([]);
    localStorage.removeItem('masters_services');
    localStorage.removeItem('masters_staff');
    localStorage.removeItem('masters_transactions');
    localStorage.removeItem('masters_closing_records');
    localStorage.removeItem('masters_expenses');
    localStorage.removeItem('masters_appointments');

    try {
      await api.resetDemoData();
      const [srv, stf, txs, cls, exps, apts] = await Promise.all([
        api.getServices(),
        api.getStaff(),
        api.getTransactions(),
        api.getClosingRecords(),
        api.getExpenses(),
        api.getAppointments().catch(() => []),
      ]);
      if (srv) setServices(srv);
      if (stf) setStaff(stf);
      if (txs) setTransactions(txs);
      if (cls) setClosingRecords(cls);
      if (exps) setExpenses(exps);
      if (apts) setAppointments(apts);
    } catch (err) {
      console.warn('Could not reset demo data via API:', err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        switchView,
        currency,
        setCurrency,
        isBackendConnected,
        authUser,
        authToken,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isChangePasswordOpen,
        setIsChangePasswordOpen,
        bossTab,
        setBossTab,
        staffTab,
        setStaffTab,
        isStaffModalOpen,
        setIsStaffModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        settingsTab,
        setSettingsTab,
        periodPreset,
        setPeriodPreset,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        isServiceModalOpen,
        setIsServiceModalOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        login,
        logout,
        changePassword,
        services,
        staff,
        transactions,
        closingRecords,
        expenses,
        appointments,
        createAppointment,
        claimAppointment,
        assignAppointment,
        updateAppointmentStatus,
        addTransaction,
        saveClosingRecord,
        toggleTipPayoff,
        payOffAllStaffTips,
        addStaff,
        updateStaff,
        toggleStaffStatus,
        addService,
        updateService,
        deleteTransaction,
        addExpense,
        deleteExpense,
        resetDemoData,
        isOnline,
        showPWAInstall,
        installPWA,
        dismissPWAInstall,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
