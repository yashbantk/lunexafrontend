import { useState, useCallback } from 'react';
import { gqlRequest } from '@/lib/graphql/client';
import { SIGNUP_MUTATION } from '@/graphql/mutations/user';
import type { 
  SignupInput, 
  SignupResponse, 
  SignupVariables, 
  User, 
  SignupError 
} from '@/types/graphql';

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

export const useSignup = (options?: UseSignupOptions): UseSignupReturn => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<SignupError[]>([]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const signup = useCallback(async (input: SignupInput): Promise<User | null> => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate input
      const validationErrors = validateSignupInput(input);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        options?.onError?.(validationErrors);
        setLoading(false);
        return null;
      }

      // Prepare variables for GraphQL mutation
      const variables: SignupVariables = {
        email: input.email.trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        password: input.password,
      };

      // Execute GraphQL mutation
      const response = await gqlRequest<SignupResponse>(SIGNUP_MUTATION, variables);
      
      if (response?.register) {
        const result = response.register;
        
        // Success case - user was created successfully
        options?.onSuccess?.(result);
        setLoading(false);
        return result;
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
      console.error('Signup error:', error);
      
      // Handle network or GraphQL errors
      const networkError: SignupError = {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      };
      setErrors([networkError]);
      options?.onError?.([networkError]);
      setLoading(false);
      return null;
    }
  }, [options]);

  return {
    signup,
    loading,
    errors,
    clearErrors,
  };
};

// Helper function to validate signup input
const validateSignupInput = (input: SignupInput): SignupError[] => {
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

  // First name validation
  if (!input.firstName || !input.firstName.trim()) {
    errors.push({
      field: 'firstName',
      message: 'First name is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (input.firstName.trim().length < 2) {
    errors.push({
      field: 'firstName',
      message: 'First name must be at least 2 characters',
      code: 'MIN_LENGTH'
    });
  }

  // Last name validation
  if (!input.lastName || !input.lastName.trim()) {
    errors.push({
      field: 'lastName',
      message: 'Last name is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (input.lastName.trim().length < 2) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be at least 2 characters',
      code: 'MIN_LENGTH'
    });
  }

  // Password validation
  if (!input.password || !input.password.trim()) {
    errors.push({
      field: 'password',
      message: 'Password is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (input.password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters',
      code: 'MIN_LENGTH'
    });
  }

  return errors;
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


