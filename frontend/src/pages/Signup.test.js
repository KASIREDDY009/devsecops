import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';

// Mock axios
jest.mock('../api/axios', () => ({
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

const renderSignup = () => {
  return render(
    <BrowserRouter>
      <Signup />
    </BrowserRouter>
  );
};

describe('Signup Component', () => {
  test('renders signup form with all required fields', () => {
    renderSignup();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('renders page title', () => {
    renderSignup();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  test('shows validation errors for empty form submission', async () => {
    renderSignup();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  test('shows error for short username', async () => {
    renderSignup();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'ab', name: 'username' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123', name: 'password' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123', name: 'confirmPassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });
  });

  test('shows error when passwords do not match', async () => {
    renderSignup();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123', name: 'password' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different', name: 'confirmPassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('has link to login page', () => {
    renderSignup();
    const loginLink = screen.getByText(/sign in/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('shows error for invalid email format', async () => {
    renderSignup();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalidemail', name: 'email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123', name: 'password' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123', name: 'confirmPassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });
});
