import { GraphQLClient } from 'graphql-request';

// GraphQL endpoint configuration
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://your-graphql-endpoint.com/graphql';

// Create GraphQL client instance
export const gqlClient = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic request helper
export const gqlRequest = async <T = any>(query: string, variables?: Record<string, any>) => {
  try {
    console.log('GraphQL Request:', { query, variables });
    const result = await gqlClient.request<T>(query, variables);
    console.log('GraphQL Response:', result);
    return result;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    
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

