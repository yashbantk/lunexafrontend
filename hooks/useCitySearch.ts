import { useState, useCallback, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { CITIES_QUERY } from '@/graphql/queries/cities';
import { City, CityFilter, CitiesResponse } from '@/types/graphql';

interface UseCitySearchReturn {
  cities: City[];
  loading: boolean;
  error: string | null;
  searchCities: (query: string) => void;
  clearResults: () => void;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function useCitySearch(): UseCitySearchReturn {
  const [cities, setCities] = useState<City[]>([]);
  
  const [fetchCities, { data, loading, error }] = useLazyQuery(CITIES_QUERY as any, {
    errorPolicy: 'all'
  });

  // Handle data when it changes
  useEffect(() => {
    if (data && typeof data === 'object' && data !== null && 'cities' in data) {
      setCities((data as any).cities);
    }
  }, [data]);

  // Handle errors when they change
  useEffect(() => {
    if (error) {
      console.error('City search error:', error);
      setCities([]);
    }
  }, [error]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setCities([]);
        return;
      }

      const filters: CityFilter = {
        searchCities: searchQuery.trim()
      };

      fetchCities({
        variables: { filters }
      });
    }, 300),
    [fetchCities]
  );

  const searchCities = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearResults = useCallback(() => {
    setCities([]);
  }, []);

  return {
    cities,
    loading,
    error: error?.message || null,
    searchCities,
    clearResults
  };
}
