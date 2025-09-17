import { useState, useCallback, useEffect } from 'react';
import { gqlRequest } from '@/lib/graphql/client';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseCountriesSearchReturn['pagination']>(null);
  const [currentFilters, setCurrentFilters] = useState<CountryFilter>({});
  const [currentPagination, setCurrentPagination] = useState<PaginationInput>({ limit: 20, offset: 0 });
  const [currentSort, setCurrentSort] = useState<SortInput>({ field: 'name', direction: 'ASC' });

  const fetchCountries = useCallback(async (
    filters: CountryFilter, 
    paginationInput?: PaginationInput, 
    sort?: SortInput
  ) => {
    try {
      setLoading(true);
      setError(null);

      const variables: CountriesVariables = {
        filters,
        pagination: paginationInput || currentPagination,
        sort: sort || currentSort
      };

      const response = await gqlRequest<CountriesResponse>(COUNTRIES_QUERY, variables);
      
      if (response.countries) {
        setCountries(response.countries.data || []);
        setPagination(response.countries.pagination || null);
        setCurrentFilters(filters);
        setCurrentPagination(paginationInput || currentPagination);
        setCurrentSort(sort || currentSort);
      } else {
        setCountries([]);
        setPagination(null);
      }
    } catch (err) {
      console.error('Countries search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search countries');
      setCountries([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [currentPagination, currentSort]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(fetchCountries, 300),
    [fetchCountries]
  );

  const searchCountries = useCallback((
    filters: CountryFilter, 
    paginationInput?: PaginationInput, 
    sort?: SortInput
  ) => {
    debouncedSearch(filters, paginationInput, sort);
  }, [debouncedSearch]);

  const fetchNextPage = useCallback(() => {
    if (!pagination?.hasNextPage || loading) return;
    
    const nextOffset = currentPagination.offset + (currentPagination.limit || 20);
    const nextPagination = { ...currentPagination, offset: nextOffset };
    
    fetchCountries(currentFilters, nextPagination, currentSort);
  }, [pagination, loading, currentPagination, currentFilters, currentSort, fetchCountries]);

  const fetchPreviousPage = useCallback(() => {
    if (!pagination?.hasPreviousPage || loading) return;
    
    const prevOffset = Math.max(0, currentPagination.offset - (currentPagination.limit || 20));
    const prevPagination = { ...currentPagination, offset: prevOffset };
    
    fetchCountries(currentFilters, prevPagination, currentSort);
  }, [pagination, loading, currentPagination, currentFilters, currentSort, fetchCountries]);

  const setPage = useCallback((page: number) => {
    if (loading || !pagination) return;
    
    const offset = (page - 1) * (currentPagination.limit || 20);
    const newPagination = { ...currentPagination, offset };
    
    fetchCountries(currentFilters, newPagination, currentSort);
  }, [loading, pagination, currentPagination, currentFilters, currentSort, fetchCountries]);

  const clearResults = useCallback(() => {
    setCountries([]);
    setError(null);
    setPagination(null);
    setCurrentFilters({});
    setCurrentPagination({ limit: 20, offset: 0 });
    setCurrentSort({ field: 'name', direction: 'ASC' });
  }, []);

  return {
    countries,
    loading,
    error,
    pagination,
    searchCountries,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async (filters?: CountryFilter) => {
    try {
      setLoading(true);
      setError(null);

      const response = await gqlRequest<CountriesSimpleResponse>(COUNTRIES_SIMPLE_QUERY, { filters });
      setCountries(response.countries || []);
    } catch (err) {
      console.error('Countries fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch countries');
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setCountries([]);
    setError(null);
  }, []);

  return {
    countries,
    loading,
    error,
    fetchCountries,
    clearResults
  };
}
