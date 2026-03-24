/**
 * Dashboard Page Component
 * ------------------------
 * The main landing page for authenticated users. Displays a responsive grid
 * of PlantCard components representing all plants belonging to the user.
 * Features:
 *   - Fetches the user's plants from the API on mount
 *   - Loading spinner while data is being retrieved
 *   - Empty state message with a call-to-action to add a plant
 *   - Error handling for failed API calls
 *   - Responsive grid layout (1–3 columns depending on viewport)
 *
 * MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PlantCard from '../components/PlantCard';
import './Dashboard.css';

const Dashboard = () => {
  // State for the list of plants returned by the API
  const [plants, setPlants] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetch all plants for the authenticated user when the component mounts.
   */
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await api.get('/plants');
        setPlants(response.data);
      } catch (err) {
        setError('Failed to load plants. Please try again later.');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Display a loading spinner while waiting for data
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your plants...</p>
        </div>
      </div>
    );
  }

  // Display error message if the API call failed
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Page header with title and add button */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Plants</h1>
        <Link to="/add-plant" className="add-plant-btn">
          + Add Plant
        </Link>
      </div>

      {/* Show plant grid or empty state */}
      {plants.length === 0 ? (
        <div className="empty-state">
          <h2>No plants yet</h2>
          <p>Start monitoring your plants by adding your first one.</p>
          <Link to="/add-plant" className="add-plant-btn">
            + Add Your First Plant
          </Link>
        </div>
      ) : (
        <div className="plant-grid">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
