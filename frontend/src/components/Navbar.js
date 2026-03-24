/**
 * Navbar Component
 * ----------------
 * Responsive top navigation bar displayed on every authenticated page.
 * Features:
 *   - Application title / brand link
 *   - Navigation links to Dashboard and Add Plant pages
 *   - Displays the logged-in user's username
 *   - Logout button that clears the session
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle logout: clear auth state and redirect to login page.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Only render the navbar when the user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      {/* Brand / Logo */}
      <div className="navbar-brand">
        <Link to="/dashboard" className="navbar-logo">
          PlantCare Monitor
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/add-plant" className="nav-link">Add Plant</Link>
      </div>

      {/* User Info & Logout */}
      <div className="navbar-user">
        <span className="navbar-username">Hello, {user?.username || 'User'}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
