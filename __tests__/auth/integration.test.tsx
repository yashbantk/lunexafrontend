// Integration tests for authentication system

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth/provider';
import { authAPI } from '@/lib/auth/api';
import { authStorage } from '@/lib/auth/storage';
import { authAuditService } from '@/lib/auth/audit';
import type { User, AuthTokens } from '@/types/auth';

// Mock dependencies
jest.mock('@/lib/auth/api');
jest.mock('@/lib/auth/storage');
jest.mock('@/lib/auth/audit');

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;
const mockAuthStorage = authStorage as jest.Mocked<typeof authStorage>;
const mockAuthAuditService = authAuditService as jest.Mocked<typeof authAuditService>;

// Test component that uses authentication
function TestComponent() {
  const { 
    isAuthenticated, 
    user, 
    login, 
    signup, 
    logout, 
    isLoading, 
    error, 
    errors 
  } = useAuth();

  const handleLogin = async () => {
    await login({
      email: 'test@example.com',
      password: 'Password123!',
      rememberMe: false,
    });
  };

  const handleSignup = async () => {
    await signup({
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true,
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? `${user.firstName} ${user.lastName}` : 'No User'}
      </div>
      <div data-testid="loading-status">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
      <div data-testid="error-info">
        {error ? error.message : 'No Error'}
      </div>
      <div data-testid="errors-count">
        {errors.length} errors
      </div>
      <button data-testid="login-btn" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="signup-btn" onClick={handleSignup}>
        Signup
      </button>
      <button data-testid="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

// Wrapper component with AuthProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getTokens.mockReturnValue(null);
    mockAuthStorage.isAuthenticated.mockReturnValue(false);
  });

  describe('Authentication Flow', () => {
    it('should handle complete login flow', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isStaff: false,
        isSuperuser: false,
        groups: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens: AuthTokens = {
        access: 'access-token',
        refresh: 'refresh-token',
        expiresAt: Date.now() + (15 * 60 * 1000),
        refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      };

      mockAuthAPI.login.mockResolvedValue({
        success: true,
        data: { user: mockUser, tokens: mockTokens },
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initial state
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not Loading');

      // Click login button
      fireEvent.click(screen.getByTestId('login-btn'));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading');
      });

      // Wait for login to complete
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('error-info')).toHaveTextContent('No Error');

      // Verify API was called
      expect(mockAuthAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        rememberMe: false,
      });

      // Verify storage was updated
      expect(mockAuthStorage.setUser).toHaveBeenCalledWith(mockUser);
      expect(mockAuthStorage.setTokens).toHaveBeenCalledWith(mockTokens);

      // Verify audit logging
      expect(mockAuthAuditService.logLoginSuccess).toHaveBeenCalledWith(mockUser, expect.any(Object));
    });

    it('should handle login failure', async () => {
      mockAuthAPI.login.mockResolvedValue({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          timestamp: Date.now(),
          severity: 'high',
        },
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Click login button
      fireEvent.click(screen.getByTestId('login-btn'));

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-info')).toHaveTextContent('Invalid email or password');
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('No User');

      // Verify audit logging
      expect(mockAuthAuditService.logLoginFailure).toHaveBeenCalledWith(
        'test@example.com',
        'Invalid email or password',
        expect.any(Object)
      );
    });

    it('should handle signup flow', async () => {
      const mockUser: User = {
        id: '2',
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isStaff: false,
        isSuperuser: false,
        groups: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAuthAPI.signup.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Click signup button
      fireEvent.click(screen.getByTestId('signup-btn'));

      // Wait for signup to complete
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
      });

      // User should be created but not authenticated (needs email verification)
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

      // Verify API was called
      expect(mockAuthAPI.signup).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      });

      // Verify audit logging
      expect(mockAuthAuditService.logSignupSuccess).toHaveBeenCalledWith(mockUser, expect.any(Object));
    });

    it('should handle logout flow', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isStaff: false,
        isSuperuser: false,
        groups: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Set up authenticated state
      mockAuthStorage.getUser.mockReturnValue(mockUser);
      mockAuthStorage.getTokens.mockReturnValue({
        access: 'token',
        refresh: 'refresh',
        expiresAt: Date.now() + 1000,
        refreshExpiresAt: Date.now() + 1000,
      });
      mockAuthStorage.isAuthenticated.mockReturnValue(true);

      mockAuthAPI.logout.mockResolvedValue({
        success: true,
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      // Click logout button
      fireEvent.click(screen.getByTestId('logout-btn'));

      // Wait for logout to complete
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });

      expect(screen.getByTestId('user-info')).toHaveTextContent('No User');

      // Verify storage was cleared
      expect(mockAuthStorage.clearAll).toHaveBeenCalled();

      // Verify audit logging
      expect(mockAuthAuditService.logLogout).toHaveBeenCalledWith(mockUser, expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockAuthAPI.login.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Click login button
      fireEvent.click(screen.getByTestId('login-btn'));

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-info')).toHaveTextContent('An unexpected error occurred');
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    it('should handle validation errors', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Mock invalid credentials by modifying the component
      const TestComponentWithInvalidCredentials = () => {
        const { signup } = useAuth();

        const handleSignup = async () => {
          await signup({
            email: 'invalid-email',
            firstName: '',
            lastName: '',
            password: 'weak',
            confirmPassword: 'different',
            acceptTerms: false,
          });
        };

        return (
          <div>
            <button data-testid="invalid-signup-btn" onClick={handleSignup}>
              Invalid Signup
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponentWithInvalidCredentials />
        </TestWrapper>
      );

      // Click invalid signup button
      fireEvent.click(screen.getByTestId('invalid-signup-btn'));

      // Should not call API due to validation errors
      expect(mockAuthAPI.signup).not.toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should initialize with stored authentication', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isStaff: false,
        isSuperuser: false,
        groups: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens: AuthTokens = {
        access: 'access-token',
        refresh: 'refresh-token',
        expiresAt: Date.now() + (15 * 60 * 1000),
        refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      };

      // Mock stored authentication
      mockAuthStorage.getUser.mockReturnValue(mockUser);
      mockAuthStorage.getTokens.mockReturnValue(mockTokens);
      mockAuthStorage.isAuthenticated.mockReturnValue(true);
      mockAuthStorage.getSession.mockReturnValue({
        sessionId: 'session-123',
        lastActivity: Date.now() - (5 * 60 * 1000), // 5 minutes ago
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    });

    it('should handle expired stored authentication', async () => {
      const mockTokens: AuthTokens = {
        access: 'access-token',
        refresh: 'refresh-token',
        expiresAt: Date.now() - (15 * 60 * 1000), // Expired 15 minutes ago
        refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      };

      // Mock expired stored authentication
      mockAuthStorage.getUser.mockReturnValue({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isStaff: false,
        isSuperuser: false,
        groups: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      mockAuthStorage.getTokens.mockReturnValue(mockTokens);
      mockAuthStorage.isAuthenticated.mockReturnValue(false);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });

      expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
    });
  });

  describe('Security Features', () => {
    it('should handle account lockout', async () => {
      mockAuthAPI.login.mockResolvedValue({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: Date.now(),
          severity: 'high',
        },
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByTestId('login-btn'));
        await waitFor(() => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('Not Loading');
        });
      }

      // Account should be locked
      await waitFor(() => {
        expect(screen.getByTestId('error-info')).toContain('Account is locked');
      });

      // Verify audit logging
      expect(mockAuthAuditService.logAccountLocked).toHaveBeenCalled();
    });
  });
});
