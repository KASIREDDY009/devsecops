/**
 * Signup Page Component
 * ---------------------
 * Provides a registration form for new users.
 * Features:
 *   - Username, email, password, and confirm password fields
 *   - Comprehensive client-side validation:
 *       * Username: required, 3-50 characters
 *       * Email: required, valid format
 *       * Password: required, minimum 6 characters
 *       * Confirm password: must match password
 *   - Error messages displayed below each invalid field
 *   - API error handling (e.g. duplicate email)
 *   - Loading state during registration
 *   - On success, redirects to login page with a success message
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();

  // Form field state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation error messages keyed by field name
  const [errors, setErrors] = useState({});

  // Global error/success messages
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Validates all form fields and returns an errors object.
   * An empty object indicates all fields are valid.
   */
  const validate = () => {
    const newErrors = {};

    // Username: required, 3–50 characters
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 50) {
      newErrors.username = 'Username must be at most 50 characters';
    }

    // Email: required, valid format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password: required, minimum 6 characters
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password: must match the password field
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  /**
   * Handles changes to form input fields and clears field-level errors.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  /**
   * Handles form submission: validates, calls API, processes result.
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
      // POST registration data to the signup endpoint
      await api.post('/auth/signup', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Redirect to login page on successful registration
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (error) {
      // Display API error or generic fallback
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Registration failed. Please try again.');
      } else {
        setApiError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Header */}
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join PlantCare Monitor today</p>
        </div>

        {/* API error banner */}
        {apiError && <div className="error-banner">{apiError}</div>}

        {/* Signup Form */}
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
              placeholder="Choose a username (3-50 chars)"
              disabled={loading}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
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
              placeholder="Minimum 6 characters"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              disabled={loading}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Link to Login */}
        <p className="signup-footer">
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
