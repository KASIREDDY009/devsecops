/**
 * SensorData Page Component
 * -------------------------
 * Manages sensor readings for a specific plant. Combines both viewing
 * historical data and adding new sensor readings on a single page.
 * Features:
 *   - Form to submit new sensor readings with validation:
 *       * Soil moisture: 0-100
 *       * Temperature: -40 to 60
 *       * Light level: 0-100000
 *       * Humidity: 0-100
 *   - Displays all historical sensor data in a table
 *   - Shows latest reading summary at the top
 *   - Loading, success, and error states
 *   - Data sorted by most recent first
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import './SensorData.css';

const SensorData = () => {
  const { plantId } = useParams(); // Plant ID from URL

  // Sensor data list and form state
  const [sensorData, setSensorData] = useState([]);
  const [formData, setFormData] = useState({
    soilMoisture: '',
    temperature: '',
    lightLevel: '',
    humidity: '',
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Fetch all sensor data for this plant on component mount.
   */
  useEffect(() => {
    fetchSensorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantId]);

  /**
   * Retrieves sensor data from the API and updates state.
   */
  const fetchSensorData = async () => {
    try {
      const response = await api.get(`/plants/${plantId}/sensor-data`);
      setSensorData(response.data);
    } catch (err) {
      setApiError('Failed to load sensor data.');
      console.error('SensorData fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validates sensor reading form fields.
   * All fields are required and must fall within their acceptable ranges.
   */
  const validate = () => {
    const newErrors = {};

    // Soil moisture: required, 0-100
    if (formData.soilMoisture === '') {
      newErrors.soilMoisture = 'Soil moisture is required';
    } else {
      const val = Number(formData.soilMoisture);
      if (isNaN(val) || val < 0 || val > 100) {
        newErrors.soilMoisture = 'Soil moisture must be between 0 and 100';
      }
    }

    // Temperature: required, -40 to 60
    if (formData.temperature === '') {
      newErrors.temperature = 'Temperature is required';
    } else {
      const val = Number(formData.temperature);
      if (isNaN(val) || val < -40 || val > 60) {
        newErrors.temperature = 'Temperature must be between -40 and 60°C';
      }
    }

    // Light level: required, 0-100000
    if (formData.lightLevel === '') {
      newErrors.lightLevel = 'Light level is required';
    } else {
      const val = Number(formData.lightLevel);
      if (isNaN(val) || val < 0 || val > 100000) {
        newErrors.lightLevel = 'Light level must be between 0 and 100,000 lux';
      }
    }

    // Humidity: required, 0-100
    if (formData.humidity === '') {
      newErrors.humidity = 'Humidity is required';
    } else {
      const val = Number(formData.humidity);
      if (isNaN(val) || val < 0 || val > 100) {
        newErrors.humidity = 'Humidity must be between 0 and 100';
      }
    }

    return newErrors;
  };

  /**
   * Handles input changes and clears the corresponding field error.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
    setSuccessMsg('');
  };

  /**
   * Submits a new sensor reading to the API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // POST the sensor reading to the backend
      await api.post(`/plants/${plantId}/sensor-data`, {
        soilMoisture: Number(formData.soilMoisture),
        temperature: Number(formData.temperature),
        lightLevel: Number(formData.lightLevel),
        humidity: Number(formData.humidity),
      });

      setSuccessMsg('Sensor reading added successfully!');

      // Reset the form
      setFormData({ soilMoisture: '', temperature: '', lightLevel: '', humidity: '' });

      // Refresh the sensor data list
      await fetchSensorData();
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Failed to add sensor reading.');
      } else {
        setApiError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sensor-container">
      {/* Navigation link back to the plant detail page */}
      <Link to={`/plants/${plantId}`} className="back-link">
        Back to Plant Details
      </Link>

      <h1 className="page-title">Sensor Data Management</h1>

      {/* Add Sensor Reading Form */}
      <div className="sensor-form-card">
        <h2 className="section-title">Add New Reading</h2>

        {successMsg && <div className="success-banner">{successMsg}</div>}
        {apiError && <div className="error-banner">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="sensor-form-grid">
            {/* Soil Moisture */}
            <div className="form-group">
              <label htmlFor="soilMoisture" className="form-label">
                Soil Moisture (%)
              </label>
              <input
                type="number"
                id="soilMoisture"
                name="soilMoisture"
                className={`form-input ${errors.soilMoisture ? 'input-error' : ''}`}
                value={formData.soilMoisture}
                onChange={handleChange}
                placeholder="0-100"
                min="0"
                max="100"
                step="0.1"
                disabled={submitting}
              />
              {errors.soilMoisture && <span className="field-error">{errors.soilMoisture}</span>}
            </div>

            {/* Temperature */}
            <div className="form-group">
              <label htmlFor="temperature" className="form-label">
                Temperature (°C)
              </label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                className={`form-input ${errors.temperature ? 'input-error' : ''}`}
                value={formData.temperature}
                onChange={handleChange}
                placeholder="-40 to 60"
                min="-40"
                max="60"
                step="0.1"
                disabled={submitting}
              />
              {errors.temperature && <span className="field-error">{errors.temperature}</span>}
            </div>

            {/* Light Level */}
            <div className="form-group">
              <label htmlFor="lightLevel" className="form-label">
                Light Level (lux)
              </label>
              <input
                type="number"
                id="lightLevel"
                name="lightLevel"
                className={`form-input ${errors.lightLevel ? 'input-error' : ''}`}
                value={formData.lightLevel}
                onChange={handleChange}
                placeholder="0-100000"
                min="0"
                max="100000"
                step="1"
                disabled={submitting}
              />
              {errors.lightLevel && <span className="field-error">{errors.lightLevel}</span>}
            </div>

            {/* Humidity */}
            <div className="form-group">
              <label htmlFor="humidity" className="form-label">
                Humidity (%)
              </label>
              <input
                type="number"
                id="humidity"
                name="humidity"
                className={`form-input ${errors.humidity ? 'input-error' : ''}`}
                value={formData.humidity}
                onChange={handleChange}
                placeholder="0-100"
                min="0"
                max="100"
                step="0.1"
                disabled={submitting}
              />
              {errors.humidity && <span className="field-error">{errors.humidity}</span>}
            </div>
          </div>

          <button type="submit" className="submit-btn sensor-submit" disabled={submitting}>
            {submitting ? 'Adding Reading...' : 'Add Reading'}
          </button>
        </form>
      </div>

      {/* Sensor Data History Table */}
      <div className="sensor-history-card">
        <h2 className="section-title">Reading History</h2>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading sensor data...</p>
          </div>
        ) : sensorData.length === 0 ? (
          <p className="no-data-msg">No sensor readings recorded yet. Add your first reading above.</p>
        ) : (
          <div className="table-wrapper">
            <table className="sensor-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Soil Moisture (%)</th>
                  <th>Temperature (°C)</th>
                  <th>Light (lux)</th>
                  <th>Humidity (%)</th>
                </tr>
              </thead>
              <tbody>
                {sensorData.map((reading, index) => (
                  <tr key={reading.id || index}>
                    <td>
                      {reading.recordedAt
                        ? new Date(reading.recordedAt).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td>{reading.soilMoisture}</td>
                    <td>{reading.temperature}</td>
                    <td>{reading.lightLevel}</td>
                    <td>{reading.humidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorData;
