// Legacy useSignup hook - now uses the new authentication system
// This file is kept for backward compatibility

import { useSignup as useNewSignup, useCurrentUser, useIsAuthenticated } from './useAuth';
import type { SignupInput, User, SignupError } from '@/types/graphql';
import { useEffect, useRef, useCallback } from 'react';

export interface UseSignupOptions {
  onSuccess?: (result: User) => void;
  onError?: (error: SignupError[]) => void;
}

export interface UseSignupReturn {
  signup: (input: SignupInput) => Promise<User | null>;
  loading: boolean;
  errors: SignupError[];
  clearErrors: () => void;
}

/**
 * Legacy useSignup hook for backward compatibility
 * @deprecated Use useSignup from './useAuth' instead
 */
export const useSignup = (options?: UseSignupOptions): UseSignupReturn => {
  const { signup: newSignup, loading, errors, clearErrors } = useNewSignup();
  const currentUser = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  
  // Use refs to track if we've already triggered the success callback
  const hasTriggeredSuccess = useRef(false);
  const lastUserRef = useRef<string | null>(null);
  
  // Memoize the success callback to prevent infinite loops
  const onSuccessCallback = useCallback((user: User) => {
    if (options?.onSuccess) {
      console.log('useSignup: Triggering onSuccess callback', { user, isAuthenticated });
      options.onSuccess(user);
    }
  }, [options?.onSuccess, isAuthenticated]);
  
  // Convert new error format to legacy format
  const legacyErrors: SignupError[] = errors.map(error => ({
    field: error.field,
    message: error.message,
    code: error.code,
  }));
  
  // Handle authentication state changes for success callback
  useEffect(() => {
    if (isAuthenticated && currentUser && !hasTriggeredSuccess.current) {
      // Check if this is a new authentication (different user)
      const currentUserKey = currentUser.id;
      
      if (lastUserRef.current !== currentUserKey) {
        hasTriggeredSuccess.current = true;
        lastUserRef.current = currentUserKey;
        
        onSuccessCallback(currentUser);
      }
    }
  }, [isAuthenticated, currentUser, onSuccessCallback]);
  
  const signup = async (input: SignupInput): Promise<User | null> => {
    // Reset the success trigger flag to allow new callbacks
    hasTriggeredSuccess.current = false;
    lastUserRef.current = null;
    
    const credentials = {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: input.password,
      confirmPassword: input.password, // Use same password for confirmation
      acceptTerms: true, // Default to true for legacy compatibility
    };
    
    const success = await newSignup(credentials);
    
    if (success) {
      // Return the current user if authenticated, otherwise null
      // The useEffect above will handle the success callback
      return currentUser || null;
    }
    
    return null;
  };
  
  return {
    signup,
    loading,
    errors: legacyErrors,
    clearErrors,
  };
};


