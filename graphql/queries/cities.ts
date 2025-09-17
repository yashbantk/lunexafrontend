import { gql } from 'graphql-request';

export const CITIES_QUERY = gql`
  query Cities($filters: CityFilter) {
    cities(filters: $filters) {
      id
      name
      country {
        iso2
        name
        createdAt
      }
      timezone
      lat
      lon
      createdAt
    }
  }
`;
