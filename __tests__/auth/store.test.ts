// Unit tests for authentication store

import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/auth/store';
import { authAPI } from '@/lib/auth/api';
import { authStorage } from '@/lib/auth/storage';
import { authAuditService } from '@/lib/auth/audit';
import type { LoginCredentials, SignupCredentials, User, AuthTokens } from '@/types/auth';

// Mock dependencies
jest.mock('@/lib/auth/api');
jest.mock('@/lib/auth/storage');
jest.mock('@/lib/auth/audit');

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;
const mockAuthStorage = authStorage as jest.Mocked<typeof authStorage>;
const mockAuthAuditService = authAuditService as jest.Mocked<typeof authAuditService>;

describe('Authentication Store', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset store state
    act(() => {
      useAuthStore.getState().reset();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isRefreshing).toBe(false);
      expect(state.error).toBeNull();
      expect(state.errors).toHaveLength(0);
      expect(state.sessionId).toBeNull();
      expect(state.loginAttempts).toBe(0);
      expect(state.isLocked).toBe(false);
      expect(state.lockoutUntil).toBeNull();
    });
  });

  describe('Login', () => {
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

    it('should login successfully with valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'Password123!',
        rememberMe: false,
      };

      mockAuthAPI.login.mockResolvedValue({
        success: true,
        data: { user: mockUser, tokens: mockTokens },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login(credentials);
        expect(success).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.tokens).toEqual(mockTokens);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockAuthStorage.setUser).toHaveBeenCalledWith(mockUser);
      expect(mockAuthStorage.setTokens).toHaveBeenCalledWith(mockTokens);
      expect(mockAuthAuditService.logLoginSuccess).toHaveBeenCalledWith(mockUser, expect.any(Object));
    });

    it('should handle login failure', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      };

      mockAuthAPI.login.mockResolvedValue({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: Date.now(),
          severity: 'high',
        },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login(credentials);
        expect(success).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(result.current.loginAttempts).toBe(1);
      expect(mockAuthAuditService.logLoginFailure).toHaveBeenCalled();
    });

    it('should lock account after max login attempts', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      };

      mockAuthAPI.login.mockResolvedValue({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: Date.now(),
          severity: 'high',
        },
      });

      const { result } = renderHook(() => useAuthStore());

      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.login(credentials);
        });
      }

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockoutUntil).toBeGreaterThan(Date.now());
      expect(mockAuthAuditService.logAccountLocked).toHaveBeenCalled();
    });

    it('should validate credentials before API call', async () => {
      const invalidCredentials: LoginCredentials = {
        email: 'invalid-email',
        password: 'weak',
        rememberMe: false,
      };

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login(invalidCredentials);
        expect(success).toBe(false);
      });

      expect(mockAuthAPI.login).not.toHaveBeenCalled();
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Signup', () => {
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

    it('should signup successfully with valid credentials', async () => {
      const credentials: SignupCredentials = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      };

      mockAuthAPI.signup.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.signup(credentials);
        expect(success).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(false); // User needs to verify email
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockAuthAuditService.logSignupSuccess).toHaveBeenCalledWith(mockUser, expect.any(Object));
    });

    it('should handle signup failure', async () => {
      const credentials: SignupCredentials = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      };

      mockAuthAPI.signup.mockResolvedValue({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Email already exists',
          timestamp: Date.now(),
          severity: 'high',
        },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.signup(credentials);
        expect(success).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(mockAuthAuditService.logSignupFailure).toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Set up authenticated state
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe', isActive: true, isStaff: false, isSuperuser: false, groups: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          tokens: { access: 'token', refresh: 'refresh', expiresAt: Date.now() + 1000, refreshExpiresAt: Date.now() + 1000 },
          isAuthenticated: true,
        });
      });

      mockAuthAPI.logout.mockResolvedValue({
        success: true,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockAuthStorage.clearAll).toHaveBeenCalled();
      expect(mockAuthAuditService.logLogout).toHaveBeenCalled();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      const newTokens: AuthTokens = {
        access: 'new-access-token',
        refresh: 'new-refresh-token',
        expiresAt: Date.now() + (15 * 60 * 1000),
        refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      };

      mockAuthAPI.refreshToken.mockResolvedValue({
        success: true,
        data: newTokens,
      });

      const { result } = renderHook(() => useAuthStore());

      // Set up state with refresh token
      act(() => {
        useAuthStore.setState({
          tokens: { access: 'old-token', refresh: 'refresh-token', expiresAt: Date.now() - 1000, refreshExpiresAt: Date.now() + 1000 },
        });
      });

      await act(async () => {
        const success = await result.current.refreshToken();
        expect(success).toBe(true);
      });

      expect(result.current.tokens).toEqual(newTokens);
      expect(result.current.isRefreshing).toBe(false);
      expect(mockAuthStorage.setTokens).toHaveBeenCalledWith(newTokens);
    });

    it('should handle token refresh failure', async () => {
      mockAuthAPI.refreshToken.mockResolvedValue({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Refresh token expired',
          timestamp: Date.now(),
          severity: 'high',
        },
      });

      const { result } = renderHook(() => useAuthStore());

      // Set up state with refresh token
      act(() => {
        useAuthStore.setState({
          tokens: { access: 'old-token', refresh: 'refresh-token', expiresAt: Date.now() - 1000, refreshExpiresAt: Date.now() + 1000 },
        });
      });

      await act(async () => {
        const success = await result.current.refreshToken();
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(mockAuthStorage.clearAll).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should update last activity', () => {
      const { result } = renderHook(() => useAuthStore());

      const initialTime = result.current.lastActivity;

      act(() => {
        result.current.updateLastActivity();
      });

      expect(result.current.lastActivity).toBeGreaterThan(initialTime);
      expect(mockAuthStorage.setSession).toHaveBeenCalled();
    });

    it('should validate session successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set up valid session
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          lastActivity: Date.now() - (10 * 60 * 1000), // 10 minutes ago
          tokens: { access: 'token', refresh: 'refresh', expiresAt: Date.now() + (10 * 60 * 1000), refreshExpiresAt: Date.now() + 1000 },
        });
      });

      await act(async () => {
        const isValid = await result.current.validateSession();
        expect(isValid).toBe(true);
      });
    });

    it('should invalidate expired session', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set up expired session
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          lastActivity: Date.now() - (40 * 60 * 1000), // 40 minutes ago
          tokens: { access: 'token', refresh: 'refresh', expiresAt: Date.now() + (10 * 60 * 1000), refreshExpiresAt: Date.now() + 1000 },
        });
      });

      await act(async () => {
        const isValid = await result.current.validateSession();
        expect(isValid).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set some errors
      act(() => {
        useAuthStore.setState({
          error: { code: 'TEST_ERROR', message: 'Test error', timestamp: Date.now(), severity: 'high' },
          errors: [{ code: 'TEST_ERROR', message: 'Test error', timestamp: Date.now(), severity: 'high' }],
        });
      });

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.errors).toHaveLength(0);
    });

    it('should clear specific error', () => {
      const { result } = renderHook(() => useAuthStore());

      const error1 = { code: 'ERROR_1', message: 'Error 1', timestamp: Date.now(), severity: 'high' as const };
      const error2 = { code: 'ERROR_2', message: 'Error 2', timestamp: Date.now() + 1, severity: 'high' as const };

      // Set multiple errors
      act(() => {
        useAuthStore.setState({
          errors: [error1, error2],
        });
      });

      act(() => {
        result.current.clearError(error1.timestamp.toString());
      });

      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0]).toEqual(error2);
    });
  });

  describe('Security Features', () => {
    it('should reset login attempts', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set login attempts
      act(() => {
        useAuthStore.setState({
          loginAttempts: 5,
          lastLoginAttempt: Date.now(),
        });
      });

      act(() => {
        result.current.resetLoginAttempts();
      });

      expect(result.current.loginAttempts).toBe(0);
      expect(result.current.lastLoginAttempt).toBe(0);
    });

    it('should lock account for specified duration', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.lockAccount(15); // 15 minutes
      });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.lockoutUntil).toBeGreaterThan(Date.now());
    });
  });
});
