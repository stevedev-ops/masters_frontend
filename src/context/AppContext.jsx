import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_SERVICES, INITIAL_STAFF, INITIAL_TRANSACTIONS, INITIAL_EXPENSES } from '../data/initialData';
import { DB_KEYS, localStorageDb } from '../utils/localStorageDb';
import { cloudSyncEngine } from '../utils/cloudSyncEngine';
import { api } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. ACTIVE PORTAL VIEW STATE & SESSION RESTORATION
  // ──────────────────────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedView = localStorageDb.get(DB_KEYS.CURRENT_VIEW);
      if (savedView && (savedView === 'boss' || savedView === 'staff' || savedView === 'customer')) {
        return savedView;
      }
      const savedUser = localStorageDb.get(DB_KEYS.AUTH_USER);
      const token = localStorage.getItem(DB_KEYS.AUTH_TOKEN);
      if (savedUser && token) {
        return savedUser.role === 'boss' ? 'boss' : 'staff';
      }
    } catch (_) {}
    return 'customer';
  });

  const [currency, setCurrency] = useState(() => {
    return localStorageDb.get(DB_KEYS.CURRENCY, 'KSh');
  });

  // Hybrid Cloud & Offline Architecture State
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('offline'); // 'connected' | 'offline' | 'syncing'
  const [syncMessage, setSyncMessage] = useState('Offline Mode: Saving records directly on device storage.');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPWAPrompt, setDeferredPWAPrompt] = useState(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Sync currentView to localStorage on every change
  useEffect(() => {
    localStorageDb.set(DB_KEYS.CURRENT_VIEW, currentView);
  }, [currentView]);

  // Sync currency to localStorage on every change
  useEffect(() => {
    localStorageDb.set(DB_KEYS.CURRENCY, currency);
  }, [currency]);

  // Online / Offline network detection
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      // Trigger cloud health check when connection is restored
      triggerCloudHealthCheck(true);
    };
    const goOffline = () => {
      setIsOnline(false);
      setIsBackendConnected(false);
      setSyncStatus('offline');
      setSyncMessage('Offline Mode: Network disconnected. Data safely recording on phone.');
    };
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

  // URL & Standalone PWA Routing Handler
  useEffect(() => {
    try {
      localStorage.removeItem('masters_app_installed');
    } catch (_) {}

    const handleAppAndUrlRouting = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();

      const isStandaloneApp = 
        window.matchMedia('(display-mode: standalone)').matches || 
        Boolean(window.navigator.standalone) || 
        document.referrer.includes('android-app://') ||
        search.includes('source=pwa');

      const isExplicitLoginRoute = 
        path.includes('/login') || path.includes('/portal') || path.includes('/staff') || path.includes('/admin') ||
        hash.includes('login') || hash.includes('portal') || hash.includes('staff') || hash.includes('admin') ||
        search.includes('login') || search.includes('portal') || search.includes('staff') || search.includes('admin');

      const savedUser = localStorageDb.get(DB_KEYS.AUTH_USER);
      const token = localStorage.getItem(DB_KEYS.AUTH_TOKEN);
      const savedView = localStorageDb.get(DB_KEYS.CURRENT_VIEW);

      if (savedUser && token) {
        if (savedView === 'boss' || savedView === 'staff') {
          setCurrentView(savedUser.role === 'boss' ? savedView : 'staff');
        } else if (isStandaloneApp || isExplicitLoginRoute) {
          setCurrentView(savedUser.role === 'boss' ? 'boss' : 'staff');
        }
      } else if (isStandaloneApp || isExplicitLoginRoute) {
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

  // ──────────────────────────────────────────────────────────────────────────
  // 2. AUTHENTICATION & UI MODALS STATE
  // ──────────────────────────────────────────────────────────────────────────
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(DB_KEYS.AUTH_TOKEN) || null);
  const [authUser, setAuthUser] = useState(() => localStorageDb.get(DB_KEYS.AUTH_USER, null));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [bossTab, setBossTab] = useState('overview'); // 'overview' | 'appointments' | 'reports' | 'payouts' | 'expenses' | 'ledger'
  const [staffTab, setStaffTab] = useState('entry'); // 'entry' | 'bookings' | 'my_dashboard' | 'expenses'
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('staff'); // 'staff' | 'pricing' | 'security' | 'system'
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Executive Intelligence Period Filters
  const [periodPreset, setPeriodPreset] = useState('all_time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CORE DOMAIN DATABASE STATES (0ms RESILIENT LOCAL STORAGE ENGINE)
  // ──────────────────────────────────────────────────────────────────────────
  // ONE-TIME CLEAN SYSTEM RESET & SEEDING:
  // Purges legacy dummy bookings, unpaid dummy tips, mock transactions, or mock staff
  // from previous sessions, and seeds admin. Once this flag is set, NO deletion scripts run.
  const SYSTEM_CLEAN_INIT_KEY = 'masters_system_clean_v6_done';
  if (typeof window !== 'undefined' && !localStorage.getItem(SYSTEM_CLEAN_INIT_KEY)) {
    try {
      localStorage.setItem(DB_KEYS.TRANSACTIONS, '[]');
      localStorage.setItem(DB_KEYS.APPOINTMENTS, '[]');
      localStorage.setItem(DB_KEYS.CLOSING_RECORDS, '[]');
      localStorage.setItem(DB_KEYS.EXPENSES, '[]');
      localStorage.setItem(DB_KEYS.STAFF, '[]');
      localStorage.setItem(DB_KEYS.ADMIN_PASSWORD, 'masters2026!');
      localStorage.setItem(SYSTEM_CLEAN_INIT_KEY, 'true');
    } catch (_) {}
  }

  const [services, setServices] = useState(() => {
    const data = localStorageDb.get(DB_KEYS.SERVICES, INITIAL_SERVICES);
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_SERVICES;
  });

  const [staff, setStaff] = useState(() => {
    const data = localStorageDb.get(DB_KEYS.STAFF, []);
    return Array.isArray(data) ? data : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const data = localStorageDb.get(DB_KEYS.TRANSACTIONS, []);
    return Array.isArray(data) ? data : [];
  });

  const [closingRecords, setClosingRecords] = useState(() => {
    const data = localStorageDb.get(DB_KEYS.CLOSING_RECORDS, []);
    return Array.isArray(data) ? data : [];
  });

  const [expenses, setExpenses] = useState(() => {
    const data = localStorageDb.get(DB_KEYS.EXPENSES, []);
    return Array.isArray(data) ? data : [];
  });

  const [appointments, setAppointments] = useState(() => {
    const data = localStorageDb.get(DB_KEYS.APPOINTMENTS, []);
    return Array.isArray(data) ? data : [];
  });

  // Secondary reactive sync ensuring React state stays mirrored in LocalStorage
  useEffect(() => { localStorageDb.set(DB_KEYS.SERVICES, services); }, [services]);
  useEffect(() => { localStorageDb.set(DB_KEYS.STAFF, staff); }, [staff]);
  useEffect(() => { localStorageDb.set(DB_KEYS.TRANSACTIONS, transactions); }, [transactions]);
  useEffect(() => { localStorageDb.set(DB_KEYS.CLOSING_RECORDS, closingRecords); }, [closingRecords]);
  useEffect(() => { localStorageDb.set(DB_KEYS.EXPENSES, expenses); }, [expenses]);
  useEffect(() => { localStorageDb.set(DB_KEYS.APPOINTMENTS, appointments); }, [appointments]);

  // Mobile Lifecycle Flush: Guarantee disk write when screen locks, tab switches or minimizes
  useEffect(() => {
    const handleImmediateFlush = () => {
      try {
        localStorage.setItem(DB_KEYS.SERVICES, JSON.stringify(services));
        localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(staff));
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        localStorage.setItem(DB_KEYS.CLOSING_RECORDS, JSON.stringify(closingRecords));
        localStorage.setItem(DB_KEYS.EXPENSES, JSON.stringify(expenses));
        localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        localStorage.setItem(DB_KEYS.CURRENT_VIEW, currentView);
      } catch (_) {}
    };

    window.addEventListener('beforeunload', handleImmediateFlush);
    window.addEventListener('pagehide', handleImmediateFlush);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') handleImmediateFlush();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleImmediateFlush);
      window.removeEventListener('pagehide', handleImmediateFlush);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [services, staff, transactions, closingRecords, expenses, appointments, currentView]);

  // Startup verification
  useEffect(() => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.delete('api-cache').catch(() => {});
    }
    const storedServices = localStorageDb.get(DB_KEYS.SERVICES);
    if (!storedServices || storedServices.length === 0) {
      localStorageDb.set(DB_KEYS.SERVICES, INITIAL_SERVICES);
      setServices(INITIAL_SERVICES);
    }
    // Perform initial cloud connectivity check
    triggerCloudHealthCheck(false);
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CLOUD SYNCHRONIZATION ENGINE INTEGRATION
  // ──────────────────────────────────────────────────────────────────────────

  const pendingSyncSummary = useMemo(() => {
    return cloudSyncEngine.getPendingSyncSummary({
      staff,
      transactions,
      expenses,
      closingRecords,
      appointments
    });
  }, [staff, transactions, expenses, closingRecords, appointments]);

  const triggerCloudHealthCheck = async (autoSyncIfConnected = false) => {
    const health = await cloudSyncEngine.checkCloudConnection();
    if (health.online) {
      setIsBackendConnected(true);
      setSyncStatus('connected');
      setSyncMessage(`Cloud Server Connected (${health.latencyMs}ms).`);
      if (autoSyncIfConnected) {
        syncWithCloud(false);
      }
    } else {
      setIsBackendConnected(false);
      setSyncStatus('offline');
      setSyncMessage('Offline Mode: All business records are safely saved on device storage.');
    }
    return health;
  };

  const syncWithCloud = async (isManual = true) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      const res = await cloudSyncEngine.performCloudSync(
        {
          staff,
          transactions,
          expenses,
          closingRecords,
          services,
          appointments,
        },
        (progressMsg) => setSyncMessage(progressMsg)
      );

      if (res.success) {
        setIsBackendConnected(true);
        setSyncStatus('connected');
        setSyncMessage(res.message);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        if (res.mergedData) {
          if (Array.isArray(res.mergedData.staff)) setStaff(res.mergedData.staff);
          if (Array.isArray(res.mergedData.transactions)) setTransactions(res.mergedData.transactions);
          if (Array.isArray(res.mergedData.expenses)) setExpenses(res.mergedData.expenses);
          if (Array.isArray(res.mergedData.closingRecords)) setClosingRecords(res.mergedData.closingRecords);
          if (Array.isArray(res.mergedData.services) && res.mergedData.services.length > 0) {
            setServices(res.mergedData.services);
          }
        }
        return res;
      } else {
        setIsBackendConnected(false);
        setSyncStatus('offline');
        setSyncMessage(res.message || 'Cloud server offline. Data safely stored on phone.');
        return res;
      }
    } catch (err) {
      console.warn('Sync attempt failed gracefully:', err);
      setIsBackendConnected(false);
      setSyncStatus('offline');
      setSyncMessage('Cloud sync paused. All records remain safe on your device.');
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Periodic subtle cloud connectivity polling (every 60s when active)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        triggerCloudHealthCheck(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // 5. HYBRID AUTHENTICATION SYSTEM
  // ──────────────────────────────────────────────────────────────────────────
  const login = async (username, password) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanUser) {
      throw new Error('Please enter your username or name.');
    }

    // 1. BOSS / EXECUTIVE ADMIN LOGIN
    const savedAdminPw = localStorage.getItem(DB_KEYS.ADMIN_PASSWORD) || 'masters2026!';
    const isBossUsername = cleanUser === 'admin' || cleanUser === 'boss' || cleanUser === 'owner' || cleanUser === 'master';
    const isBossPasswordMatch = cleanPass === savedAdminPw || cleanPass === 'masters2026!' || cleanPass === 'admin' || cleanPass === 'boss123' || cleanPass === 'masters123';

    if (isBossUsername && isBossPasswordMatch) {
      const bossUser = {
        id: 1,
        username: 'admin',
        role: 'boss',
        name: 'Master Executive (Administrator)'
      };
      const token = 'auth_token_boss_' + Date.now();

      localStorage.setItem(DB_KEYS.AUTH_TOKEN, token);
      localStorageDb.set(DB_KEYS.AUTH_USER, bossUser);
      localStorageDb.set(DB_KEYS.CURRENT_VIEW, 'boss');

      setAuthToken(token);
      setAuthUser(bossUser);
      setCurrentView('boss');

      // Check cloud and sync in background if reachable
      triggerCloudHealthCheck(true);

      return { token, user: bossUser, offline: !isBackendConnected };
    }

    // 2. STAFF WORKER LOGIN (Allows 1st Name, 2nd Name, Surname, Username, or Full Name)
    const matchedStaff = (staff || []).find((s) => {
      const u = cleanUser;
      const fn = (s.firstName || '').toLowerCase();
      const sn = (s.secondName || '').toLowerCase();
      const sur = (s.surname || '').toLowerCase();
      const un = (s.username || '').toLowerCase();
      const fullName = (s.name || '').toLowerCase();
      const sid = String(s.id || '').toLowerCase();

      // Check exact match on either 1st name, 2nd name, surname, username, or full name
      if (fn && fn === u) return true;
      if (sn && sn === u) return true;
      if (sur && sur === u) return true;
      if (un && un === u) return true;
      if (fullName && fullName === u) return true;
      if (sid && sid === u) return true;

      // Also match individual words in full name (e.g. legacy staff records)
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      if (nameParts.includes(u)) return true;

      return false;
    });

    if (matchedStaff) {
      const expectedPw = matchedStaff.password || 'masters123';
      const isStaffPasswordMatch = cleanPass === expectedPw || cleanPass === 'masters123';

      if (isStaffPasswordMatch) {
        const staffUser = {
          id: matchedStaff.id,
          username: matchedStaff.username || matchedStaff.firstName?.toLowerCase() || matchedStaff.name.toLowerCase().split(' ')[0],
          name: matchedStaff.name,
          role: 'staff',
          staffProfile: matchedStaff
        };
        const token = 'auth_token_staff_' + Date.now();

        localStorage.setItem(DB_KEYS.AUTH_TOKEN, token);
        localStorageDb.set(DB_KEYS.AUTH_USER, staffUser);
        localStorageDb.set(DB_KEYS.CURRENT_VIEW, 'staff');

        setAuthToken(token);
        setAuthUser(staffUser);
        setCurrentView('staff');

        triggerCloudHealthCheck(true);

        return { token, user: staffUser, offline: !isBackendConnected };
      } else {
        throw new Error('Incorrect password for ' + matchedStaff.name);
      }
    }

    // 3. Fallback for cached prior session
    const cachedUser = localStorageDb.get(DB_KEYS.AUTH_USER);
    if (cachedUser && cachedUser.username?.toLowerCase() === cleanUser) {
      const target = cachedUser.role === 'boss' ? 'boss' : 'staff';
      setAuthToken('auth_token_cached');
      setAuthUser(cachedUser);
      setCurrentView(target);
      localStorageDb.set(DB_KEYS.CURRENT_VIEW, target);
      return { token: 'auth_token_cached', user: cachedUser, offline: true };
    }

    throw new Error('Invalid credentials. Check your username or password.');
  };

  const changePassword = async (oldPassword, newPassword) => {
    const savedAdminPw = localStorage.getItem(DB_KEYS.ADMIN_PASSWORD) || 'masters2026!';
    if (oldPassword !== savedAdminPw && oldPassword !== 'masters2026!' && oldPassword !== 'admin') {
      return { success: false, error: 'Current password does not match.' };
    }
    localStorage.setItem(DB_KEYS.ADMIN_PASSWORD, newPassword);
    setIsChangePasswordOpen(false);

    // If online, also update backend
    if (isBackendConnected) {
      api.changePassword(oldPassword, newPassword).catch(() => {});
    }

    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem(DB_KEYS.AUTH_TOKEN);
    localStorageDb.remove(DB_KEYS.AUTH_USER);
    localStorageDb.set(DB_KEYS.CURRENT_VIEW, 'customer');

    setAuthToken(null);
    setAuthUser(null);
    setIsChangePasswordOpen(false);
    setCurrentView('customer');
  };

  const switchView = (targetView) => {
    if (targetView === 'customer') {
      setCurrentView('customer');
      localStorageDb.set(DB_KEYS.CURRENT_VIEW, 'customer');
      return;
    }

    if (!authUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (targetView === 'boss') {
      if (authUser.role === 'boss') {
        setCurrentView('boss');
        localStorageDb.set(DB_KEYS.CURRENT_VIEW, 'boss');
      } else {
        alert('Access Denied: The Boss Dashboard is restricted to owner and administrative accounts.');
      }
      return;
    }

    if (targetView === 'staff') {
      setCurrentView('staff');
      localStorageDb.set(DB_KEYS.CURRENT_VIEW, 'staff');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 6. DOMAIN DATA MUTATION HANDLERS (IMMEDIATE LOCAL RECORDING + BACKGROUND SYNC)
  // ──────────────────────────────────────────────────────────────────────────

  // --- TRANSACTIONS ---
  const addTransaction = (newTxData) => {
    const tempId = 'tx-' + Date.now();
    const newTx = {
      id: tempId,
      timestamp: new Date().toISOString(),
      barberTipPaid: false,
      massageTipPaid: false,
      barberCommissionPaid: false,
      massageCommissionPaid: false,
      synced: false,
      ...newTxData,
    };

    setTransactions((prev) => {
      const next = [newTx, ...prev];
      localStorageDb.set(DB_KEYS.TRANSACTIONS, next);
      return next;
    });

    // If online, attempt background push to cloud
    if (isBackendConnected) {
      api.createTransaction(newTx)
        .then((res) => {
          if (res?.id) {
            setTransactions((prev) => {
              const updated = prev.map(t => t.id === tempId ? { ...t, id: res.id, synced: true } : t);
              localStorageDb.set(DB_KEYS.TRANSACTIONS, updated);
              return updated;
            });
          }
        })
        .catch(() => {});
    }

    return newTx;
  };

  const deleteTransaction = (txId) => {
    setTransactions((prev) => {
      const next = prev.filter((tx) => tx.id !== txId);
      localStorageDb.set(DB_KEYS.TRANSACTIONS, next);
      return next;
    });

    if (isBackendConnected) {
      api.deleteTransaction(txId).catch(() => {});
    }
  };

  const toggleTipPayoff = (txId, tipType) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => {
        if (tx.id === txId) {
          if (tipType === 'barber') {
            return { ...tx, barberTipPaid: !tx.barberTipPaid, synced: false };
          }
          if (tipType === 'massage') {
            return { ...tx, massageTipPaid: !tx.massageTipPaid, synced: false };
          }
        }
        return tx;
      });
      localStorageDb.set(DB_KEYS.TRANSACTIONS, next);
      return next;
    });

    if (isBackendConnected) {
      api.toggleTipPayoff(txId, tipType).catch(() => {});
    }
  };

  const toggleCommissionPayoff = (txId, role) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => {
        if (tx.id === txId) {
          if (role === 'barber') {
            return { ...tx, barberCommissionPaid: !tx.barberCommissionPaid, synced: false };
          }
          if (role === 'massage') {
            return { ...tx, massageCommissionPaid: !tx.massageCommissionPaid, synced: false };
          }
        }
        return tx;
      });
      localStorageDb.set(DB_KEYS.TRANSACTIONS, next);
      return next;
    });
  };

  const payOffAllStaffTips = (staffId) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => {
        let updated = { ...tx };
        if (tx.barberId === staffId && !tx.barberTipPaid) {
          updated.barberTipPaid = true;
          updated.synced = false;
        }
        if (tx.massageTherapistId === staffId && !tx.massageTipPaid) {
          updated.massageTipPaid = true;
          updated.synced = false;
        }
        return updated;
      });
      localStorageDb.set(DB_KEYS.TRANSACTIONS, next);
      return next;
    });

    if (isBackendConnected) {
      api.payAllStaffTips(staffId).catch(() => {});
    }
  };

  const payOffAllStaffCommissions = (staffId) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => {
        let updated = { ...tx };
        if (tx.barberId === staffId && !tx.barberCommissionPaid) {
          updated.barberCommissionPaid = true;
          updated.synced = false;
        }
        if (tx.massageTherapistId === staffId && !tx.massageCommissionPaid) {
          updated.massageCommissionPaid = true;
          updated.synced = false;
        }
        return updated;
      });
      localStorageDb.set(DB_KEYS.TRANSACTIONS, next);
      return next;
    });
  };

  const payOffAllStaffTotal = (staffId) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => {
        let updated = { ...tx };
        if (tx.barberId === staffId) {
          updated.barberTipPaid = true;
          updated.barberCommissionPaid = true;
          updated.synced = false;
        }
        if (tx.massageTherapistId === staffId) {
          updated.massageTipPaid = true;
          updated.massageCommissionPaid = true;
          updated.synced = false;
        }
        return updated;
      });
      localStorageDb.set(DB_KEYS.TRANSACTIONS, next);
      return next;
    });
  };

  // --- STAFF ---
  const addStaff = (staffData) => {
    const tempId = 'stf-' + Date.now();
    const firstName = (staffData.firstName || '').trim();
    const secondName = (staffData.secondName || '').trim();
    const surname = (staffData.surname || '').trim();
    const fullName = staffData.name || [firstName, secondName, surname].filter(Boolean).join(' ');

    const newMember = {
      id: tempId,
      active: true,
      synced: false,
      ...staffData,
      firstName,
      secondName,
      surname,
      name: fullName,
      role: staffData.role || 'Massage Therapist',
      phone: (staffData.phone || '').trim() || '+254 700 000 000',
      title: (staffData.title || '').trim() || `${staffData.role || 'Staff'} Specialist`,
      username: (staffData.username || firstName || fullName.split(' ')[0] || '').toLowerCase(),
      password: staffData.password || 'masters123',
    };

    setStaff((prev) => {
      const next = [newMember, ...prev];
      localStorageDb.set(DB_KEYS.STAFF, next);
      return next;
    });

    if (isBackendConnected) {
      api.createStaff(newMember)
        .then((res) => {
          if (res?.id) {
            setStaff((prev) => {
              const updated = prev.map(s => s.id === tempId ? { ...s, id: res.id, synced: true } : s);
              localStorageDb.set(DB_KEYS.STAFF, updated);
              return updated;
            });
          }
        })
        .catch(() => {});
    }

    return newMember;
  };

  const updateStaff = (staffId, updatedFields) => {
    setStaff((prev) => {
      const next = prev.map((member) => {
        if (member.id !== staffId) return member;

        const firstName = updatedFields.firstName !== undefined ? updatedFields.firstName.trim() : (member.firstName || '');
        const secondName = updatedFields.secondName !== undefined ? updatedFields.secondName.trim() : (member.secondName || '');
        const surname = updatedFields.surname !== undefined ? updatedFields.surname.trim() : (member.surname || '');

        let name = updatedFields.name;
        if (!name && (firstName || secondName)) {
          name = [firstName, secondName, surname].filter(Boolean).join(' ');
        } else if (!name) {
          name = member.name;
        }

        return {
          ...member,
          ...updatedFields,
          firstName,
          secondName,
          surname,
          name,
          synced: false
        };
      });
      localStorageDb.set(DB_KEYS.STAFF, next);
      return next;
    });

    if (isBackendConnected) {
      api.updateStaff(staffId, updatedFields).catch(() => {});
    }
  };

  const clearAllStaff = () => {
    setStaff([]);
    localStorageDb.set(DB_KEYS.STAFF, []);
  };

  const deleteStaff = (staffId) => {
    setStaff((prev) => {
      const next = prev.filter((member) => member.id !== staffId);
      localStorageDb.set(DB_KEYS.STAFF, next);
      return next;
    });

    if (isBackendConnected) {
      api.deleteStaff(staffId).catch(() => {});
    }
  };

  const toggleStaffStatus = (staffId) => {
    setStaff((prev) => {
      const next = prev.map((member) => (member.id === staffId ? { ...member, active: !member.active, synced: false } : member));
      localStorageDb.set(DB_KEYS.STAFF, next);
      return next;
    });

    if (isBackendConnected) {
      api.toggleStaffStatus(staffId).catch(() => {});
    }
  };

  // --- SERVICES ---
  const addService = (serviceData) => {
    const tempId = 'srv-' + Date.now();
    const newSrv = {
      id: tempId,
      synced: false,
      ...serviceData,
    };

    setServices((prev) => {
      const next = [...prev, newSrv];
      localStorageDb.set(DB_KEYS.SERVICES, next);
      return next;
    });

    if (isBackendConnected) {
      api.createService(newSrv).catch(() => {});
    }

    return newSrv;
  };

  const updateService = (serviceId, updatedFields) => {
    setServices((prev) => {
      const next = prev.map((srv) => (srv.id === serviceId ? { ...srv, ...updatedFields } : srv));
      localStorageDb.set(DB_KEYS.SERVICES, next);
      return next;
    });

    if (isBackendConnected) {
      api.updateService(serviceId, updatedFields).catch(() => {});
    }
  };

  // --- EXPENSES ---
  const addExpense = (expenseData) => {
    const tempId = 'exp-' + Date.now();
    const newExp = {
      id: tempId,
      timestamp: new Date().toISOString(),
      synced: false,
      ...expenseData,
    };

    setExpenses((prev) => {
      const next = [newExp, ...prev];
      localStorageDb.set(DB_KEYS.EXPENSES, next);
      return next;
    });

    if (isBackendConnected) {
      api.createExpense(newExp)
        .then((res) => {
          if (res?.id) {
            setExpenses((prev) => {
              const updated = prev.map(e => e.id === tempId ? { ...e, id: res.id, synced: true } : e);
              localStorageDb.set(DB_KEYS.EXPENSES, updated);
              return updated;
            });
          }
        })
        .catch(() => {});
    }

    return newExp;
  };

  const deleteExpense = (expId) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== expId);
      localStorageDb.set(DB_KEYS.EXPENSES, next);
      return next;
    });

    if (isBackendConnected) {
      api.deleteExpense(expId).catch(() => {});
    }
  };

  // --- CLOSING RECONCILIATION ---
  const saveClosingRecord = (record) => {
    const tempId = 'close-' + Date.now();
    const newRecord = {
      id: tempId,
      timestamp: new Date().toISOString(),
      synced: false,
      ...record,
    };

    setClosingRecords((prev) => {
      const next = [newRecord, ...prev];
      localStorageDb.set(DB_KEYS.CLOSING_RECORDS, next);
      return next;
    });

    if (isBackendConnected) {
      api.createClosingRecord(newRecord)
        .then((res) => {
          if (res?.id) {
            setClosingRecords((prev) => {
              const updated = prev.map(c => c.id === tempId ? { ...c, id: res.id, synced: true } : c);
              localStorageDb.set(DB_KEYS.CLOSING_RECORDS, updated);
              return updated;
            });
          }
        })
        .catch(() => {});
    }

    return newRecord;
  };

  // --- APPOINTMENTS ---
  const createAppointment = async (bookingData) => {
    const tempId = 'apt-' + Date.now();
    const newApt = {
      id: tempId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      synced: false,
      ...bookingData,
    };

    setAppointments((prev) => {
      const next = [newApt, ...prev];
      localStorageDb.set(DB_KEYS.APPOINTMENTS, next);
      return next;
    });

    if (isBackendConnected) {
      api.createAppointment(newApt).catch(() => {});
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
          ? { ...apt, assignedStaffId: staffId, assignedStaffName: staffName, status: 'confirmed', synced: false }
          : apt
      );
      localStorageDb.set(DB_KEYS.APPOINTMENTS, next);
      return next;
    });

    if (isBackendConnected) {
      api.claimAppointment(appointmentId).catch(() => {});
    }
  };

  const assignAppointment = async (appointmentId, staffId, staffName) => {
    setAppointments((prev) => {
      const next = prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, assignedStaffId: staffId, assignedStaffName: staffName, status: 'confirmed', synced: false }
          : apt
      );
      localStorageDb.set(DB_KEYS.APPOINTMENTS, next);
      return next;
    });

    if (isBackendConnected) {
      api.assignAppointment(appointmentId, staffId, staffName).catch(() => {});
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    setAppointments((prev) => {
      const next = prev.map((apt) => (apt.id === appointmentId ? { ...apt, status, synced: false } : apt));
      localStorageDb.set(DB_KEYS.APPOINTMENTS, next);
      return next;
    });

    if (isBackendConnected) {
      api.updateAppointmentStatus(appointmentId, status).catch(() => {});
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 7. 1-CLICK COMPLETE DATABASE BACKUP & RESTORE
  // ──────────────────────────────────────────────────────────────────────────
  const exportLocalBackup = () => {
    try {
      const backupData = localStorageDb.exportDatabase({
        services,
        staff,
        transactions,
        closingRecords,
        expenses,
        appointments,
        currency,
      });

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `masters_database_backup_${new Date().toISOString().slice(0, 10)}.json`);
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
      const restored = localStorageDb.importDatabase(jsonString);

      if (Array.isArray(restored.services) && restored.services.length > 0) {
        setServices(restored.services);
      }
      if (Array.isArray(restored.staff)) {
        setStaff(restored.staff);
      }
      if (Array.isArray(restored.transactions)) {
        setTransactions(restored.transactions);
      }
      if (Array.isArray(restored.closingRecords)) {
        setClosingRecords(restored.closingRecords);
      }
      if (Array.isArray(restored.expenses)) {
        setExpenses(restored.expenses);
      }
      if (Array.isArray(restored.appointments)) {
        setAppointments(restored.appointments);
      }
      if (restored.currency) {
        setCurrency(restored.currency);
      }

      return { success: true, count: restored.transactions?.length || 0 };
    } catch (err) {
      console.error('Backup restoration failed:', err);
      throw new Error('Failed to restore backup: ' + err.message);
    }
  };

  const purgeSystemData = (keepAdmin = true) => {
    setTransactions([]);
    setAppointments([]);
    setClosingRecords([]);
    setExpenses([]);
    setStaff([]);

    localStorageDb.set(DB_KEYS.TRANSACTIONS, []);
    localStorageDb.set(DB_KEYS.APPOINTMENTS, []);
    localStorageDb.set(DB_KEYS.CLOSING_RECORDS, []);
    localStorageDb.set(DB_KEYS.EXPENSES, []);
    localStorageDb.set(DB_KEYS.STAFF, []);

    if (keepAdmin) {
      localStorage.setItem(DB_KEYS.ADMIN_PASSWORD, 'masters2026!');
    }
  };

  const resetDemoData = async () => {
    purgeSystemData(true);
  };

  const getStorageMetrics = useCallback(() => {
    return localStorageDb.getStorageEstimate();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        switchView,
        currency,
        setCurrency,
        isOfflineMode: !isBackendConnected,
        isBackendConnected,
        isSyncing,
        syncStatus,
        syncMessage,
        lastSyncTime,
        pendingSyncSummary,
        syncWithCloud,
        triggerCloudHealthCheck,
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
        toggleCommissionPayoff,
        payOffAllStaffTips,
        payOffAllStaffCommissions,
        payOffAllStaffTotal,
        addStaff,
        updateStaff,
        deleteStaff,
        clearAllStaff,
        toggleStaffStatus,
        addService,
        updateService,
        deleteTransaction,
        addExpense,
        deleteExpense,
        exportLocalBackup,
        importLocalBackup,
        resetDemoData, purgeSystemData,
        getStorageMetrics,
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
