import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the child components to isolate App routing tests
jest.mock('./pages/Login', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('./pages/Signup', () => () => <div data-testid="signup-page">Signup Page</div>);
jest.mock('./pages/Dashboard', () => () => <div data-testid="dashboard-page">Dashboard</div>);
jest.mock('./pages/AddPlant', () => () => <div data-testid="addplant-page">Add Plant</div>);
jest.mock('./pages/EditPlant', () => () => <div data-testid="editplant-page">Edit Plant</div>);
jest.mock('./pages/PlantDetail', () => () => <div data-testid="plantdetail-page">Plant Detail</div>);
jest.mock('./pages/SensorData', () => () => <div data-testid="sensordata-page">Sensor Data</div>);
jest.mock('./components/Navbar', () => () => <nav data-testid="navbar">Navbar</nav>);

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(document.querySelector('.app-content')).toBeInTheDocument();
  });

  test('renders the Navbar component', () => {
    render(<App />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  test('redirects unauthenticated users to login for protected routes', () => {
    // When not authenticated, navigating to /dashboard should redirect to /login
    window.history.pushState({}, '', '/dashboard');
    render(<App />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('renders login page at /login route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('renders signup page at /signup route', () => {
    window.history.pushState({}, '', '/signup');
    render(<App />);
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
  });
});
