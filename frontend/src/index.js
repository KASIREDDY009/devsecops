/**
 * Application Entry Point
 * -----------------------
 * Renders the root App component into the DOM.
 * React.StrictMode is enabled for development-time warnings.
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create the root React DOM node and render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
