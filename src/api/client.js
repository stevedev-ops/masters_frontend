const API_BASE = (import.meta.env.VITE_API_URL || 'https://masters-backend-55ok.onrender.com/api').replace(/\/+$/, '');

async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  const token = localStorage.getItem('masters_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errMsg = `API Error [${res.status}]`;
      try {
        const errorJson = await res.json();
        errMsg = errorJson.error || errorJson.message || JSON.stringify(errorJson);
      } catch (_) {
        errMsg = await res.text();
      }
      throw new Error(errMsg);
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
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
