/**
 * PlantCard Component
 * -------------------
 * Displays a summary card for a single plant on the Dashboard grid.
 * Features:
 *   - Plant name, species, and location
 *   - Health status badge colour-coded:
 *       green  = HEALTHY
 *       orange = NEEDS_ATTENTION
 *       red    = CRITICAL
 *   - Watering frequency information
 *   - Click handler navigates to the detailed plant view
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlantCard.css';

const PlantCard = ({ plant }) => {
  const navigate = useNavigate();

  /**
   * Maps the health status string to a CSS class for colour coding.
   * @param {string} status - One of HEALTHY, NEEDS_ATTENTION, CRITICAL
   * @returns {string} CSS class name
   */
  const getStatusClass = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'status-healthy';
      case 'NEEDS_ATTENTION':
        return 'status-attention';
      case 'CRITICAL':
        return 'status-critical';
      default:
        return 'status-unknown';
    }
  };

  /**
   * Returns a user-friendly label for the health status.
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'Healthy';
      case 'NEEDS_ATTENTION':
        return 'Needs Attention';
      case 'CRITICAL':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="plant-card" onClick={() => navigate(`/plants/${plant.id}`)}>
      {/* Health status badge */}
      <div className={`plant-card-status ${getStatusClass(plant.healthStatus)}`}>
        {getStatusLabel(plant.healthStatus)}
      </div>

      {/* Plant information */}
      <h3 className="plant-card-name">{plant.name}</h3>
      <p className="plant-card-species">{plant.species}</p>

      <div className="plant-card-details">
        <div className="plant-card-detail">
          <span className="detail-label">Location</span>
          <span className="detail-value">{plant.location}</span>
        </div>
        <div className="plant-card-detail">
          <span className="detail-label">Watering</span>
          <span className="detail-value">Every {plant.wateringFrequencyDays} days</span>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
