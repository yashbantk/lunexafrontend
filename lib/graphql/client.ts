import { GraphQLClient } from 'graphql-request';
import { authStorage } from '@/lib/auth/storage';

// GraphQL endpoint configuration
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://f49b62996ffc.ngrok-free.app/graphql-apollo/';

// Fallback token for initial requests (before user authentication)
const FALLBACK_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MTkxMzMzLCJpYXQiOjE3NTgxMDQ5MzMsImp0aSI6ImUwZjk0MjdlNjg1ZjQ3YWNiNTAxZTY0MzkyNDg5ZDVhIiwidXNlcl9pZCI6IjEifQ.Gz6i2pCnEp6vLE7SbXb-2e0ltNUOKG4cTycWLeYBqDg';

// Create base GraphQL client instance (without auth header)
export const gqlClient = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get the current authentication token from storage
 * Falls back to the hardcoded token if no user token is available
 */
function getAuthToken(): string {
  try {
    const tokens = authStorage.getTokens();
    if (tokens?.access) {
      return `Bearer ${tokens.access}`;
    }
  } catch (error) {
    console.warn('Failed to retrieve auth token from storage:', error);
  }
  
  // Fallback to hardcoded token for initial requests
  return FALLBACK_TOKEN;
}

/**
 * Create a GraphQL client with current authentication token
 */
function createAuthenticatedClient(): GraphQLClient {
  const token = getAuthToken();
  
  return new GraphQLClient(GRAPHQL_URL, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  });
}

// Generic request helper with dynamic authentication and token refresh
export const gqlRequest = async <T = any>(query: string, variables?: Record<string, any>) => {
  try {
    // Create a new client instance with current auth token for each request
    const authenticatedClient = createAuthenticatedClient();
    
    console.log('GraphQL Request:', { 
      query, 
      variables,
      authToken: getAuthToken().substring(0, 20) + '...' // Log partial token for debugging
    });
    
    const result = await authenticatedClient.request<T>(query, variables);
    console.log('GraphQL Response:', result);
    return result;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    
    // Check if this is an authentication error
    if (isAuthenticationError(error)) {
      console.warn('Authentication error detected, attempting token refresh...');
      
      try {
        // Attempt to refresh the token
        const { useAuthStore } = await import('@/lib/auth/store');
        const authStore = useAuthStore.getState();
        
        if (authStore.tokens?.refresh) {
          const refreshSuccess = await authStore.refreshToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed successfully, retrying request...');
            // Retry the request with the new token
            const retryClient = createAuthenticatedClient();
            return await retryClient.request<T>(query, variables);
          }
        }
        
        // If refresh failed, clear auth and redirect to login
        console.error('Token refresh failed, clearing authentication...');
        authStore.logout();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
      } catch (refreshError) {
        console.error('Error during token refresh:', refreshError);
      }
    }
    
    // Log detailed error information
    if (error && typeof error === 'object') {
      console.log('Error details:', {
        message: (error as any).message,
        response: (error as any).response,
        request: (error as any).request,
        stack: (error as any).stack
      });
    }
    
    throw error;
  }
};

/**
 * Check if the error is related to authentication
 */
function isAuthenticationError(error: any): boolean {
  if (!error) return false;
  
  // Check for common authentication error patterns
  const authErrorPatterns = [
    'unauthorized',
    'authentication',
    'token',
    'invalid token',
    'expired token',
    'access denied',
    'forbidden'
  ];
  
  const errorMessage = (error.message || '').toLowerCase();
  const responseMessage = (error.response?.errors?.[0]?.message || '').toLowerCase();
  
  return authErrorPatterns.some(pattern => 
    errorMessage.includes(pattern) || responseMessage.includes(pattern)
  );
}

// Alternative Apollo Client setup (commented out)
/*
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
*/

