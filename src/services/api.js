const API = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');

  return {
    'Content-Type': 'application/json',
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
};

const request = async (url, opts = {}) => {
  try {
    const res = await fetch(`${API}${url}`, {
      ...opts,
      headers: {
        ...getHeaders(),
        ...opts.headers,
      },
    });

    // Auth errors
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return;
    }

    // Safe JSON parsing
    const text = await res.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Invalid JSON response:', text);

      throw new Error('Server returned invalid JSON');
    }

    // Handle API errors
    if (!res.ok) {
      throw new Error(
        data.error ||
        data.message ||
        'Request failed'
      );
    }

    return data;

  } catch (err) {
    console.error(`API Error (${url}):`, err);
    throw err;
  }
};

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Stats
  getStats: () => request('/stats'),

  // Students
  getStudents: () => request('/etudiants'),

  createStudent: (d) =>
    request('/etudiants', {
      method: 'POST',
      body: JSON.stringify(d),
    }),

  updateStudent: (id, d) =>
    request(`/etudiants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(d),
    }),

  deleteStudent: (id) =>
    request(`/etudiants/${id}`, {
      method: 'DELETE',
    }),

  getStudentHistory: (id) =>
    request(`/etudiants/${id}/historique`),

  // Lines
  getLines: () => request('/lignes'),

  getLine: (id) =>
    request(`/lignes/${id}`),

  createLine: (d) =>
    request('/lignes', {
      method: 'POST',
      body: JSON.stringify(d),
    }),

  updateLine: (id, d) =>
    request(`/lignes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(d),
    }),

  // Buses
  getBuses: () => request('/bus'),

  createBus: (d) =>
    request('/bus', {
      method: 'POST',
      body: JSON.stringify(d),
    }),

  updateBus: (id, d) =>
    request(`/bus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(d),
    }),

  // Incidents
  getIncidents: () => request('/incidents'),

  // Trips
  getTrips: () => request('/trajets'),

  // Schedules
  getSchedules: () => request('/horaires'),

  // Stations
  getStations: () => request('/stations'),
};