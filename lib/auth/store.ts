// Zustand store for comprehensive authentication state management
// Uses cookie-based storage for consistency across client and server

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { authConfig, AUTH_ERROR_CODES } from './config';
import { authStorage } from './storage';
import { authAPI } from './api';
import { authAuditService } from './audit';
import { validateLoginCredentials, validateSignupCredentials, validateSessionTimeout, validateTokenExpiry, shouldRefreshToken } from './validation';
import type { 
  AuthState, 
  AuthActions, 
  LoginCredentials, 
  SignupCredentials, 
  User, 
  AuthTokens, 
  AuthError,
  AuthMiddleware 
} from '@/types/auth';

/**
 * Initial authentication state
 */
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  errors: [],
  sessionId: null,
  lastActivity: Date.now(),
  loginAttempts: 0,
  lastLoginAttempt: 0,
  isLocked: false,
  lockoutUntil: null,
};

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Security middleware for rate limiting and account locking
 */
const securityMiddleware: AuthMiddleware = {
  name: 'security',
  execute: (state, action) => {
    const now = Date.now();
    
    // Check if account is locked
    if (state.isLocked && state.lockoutUntil && now < state.lockoutUntil) {
      const remainingTime = Math.ceil((state.lockoutUntil - now) / 1000 / 60);
      return {
        ...state,
        error: {
          code: AUTH_ERROR_CODES.ACCOUNT_LOCKED,
          message: `Account is locked. Please try again in ${remainingTime} minutes.`,
          timestamp: now,
          severity: 'high',
        },
      };
    }
    
    // Reset lockout if time has passed
    if (state.isLocked && state.lockoutUntil && now >= state.lockoutUntil) {
      return {
        ...state,
        isLocked: false,
        lockoutUntil: null,
        loginAttempts: 0,
      };
    }
    
    return state;
  },
};

/**
 * Session management middleware
 */
const sessionMiddleware: AuthMiddleware = {
  name: 'session',
  execute: (state, action) => {
    const now = Date.now();
    
    // Check session timeout
    if (state.isAuthenticated && state.lastActivity) {
      const sessionValidation = validateSessionTimeout(state.lastActivity);
      if (!sessionValidation.isValid) {
        return {
          ...state,
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: sessionValidation.error || null,
        };
      }
    }
    
    // Check token expiry
    if (state.tokens && state.tokens.expiresAt) {
      const tokenValidation = validateTokenExpiry(state.tokens.expiresAt);
      if (!tokenValidation.isValid) {
        return {
          ...state,
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: tokenValidation.error || null,
        };
      }
    }
    
    return state;
  },
};

