import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Mock axios
jest.mock('axios');

// Mock useNavigate
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: jest.fn(),
}));

describe('Password Reset Flow', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Forgot Password Page', () => {
    it('should render the forgot password form', () => {
      render(
        <Router>
          <ForgotPassword />
        </Router>
      );

      expect(screen.getByText('Forgot Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should show error when email is not provided', async () => {
      render(
        <Router>
          <ForgotPassword />
        </Router>
      );

      const submitButton = screen.getByText('Send Reset Link');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show success message on successful submission', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Reset link sent to your email'
        }
      });

      render(
        <Router>
          <ForgotPassword />
        </Router>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByText('Send Reset Link');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/forgot-password',
          { email: 'test@example.com' }
        );
        expect(screen.getByText(/If an account with that email exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reset Password Page', () => {
    const mockSearchParams = new URLSearchParams({
      token: 'test-token',
      userId: 'test-user-id'
    });

    beforeEach(() => {
      // Mock useSearchParams
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
        mockSearchParams,
        jest.fn()
      ]);
    });

    it('should verify the reset token on mount', async () => {
      axios.get.mockResolvedValueOnce({
        data: { valid: true }
      });

      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </MemoryRouter>
      );

      // Should show loading initially
      expect(screen.getByText('Verifying reset link...')).toBeInTheDocument();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/verify-reset-token/test-token?userId=test-user-id'
        );
        expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      });
    });

    it('should show error for invalid token', async () => {
      axios.get.mockResolvedValueOnce({
        data: { 
          valid: false,
          message: 'Invalid or expired token'
        }
      });

      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/This reset link is invalid or has expired/i)).toBeInTheDocument();
        expect(screen.getByText('Request New Reset Link')).toBeInTheDocument();
      });
    });

    it('should handle password reset submission', async () => {
      // Mock token verification
      axios.get.mockResolvedValueOnce({
        data: { valid: true }
      });
      
      // Mock password reset
      axios.post.mockResolvedValueOnce({
        data: { success: true }
      });

      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for token verification
      await waitFor(() => {
        expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      });

      // Fill out the form
      const newPassword = 'NewSecurePassword123!';
      const passwordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: newPassword } });
      fireEvent.change(confirmPasswordInput, { target: { value: newPassword } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/reset-password/test-token',
          {
            password: newPassword,
            userId: 'test-user-id'
          }
        );
        expect(screen.getByText(/Your password has been reset successfully!/i)).toBeInTheDocument();
      });

      // Should navigate to login after success
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 4000 });
    });
  });
});
