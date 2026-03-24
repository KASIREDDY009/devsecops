/**
 * PlantDetail Page Component
 * --------------------------
 * Displays the full details of a single plant, including its sensor data
 * history. Provides navigation to edit, delete, and manage sensor data.
 * Features:
 *   - Fetches plant details and latest sensor data on mount
 *   - Colour-coded health status display
 *   - Edit and Delete action buttons
 *   - Confirmation prompt before deleting a plant
 *   - Sensor data summary (latest readings)
 *   - Links to full sensor data page
 *   - Loading and error states
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './PlantDetail.css';

const PlantDetail = () => {
  const { id } = useParams(); // Extract plant ID from the URL
  const navigate = useNavigate();

  // Plant data and sensor readings
  const [plant, setPlant] = useState(null);
  const [latestSensor, setLatestSensor] = useState(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  /**
   * Fetch plant details and latest sensor data in parallel on mount.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plant details and latest sensor data concurrently
        const [plantRes, sensorRes] = await Promise.all([
          api.get(`/plants/${id}`),
          api.get(`/plants/${id}/sensor-data/latest`).catch(() => null), // sensor data may not exist
        ]);

        setPlant(plantRes.data);

        // Set latest sensor data if available
        if (sensorRes && sensorRes.data) {
          setLatestSensor(sensorRes.data);
        }
      } catch (err) {
        setError('Failed to load plant details. Please try again.');
        console.error('PlantDetail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /**
   * Returns a CSS class for colour-coding the health status badge.
   */
  const getStatusClass = (status) => {
    switch (status) {
      case 'HEALTHY': return 'status-healthy';
      case 'NEEDS_ATTENTION': return 'status-attention';
      case 'CRITICAL': return 'status-critical';
      default: return 'status-unknown';
    }
  };

  /**
   * Returns a user-friendly label for the health status.
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case 'HEALTHY': return 'Healthy';
      case 'NEEDS_ATTENTION': return 'Needs Attention';
      case 'CRITICAL': return 'Critical';
      default: return 'Unknown';
    }
  };

  /**
   * Handles plant deletion with a confirmation prompt.
   */
  const handleDelete = async () => {
    // Confirm before deleting
    const confirmed = window.confirm(
      `Are you sure you want to delete "${plant.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/plants/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete plant. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading plant details...</p>
        </div>
      </div>
    );
  }

  // Show error if plant could not be loaded
  if (error && !plant) {
    return (
      <div className="detail-container">
        <div className="error-banner">{error}</div>
        <Link to="/dashboard" className="back-link">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="detail-container">
      {/* Back navigation */}
      <Link to="/dashboard" className="back-link">Back to Dashboard</Link>

      {error && <div className="error-banner">{error}</div>}

      {plant && (
        <div className="detail-card">
          {/* Plant header with name, status, and actions */}
          <div className="detail-header">
            <div>
              <h1 className="detail-name">{plant.name}</h1>
              <span className={`detail-status ${getStatusClass(plant.healthStatus)}`}>
                {getStatusLabel(plant.healthStatus)}
              </span>
            </div>
            <div className="detail-actions">
              <button
                className="edit-btn"
                onClick={() => navigate(`/plants/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Plant information grid */}
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span className="info-label">Species</span>
              <span className="info-value">{plant.species}</span>
            </div>
            <div className="detail-info-item">
              <span className="info-label">Location</span>
              <span className="info-value">{plant.location}</span>
            </div>
            <div className="detail-info-item">
              <span className="info-label">Watering Frequency</span>
              <span className="info-value">Every {plant.wateringFrequencyDays} days</span>
            </div>
            <div className="detail-info-item">
              <span className="info-label">Created</span>
              <span className="info-value">
                {plant.createdAt ? new Date(plant.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Latest Sensor Data Section */}
          <div className="sensor-section">
            <div className="sensor-section-header">
              <h2 className="sensor-title">Latest Sensor Readings</h2>
              <Link to={`/plants/${id}/sensor-data`} className="sensor-link">
                View All / Add Data
              </Link>
            </div>

            {latestSensor ? (
              <div className="sensor-readings-grid">
                <div className="sensor-reading">
                  <span className="sensor-label">Soil Moisture</span>
                  <span className="sensor-value">{latestSensor.soilMoisture}%</span>
                </div>
                <div className="sensor-reading">
                  <span className="sensor-label">Temperature</span>
                  <span className="sensor-value">{latestSensor.temperature}°C</span>
                </div>
                <div className="sensor-reading">
                  <span className="sensor-label">Light Level</span>
                  <span className="sensor-value">{latestSensor.lightLevel} lux</span>
                </div>
                <div className="sensor-reading">
                  <span className="sensor-label">Humidity</span>
                  <span className="sensor-value">{latestSensor.humidity}%</span>
                </div>
                {latestSensor.recordedAt && (
                  <div className="sensor-reading sensor-reading-full">
                    <span className="sensor-label">Recorded At</span>
                    <span className="sensor-value">
                      {new Date(latestSensor.recordedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-sensor-data">
                No sensor data available yet.{' '}
                <Link to={`/plants/${id}/sensor-data`}>Add sensor readings</Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetail;
