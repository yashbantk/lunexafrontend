import { useState, useCallback } from 'react';
import { gqlRequest } from '@/lib/graphql/client';
import { LOGIN_MUTATION } from '@/graphql/mutations/user';
import type { 
  LoginInput, 
  LoginResponse, 
  LoginVariables, 
  User, 
  Tokens,
  SignupError 
} from '@/types/graphql';

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

export const useSignin = (options?: UseSigninOptions): UseSigninReturn => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<SignupError[]>([]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const signin = useCallback(async (input: LoginInput): Promise<{ user: User; tokens: Tokens } | null> => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate input
      const validationErrors = validateLoginInput(input);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        options?.onError?.(validationErrors);
        setLoading(false);
        return null;
      }

      // Prepare variables for GraphQL mutation
      const variables: LoginVariables = {
        email: input.email.trim(),
        password: input.password,
      };

      // Execute GraphQL mutation
      const response = await gqlRequest<LoginResponse>(LOGIN_MUTATION, variables);
      
      if (response?.login) {
        const result = response.login;
        
        // Success case - user was authenticated successfully
        const successResult = {
          user: result.user,
          tokens: result.tokens
        };
        
        // Store tokens in localStorage for future requests
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', result.tokens.access);
          localStorage.setItem('refresh_token', result.tokens.refresh);
        }
        
        options?.onSuccess?.(successResult);
        setLoading(false);
        return successResult;
      }

      // Fallback error if no response
      const fallbackError: SignupError = {
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR'
      };
      setErrors([fallbackError]);
      options?.onError?.([fallbackError]);
      setLoading(false);
      return null;

    } catch (error) {
      console.error('Signin error:', error);
      
      // Handle network or GraphQL errors
      const networkError: SignupError = {
        message: 'Invalid email or password. Please check your credentials and try again.',
        code: 'INVALID_CREDENTIALS'
      };
      setErrors([networkError]);
      options?.onError?.([networkError]);
      setLoading(false);
      return null;
    }
  }, [options]);

  return {
    signin,
    loading,
    errors,
    clearErrors,
  };
};

// Helper function to validate login input
const validateLoginInput = (input: LoginInput): SignupError[] => {
  const errors: SignupError[] = [];

  // Email validation
  if (!input.email || !input.email.trim()) {
    errors.push({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (!isValidEmail(input.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
      code: 'INVALID_EMAIL'
    });
  }

  // Password validation
  if (!input.password || !input.password.trim()) {
    errors.push({
      field: 'password',
      message: 'Password is required',
      code: 'REQUIRED_FIELD'
    });
  }

  return errors;
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
