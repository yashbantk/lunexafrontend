import { GraphQLClient } from 'graphql-request';

// GraphQL endpoint configuration
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://f49b62996ffc.ngrok-free.app/graphql-apollo/';

// Authorization token
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MTkxMzMzLCJpYXQiOjE3NTgxMDQ5MzMsImp0aSI6ImUwZjk0MjdlNjg1ZjQ3YWNiNTAxZTY0MzkyNDg5ZDVhIiwidXNlcl9pZCI6IjEifQ.Gz6i2pCnEp6vLE7SbXb-2e0ltNUOKG4cTycWLeYBqDg';

// Create GraphQL client instance
export const gqlClient = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN,
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