/**
 * Create authentication store with middleware
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

          // Authentication actions
          login: async (credentials: LoginCredentials): Promise<boolean> => {
            const state = get();
            
            // Apply security middleware
            const securityState = securityMiddleware.execute(state, { type: 'login', credentials });
            if (securityState.error) {
              set({ error: securityState.error });
              return false;
            }
            
            set({ isLoading: true, error: null, errors: [] });
            
            try {
              // Validate credentials
              const validation = validateLoginCredentials(credentials);
              if (!validation.isValid) {
                set({ 
                  errors: validation.errors, 
                  error: validation.errors[0] || null,
                  isLoading: false 
                });
                return false;
              }
              
              // Call API
              const response = await authAPI.login(credentials);
              
              if (response.success && response.data) {
                const { user, tokens } = response.data;
                
                // Update state
                set({
                  user,
                  tokens,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                  errors: [],
                  sessionId: generateSessionId(),
                  lastActivity: Date.now(),
                  loginAttempts: 0,
                  isLocked: false,
                  lockoutUntil: null,
                });
                
                // Store in secure storage (cookies)
                authStorage.setUser(user);
                authStorage.setTokens(tokens);
                authStorage.setSession(get().sessionId!, Date.now());
                
                // Log successful login
                authAuditService.logLoginSuccess(user, {
                  sessionId: get().sessionId,
                  rememberMe: credentials.rememberMe,
                });
                
                return true;
              } else {
                // Handle login failure
                const error = response.error || {
                  code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
                  message: 'Login failed. Please try again.',
                  timestamp: Date.now(),
                  severity: 'high' as const,
                };
                
                set({ 
                  error, 
                  errors: [error], 
                  isLoading: false,
                  loginAttempts: state.loginAttempts + 1,
                  lastLoginAttempt: Date.now(),
                });
                
                // Log failed login
                authAuditService.logLoginFailure(credentials.email, error.message, {
                  attempt: state.loginAttempts + 1,
                  errorCode: error.code,
                });
                
                // Check if account should be locked
                if (state.loginAttempts + 1 >= authConfig.maxLoginAttempts) {
                  const lockoutDuration = authConfig.lockoutDuration * 60 * 1000; // Convert to milliseconds
                  set({
                    isLocked: true,
                    lockoutUntil: Date.now() + lockoutDuration,
                  });
                  
                  authAuditService.logAccountLocked(credentials.email, 'Too many failed login attempts', {
                    attempts: state.loginAttempts + 1,
                    lockoutDuration: authConfig.lockoutDuration,
                  });
                }
                
                return false;
              }
            } catch (error: any) {
              console.error('Login error:', error);
              
              const authError: AuthError = {
                code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
                message: 'An unexpected error occurred. Please try again.',
                timestamp: Date.now(),
                severity: 'high',
              };
              
              set({ 
                error: authError, 
                errors: [authError], 
                isLoading: false 
              });
              
              authAuditService.logLoginFailure(credentials.email, 'Unexpected error', {
                error: error.message,
              });
              
              return false;
            }
          },

          signup: async (credentials: SignupCredentials): Promise<boolean> => {
            set({ isLoading: true, error: null, errors: [] });
            
            try {
              // Validate credentials
              const validation = validateSignupCredentials(credentials);
              if (!validation.isValid) {
                set({ 
                  errors: validation.errors, 
                  error: validation.errors[0] || null,
                  isLoading: false 
                });
                return false;
              }
              
              // Call API
              const response = await authAPI.signup(credentials);
              
              if (response.success && response.data) {
                const user = response.data;
                
                // After successful signup, automatically log in the user
                // This provides a better user experience
                try {
                  const loginResponse = await authAPI.login({
                    email: credentials.email,
                    password: credentials.password,
                    rememberMe: false,
                  });
                  
                  if (loginResponse.success && loginResponse.data) {
                    const { user: loggedInUser, tokens } = loginResponse.data;
                    
                    // Update state with authenticated user
                    set({
                      user: loggedInUser,
                      tokens,
                      isAuthenticated: true,
                      isLoading: false,
                      error: null,
                      errors: [],
                      sessionId: generateSessionId(),
                      lastActivity: Date.now(),
                      loginAttempts: 0,
                      isLocked: false,
                      lockoutUntil: null,
                    });
                    
                    // Store in secure storage (cookies)
                    authStorage.setUser(loggedInUser);
                    authStorage.setTokens(tokens);
                    authStorage.setSession(get().sessionId!, Date.now());
                    
                    // Log successful signup and login
                    authAuditService.logSignupSuccess(loggedInUser, {
                      email: credentials.email,
                      autoLogin: true,
                    });
                    authAuditService.logLoginSuccess(loggedInUser, {
                      sessionId: get().sessionId,
                      source: 'signup',
                    });
                    
                    return true;
                  } else {
                    // If auto-login fails, still show success but user needs to manually log in
                    set({
                      user,
                      isAuthenticated: false,
                      isLoading: false,
                      error: null,
                      errors: [],
                    });
                    
                    // Log successful signup but failed auto-login
                    authAuditService.logSignupSuccess(user, {
                      email: credentials.email,
                      autoLoginFailed: true,
                    });
                    
                    return true;
                  }
                } catch (loginError) {
                  // If auto-login fails, still show success but user needs to manually log in
                  console.warn('Auto-login after signup failed:', loginError);
                  
                  set({
                    user,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                    errors: [],
                  });
                  
                  // Log successful signup but failed auto-login
                  authAuditService.logSignupSuccess(user, {
                    email: credentials.email,
                    autoLoginFailed: true,
                    loginError: loginError instanceof Error ? loginError.message : 'Unknown error',
                  });
                  
                  return true;
                }
              } else {
                // Handle signup failure
                const error = response.error || {
                  code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
                  message: 'Signup failed. Please try again.',
                  timestamp: Date.now(),
                  severity: 'high' as const,
                };
                
                set({ 
                  error, 
                  errors: [error], 
                  isLoading: false 
                });
                
                // Log failed signup
                authAuditService.logSignupFailure(credentials.email, error.message, {
                  errorCode: error.code,
                });
                
                return false;
              }
            } catch (error: any) {
              console.error('Signup error:', error);
              
              const authError: AuthError = {
                code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
                message: 'An unexpected error occurred. Please try again.',
                timestamp: Date.now(),
                severity: 'high',
              };
              
              set({ 
                error: authError, 
                errors: [authError], 
                isLoading: false 
              });
              
              authAuditService.logSignupFailure(credentials.email, 'Unexpected error', {
                error: error.message,
              });
              
              return false;
            }
          },

          logout: async (): Promise<void> => {
            const state = get();
            
            try {
              // Call logout API
              await authAPI.logout();
              
              // Log logout
              if (state.user) {
                authAuditService.logLogout(state.user, {
                  sessionId: state.sessionId,
                });
              }
            } catch (error) {
              console.error('Logout API error:', error);
              // Continue with client-side logout even if API fails
            }
            
            // Clear all state
            set({
              ...initialState,
              isInitialized: true, // Keep initialized state
            });
            
            // Clear storage (cookies)
            authStorage.clearAll();
          },

          refreshToken: async (): Promise<boolean> => {
            const state = get();
            
            if (!state.tokens?.refresh) {
              return false;
            }
            
            set({ isRefreshing: true, error: null });
            
            try {
              const response = await authAPI.refreshToken(state.tokens.refresh);
              
              if (response.success && response.data) {
                const tokens = response.data;
                
                set({
                  tokens,
                  isRefreshing: false,
                  lastActivity: Date.now(),
                });
                
                // Update storage
                authStorage.setTokens(tokens);
                
                // Log token refresh
                authAuditService.logTokenRefresh(state.user?.id || 'unknown', true);
                
                return true;
              } else {
                // Token refresh failed, logout user
                set({ 
                  isRefreshing: false,
                  isAuthenticated: false,
                  user: null,
                  tokens: null,
                  error: response.error || null,
                });
                
                authStorage.clearAll();
                
                authAuditService.logTokenRefresh(state.user?.id || 'unknown', false, {
                  error: response.error?.message,
                });
                
                return false;
              }
            } catch (error: any) {
              console.error('Token refresh error:', error);
              
              set({ 
                isRefreshing: false,
                isAuthenticated: false,
                user: null,
                tokens: null,
                error: {
                  code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
                  message: 'Session expired. Please log in again.',
                  timestamp: Date.now(),
                  severity: 'medium',
                },
              });
              
              authStorage.clearAll();
              
              return false;
            }
          },

          // State management actions
          clearErrors: () => {
            set({ error: null, errors: [] });
          },

          clearError: (errorId: string) => {
            set(state => ({
              errors: state.errors.filter(error => error.timestamp.toString() !== errorId),
              error: state.error?.timestamp.toString() === errorId ? null : state.error,
            }));
          },

          setLoading: (loading: boolean) => {
            set({ isLoading: loading });
          },

          // Security actions
          resetLoginAttempts: () => {
            set({ 
              loginAttempts: 0, 
              lastLoginAttempt: 0,
              isLocked: false,
              lockoutUntil: null,
            });
          },

          incrementLoginAttempts: () => {
            set(state => ({
              loginAttempts: state.loginAttempts + 1,
              lastLoginAttempt: Date.now(),
            }));
          },

          lockAccount: (duration: number) => {
            set({
              isLocked: true,
              lockoutUntil: Date.now() + (duration * 60 * 1000), // Convert minutes to milliseconds
            });
          },

          // Session management
          updateLastActivity: () => {
            set({ lastActivity: Date.now() });
            authStorage.setSession(get().sessionId || '', Date.now());
          },

          validateSession: async (): Promise<boolean> => {
            const state = get();
            
            if (!state.isAuthenticated || !state.tokens) {
              return false;
            }
            
            // Check if token needs refresh
            if (shouldRefreshToken(state.tokens.expiresAt)) {
              return await get().refreshToken();
            }
            
            // Check session timeout
            const sessionValidation = validateSessionTimeout(state.lastActivity);
            if (!sessionValidation.isValid) {
              set({
                isAuthenticated: false,
                user: null,
                tokens: null,
                error: sessionValidation.error || null,
              });
              
              authStorage.clearAll();
              
              if (state.user) {
                authAuditService.logSessionExpired(state.user.id, {
                  lastActivity: new Date(state.lastActivity).toISOString(),
                });
              }
              
              return false;
            }
            
            return true;
          },

          // Initialization
          initialize: async (): Promise<void> => {
            set({ isLoading: true });
            
            try {
              // Load from storage
              const storedUser = authStorage.getUser();
              const storedTokens = authStorage.getTokens();
              const storedSession = authStorage.getSession();
              const securityData = authStorage.getSecurityData();
              
              if (storedUser && storedTokens && authStorage.isAuthenticated()) {
                // Check if tokens are still valid
                const tokenValidation = validateTokenExpiry(storedTokens.expiresAt);
                
                if (tokenValidation.isValid) {
                  set({
                    user: storedUser,
                    tokens: storedTokens,
                    isAuthenticated: true,
                    sessionId: storedSession?.sessionId || generateSessionId(),
                    lastActivity: storedSession?.lastActivity || Date.now(),
                    loginAttempts: securityData.loginAttempts || 0,
                    lastLoginAttempt: securityData.lastLoginAttempt || 0,
                    isLocked: securityData.isLocked || false,
                    lockoutUntil: securityData.lockoutUntil || null,
                    isLoading: false,
                    isInitialized: true,
                  });
                  
                  // Update last activity
                  get().updateLastActivity();
                } else {
                  // Tokens expired, clear everything
                  authStorage.clearAll();
                  set({
                    ...initialState,
                    isInitialized: true,
                  });
                }
              } else {
                // No valid stored data
                set({
                  ...initialState,
                  isInitialized: true,
                });
              }
            } catch (error) {
              console.error('Auth initialization error:', error);
              
              // Clear potentially corrupted data
              authStorage.clearAll();
              set({
                ...initialState,
                isInitialized: true,
                error: {
                  code: AUTH_ERROR_CODES.INITIALIZATION_FAILED,
                  message: 'Failed to initialize authentication. Please refresh the page.',
                  timestamp: Date.now(),
                  severity: 'high',
                },
              });
            }
          },

          reset: () => {
            set({ ...initialState });
            authStorage.clearAll();
          },

          // Debug utility to help troubleshoot authentication issues
          debugAuthState: () => {
            const state = get();
            const storageStats = authStorage.getStorageStats();
            
            const debugInfo = {
              store: {
                isAuthenticated: state.isAuthenticated,
                hasUser: !!state.user,
                hasTokens: !!state.tokens,
                tokenExpiry: state.tokens?.expiresAt ? new Date(state.tokens.expiresAt).toISOString() : null,
                refreshTokenExpiry: state.tokens?.refreshExpiresAt ? new Date(state.tokens.refreshExpiresAt).toISOString() : null,
                sessionId: state.sessionId,
                lastActivity: state.lastActivity ? new Date(state.lastActivity).toISOString() : null,
                isLoading: state.isLoading,
                isRefreshing: state.isRefreshing,
                error: state.error,
              },
              storage: storageStats,
              currentTime: new Date().toISOString(),
            };
            
            console.log('🔍 Authentication Debug Info:', debugInfo);
            return debugInfo;
          },
        }))
      ),
    {
      name: 'auth-store',
    }
  )
);

/**
 * Initialize authentication state from cookies
 */
