import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import api from '../api/axios';

// Mock axios
jest.mock('../api/axios', () => ({
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading spinner initially', () => {
    api.get.mockReturnValue(new Promise(() => {})); // never resolves
    renderDashboard();
    expect(screen.getByText('Loading your plants...')).toBeInTheDocument();
  });

  test('displays plants when API returns data', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Fern', species: 'Boston Fern', healthStatus: 'HEALTHY', wateringFrequencyDays: 3 },
        { id: 2, name: 'Cactus', species: 'Prickly Pear', healthStatus: 'NEEDS_ATTENTION', wateringFrequencyDays: 14 },
      ],
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('My Plants')).toBeInTheDocument();
    });
  });

  test('shows empty state when no plants exist', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('No plants yet')).toBeInTheDocument();
      expect(screen.getByText(/start monitoring/i)).toBeInTheDocument();
    });
  });

  test('shows error message when API call fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Failed to load plants. Please try again later.')).toBeInTheDocument();
    });
  });

  test('has add plant button', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderDashboard();
    await waitFor(() => {
      const addButton = screen.getByText('+ Add Your First Plant');
      expect(addButton.closest('a')).toHaveAttribute('href', '/add-plant');
    });
  });

  test('calls API with correct endpoint', () => {
    api.get.mockResolvedValue({ data: [] });
    renderDashboard();
    expect(api.get).toHaveBeenCalledWith('/plants');
  });
});
