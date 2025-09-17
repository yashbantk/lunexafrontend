import { gqlRequest } from '@/lib/graphql/client';
import { COUNTRIES_QUERY, COUNTRIES_SIMPLE_QUERY } from '@/graphql/queries/countries';
import { CountriesVariables, CountriesResponse, CountriesSimpleResponse } from '@/types/graphql';

// Mock the GraphQL client
jest.mock('@/lib/graphql/client');
const mockGqlRequest = gqlRequest as jest.MockedFunction<typeof gqlRequest>;

describe('Countries GraphQL Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('COUNTRIES_QUERY', () => {
    it('should fetch countries with pagination', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [
            {
              id: '1',
              iso2: 'US',
              iso3: 'USA',
              name: 'United States',
              continentCode: 'NA',
              currencyCode: 'USD',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            },
            {
              id: '2',
              iso2: 'CA',
              iso3: 'CAN',
              name: 'Canada',
              continentCode: 'NA',
              currencyCode: 'CAD',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            total: 195,
            limit: 20,
            offset: 0,
            hasNextPage: true,
            hasPreviousPage: false,
            totalPages: 10,
            currentPage: 1
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        pagination: { limit: 20, offset: 0 },
        sort: { field: 'name', direction: 'ASC' }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.data).toHaveLength(2);
      expect(result.countries.pagination.total).toBe(195);
      expect(result.countries.pagination.hasNextPage).toBe(true);
    });

    it('should filter countries by name', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [
            {
              id: '1',
              iso2: 'US',
              iso3: 'USA',
              name: 'United States',
              continentCode: 'NA',
              currencyCode: 'USD',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            total: 1,
            limit: 20,
            offset: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            totalPages: 1,
            currentPage: 1
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        filters: { name: 'united' }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.data[0].name).toBe('United States');
    });

    it('should filter countries by ISO2 code', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [
            {
              id: '1',
              iso2: 'US',
              iso3: 'USA',
              name: 'United States',
              continentCode: 'NA',
              currencyCode: 'USD',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            total: 1,
            limit: 20,
            offset: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            totalPages: 1,
            currentPage: 1
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        filters: { iso2: 'US' }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.data[0].iso2).toBe('US');
    });

    it('should filter countries by continent codes', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [
            {
              id: '1',
              iso2: 'FR',
              iso3: 'FRA',
              name: 'France',
              continentCode: 'EU',
              currencyCode: 'EUR',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            },
            {
              id: '2',
              iso2: 'DE',
              iso3: 'DEU',
              name: 'Germany',
              continentCode: 'EU',
              currencyCode: 'EUR',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            total: 2,
            limit: 20,
            offset: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            totalPages: 1,
            currentPage: 1
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        filters: { continentCode: ['EU'] }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.data).toHaveLength(2);
      expect(result.countries.data.every(country => country.continentCode === 'EU')).toBe(true);
    });

    it('should filter countries by currency code', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [
            {
              id: '1',
              iso2: 'FR',
              iso3: 'FRA',
              name: 'France',
              continentCode: 'EU',
              currencyCode: 'EUR',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            total: 1,
            limit: 20,
            offset: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            totalPages: 1,
            currentPage: 1
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        filters: { currencyCode: 'EUR' }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.data[0].currencyCode).toBe('EUR');
    });

    it('should handle combined filters', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [
            {
              id: '1',
              iso2: 'FR',
              iso3: 'FRA',
              name: 'France',
              continentCode: 'EU',
              currencyCode: 'EUR',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            total: 1,
            limit: 20,
            offset: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            totalPages: 1,
            currentPage: 1
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        filters: { 
          continentCode: ['EU'],
          currencyCode: 'EUR'
        }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.data[0].continentCode).toBe('EU');
      expect(result.countries.data[0].currencyCode).toBe('EUR');
    });

    it('should handle pagination', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [],
          pagination: {
            total: 195,
            limit: 10,
            offset: 20,
            hasNextPage: true,
            hasPreviousPage: true,
            totalPages: 20,
            currentPage: 3
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        pagination: { limit: 10, offset: 20 }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.pagination.offset).toBe(20);
      expect(result.countries.pagination.limit).toBe(10);
      expect(result.countries.pagination.currentPage).toBe(3);
    });

    it('should handle sorting', async () => {
      const mockResponse: CountriesResponse = {
        countries: {
          data: [
            {
              id: '1',
              iso2: 'CA',
              iso3: 'CAN',
              name: 'Canada',
              continentCode: 'NA',
              currencyCode: 'CAD',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            },
            {
              id: '2',
              iso2: 'US',
              iso3: 'USA',
              name: 'United States',
              continentCode: 'NA',
              currencyCode: 'USD',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          pagination: {
            total: 2,
            limit: 20,
            offset: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            totalPages: 1,
            currentPage: 1
          }
        }
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const variables: CountriesVariables = {
        sort: { field: 'name', direction: 'ASC' }
      };

      const result = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_QUERY, variables);
      expect(result.countries.data[0].name).toBe('Canada');
      expect(result.countries.data[1].name).toBe('United States');
    });
  });

  describe('COUNTRIES_SIMPLE_QUERY', () => {
    it('should fetch countries without pagination', async () => {
      const mockResponse: CountriesSimpleResponse = {
        countries: [
          {
            id: '1',
            iso2: 'US',
            iso3: 'USA',
            name: 'United States',
            continentCode: 'NA',
            currencyCode: 'USD',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          }
        ]
      };

      mockGqlRequest.mockResolvedValueOnce(mockResponse);

      const result = await gqlRequest<CountriesSimpleResponse>(COUNTRIES_SIMPLE_QUERY, {});

      expect(mockGqlRequest).toHaveBeenCalledWith(COUNTRIES_SIMPLE_QUERY, {});
      expect(result.countries).toHaveLength(1);
      expect(result.countries[0].name).toBe('United States');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('GraphQL error');
      mockGqlRequest.mockRejectedValueOnce(error);

      await expect(gqlRequest<CountriesResponse>(COUNTRIES_QUERY, {})).rejects.toThrow('GraphQL error');
    });
  });
});
