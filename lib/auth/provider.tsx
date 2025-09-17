// Authentication provider component for React context

"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from './store';
import type { AuthState, AuthActions } from '@/types/auth';

/**
 * Authentication context type
 */
interface AuthContextType extends AuthState, AuthActions {}

/**
 * Create authentication context
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuthStore();
  
  // Initialize authentication on mount
  useEffect(() => {
    if (!authState.isInitialized) {
      authState.initialize();
    }
  }, [authState.isInitialized, authState.initialize, authState]);
  
  // Auto-validate session periodically
  useEffect(() => {
    if (authState.isAuthenticated) {
      const interval = setInterval(() => {
        authState.validateSession();
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, authState.validateSession, authState]);
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated, isInitialized } = useAuth();
  return isInitialized && isAuthenticated;
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  return isInitialized && isAuthenticated ? user : null;
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission(resource: string, action: string): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  // Basic permission check - extend this based on your needs
  if (user.isSuperuser) return true;
  if (user.isStaff && resource === 'admin') return true;
  
  // Add more permission logic here based on user groups
  return user.groups.includes(`${resource}:${action}`);
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasRole(roles: string[]): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  return roles.some(role => {
    switch (role) {
      case 'superuser':
        return user.isSuperuser;
      case 'staff':
        return user.isStaff;
      case 'user':
        return user.isActive;
      default:
        return user.groups.includes(role);
    }
  });
}

/**
 * Higher-order component for protected routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredRole?: string;
    requiredPermission?: { resource: string; action: string };
    redirectTo?: string;
    fallback?: React.ComponentType;
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isInitialized, user } = useAuth();
    const hasRequiredRole = useHasRole(options.requiredRole ? [options.requiredRole] : []);
    const hasRequiredPermission = useHasPermission(
      options.requiredPermission?.resource || '', 
      options.requiredPermission?.action || ''
    );
    const { requiredRole, requiredPermission, fallback: Fallback } = options;
    
    // Show loading while initializing
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // Redirect if not authenticated
    if (!isAuthenticated || !user) {
      if (Fallback) {
        return <Fallback />;
      }
      
      // Default redirect behavior
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      return null;
    }
    
    // Check role requirement
    if (requiredRole && !hasRequiredRole) {
      if (Fallback) {
        return <Fallback />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      );
    }
    
    // Check permission requirement
    if (requiredPermission && !hasRequiredPermission) {
      if (Fallback) {
        return <Fallback />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have permission to perform this action.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

/**
 * Hook for authentication status with loading state
 */
export function useAuthStatus() {
  const { isAuthenticated, isInitialized, isLoading, error } = useAuth();
  
  return {
    isAuthenticated: isInitialized && isAuthenticated,
    isLoading: !isInitialized || isLoading,
    error,
    isReady: isInitialized,
  };
}

/**
 * Hook for authentication actions
 */
export function useAuthActions() {
  const {
    login,
    signup,
    logout,
    refreshToken,
    clearErrors,
    clearError,
    setLoading,
    resetLoginAttempts,
    incrementLoginAttempts,
    lockAccount,
    updateLastActivity,
    validateSession,
    initialize,
    reset,
  } = useAuth();
  
  return {
    login,
    signup,
    logout,
    refreshToken,
    clearErrors,
    clearError,
    setLoading,
    resetLoginAttempts,
    incrementLoginAttempts,
    lockAccount,
    updateLastActivity,
    validateSession,
    initialize,
    reset,
  };
}

export default AuthProvider;
