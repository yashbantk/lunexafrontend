// Legacy useSignup hook - now uses the new authentication system
// This file is kept for backward compatibility

import { useSignup as useNewSignup, useCurrentUser, useIsAuthenticated } from './useAuth';
import type { SignupInput, User, SignupError } from '@/types/graphql';
import { useEffect } from 'react';

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
  
  // Convert new error format to legacy format
  const legacyErrors: SignupError[] = errors.map(error => ({
    field: error.field,
    message: error.message,
    code: error.code,
  }));
  
  // Handle authentication state changes for success callback
  useEffect(() => {
    if (isAuthenticated && currentUser && options?.onSuccess) {
      // User is now authenticated after signup, trigger success callback
      options.onSuccess(currentUser);
    }
  }, [isAuthenticated, currentUser, options]);
  
  const signup = async (input: SignupInput): Promise<User | null> => {
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


