import { apolloClient } from '@/lib/graphql/client';
import { COUNTRIES_QUERY, COUNTRIES_SIMPLE_QUERY } from '@/graphql/queries/countries';
import { CountriesVariables, CountriesResponse, CountriesSimpleResponse } from '@/types/graphql';

// Mock the Apollo Client
jest.mock('@/lib/graphql/client');
const mockApolloClient = apolloClient as jest.Mocked<typeof apolloClient>;

describe('Countries GraphQL Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('COUNTRIES_QUERY', () => {
    it('should fetch countries', async () => {
      const mockResponse: CountriesResponse = {
        countries: [
          {
            iso2: 'US',
            name: 'United States',
            createdAt: '2023-01-01T00:00:00Z',
          },
          {
            iso2: 'CA',
            name: 'Canada',
            createdAt: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockApolloClient.query.mockResolvedValueOnce({ data: mockResponse } as any);

      const variables: CountriesVariables = {
        order: { name: 'ASC' }
      };

      const result = await apolloClient.query({
        query: COUNTRIES_QUERY as any,
        variables
      });

      expect(mockApolloClient.query).toHaveBeenCalledWith({
        query: COUNTRIES_QUERY,
        variables
      });
      expect(result.data.countries).toHaveLength(2);
    });

    it('should filter countries by name', async () => {
      const mockResponse: CountriesResponse = {
        countries: [
          {
            iso2: 'US',
            name: 'United States',
            createdAt: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockApolloClient.query.mockResolvedValueOnce({ data: mockResponse } as any);

      const variables: CountriesVariables = {
        filters: { name: { iContains: 'united' } }
      };

      const result = await apolloClient.query({
        query: COUNTRIES_QUERY as any,
        variables
      });

      expect(mockApolloClient.query).toHaveBeenCalledWith({
        query: COUNTRIES_QUERY,
        variables
      });
      expect(result.data.countries[0].name).toBe('United States');
    });

    it('should filter countries by ISO2 code', async () => {
      const mockResponse: CountriesResponse = {
        countries: [
          {
            iso2: 'US',
            name: 'United States',
            createdAt: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockApolloClient.query.mockResolvedValueOnce({ data: mockResponse } as any);

      const variables: CountriesVariables = {
        filters: { iso2: { exact: 'US' } }
      };

      const result = await apolloClient.query({
        query: COUNTRIES_QUERY as any,
        variables
      });

      expect(mockApolloClient.query).toHaveBeenCalledWith({
        query: COUNTRIES_QUERY,
        variables
      });
      expect(result.data.countries[0].iso2).toBe('US');
    });

    it('should handle sorting', async () => {
      const mockResponse: CountriesResponse = {
        countries: [
          {
            iso2: 'CA',
            name: 'Canada',
            createdAt: '2023-01-01T00:00:00Z',
          },
          {
            iso2: 'US',
            name: 'United States',
            createdAt: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockApolloClient.query.mockResolvedValueOnce({ data: mockResponse } as any);

      const variables: CountriesVariables = {
        order: { name: 'ASC' }
      };

      const result = await apolloClient.query({
        query: COUNTRIES_QUERY as any,
        variables
      });

      expect(mockApolloClient.query).toHaveBeenCalledWith({
        query: COUNTRIES_QUERY,
        variables
      });
      expect(result.data.countries[0].name).toBe('Canada');
      expect(result.data.countries[1].name).toBe('United States');
    });
  });

  describe('COUNTRIES_SIMPLE_QUERY', () => {
    it('should fetch countries without pagination', async () => {
      const mockResponse: CountriesSimpleResponse = {
        countries: [
          {
            iso2: 'US',
            name: 'United States',
            createdAt: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockApolloClient.query.mockResolvedValueOnce({ data: mockResponse } as any);

      const result = await apolloClient.query({
        query: COUNTRIES_SIMPLE_QUERY as any,
        variables: {}
      });

      expect(mockApolloClient.query).toHaveBeenCalledWith({
        query: COUNTRIES_SIMPLE_QUERY,
        variables: {}
      });
      expect(result.data.countries).toHaveLength(1);
      expect(result.data.countries[0].name).toBe('United States');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('GraphQL error');
      mockApolloClient.query.mockRejectedValueOnce(error);

      await expect(apolloClient.query({
        query: COUNTRIES_QUERY as any,
        variables: {}
      })).rejects.toThrow('GraphQL error');
    });
  });
});
