import { useState, useCallback, useEffect } from 'react';
import { gqlRequest } from '@/lib/graphql/client';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCities([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters: CityFilter = {
        searchCities: searchQuery.trim()
      };

      const response = await gqlRequest<CitiesResponse>(CITIES_QUERY, { filters });
      setCities(response.cities || []);
    } catch (err) {
      console.error('City search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search cities');
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(fetchCities, 300),
    [fetchCities]
  );

  const searchCities = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearResults = useCallback(() => {
    setCities([]);
    setError(null);
  }, []);

  return {
    cities,
    loading,
    error,
    searchCities,
    clearResults
  };
}
