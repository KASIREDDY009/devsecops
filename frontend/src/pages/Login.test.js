import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

// Mock axios
jest.mock('../api/axios', () => ({
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

const renderLogin = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders login form with username and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders page title', () => {
    renderLogin();
    expect(screen.getByText('PlantCare Monitor')).toBeInTheDocument();
  });

  test('shows validation error when username is empty', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for short username', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'ab', name: 'username' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });
  });

  test('shows validation error when password is empty', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for short password', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '12345', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  test('has link to signup page', () => {
    renderLogin();
    const signupLink = screen.getByText(/sign up/i);
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  test('clears field error when user starts typing', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 't', name: 'username' } });
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
  });
});
