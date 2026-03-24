/**
 * EditPlant Page Component
 * ------------------------
 * Provides a pre-populated form for updating an existing plant's details.
 * Features:
 *   - Fetches current plant data on mount using the plant ID from the URL
 *   - Pre-populates all form fields with existing values
 *   - Same validation rules as AddPlant (name 2-100 chars, etc.)
 *   - Loading state while fetching or submitting data
 *   - Success/error messages for user feedback
 *   - Redirects to Plant Detail page on successful update
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import './EditPlant.css';

const EditPlant = () => {
  const { id } = useParams(); // Extract plant ID from the URL
  const navigate = useNavigate();

  // Form field state
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    location: '',
    wateringFrequencyDays: '',
    healthStatus: 'HEALTHY',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Fetch the existing plant data to pre-populate the form.
   */
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const response = await api.get(`/plants/${id}`);
        const plant = response.data;
        setFormData({
          name: plant.name || '',
          species: plant.species || '',
          location: plant.location || '',
          wateringFrequencyDays: plant.wateringFrequencyDays || '',
          healthStatus: plant.healthStatus || 'HEALTHY',
        });
      } catch (err) {
        setApiError('Failed to load plant data. Please try again.');
        console.error('EditPlant fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id]);

  /**
   * Validates all plant form fields (same rules as AddPlant).
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plant name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Plant name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Plant name must be at most 100 characters';
    }

    if (!formData.species.trim()) {
      newErrors.species = 'Species is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

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
   * Handles form submission: validates and sends PUT request.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError('');
    setSuccessMsg('');

    try {
      // PUT updated plant data to the backend
      await api.put(`/plants/${id}`, {
        name: formData.name.trim(),
        species: formData.species.trim(),
        location: formData.location.trim(),
        wateringFrequencyDays: Number(formData.wateringFrequencyDays),
        healthStatus: formData.healthStatus,
      });

      setSuccessMsg('Plant updated successfully!');
      setTimeout(() => navigate(`/plants/${id}`), 1200);
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Failed to update plant.');
      } else {
        setApiError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching plant data
  if (loading) {
    return (
      <div className="edit-plant-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading plant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-plant-container">
      <div className="form-card">
        <h1 className="form-title">Edit Plant</h1>

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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
            >
              <option value="HEALTHY">Healthy</option>
              <option value="NEEDS_ATTENTION">Needs Attention</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Plant'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(`/plants/${id}`)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlant;
