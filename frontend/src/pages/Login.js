/**
 * Login Page Component
 * --------------------
 * Provides a login form for user authentication.
 * Features:
 *   - Email and password input fields with client-side validation
 *   - Error messages displayed below each invalid field
 *   - Global error message for failed login attempts (e.g. invalid credentials)
 *   - Loading state while the API call is in progress
 *   - On successful login, stores JWT token and redirects to Dashboard
 *   - Link to the Signup page for new users
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form field state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Validation error messages keyed by field name
  const [errors, setErrors] = useState({});

  // Global error message (e.g. "Invalid credentials")
  const [apiError, setApiError] = useState('');

  // Loading indicator for async operations
  const [loading, setLoading] = useState(false);

  /**
   * Validates form fields and returns an errors object.
   * Empty object means all fields are valid.
   */
  const validate = () => {
    const newErrors = {};

    // Username validation: must be present
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation: must be present and at least 6 characters
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  /**
   * Handles changes to form input fields and clears field-level errors.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific field error when the user starts correcting it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  /**
   * Handles form submission: validates, calls API, and processes result.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // POST login credentials to the authentication endpoint
      const response = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password,
      });

      // Extract token and username from the response
      const { token, username } = response.data;

      // Persist auth state and redirect to the dashboard
      login(token, { username });
      navigate('/dashboard');
    } catch (error) {
      // Display a meaningful error message from the API or a fallback
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Invalid email or password');
      } else {
        setApiError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fills in the demo credentials and submits the login form.
   * Allows the examiner to access the app with one click.
   */
  const handleDemoLogin = async () => {
    setFormData({ username: 'examiner', password: 'PlantCare2024' });
    setLoading(true);
    setApiError('');
    try {
      const response = await api.post('/auth/login', {
        username: 'examiner',
        password: 'PlantCare2024',
      });
      const { token, username } = response.data;
      login(token, { username });
      navigate('/dashboard');
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Demo login failed.');
      } else {
        setApiError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">PlantCare Monitor</h1>
          <p className="login-subtitle">Automated Plant Care Monitoring System</p>
          <p className="login-module">MSc Cloud DevOpsSec — National College of Ireland</p>
        </div>

        {/* Demo Credentials Box for Examiner Access */}
        <div className="demo-credentials">
          <p className="demo-title">Examiner Access</p>
          <p className="demo-info">Username: <strong>examiner</strong></p>
          <p className="demo-info">Password: <strong>PlantCare2024</strong></p>
          <button
            type="button"
            className="demo-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login as Examiner'}
          </button>
        </div>

        {/* Global API error message */}
        {apiError && <div className="error-banner">{apiError}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Link to Signup */}
        <p className="login-footer">
          Don't have an account? <Link to="/signup" className="link">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
