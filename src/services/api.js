const API = 'http://localhost:3001/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const request = async (url, opts = {}) => {
  const res = await fetch(`${API}${url}`, { ...opts, headers: { ...getHeaders(), ...opts.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  // Stats
  getStats: () => request('/stats'),
  // Students
  getStudents: () => request('/etudiants'),
  createStudent: (d) => request('/etudiants', { method: 'POST', body: JSON.stringify(d) }),
  updateStudent: (id, d) => request(`/etudiants/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteStudent: (id) => request(`/etudiants/${id}`, { method: 'DELETE' }),
  getStudentHistory: (id) => request(`/etudiants/${id}/historique`),
  // Lines
  getLines: () => request('/lignes'),
  getLine: (id) => request(`/lignes/${id}`),
  // Buses
  getBuses: () => request('/bus'),
  // Incidents
  getIncidents: () => request('/incidents'),
  // Trips
  getTrips: () => request('/trajets'),
  // Schedules
  getSchedules: () => request('/horaires'),
  // Stations
  getStations: () => request('/stations'),
};