export const initializeAuth = (): void => {
  try {
    const tokens = authStorage.getTokens();
    const user = authStorage.getUser();
    const session = authStorage.getSession();
    const securityData = authStorage.getSecurityData();
    
    const isAuthenticated = authStorage.isAuthenticated();
    
    // Update store with data from cookies
    useAuthStore.setState({
      user,
      tokens,
      isAuthenticated,
      isInitialized: true,
      sessionId: session?.sessionId || null,
      lastActivity: session?.lastActivity || Date.now(),
      loginAttempts: securityData.loginAttempts || 0,
      lastLoginAttempt: securityData.lastLoginAttempt || 0,
      isLocked: securityData.isLocked || false,
      lockoutUntil: securityData.lockoutUntil || null,
    });
    
    console.log('Auth initialized from cookies:', { isAuthenticated, hasUser: !!user, hasTokens: !!tokens });
  } catch (error) {
    console.error('Failed to initialize auth from cookies:', error);
    useAuthStore.setState({ isInitialized: true });
  }
};

// Auto-refresh token when it's about to expire
let refreshInterval: NodeJS.Timeout | null = null;

useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    
    if (isAuthenticated) {
      // Check for token refresh every minute
      refreshInterval = setInterval(() => {
        const state = useAuthStore.getState();
        if (state.tokens && shouldRefreshToken(state.tokens.expiresAt)) {
          state.refreshToken();
        }
      }, 60000); // 1 minute
    }
  }
);

// Auto-update last activity on user interaction
if (typeof window !== 'undefined') {
  const updateActivity = () => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      state.updateLastActivity();
    }
  };
  
  // Update activity on various user interactions
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, updateActivity, true);
  });
}

export default useAuthStore;
