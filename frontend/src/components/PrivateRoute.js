/**
 * PrivateRoute Component
 * ----------------------
 * A wrapper component that protects routes from unauthenticated access.
 * If the user is not logged in (no valid token in AuthContext), they are
 * automatically redirected to the /login page.
 *
 * Usage in App.js:
 *   <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the protected child component
  return children;
};

export default PrivateRoute;
