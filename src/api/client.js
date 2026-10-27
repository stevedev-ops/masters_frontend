// Master Production Render API endpoint
// Configured directly in code so that NO Vercel dashboard environment variables are needed
const LIVE_RENDER_API_URL = 'https://masters-backend-4z8u.onrender.com/api';

// Verified Master Shop Terminal Token for the salon POS devices
export const SHOP_TERMINAL_TOKEN = '78e4b1af10991940c87bea1340a3bc9e9221c1a3';

const API_BASE = (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : LIVE_RENDER_API_URL
).replace(/\/+$/, '');

/**
 * Robust API fetch handler with salon terminal authentication fallback and generous mobile timeouts
 */
async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  
  let token = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('masters_auth_token') : null;
    // Discard invalid mock strings like 'auth_token_boss_...'
    if (raw && !raw.startsWith('auth_token_')) {
      token = raw;
    } else if (raw && raw.startsWith('auth_token_')) {
      localStorage.removeItem('masters_auth_token');
    }
  } catch (_) {}

  // Fallback to permanent shop terminal token if no valid personal token is present
  const effectiveToken = token || SHOP_TERMINAL_TOKEN;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(effectiveToken ? { 'Authorization': `Token ${effectiveToken}` } : {}),
    ...(options.headers || {}),
  };

  // Generous 20s timeout to accommodate mobile 3G/4G connections and Render wake-ups
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    // If 401 with a personal token, try one fallback with the shop terminal token
    if (res.status === 401 && token && token !== SHOP_TERMINAL_TOKEN) {
      console.warn('Personal token rejected; retrying with master salon terminal token...');
      try { localStorage.removeItem('masters_auth_token'); } catch (_) {}
      const retryHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${SHOP_TERMINAL_TOKEN}`,
        ...(options.headers || {}),
      };
      const retryRes = await fetch(url, { ...options, headers: retryHeaders });
      if (!retryRes.ok) {
        throw new Error(`API Error [${retryRes.status}]`);
      }
      if (retryRes.status === 204) return null;
      return await retryRes.json();
    }

    if (!res.ok) {
      let errMsg = `API Error [${res.status}]`;
      try {
        const errorJson = await res.json();
        errMsg = errorJson.error || errorJson.message || errorJson.detail || JSON.stringify(errorJson);
      } catch (_) {
        errMsg = await res.text();
      }
      throw new Error(errMsg);
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`API call failed for ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (username, password) => apiFetch('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  getMe: () => apiFetch('/auth/me/'),
  logout: () => apiFetch('/auth/logout/', { method: 'POST' }),
  changePassword: (oldPassword, newPassword) => apiFetch('/auth/change-password/', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  }),

  // Services
  getServices: () => apiFetch('/services/'),
  createService: (data) => apiFetch('/services/', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => apiFetch(`/services/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteService: (id) => apiFetch(`/services/${id}/`, { method: 'DELETE' }),

  // Staff
  getStaff: () => apiFetch('/staff/'),
  createStaff: (data) => apiFetch('/staff/', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id, data) => apiFetch(`/staff/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStaff: (id) => apiFetch(`/staff/${id}/`, { method: 'DELETE' }),
  toggleStaffStatus: (id) => apiFetch(`/staff/${id}/toggle_active/`, { method: 'POST' }),
  payAllStaffTips: (id) => apiFetch(`/staff/${id}/pay_all_tips/`, { method: 'POST' }),

  // Transactions
  getTransactions: () => apiFetch('/transactions/'),
  createTransaction: (data) => apiFetch('/transactions/', { method: 'POST', body: JSON.stringify(data) }),
  deleteTransaction: (id) => apiFetch(`/transactions/${id}/`, { method: 'DELETE' }),
  toggleTipPayoff: (id, tipType) => apiFetch(`/transactions/${id}/toggle_tip/`, {
    method: 'POST',
    body: JSON.stringify({ tipType }),
  }),

  // Closing records
  getClosingRecords: () => apiFetch('/closing_records/'),
  createClosingRecord: (data) => apiFetch('/closing_records/', { method: 'POST', body: JSON.stringify(data) }),

  // Expenses
  getExpenses: () => apiFetch('/expenses/'),
  createExpense: (data) => apiFetch('/expenses/', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id) => apiFetch(`/expenses/${id}/`, { method: 'DELETE' }),

  // Appointments
  getAppointments: () => apiFetch('/appointments/'),
  createAppointment: (data) => apiFetch('/appointments/', { method: 'POST', body: JSON.stringify(data) }),
  claimAppointment: (id) => apiFetch(`/appointments/${id}/claim/`, { method: 'POST' }),
  assignAppointment: (id, staffId, staffName) => apiFetch(`/appointments/${id}/assign/`, {
    method: 'POST',
    body: JSON.stringify({ staffId, staffName }),
  }),
  updateAppointmentStatus: (id, status) => apiFetch(`/appointments/${id}/update_status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  }),

  // Reset
  resetDemoData: () => apiFetch('/reset_demo/', { method: 'POST' }),
};
