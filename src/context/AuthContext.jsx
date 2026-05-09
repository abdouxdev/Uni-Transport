import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('auth_user');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));

  const login = async (email, password) => {
    const data = await api.login(email, password);
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
