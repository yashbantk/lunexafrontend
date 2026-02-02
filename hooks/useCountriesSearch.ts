import { useState, useCallback, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { COUNTRIES_QUERY, COUNTRIES_SIMPLE_QUERY } from '@/graphql/queries/countries';
import { 
  Country, 
  CountryFilter, 
  CountryOrder,
  SortInput,
  CountriesVariables 
} from '@/types/graphql';

interface UseCountriesSearchReturn {
  countries: Country[];
  loading: boolean;
  error: string | null;
  // Kept for compatibility but always null
  pagination: null;
  searchCountries: (filters: CountryFilter, pagination?: any, sort?: SortInput) => void;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  clearResults: () => void;
  setPage: (page: number) => void;
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

export function useCountriesSearch(): UseCountriesSearchReturn {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentFilters, setCurrentFilters] = useState<CountryFilter>({});
  const [currentSort, setCurrentSort] = useState<SortInput>({ field: 'name', direction: 'ASC' });

  const [fetchCountries, { data, loading, error }] = useLazyQuery(COUNTRIES_QUERY as any, {
    errorPolicy: 'all'
  });

  // Handle data when it changes
  useEffect(() => {
    if (data && typeof data === 'object' && data !== null && 'countries' in data) {
      // Direct array response now
      setCountries((data as any).countries || []);
    }
  }, [data]);

  // Handle errors when they change
  useEffect(() => {
    if (error) {
      console.error('Countries search error:', error);
      setCountries([]);
    }
  }, [error]);

  const searchCountriesInternal = useCallback(async (
    filters: CountryFilter, 
    _pagination?: any, // Ignored
    sort?: SortInput
  ) => {
    const sortToUse = sort || currentSort;
    const order: CountryOrder = {
      [sortToUse.field]: sortToUse.direction
    };

    const variables: CountriesVariables = {
      filters,
      order
    };

    setCurrentFilters(filters);
    if (sort) setCurrentSort(sort);

    await fetchCountries({
      variables
    });
  }, [fetchCountries, currentSort]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((filters: CountryFilter, _pagination?: any, sort?: SortInput) => {
      searchCountriesInternal(filters, _pagination, sort);
    }, 300),
    [searchCountriesInternal]
  );

  const clearResults = useCallback(() => {
    setCountries([]);
    setCurrentFilters({});
    setCurrentSort({ field: 'name', direction: 'ASC' });
  }, []);

  return {
    countries,
    loading,
    error: error?.message || null,
    pagination: null,
    searchCountries: debouncedSearch,
    fetchNextPage: () => {}, // No-op
    fetchPreviousPage: () => {}, // No-op
    clearResults,
    setPage: (_page: number) => {} // No-op
  };
}

// Simple hook for basic country fetching without pagination
export function useCountriesSimple(): {
  countries: Country[];
  loading: boolean;
  error: string | null;
  fetchCountries: (filters?: CountryFilter) => void;
  clearResults: () => void;
} {
  const [countries, setCountries] = useState<Country[]>([]);
  
  const [fetchCountriesQuery, { data, loading, error }] = useLazyQuery(COUNTRIES_SIMPLE_QUERY as any, {
    errorPolicy: 'all'
  });

  // Handle data when it changes
  useEffect(() => {
    if (data && typeof data === 'object' && data !== null && 'countries' in data) {
      setCountries((data as any).countries);
    }
  }, [data]);

  // Handle errors when they change
  useEffect(() => {
    if (error) {
      console.error('Countries fetch error:', error);
      setCountries([]);
    }
  }, [error]);

  const fetchCountries = useCallback(async (filters?: CountryFilter) => {
    await fetchCountriesQuery({
      variables: { filters: filters || {} }
    });
  }, [fetchCountriesQuery]);

  const clearResults = useCallback(() => {
    setCountries([]);
  }, []);

  return {
    countries,
    loading,
    error: error?.message || null,
    fetchCountries,
    clearResults
  };
}
