// Secure API client for authentication operations

import { apolloClient } from '@/lib/graphql/client';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '@/graphql/mutations/user';
import { authConfig, AUTH_ERROR_CODES } from './config';
import type { 
  LoginCredentials, 
  SignupCredentials, 
  User, 
  AuthTokens, 
  AuthError,
  LoginResponse,
  SignupResponse 
} from '@/types/auth';

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  data?: T;
  error?: AuthError;
  success: boolean;
}

/**
 * Create API error
 */
function createApiError(code: string, message: string, field?: string): AuthError {
  return {
    code,
    message,
    field,
    timestamp: Date.now(),
    severity: 'high',
  };
}

/**
 * Handle GraphQL errors
 */
function handleGraphQLError(error: any): AuthError {
  console.error('GraphQL Error:', error);
  
  // Extract error details from the actual error structure
  let errorMessage = 'An unexpected error occurred';
  let errorCode: string = AUTH_ERROR_CODES.UNKNOWN_ERROR;
  let field: string | undefined;
  
  // Handle the specific error format from your API
  if (error?.message) {
    // Try to parse the error message which contains the actual error details
    try {
      const errorDetails = JSON.parse(error.message);
      
      // Extract field-specific errors
      if (errorDetails.email && Array.isArray(errorDetails.email)) {
        const emailError = errorDetails.email[0];
        errorMessage = emailError.string || emailError.message || 'Email error';
        errorCode = AUTH_ERROR_CODES.EMAIL_INVALID;
        field = 'email';
      } else if (errorDetails.password && Array.isArray(errorDetails.password)) {
        const passwordError = errorDetails.password[0];
        errorMessage = passwordError.string || passwordError.message || 'Password error';
        errorCode = AUTH_ERROR_CODES.PASSWORD_TOO_WEAK;
        field = 'password';
      } else if (errorDetails.firstName && Array.isArray(errorDetails.firstName)) {
        const firstNameError = errorDetails.firstName[0];
        errorMessage = firstNameError.string || firstNameError.message || 'First name error';
        errorCode = AUTH_ERROR_CODES.NAME_INVALID;
        field = 'firstName';
      } else if (errorDetails.lastName && Array.isArray(errorDetails.lastName)) {
        const lastNameError = errorDetails.lastName[0];
        errorMessage = lastNameError.string || lastNameError.message || 'Last name error';
        errorCode = AUTH_ERROR_CODES.NAME_INVALID;
        field = 'lastName';
      } else {
        // Generic error
        errorMessage = error.message;
        errorCode = AUTH_ERROR_CODES.SERVER_ERROR;
      }
    } catch (parseError) {
      // If parsing fails, use the raw message
      errorMessage = error.message;
      errorCode = AUTH_ERROR_CODES.SERVER_ERROR;
    }
  } else {
    errorMessage = error?.message || 'An unexpected error occurred';
    errorCode = error?.extensions?.code || AUTH_ERROR_CODES.UNKNOWN_ERROR;
    field = error?.extensions?.field;
  }
  
  // Map common GraphQL errors to our error codes
  const errorCodeMap: Record<string, string> = {
    'INVALID_CREDENTIALS': AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    'ACCOUNT_LOCKED': AUTH_ERROR_CODES.ACCOUNT_LOCKED,
    'ACCOUNT_DISABLED': AUTH_ERROR_CODES.ACCOUNT_DISABLED,
    'EMAIL_ALREADY_EXISTS': AUTH_ERROR_CODES.EMAIL_INVALID,
    'WEAK_PASSWORD': AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
    'unique': AUTH_ERROR_CODES.EMAIL_INVALID, // Handle unique constraint errors
  };
  
  const mappedCode = errorCodeMap[errorCode] || AUTH_ERROR_CODES.SERVER_ERROR;
  
  return createApiError(mappedCode, errorMessage, field);
}

/**
 * Handle network errors
 */
function handleNetworkError(error: any): AuthError {
  console.error('Network Error:', error);
  
  if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return createApiError(AUTH_ERROR_CODES.NETWORK_ERROR, 'Network connection failed. Please check your internet connection.');
  }
  
  if (error?.code === 'TIMEOUT') {
    return createApiError(AUTH_ERROR_CODES.TIMEOUT_ERROR, 'Request timed out. Please try again.');
  }
  
  return createApiError(AUTH_ERROR_CODES.SERVER_ERROR, 'Server error. Please try again later.');
}

/**
 * Authentication API client
 */
