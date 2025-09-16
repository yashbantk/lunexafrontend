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
    return await gqlClient.request<T>(query, variables);
  } catch (error) {
    console.error('GraphQL request failed:', error);
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

