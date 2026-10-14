import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.js';
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  loginDemoUser,
  registerDemoUser,
  DEFAULT_DEMO_USER
} from '../utils/auth.js';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());

  useEffect(() => {
    const handleStorage = () => {
      setCurrentUserState(getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (email, password) => {
    const result = loginDemoUser(email, password);
    if (result.success) {
      setCurrentUserState(result.user);
    }
    return result;
  };

  const register = (userData) => {
    return registerDemoUser(userData);
  };

  const logout = () => {
    persistCurrentUser(null);
    setCurrentUserState(null);
  };

  const setUser = (user) => {
    persistCurrentUser(user);
    setCurrentUserState(user);
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login,
    register,
    logout,
    setCurrentUser: setUser,
    defaultDemoUser: DEFAULT_DEMO_USER
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
