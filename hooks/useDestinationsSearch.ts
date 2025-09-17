import { useState, useCallback } from 'react';
import { gqlRequest } from '@/lib/graphql/client';
import { DESTINATIONS_QUERY } from '@/graphql/queries/destinations';
import { Destination, DestinationFilter, DestinationsResponse } from '@/types/graphql';

interface UseDestinationsSearchReturn {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  searchDestinations: (query: string) => void;
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

export function useDestinationsSearch(): UseDestinationsSearchReturn {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setDestinations([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters: DestinationFilter = {
        searchDestinations: searchQuery.trim()
      };

      const response = await gqlRequest<DestinationsResponse>(DESTINATIONS_QUERY, { filters });
      setDestinations(response.destinations || []);
    } catch (err) {
      console.error('Destinations search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search destinations');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(fetchDestinations, 300),
    [fetchDestinations]
  );

  const searchDestinations = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearResults = useCallback(() => {
    setDestinations([]);
    setError(null);
  }, []);

  return {
    destinations,
    loading,
    error,
    searchDestinations,
    clearResults
  };
}
