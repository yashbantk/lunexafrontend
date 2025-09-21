import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { authStorage } from '@/lib/auth/storage';

// GraphQL endpoint configuration
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://f49b62996ffc.ngrok-free.app/graphql-apollo/';


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
  return '';
}

// Create HTTP link with authentication headers
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  headers: {
    authorization: getAuthToken(),
  },
});

// Create error link for handling authentication errors
const errorLink = new ErrorLink(({ error, operation, forward }) => {
  // Check if it's a GraphQL error
  if ('graphQLErrors' in error && error.graphQLErrors) {
    (error.graphQLErrors as any[]).forEach(({ message, locations, path, extensions }: any) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.warn('Authentication error detected, attempting token refresh...');
        // Here you could implement token refresh logic
        // For now, we'll just log the error
      }
    });
  }

  // Check if it's a network error
  if ('networkError' in error && error.networkError) {
    console.error(`[Network error]: ${error.networkError}`);
  }

  // Forward the operation to continue the chain
  return forward(operation);
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    },
  },
});

