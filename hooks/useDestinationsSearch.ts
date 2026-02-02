import { useState, useCallback, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
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
  
  const [fetchDestinations, { data, loading, error }] = useLazyQuery(DESTINATIONS_QUERY as any, {
    errorPolicy: 'all'
  });

  // Handle data when it changes
  useEffect(() => {
    if (data && typeof data === 'object' && data !== null && 'destinations' in data) {
      setDestinations((data as any).destinations);
    } else {
    }
  }, [data]);

  // Handle errors when they change
  useEffect(() => {
    if (error) {
      console.error('Destinations search error:', error);
      setDestinations([]);
    }
  }, [error]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setDestinations([]);
        return;
      }

      const filters: DestinationFilter = {
        searchDestinations: searchQuery.trim()
      };

      fetchDestinations({
        variables: { filters }
      });
    }, 300),
    [fetchDestinations]
  );

  const searchDestinations = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearResults = useCallback(() => {
    setDestinations([]);
  }, []);

  return {
    destinations,
    loading,
    error: error?.message || null,
    searchDestinations,
    clearResults
  };
}
