import { gql } from 'graphql-request';

export const DESTINATIONS_QUERY = gql`
  query Destinations($filters: DestinationFilter) {
    destinations(filters: $filters) {
      id
      title
      description
      heroImageUrl
      highlights
      isFeatured
      createdAt
      updatedAt
    }
  }
`;
