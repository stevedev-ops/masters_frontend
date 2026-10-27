/**
 * LocalStorage Database Engine for The Masters Barber & Executive Spa
 * 100% Offline Architecture - Zero Postgres / Render Dependency
 */

export const DB_KEYS = {
  SERVICES: 'masters_services',
  STAFF: 'masters_staff',
  TRANSACTIONS: 'masters_transactions',
  CLOSING_RECORDS: 'masters_closing_records',
  EXPENSES: 'masters_expenses',
  APPOINTMENTS: 'masters_appointments',
  AUTH_USER: 'masters_auth_user',
  AUTH_TOKEN: 'masters_auth_token',
  CURRENT_VIEW: 'masters_current_view',
  ADMIN_PASSWORD: 'masters_admin_password',
  CURRENCY: 'masters_currency',
  BACKUP_SNAPSHOT: 'masters_last_snapshot',
};

export const localStorageDb = {
  /**
   * Safely retrieve and parse a JSON record from localStorage
   */
  get(key, fallback = null) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined || raw === '') return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[LocalStorageDb] Error reading key "${key}":`, err);
      return fallback;
    }
  },

  /**
   * Safely stringify and write data directly to localStorage
   */
  set(key, value) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[LocalStorageDb] Quota or write error for "${key}":`, err);
      return false;
    }
  },

  /**
   * Remove a key from localStorage
   */
  remove(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (_) {}
  },

  /**
   * Calculate exact storage utilization in LocalStorage
   */
  getStorageEstimate() {
    let totalBytes = 0;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          const v = localStorage.getItem(k);
          if (k && v) {
            totalBytes += (k.length + v.length) * 2; // UTF-16 representation
          }
        }
      }
    } catch (_) {}

    const kb = (totalBytes / 1024).toFixed(1);
    const mb = (totalBytes / (1024 * 1024)).toFixed(2);
    // Typical browser localStorage limit is 5MB (~5242880 bytes)
    const pct = Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024)) * 100));

    return {
      bytes: totalBytes,
      kb,
      mb,
      formatted: totalBytes > 1024 * 1024 ? `${mb} MB` : `${kb} KB`,
      percentageUsed: pct,
    };
  },

  /**
   * Export the complete state as a structured JSON object
   */
  exportDatabase(stateSnapshot = {}) {
    return {
      appName: 'The Masters Barber & Executive Spa',
      version: '2.0-offline',
      exportedAt: new Date().toISOString(),
      platform: 'Local Storage Offline Database',
      data: {
        services: stateSnapshot.services || this.get(DB_KEYS.SERVICES, []),
        staff: stateSnapshot.staff || this.get(DB_KEYS.STAFF, []),
        transactions: stateSnapshot.transactions || this.get(DB_KEYS.TRANSACTIONS, []),
        closingRecords: stateSnapshot.closingRecords || this.get(DB_KEYS.CLOSING_RECORDS, []),
        expenses: stateSnapshot.expenses || this.get(DB_KEYS.EXPENSES, []),
        appointments: stateSnapshot.appointments || this.get(DB_KEYS.APPOINTMENTS, []),
        currency: stateSnapshot.currency || this.get(DB_KEYS.CURRENCY, 'KSh'),
      }
    };
  },

  /**
   * Import a structured JSON database backup directly into LocalStorage
   */
  importDatabase(jsonData) {
    const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    const data = parsed.data || parsed;
    if (!data) throw new Error('Invalid backup file structure.');

    if (Array.isArray(data.services) && data.services.length > 0) {
      this.set(DB_KEYS.SERVICES, data.services);
    }
    if (Array.isArray(data.staff)) {
      this.set(DB_KEYS.STAFF, data.staff);
    }
    if (Array.isArray(data.transactions)) {
      this.set(DB_KEYS.TRANSACTIONS, data.transactions);
    }
    if (Array.isArray(data.closingRecords)) {
      this.set(DB_KEYS.CLOSING_RECORDS, data.closingRecords);
    }
    if (Array.isArray(data.expenses)) {
      this.set(DB_KEYS.EXPENSES, data.expenses);
    }
    if (Array.isArray(data.appointments)) {
      this.set(DB_KEYS.APPOINTMENTS, data.appointments);
    }
    if (data.currency) {
      this.set(DB_KEYS.CURRENCY, data.currency);
    }
    return data;
  }
};
