/**
 * Axios Configuration Module
 * --------------------------
 * Configures a centralised Axios instance used throughout the application.
 * - Reads the API base URL from the REACT_APP_API_URL environment variable
 *   (defaults to http://localhost:8080/api for local development).
 * - Attaches the JWT bearer token (stored in localStorage) to every outgoing
 *   request via a request interceptor.
 * - Handles 401 (Unauthorized) responses globally by clearing the stored token
 *   and redirecting the user to the login page.
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import axios from 'axios';

// Base URL sourced from environment variable for flexible deployment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create a reusable Axios instance with the base URL pre-configured
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Attaches the JWT token from localStorage to every outgoing request
 * so protected API endpoints can authenticate the user.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Catches 401 Unauthorized responses globally.
 * When a 401 is received the stored token is removed and the user
 * is redirected to the login page to re-authenticate.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login unless already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
