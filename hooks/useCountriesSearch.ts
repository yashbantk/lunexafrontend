import { useState, useCallback, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { COUNTRIES_QUERY, COUNTRIES_SIMPLE_QUERY } from '@/graphql/queries/countries';
import { 
  Country, 
  CountryFilter, 
  PaginationInput, 
  SortInput, 
  CountriesResponse, 
  CountriesSimpleResponse,
  CountriesVariables 
} from '@/types/graphql';

interface UseCountriesSearchReturn {
  countries: Country[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPages: number;
    currentPage: number;
  } | null;
  searchCountries: (filters: CountryFilter, pagination?: PaginationInput, sort?: SortInput) => void;
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
  const [pagination, setPagination] = useState<UseCountriesSearchReturn['pagination']>(null);
  const [currentFilters, setCurrentFilters] = useState<CountryFilter>({});
  const [currentPagination, setCurrentPagination] = useState<PaginationInput>({ limit: 20, offset: 0 });
  const [currentSort, setCurrentSort] = useState<SortInput>({ field: 'name', direction: 'ASC' });

  const [fetchCountries, { data, loading, error }] = useLazyQuery(COUNTRIES_QUERY as any, {
    errorPolicy: 'all'
  });

  // Handle data when it changes
  useEffect(() => {
    if (data && typeof data === 'object' && data !== null && 'countries' in data) {
      const countriesData = (data as any).countries;
      setCountries(countriesData?.data || []);
      setPagination(countriesData?.pagination || null);
    }
  }, [data]);

  // Handle errors when they change
  useEffect(() => {
    if (error) {
      console.error('Countries search error:', error);
      setCountries([]);
      setPagination(null);
    }
  }, [error]);

  const searchCountries = useCallback(async (
    filters: CountryFilter, 
    paginationInput?: PaginationInput, 
    sort?: SortInput
  ) => {
    const variables: CountriesVariables = {
      filters,
      pagination: paginationInput || currentPagination,
      sort: sort || currentSort
    };

    setCurrentFilters(filters);
    setCurrentPagination(paginationInput || currentPagination);
    setCurrentSort(sort || currentSort);

    await fetchCountries({
      variables
    });
  }, [fetchCountries, currentPagination, currentSort]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((filters: CountryFilter, paginationInput?: PaginationInput, sort?: SortInput) => {
      const variables: CountriesVariables = {
        filters,
        pagination: paginationInput || currentPagination,
        sort: sort || currentSort
      };

      setCurrentFilters(filters);
      setCurrentPagination(paginationInput || currentPagination);
      setCurrentSort(sort || currentSort);

      fetchCountries({
        variables
      });
    }, 300),
    [fetchCountries, currentPagination, currentSort]
  );

  const searchCountriesDebounced = useCallback((
    filters: CountryFilter, 
    paginationInput?: PaginationInput, 
    sort?: SortInput
  ) => {
    debouncedSearch(filters, paginationInput, sort);
  }, [debouncedSearch]);

  const fetchNextPage = useCallback(() => {
    if (!pagination?.hasNextPage || loading) return;
    
    const nextOffset = (currentPagination.offset || 0) + (currentPagination.limit || 20);
    const nextPagination = { ...currentPagination, offset: nextOffset };
    
    searchCountries(currentFilters, nextPagination, currentSort);
  }, [pagination, loading, currentPagination, currentFilters, currentSort, searchCountries]);

  const fetchPreviousPage = useCallback(() => {
    if (!pagination?.hasPreviousPage || loading) return;
    
    const prevOffset = Math.max(0, (currentPagination.offset || 0) - (currentPagination.limit || 20));
    const prevPagination = { ...currentPagination, offset: prevOffset };
    
    searchCountries(currentFilters, prevPagination, currentSort);
  }, [pagination, loading, currentPagination, currentFilters, currentSort, searchCountries]);

  const setPage = useCallback((page: number) => {
    if (loading || !pagination) return;
    
    const offset = (page - 1) * (currentPagination.limit || 20);
    const newPagination = { ...currentPagination, offset };
    
    searchCountries(currentFilters, newPagination, currentSort);
  }, [loading, pagination, currentPagination, currentFilters, currentSort, searchCountries]);

  const clearResults = useCallback(() => {
    setCountries([]);
    setPagination(null);
    setCurrentFilters({});
    setCurrentPagination({ limit: 20, offset: 0 });
    setCurrentSort({ field: 'name', direction: 'ASC' });
  }, []);

  return {
    countries,
    loading,
    error: error?.message || null,
    pagination,
    searchCountries: searchCountriesDebounced,
    fetchNextPage,
    fetchPreviousPage,
    clearResults,
    setPage
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
