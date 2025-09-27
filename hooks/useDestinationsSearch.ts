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
    console.log('useDestinationsSearch - data changed:', data);
    if (data && typeof data === 'object' && data !== null && 'destinations' in data) {
      console.log('Destinations search response:', data);
      console.log('Setting destinations:', (data as any).destinations);
      setDestinations((data as any).destinations);
    } else {
      console.log('No destinations in data or data is null');
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
