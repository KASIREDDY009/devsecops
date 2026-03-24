/**
 * Authentication Context
 * ----------------------
 * Provides global authentication state to the entire React component tree
 * using the Context API. Exposes:
 *   - user        : the currently logged-in user object (or null)
 *   - token       : the JWT token string (or null)
 *   - login()     : persists credentials after successful authentication
 *   - logout()    : clears credentials and redirects to login
 *   - isAuthenticated : convenience boolean
 *
 * Token and user data are persisted in localStorage so sessions survive
 * page refreshes.
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context object
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the application and supplies authentication state
 * to all child components via React Context.
 */
export const AuthProvider = ({ children }) => {
  // Initialise state from localStorage so the session persists across refreshes
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // prevents flash of login page

  // On mount, rehydrate auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Persist login credentials after a successful authentication response.
   * @param {string} jwtToken - The JWT token returned by the backend
   * @param {object} userData - The user profile object
   */
  const login = (jwtToken, userData) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  /**
   * Clear all authentication data and redirect to the login page.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Convenience flag for checking authentication status
  const isAuthenticated = !!token;

  // While rehydrating from localStorage, show nothing (avoids flicker)
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for consuming the AuthContext.
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
