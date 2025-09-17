// Enhanced authentication hooks using Zustand store

import { 
  useAuth as useAuthContext, 
  useIsAuthenticated as useIsAuthenticatedContext, 
  useCurrentUser as useCurrentUserContext, 
  useHasPermission as useHasPermissionContext, 
  useHasRole as useHasRoleContext, 
  useAuthStatus as useAuthStatusContext, 
  useAuthActions as useAuthActionsContext 
} from '@/lib/auth/provider';
import type { LoginCredentials, SignupCredentials, AuthError } from '@/types/auth';

/**
 * Main authentication hook
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated() {
  return useIsAuthenticatedContext();
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useCurrentUserContext();
}

/**
 * Hook to check permissions
 */
export function useHasPermission(resource: string, action: string) {
  return useHasPermissionContext(resource, action);
}

/**
 * Hook to check roles
 */
export function useHasRole(roles: string[]) {
  return useHasRoleContext(roles);
}

/**
 * Hook for authentication status with loading states
 */
export function useAuthStatus() {
  return useAuthStatusContext();
}

/**
 * Hook for authentication actions
 */
export function useAuthActions() {
  return useAuthActionsContext();
}

/**
 * Enhanced signin hook with comprehensive error handling
 */
export function useSignin() {
  const { login, isLoading, errors, error, clearErrors } = useAuth();
  
  const signin = async (credentials: LoginCredentials) => {
    clearErrors();
    return await login(credentials);
  };
  
  return {
    signin,
    loading: isLoading,
    errors,
    error,
    clearErrors,
  };
}

/**
 * Enhanced signup hook with comprehensive error handling
 */
export function useSignup() {
  const { signup, isLoading, errors, error, clearErrors } = useAuth();
  
  const signupUser = async (credentials: SignupCredentials) => {
    clearErrors();
    return await signup(credentials);
  };
  
  return {
    signup: signupUser,
    loading: isLoading,
    errors,
    error,
    clearErrors,
  };
}

/**
 * Hook for logout functionality
 */
export function useLogout() {
  const { logout, isLoading } = useAuth();
  
  return {
    logout,
    loading: isLoading,
  };
}

/**
 * Hook for token refresh
 */
export function useTokenRefresh() {
  const { refreshToken, isRefreshing } = useAuth();
  
  return {
    refreshToken,
    isRefreshing,
  };
}

/**
 * Hook for session management
 */
export function useSession() {
  const { validateSession, updateLastActivity, lastActivity, sessionId } = useAuth();
  
  return {
    validateSession,
    updateLastActivity,
    lastActivity,
    sessionId,
  };
}

/**
 * Hook for security features
 */
export function useSecurity() {
  const { 
    loginAttempts, 
    isLocked, 
    lockoutUntil, 
    resetLoginAttempts, 
    incrementLoginAttempts, 
    lockAccount 
  } = useAuth();
  
  const isAccountLocked = isLocked && lockoutUntil && Date.now() < lockoutUntil;
  const lockoutRemainingTime = isAccountLocked ? Math.ceil((lockoutUntil - Date.now()) / 1000 / 60) : 0;
  
  return {
    loginAttempts,
    isLocked: isAccountLocked,
    lockoutRemainingTime,
    resetLoginAttempts,
    incrementLoginAttempts,
    lockAccount,
  };
}

/**
 * Hook for error handling
 */
export function useAuthErrors() {
  const { errors, error, clearErrors, clearError } = useAuth();
  
  const getFieldError = (field: string): AuthError | undefined => {
    return errors.find(err => err.field === field);
  };
  
  const getGeneralErrors = (): AuthError[] => {
    return errors.filter(err => !err.field);
  };
  
  const hasErrors = errors.length > 0;
  const hasFieldError = (field: string): boolean => {
    return errors.some(err => err.field === field);
  };
  
  return {
    errors,
    error,
    clearErrors,
    clearError,
    getFieldError,
    getGeneralErrors,
    hasErrors,
    hasFieldError,
  };
}

/**
 * Hook for user profile management
 */
export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  
  const isProfileComplete = user ? 
    !!(user.firstName && user.lastName && user.email) : false;
  
  const getDisplayName = (): string => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  };
  
  const getInitials = (): string => {
    if (!user) return '';
    const firstInitial = user.firstName.charAt(0).toUpperCase();
    const lastInitial = user.lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };
  
  return {
    user,
    isAuthenticated,
    isProfileComplete,
    getDisplayName,
    getInitials,
  };
}

/**
 * Hook for authentication state debugging
 */
export function useAuthDebug() {
  const authState = useAuth();
  
  const getDebugInfo = () => {
    return {
      isAuthenticated: authState.isAuthenticated,
      isInitialized: authState.isInitialized,
      isLoading: authState.isLoading,
      isRefreshing: authState.isRefreshing,
      hasUser: !!authState.user,
      hasTokens: !!authState.tokens,
      sessionId: authState.sessionId,
      lastActivity: authState.lastActivity ? new Date(authState.lastActivity).toISOString() : null,
      loginAttempts: authState.loginAttempts,
      isLocked: authState.isLocked,
      lockoutUntil: authState.lockoutUntil ? new Date(authState.lockoutUntil).toISOString() : null,
      errorCount: authState.errors.length,
      hasError: !!authState.error,
    };
  };
  
  return {
    getDebugInfo,
    authState,
  };
}

export default useAuth;
