import { gql } from '@apollo/client';

export const COUNTRIES_QUERY = gql`
  query Countries(
    $filters: CountryFilter
    $pagination: PaginationInput
    $sort: SortInput
  ) {
    countries(
      filters: $filters
      pagination: $pagination
      sort: $sort
    ) {
      data {
        iso2
        name
        createdAt
        updatedAt
      }
      pagination {
        total
        limit
        offset
        hasNextPage
        hasPreviousPage
        totalPages
        currentPage
      }
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
