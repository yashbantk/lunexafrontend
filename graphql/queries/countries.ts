import { gql } from '@apollo/client';

export const COUNTRIES_QUERY = gql`
  query Countries(
    $filters: CountryFilter
    $order: CountryOrder
  ) {
    countries(
      filters: $filters
      order: $order
    ) {
      iso2
      name
      createdAt
      updatedAt
    }
  }
`;

// Alternative simplified query without pagination wrapper
export const COUNTRIES_SIMPLE_QUERY = gql`
  query CountriesSimple($filters: CountryFilter) {
    countries(filters: $filters) {
      iso2
      name
      createdAt
      updatedAt
    }
  }
`;
