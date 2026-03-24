/**
 * App Component — Root of the Application
 * ----------------------------------------
 * Sets up the React Router with all application routes and wraps the
 * component tree with the AuthProvider for global authentication state.
 *
 * Route structure:
 *   /login          — Login page (public)
 *   /signup         — Signup page (public)
 *   /dashboard      — Dashboard with plant grid (private)
 *   /add-plant      — Add a new plant form (private)
 *   /plants/:id     — Plant detail view (private)
 *   /plants/:id/edit       — Edit plant form (private)
 *   /plants/:plantId/sensor-data — Sensor data management (private)
 *   /               — Redirects to /dashboard
 *
 * Private routes are protected by the PrivateRoute component which
 * redirects unauthenticated users to the login page.
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddPlant from './pages/AddPlant';
import EditPlant from './pages/EditPlant';
import PlantDetail from './pages/PlantDetail';
import SensorData from './pages/SensorData';
import './App.css';

function App() {
  return (
    // AuthProvider supplies authentication state to all child components
    <AuthProvider>
      <Router>
        {/* Navbar is rendered on every page; it self-hides when not authenticated */}
        <Navbar />

        {/* Application Routes */}
        <div className="app-content">
          <Routes>
            {/* Public routes — accessible without authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Private routes — require authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-plant"
              element={
                <PrivateRoute>
                  <AddPlant />
                </PrivateRoute>
              }
            />
            <Route
              path="/plants/:id"
              element={
                <PrivateRoute>
                  <PlantDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/plants/:id/edit"
              element={
                <PrivateRoute>
                  <EditPlant />
                </PrivateRoute>
              }
            />
            <Route
              path="/plants/:plantId/sensor-data"
              element={
                <PrivateRoute>
                  <SensorData />
                </PrivateRoute>
              }
            />

            {/* Default route — redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all route — redirect unknown paths to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
