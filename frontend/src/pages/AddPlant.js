/**
 * AddPlant Page Component
 * -----------------------
 * Form page for creating a new plant entry in the monitoring system.
 * Features:
 *   - Fields: name, species, location, watering frequency, health status
 *   - Comprehensive client-side validation:
 *       * Plant name: required, 2-100 characters
 *       * Species: required
 *       * Location: required
 *       * Watering frequency: required, number between 1 and 90
 *   - Error messages displayed below each invalid field
 *   - Success/error toast-style messages after submission
 *   - Loading state while the API call is in progress
 *   - Redirects to Dashboard on successful creation
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './AddPlant.css';

const AddPlant = () => {
  const navigate = useNavigate();

  // Form field state with default values
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    location: '',
    wateringFrequencyDays: '',
    healthStatus: 'HEALTHY',
  });

  // Validation errors keyed by field name
  const [errors, setErrors] = useState({});

  // Global messages
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Validates all plant form fields.
   * Returns an object with error messages; empty object = all valid.
   */
  const validate = () => {
    const newErrors = {};

    // Plant name: required, 2-100 characters
    if (!formData.name.trim()) {
      newErrors.name = 'Plant name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Plant name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Plant name must be at most 100 characters';
    }

    // Species: required
    if (!formData.species.trim()) {
      newErrors.species = 'Species is required';
    }

    // Location: required
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Watering frequency: required, must be a number between 1 and 90
    if (!formData.wateringFrequencyDays) {
      newErrors.wateringFrequencyDays = 'Watering frequency is required';
    } else {
      const freq = Number(formData.wateringFrequencyDays);
      if (isNaN(freq) || freq < 1 || freq > 90) {
        newErrors.wateringFrequencyDays = 'Watering frequency must be between 1 and 90 days';
      }
    }

    return newErrors;
  };

  /**
   * Handles input field changes and clears the corresponding error.
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
   * Handles form submission: validates, posts to API, handles response.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // POST the new plant data to the backend
      await api.post('/plants', {
        name: formData.name.trim(),
        species: formData.species.trim(),
        location: formData.location.trim(),
        wateringFrequencyDays: Number(formData.wateringFrequencyDays),
        healthStatus: formData.healthStatus,
      });

      setSuccessMsg('Plant added successfully!');

      // Redirect to dashboard after a brief delay so the user sees the message
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Failed to add plant. Please try again.');
      } else {
        setApiError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-plant-container">
      <div className="form-card">
        <h1 className="form-title">Add New Plant</h1>

        {/* Success / Error banners */}
        {successMsg && <div className="success-banner">{successMsg}</div>}
        {apiError && <div className="error-banner">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Plant Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Plant Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. My Sunflower (2-100 chars)"
              disabled={loading}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Species */}
          <div className="form-group">
            <label htmlFor="species" className="form-label">Species</label>
            <input
              type="text"
              id="species"
              name="species"
              className={`form-input ${errors.species ? 'input-error' : ''}`}
              value={formData.species}
              onChange={handleChange}
              placeholder="e.g. Helianthus annuus"
              disabled={loading}
            />
            {errors.species && <span className="field-error">{errors.species}</span>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              className={`form-input ${errors.location ? 'input-error' : ''}`}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Living Room Window"
              disabled={loading}
            />
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>

          {/* Watering Frequency */}
          <div className="form-group">
            <label htmlFor="wateringFrequencyDays" className="form-label">
              Watering Frequency (days)
            </label>
            <input
              type="number"
              id="wateringFrequencyDays"
              name="wateringFrequencyDays"
              className={`form-input ${errors.wateringFrequencyDays ? 'input-error' : ''}`}
              value={formData.wateringFrequencyDays}
              onChange={handleChange}
              placeholder="1-90"
              min="1"
              max="90"
              disabled={loading}
            />
            {errors.wateringFrequencyDays && (
              <span className="field-error">{errors.wateringFrequencyDays}</span>
            )}
          </div>

          {/* Health Status */}
          <div className="form-group">
            <label htmlFor="healthStatus" className="form-label">Health Status</label>
            <select
              id="healthStatus"
              name="healthStatus"
              className="form-input"
              value={formData.healthStatus}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="HEALTHY">Healthy</option>
              <option value="NEEDS_ATTENTION">Needs Attention</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding Plant...' : 'Add Plant'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlant;
