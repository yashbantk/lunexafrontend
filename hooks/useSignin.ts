// Legacy useSignin hook - now uses the new authentication system
// This file is kept for backward compatibility

import { useSignin as useNewSignin, useCurrentUser, useAuth } from './useAuth';
import { useEffect, useRef, useCallback } from 'react';
import type { LoginInput, User, Tokens, SignupError } from '@/types/graphql';

export interface UseSigninOptions {
  onSuccess?: (result: { user: User; tokens: Tokens }) => void;
  onError?: (error: SignupError[]) => void;
}

export interface UseSigninReturn {
  signin: (input: LoginInput) => Promise<{ user: User; tokens: Tokens } | null>;
  loading: boolean;
  errors: SignupError[];
  clearErrors: () => void;
}

/**
 * Legacy useSignin hook for backward compatibility
 * @deprecated Use useSignin from './useAuth' instead
 */
export const useSignin = (options?: UseSigninOptions): UseSigninReturn => {
  const { signin: newSignin, loading, errors, clearErrors } = useNewSignin();
  const currentUser = useCurrentUser();
  const { tokens } = useAuth();
  
  // Use refs to track if we've already triggered the success callback
  const hasTriggeredSuccess = useRef(false);
  const lastUserRef = useRef<string | null>(null);
  const lastTokensRef = useRef<string | null>(null);
  
  // Memoize the success callback to prevent infinite loops
  const onSuccessCallback = useCallback((result: { user: User; tokens: Tokens }) => {
    if (options?.onSuccess) {
      console.log('useSignin: Triggering onSuccess callback', { currentUser, tokens });
      options.onSuccess(result);
    }
  }, [options?.onSuccess]);
  
  // Handle success callback when user becomes authenticated
  useEffect(() => {
    if (currentUser && tokens && !hasTriggeredSuccess.current) {
      // Check if this is a new authentication (different user or tokens)
      const currentUserKey = currentUser.id;
      const currentTokensKey = tokens.access;
      
      if (lastUserRef.current !== currentUserKey || lastTokensRef.current !== currentTokensKey) {
        hasTriggeredSuccess.current = true;
        lastUserRef.current = currentUserKey;
        lastTokensRef.current = currentTokensKey;
        
        const result = {
          user: currentUser as User,
          tokens: {
            access: tokens.access,
            refresh: tokens.refresh,
            expiresAt: tokens.expiresAt,
            refreshExpiresAt: tokens.refreshExpiresAt,
          } as Tokens,
        };
        
        onSuccessCallback(result);
      }
    }
  }, [currentUser, tokens, onSuccessCallback]);
  
  // Convert new error format to legacy format
  const legacyErrors: SignupError[] = errors.map(error => ({
    field: error.field,
    message: error.message,
    code: error.code,
  }));
  
  const signin = async (input: LoginInput): Promise<{ user: User; tokens: Tokens } | null> => {
    // Reset the success trigger flag to allow new callbacks
    hasTriggeredSuccess.current = false;
    lastUserRef.current = null;
    lastTokensRef.current = null;
    
    const credentials = {
      email: input.email,
      password: input.password,
      rememberMe: false, // Default value for legacy compatibility
    };
    
    const success = await newSignin(credentials);
    
    if (success && currentUser && tokens) {
      // Return user data for immediate use
      return {
        user: currentUser as User,
        tokens: {
          access: tokens.access,
          refresh: tokens.refresh,
          expiresAt: tokens.expiresAt,
          refreshExpiresAt: tokens.refreshExpiresAt,
        } as Tokens,
      };
    }
    
    return null;
  };
  
  return {
    signin,
    loading,
    errors: legacyErrors,
    clearErrors,
  };
};
