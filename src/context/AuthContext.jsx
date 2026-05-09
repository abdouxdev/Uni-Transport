import React, { createContext, useContext, useState, useEffect } from 'react';
const API = `http://${window.location.hostname}:3001/api`;
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('auth_user');
    return s ? JSON.parse(s) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setUser(data.user); setToken(data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    localStorage.setItem('auth_token', data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'admin' || user?.role === 'manager', isStudent: user?.role === 'student' }}>
      {children}
    </AuthContext.Provider>
  );
}