export class AuthAPI {
  private static instance: AuthAPI;
  private baseURL: string;
  private timeout: number = 10000; // 10 seconds

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://your-graphql-endpoint.com/graphql';
  }

  static getInstance(): AuthAPI {
    if (!AuthAPI.instance) {
      AuthAPI.instance = new AuthAPI();
    }
    return AuthAPI.instance;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      // Prepare GraphQL variables
      const variables = {
        email: credentials.email.trim(),
        password: credentials.password,
      };

      // Execute GraphQL mutation with timeout
      const response = await Promise.race([
        apolloClient.mutate({
          mutation: LOGIN_MUTATION as any,
          variables
        }).then(result => result.data as LoginResponse),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), this.timeout)
        )
      ]) as LoginResponse;

      if (response?.login) {
        const { user, tokens } = response.login;
        
        // Create enhanced tokens with expiry information
        const enhancedTokens: AuthTokens = {
          access: tokens.access,
          refresh: tokens.refresh,
          expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes from now
          refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        };

        return {
          data: { user, tokens: enhancedTokens },
          success: true,
        };
      }

      return {
        error: createApiError(AUTH_ERROR_CODES.UNKNOWN_ERROR, 'Login failed. Please try again.'),
        success: false,
      };

    } catch (error: any) {
      console.error('Login API Error:', error);
      
      let apiError: AuthError;
      
      if (error?.response?.errors) {
        // GraphQL errors
        const graphqlError = error.response.errors[0];
        apiError = handleGraphQLError(graphqlError);
      } else if (error?.message === 'TIMEOUT') {
        // Timeout error
        apiError = createApiError(AUTH_ERROR_CODES.TIMEOUT_ERROR, 'Request timed out. Please try again.');
      } else {
        // Network or other errors
        apiError = handleNetworkError(error);
      }

      return {
        error: apiError,
        success: false,
      };
    }
  }

  /**
   * Signup user
   */
  async signup(credentials: SignupCredentials): Promise<ApiResponse<User>> {
    try {
      // Prepare GraphQL variables
      const variables = {
        email: credentials.email.trim(),
        firstName: credentials.firstName.trim(),
        lastName: credentials.lastName.trim(),
        password: credentials.password,
      };

      // Execute GraphQL mutation with timeout
      const response = await Promise.race([
        apolloClient.mutate({
          mutation: SIGNUP_MUTATION as any,
          variables
        }).then(result => result.data as SignupResponse),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), this.timeout)
        )
      ]) as SignupResponse;

      if (response?.register) {
        return {
          data: response.register,
          success: true,
        };
      }

      return {
        error: createApiError(AUTH_ERROR_CODES.UNKNOWN_ERROR, 'Signup failed. Please try again.'),
        success: false,
      };

    } catch (error: any) {
      console.error('Signup API Error:', error);
      
      let apiError: AuthError;
      
      if (error?.response?.errors) {
        // GraphQL errors
        const graphqlError = error.response.errors[0];
        apiError = handleGraphQLError(graphqlError);
      } else if (error?.message === 'TIMEOUT') {
        // Timeout error
        apiError = createApiError(AUTH_ERROR_CODES.TIMEOUT_ERROR, 'Request timed out. Please try again.');
      } else {
        // Network or other errors
        apiError = handleNetworkError(error);
      }

      return {
        error: apiError,
        success: false,
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    try {
      // TODO: Implement token refresh endpoint
      // For now, return error as this needs backend implementation
      return {
        error: createApiError(
          AUTH_ERROR_CODES.SERVER_ERROR,
          'Token refresh not implemented yet'
        ),
        success: false,
      };
    } catch (error: any) {
      console.error('Token Refresh Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      // TODO: Implement logout endpoint
      // For now, just return success as logout is handled client-side
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Logout Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      // TODO: Implement session validation endpoint
      // For now, return error as this needs backend implementation
      return {
        error: createApiError(
          AUTH_ERROR_CODES.SERVER_ERROR,
          'Session validation not implemented yet'
        ),
        success: false,
      };
    } catch (error: any) {
      console.error('Session Validation Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      // TODO: Implement get user profile endpoint
      // For now, return error as this needs backend implementation
      return {
        error: createApiError(
          AUTH_ERROR_CODES.SERVER_ERROR,
          'Get user profile not implemented yet'
        ),
        success: false,
      };
    } catch (error: any) {
      console.error('Get User Profile Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      // TODO: Implement update user profile endpoint
      // For now, return error as this needs backend implementation
      return {
        error: createApiError(
          AUTH_ERROR_CODES.SERVER_ERROR,
          'Update user profile not implemented yet'
        ),
        success: false,
      };
    } catch (error: any) {
      console.error('Update User Profile Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Implement change password endpoint
      // For now, return error as this needs backend implementation
      return {
        error: createApiError(
          AUTH_ERROR_CODES.SERVER_ERROR,
          'Change password not implemented yet'
        ),
        success: false,
      };
    } catch (error: any) {
      console.error('Change Password Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Implement password reset request endpoint
      // For now, return error as this needs backend implementation
      return {
        error: createApiError(
          AUTH_ERROR_CODES.SERVER_ERROR,
          'Password reset not implemented yet'
        ),
        success: false,
      };
    } catch (error: any) {
      console.error('Password Reset Request Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Implement password reset with token endpoint
      // For now, return error as this needs backend implementation
      return {
        error: createApiError(
          AUTH_ERROR_CODES.SERVER_ERROR,
          'Password reset not implemented yet'
        ),
        success: false,
      };
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      
      return {
        error: handleNetworkError(error),
        success: false,
      };
    }
  }
}

// Export singleton instance
export const authAPI = AuthAPI.getInstance();
