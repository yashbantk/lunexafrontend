// Legacy useSignin hook - now uses the new authentication system
// This file is kept for backward compatibility

import { useSignin as useNewSignin } from './useAuth';
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
  
  // Convert new error format to legacy format
  const legacyErrors: SignupError[] = errors.map(error => ({
    field: error.field,
    message: error.message,
    code: error.code,
  }));
  
  const signin = async (input: LoginInput): Promise<{ user: User; tokens: Tokens } | null> => {
    const credentials = {
      email: input.email,
      password: input.password,
      rememberMe: false, // Default value for legacy compatibility
    };
    
    const success = await newSignin(credentials);
    
    if (success) {
      // Get the current state to return user and tokens
      // This is a workaround since the new system doesn't return the data directly
      // In a real implementation, you might want to modify the new system to return data
      return null; // The new system handles success internally
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
