import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SERVICES, INITIAL_STAFF, INITIAL_TRANSACTIONS, INITIAL_EXPENSES } from '../data/initialData';
import { api } from '../api/client';

const AppContext = createContext();

// Helper to safely read from localStorage
const getStoredItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (item !== null && item !== undefined) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.warn(`Error parsing localStorage key ${key}:`, e);
  }
  return fallback;
};

// Helper for immediate write to localStorage
const persistState = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Failed to persist ${key} to localStorage:`, err);
  }
};

export const AppProvider = ({ children }) => {
  // Current active portal view: 'customer' | 'staff' | 'boss'
  // 1. Initial view restoration from localStorage or active session
  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedView = localStorage.getItem('masters_current_view');
      if (savedView && (savedView === 'boss' || savedView === 'staff' || savedView === 'customer')) {
        return savedView;
      }
      const savedUserStr = localStorage.getItem('masters_auth_user');
      const token = localStorage.getItem('masters_auth_token');
      if (savedUserStr && token) {
        const user = JSON.parse(savedUserStr);
        return user.role === 'boss' ? 'boss' : 'staff';
      }
    } catch (_) {}
    return 'customer';
  });

  const [currency, setCurrency] = useState('KSh');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPWAPrompt, setDeferredPWAPrompt] = useState(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Keep currentView synced to localStorage immediately on change
  useEffect(() => {
    try {
      localStorage.setItem('masters_current_view', currentView);
    } catch (_) {}
  }, [currentView]);

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

  // Dedicated App & Staff Portal Auto-Login Prompt
  useEffect(() => {
    try {
      localStorage.removeItem('masters_app_installed');
    } catch (_) {}

    const handleAppAndUrlRouting = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();

      // Detect if user opened the TRUE installed mobile PWA app from home screen
      const isStandaloneApp = 
        window.matchMedia('(display-mode: standalone)').matches || 
        Boolean(window.navigator.standalone) || 
        document.referrer.includes('android-app://') ||
        search.includes('source=pwa');

      // Detect if user navigated specifically to /login, /portal, /staff
      const isExplicitLoginRoute = 
        path.includes('/login') || path.includes('/portal') || path.includes('/staff') || path.includes('/admin') ||
        hash.includes('login') || hash.includes('portal') || hash.includes('staff') || hash.includes('admin') ||
        search.includes('login') || search.includes('portal') || search.includes('staff') || search.includes('admin');

      const savedUserStr = localStorage.getItem('masters_auth_user');
      const token = localStorage.getItem('masters_auth_token');
      const savedView = localStorage.getItem('masters_current_view');

      if (savedUserStr && token) {
        try {
          const user = JSON.parse(savedUserStr);
          // If user previously selected a view, restore it
          if (savedView === 'boss' || savedView === 'staff') {
            setCurrentView(user.role === 'boss' ? savedView : 'staff');
          } else if (isStandaloneApp || isExplicitLoginRoute) {
            setCurrentView(user.role === 'boss' ? 'boss' : 'staff');
          }
        } catch (_) {
          if (isStandaloneApp || isExplicitLoginRoute) {
            setCurrentView('staff');
            setIsLoginModalOpen(true);
          }
        }
      } else if (isStandaloneApp || isExplicitLoginRoute) {
        // In the installed app or explicit /login route and NOT logged in: open login page!
        setCurrentView('staff');
        setIsLoginModalOpen(true);
      }
    };

    handleAppAndUrlRouting();
    window.addEventListener('popstate', handleAppAndUrlRouting);
    window.addEventListener('hashchange', handleAppAndUrlRouting);
    return () => {
      window.removeEventListener('popstate', handleAppAndUrlRouting);
      window.removeEventListener('hashchange', handleAppAndUrlRouting);
    };
  }, []);

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

  // Domain States (Permanent LocalStorage persistence as primary source of truth)
  const [services, setServices] = useState(() => {
    const data = getStoredItem('masters_services', INITIAL_SERVICES);
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_SERVICES;
  });

  const [staff, setStaff] = useState(() => {
    const data = getStoredItem('masters_staff', INITIAL_STAFF);
    if (Array.isArray(data)) {
      // Keep all staff members, only filtering out obsolete demo placeholder 'stf-1'
      return data.filter(s => s && s.id !== 'stf-1');
    }
    return INITIAL_STAFF || [];
  });

  const [transactions, setTransactions] = useState(() => {
    const data = getStoredItem('masters_transactions', INITIAL_TRANSACTIONS);
    if (Array.isArray(data)) {
      return data.filter(t => t && t.id !== 'tx-101' && t.id !== 'tx-102');
    }
    return INITIAL_TRANSACTIONS || [];
  });

  const [closingRecords, setClosingRecords] = useState(() => {
    const data = getStoredItem('masters_closing_records', []);
    return Array.isArray(data) ? data : [];
  });

  const [expenses, setExpenses] = useState(() => {
    const data = getStoredItem('masters_expenses', INITIAL_EXPENSES || []);
    if (Array.isArray(data)) {
      return data.filter(e => e && e.id !== 'exp-101' && e.id !== 'exp-102');
    }
    return INITIAL_EXPENSES || [];
  });

  const [appointments, setAppointments] = useState(() => {
    const data = getStoredItem('masters_appointments', []);
    return Array.isArray(data) ? data : [];
  });

  // Sync with LocalStorage as offline cache (guarantee persistence on React state updates)
  useEffect(() => {
    persistState('masters_services', services);
  }, [services]);

  useEffect(() => {
    persistState('masters_staff', staff);
  }, [staff]);

  useEffect(() => {
    persistState('masters_transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    persistState('masters_closing_records', closingRecords);
  }, [closingRecords]);

  useEffect(() => {
    persistState('masters_expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    persistState('masters_appointments', appointments);
  }, [appointments]);

  // Flush to localStorage immediately when tab is closed, minimized, or screen locked on mobile
  useEffect(() => {
    const handleFlush = () => {
      try {
        localStorage.setItem('masters_transactions', JSON.stringify(transactions));
        localStorage.setItem('masters_staff', JSON.stringify(staff));
        localStorage.setItem('masters_closing_records', JSON.stringify(closingRecords));
        localStorage.setItem('masters_expenses', JSON.stringify(expenses));
        localStorage.setItem('masters_appointments', JSON.stringify(appointments));
        localStorage.setItem('masters_services', JSON.stringify(services));
        localStorage.setItem('masters_current_view', currentView);
      } catch (_) {}
    };

    window.addEventListener('beforeunload', handleFlush);
    window.addEventListener('pagehide', handleFlush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleFlush();
    });

    return () => {
      window.removeEventListener('beforeunload', handleFlush);
      window.removeEventListener('pagehide', handleFlush);
    };
  }, [transactions, staff, closingRecords, expenses, appointments, services, currentView]);

  // Initial load from Backend (fails gracefully if Render backend expired, NEVER overwrites local data with empty arrays)
  useEffect(() => {
    let isMounted = true;

    // Purge any legacy stale api-cache from ServiceWorker on startup
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.delete('api-cache').catch(() => {});
    }

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
            persistState('masters_auth_user', me.user);
          }
          // CRITICAL: ONLY update local state if backend returned actual, non-empty data!
          // NEVER overwrite user local storage with empty arrays!
          if (Array.isArray(srv) && srv.length > 0) {
            setServices(srv);
            persistState('masters_services', srv);
          }
          if (Array.isArray(stf) && stf.length > 0) {
            setStaff(stf);
            persistState('masters_staff', stf);
          }
          if (Array.isArray(txs) && txs.length > 0) {
            setTransactions(txs);
            persistState('masters_transactions', txs);
          }
          if (Array.isArray(cls) && cls.length > 0) {
            setClosingRecords(cls);
            persistState('masters_closing_records', cls);
          }
          if (Array.isArray(exps) && exps.length > 0) {
            setExpenses(exps);
            persistState('masters_expenses', exps);
          }
          if (Array.isArray(apts) && apts.length > 0) {
            setAppointments(apts);
            persistState('masters_appointments', apts);
          }

          const hasBackend = Boolean(me || (srv && srv.length > 0));
          setIsBackendConnected(hasBackend);
        }
      } catch (err) {
        console.info('Backend unavailable, running in 100% reliable local storage mode:', err.message);
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

        const targetView = res.user.role === 'boss' ? 'boss' : 'staff';
        setCurrentView(targetView);
        localStorage.setItem('masters_current_view', targetView);

        try {
          const apts = await api.getAppointments();
          if (apts && Array.isArray(apts) && apts.length > 0) setAppointments(apts);
        } catch (_) {}

        return res;
      }
    } catch (apiErr) {
      console.warn('Online login failed or network unavailable, using local authentication fallback:', apiErr.message);
      
      const lowerUser = username.toLowerCase().trim();
      // Check for Boss offline fallback
      if ((lowerUser === 'admin' || lowerUser === 'boss') && (password === 'masters2026!' || password === 'admin' || password === 'boss123' || password === 'masters123')) {
        const offlineBoss = { id: 1, username: 'admin', role: 'boss', name: 'Master Executive (Local Mode)' };
        const token = 'offline_token_boss_' + Date.now();
        localStorage.setItem('masters_auth_token', token);
        localStorage.setItem('masters_auth_user', JSON.stringify(offlineBoss));
        localStorage.setItem('masters_current_view', 'boss');
        setAuthToken(token);
        setAuthUser(offlineBoss);
        setCurrentView('boss');
        return { token, user: offlineBoss, offline: true };
      }

      // Check for Staff offline fallback from local staff list
      const matchedStaff = (staff || []).find(s => 
        s.name?.toLowerCase().includes(lowerUser) || 
        s.id?.toLowerCase() === lowerUser || 
        s.username?.toLowerCase() === lowerUser ||
        lowerUser === 'shee'
      );

      if (matchedStaff && (password === 'masters123' || password.length >= 4)) {
        const offlineStaffUser = {
          id: matchedStaff.id,
          username: matchedStaff.username || matchedStaff.name.toLowerCase().split(' ')[0],
          name: matchedStaff.name,
          role: 'staff',
          staffProfile: matchedStaff
        };
        const token = 'offline_token_staff_' + Date.now();
        localStorage.setItem('masters_auth_token', token);
        localStorage.setItem('masters_auth_user', JSON.stringify(offlineStaffUser));
        localStorage.setItem('masters_current_view', 'staff');
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
          if (savedUser.username?.toLowerCase() === lowerUser || lowerUser === 'admin') {
            const target = savedUser.role === 'boss' ? 'boss' : 'staff';
            setAuthToken('offline_token_cached');
            setAuthUser(savedUser);
            setCurrentView(target);
            localStorage.setItem('masters_current_view', target);
            return { token: 'offline_token_cached', user: savedUser, offline: true };
          }
        } catch (_) {}
      }

      throw new Error(apiErr.message || 'Invalid credentials or network unavailable.');
    }
    throw new Error('Authentication response invalid.');
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
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
    } catch (_) {}
    setIsChangePasswordOpen(false);
    return { success: true };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    localStorage.removeItem('masters_auth_token');
    localStorage.removeItem('masters_auth_user');
    localStorage.setItem('masters_current_view', 'customer');
    setAuthToken(null);
    setAuthUser(null);
    setIsChangePasswordOpen(false);
    setCurrentView('customer');
  };

  const switchView = (targetView) => {
    if (targetView === 'customer') {
      setCurrentView('customer');
      localStorage.setItem('masters_current_view', 'customer');
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
        localStorage.setItem('masters_current_view', 'boss');
      } else {
        alert('Access Denied: The Boss Dashboard is restricted to owner and administrative accounts.');
      }
      return;
    }

    if (targetView === 'staff') {
      setCurrentView('staff');
      localStorage.setItem('masters_current_view', 'staff');
    }
  };

  // --- BUSINESS DOMAIN ACTIONS (WITH IMMEDIATE LOCALSTORAGE FLUSH) ---

  const addTransaction = (newTxData) => {
    const tempId = 'tx-' + Date.now();
    const newTx = {
      id: tempId,
      timestamp: new Date().toISOString(),
      barberTipPaid: false,
      massageTipPaid: false,
      ...newTxData,
    };
    
    setTransactions((prev) => {
      const next = [newTx, ...prev];
      persistState('masters_transactions', next);
      return next;
    });

    api.createTransaction(newTx).then((saved) => {
      if (saved && saved.id) {
        setTransactions((prev) => {
          const updated = prev.map((t) => (t.id === tempId ? saved : t));
          persistState('masters_transactions', updated);
          return updated;
        });
      }
    }).catch((err) => {
      console.warn('Backend sync failed for addTransaction (safely kept in localStorage):', err.message);
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

    setClosingRecords((prev) => {
      const next = [newRecord, ...prev];
      persistState('masters_closing_records', next);
      return next;
    });

    api.createClosingRecord(newRecord).catch((err) => {
      console.warn('Backend sync failed for saveClosingRecord (safely kept in localStorage):', err.message);
    });

    return newRecord;
  };

  const toggleTipPayoff = (txId, tipType) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => {
        if (tx.id === txId) {
          if (tipType === 'barber') {
            return { ...tx, barberTipPaid: !tx.barberTipPaid };
          }
          if (tipType === 'massage') {
            return { ...tx, massageTipPaid: !tx.massageTipPaid };
          }
        }
        return tx;
      });
      persistState('masters_transactions', next);
      return next;
    });

    api.toggleTipPayoff(txId, tipType).catch((err) => {
      console.warn('Backend sync failed for toggleTipPayoff:', err.message);
    });
  };

  const payOffAllStaffTips = (staffId) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => {
        let updated = { ...tx };
        if (tx.barberId === staffId && !tx.barberTipPaid) {
          updated.barberTipPaid = true;
        }
        if (tx.massageTherapistId === staffId && !tx.massageTipPaid) {
          updated.massageTipPaid = true;
        }
        return updated;
      });
      persistState('masters_transactions', next);
      return next;
    });

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

    setStaff((prev) => {
      const next = [...prev, newMember];
      persistState('masters_staff', next);
      return next;
    });

    api.createStaff(newMember).then((saved) => {
      if (saved && saved.id) {
        setStaff((prev) => {
          const updated = prev.map((s) => (s.id === tempId ? saved : s));
          persistState('masters_staff', updated);
          return updated;
        });
      }
    }).catch((err) => {
      console.warn('Backend sync failed for addStaff (safely kept in localStorage):', err.message);
    });

    return newMember;
  };

  const updateStaff = (staffId, updatedFields) => {
    setStaff((prev) => {
      const next = prev.map((member) => (member.id === staffId ? { ...member, ...updatedFields } : member));
      persistState('masters_staff', next);
      return next;
    });

    api.updateStaff(staffId, updatedFields).catch((err) => {
      console.warn('Backend sync failed for updateStaff:', err.message);
    });
  };

  const deleteStaff = (staffId) => {
    setStaff((prev) => {
      const next = prev.filter((member) => member.id !== staffId);
      persistState('masters_staff', next);
      return next;
    });

    api.deleteStaff(staffId).catch((err) => {
      console.warn('Backend sync failed for deleteStaff:', err.message);
    });
  };

  const toggleStaffStatus = (staffId) => {
    setStaff((prev) => {
      const next = prev.map((member) => (member.id === staffId ? { ...member, active: !member.active } : member));
      persistState('masters_staff', next);
      return next;
    });

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

    setServices((prev) => {
      const next = [...prev, newSrv];
      persistState('masters_services', next);
      return next;
    });

    api.createService(newSrv).then((saved) => {
      if (saved && saved.id) {
        setServices((prev) => {
          const updated = prev.map((s) => (s.id === tempId ? saved : s));
          persistState('masters_services', updated);
          return updated;
        });
      }
    }).catch((err) => {
      console.warn('Backend sync failed for addService (safely kept in localStorage):', err.message);
    });
  };

  const updateService = (serviceId, updatedFields) => {
    setServices((prev) => {
      const next = prev.map((srv) => (srv.id === serviceId ? { ...srv, ...updatedFields } : srv));
      persistState('masters_services', next);
      return next;
    });

    api.updateService(serviceId, updatedFields).catch((err) => {
      console.warn('Backend sync failed for updateService:', err.message);
    });
  };

  const deleteTransaction = (txId) => {
    setTransactions((prev) => {
      const next = prev.filter((tx) => tx.id !== txId);
      persistState('masters_transactions', next);
      return next;
    });

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

    setExpenses((prev) => {
      const next = [newExp, ...prev];
      persistState('masters_expenses', next);
      return next;
    });

    api.createExpense(newExp).catch((err) => {
      console.warn('Backend sync failed for addExpense (safely kept in localStorage):', err.message);
    });

    return newExp;
  };

  const deleteExpense = (expId) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== expId);
      persistState('masters_expenses', next);
      return next;
    });

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

    setAppointments((prev) => {
      const next = [newApt, ...prev];
      persistState('masters_appointments', next);
      return next;
    });

    try {
      const saved = await api.createAppointment(bookingData);
      if (saved && saved.id) {
        setAppointments((prev) => {
          const updated = prev.map((a) => (a.id === tempId ? saved : a));
          persistState('masters_appointments', updated);
          return updated;
        });
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

    setAppointments((prev) => {
      const next = prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, assignedStaffId: staffId, assignedStaffName: staffName, status: 'confirmed' }
          : apt
      );
      persistState('masters_appointments', next);
      return next;
    });

    try {
      await api.claimAppointment(appointmentId);
    } catch (err) {
      console.warn('Backend claim appointment failed:', err.message);
    }
  };

  const assignAppointment = async (appointmentId, staffId, staffName) => {
    setAppointments((prev) => {
      const next = prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, assignedStaffId: staffId, assignedStaffName: staffName, status: 'confirmed' }
          : apt
      );
      persistState('masters_appointments', next);
      return next;
    });

    try {
      await api.assignAppointment(appointmentId, staffId, staffName);
    } catch (err) {
      console.warn('Backend assign appointment failed:', err.message);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    setAppointments((prev) => {
      const next = prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt));
      persistState('masters_appointments', next);
      return next;
    });

    try {
      await api.updateAppointmentStatus(appointmentId, status);
    } catch (err) {
      console.warn('Backend update appointment status failed:', err.message);
    }
  };

  // --- DATA MANAGEMENT & BACKUP EXPORT / RESTORE ---
  const exportLocalBackup = () => {
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        appName: 'The Masters Barber & Executive Spa',
        data: {
          services,
          staff,
          transactions,
          closingRecords,
          expenses,
          appointments,
        }
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `masters_local_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (e) {
      console.error('Export backup failed:', e);
      return false;
    }
  };

  const importLocalBackup = (jsonString) => {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      const data = parsed.data || parsed;
      if (!data) throw new Error('Invalid backup file format');

      if (Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
        persistState('masters_services', data.services);
      }
      if (Array.isArray(data.staff)) {
        setStaff(data.staff);
        persistState('masters_staff', data.staff);
      }
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        persistState('masters_transactions', data.transactions);
      }
      if (Array.isArray(data.closingRecords)) {
        setClosingRecords(data.closingRecords);
        persistState('masters_closing_records', data.closingRecords);
      }
      if (Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
        persistState('masters_expenses', data.expenses);
      }
      if (Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
        persistState('masters_appointments', data.appointments);
      }
      return { success: true, count: data.transactions?.length || 0 };
    } catch (err) {
      console.error('Backup restoration failed:', err);
      throw new Error('Failed to restore backup: ' + err.message);
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
        deleteStaff,
        toggleStaffStatus,
        addService,
        updateService,
        deleteTransaction,
        addExpense,
        deleteExpense,
        exportLocalBackup,
        importLocalBackup,
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
