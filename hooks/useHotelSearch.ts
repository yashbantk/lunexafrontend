import { useState, useEffect, useCallback, useMemo } from 'react'
import { Hotel, HotelSearchParams, HotelSearchResult, HotelFilters } from '@/types/hotel'
import { searchHotels } from '@/lib/api/hotels'

interface UseHotelSearchReturn {
  results: Hotel[]
  loading: boolean
  error: string | null
  total: number
  hasMore: boolean
  page: number
  filters: HotelFilters
  setFilters: (filters: Partial<HotelFilters>) => void
  fetchNextPage: () => void
  resetFilters: () => void
  refetch: () => void
}

const initialFilters: HotelFilters = {
  query: '',
  location: '',
  stars: [],
  priceRange: [0, 10000],
  amenities: [],
  propertyTypes: [],
  boardTypes: [],
  sort: 'recommended'
}

export const useHotelSearch = (initialParams?: Partial<HotelSearchParams>): UseHotelSearchReturn => {
  const [results, setResults] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [filters, setFiltersState] = useState<HotelFilters>({
    ...initialFilters,
    ...initialParams
  })

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchParams: HotelSearchParams) => {
      try {
        setLoading(true)
        setError(null)
        
        const searchResult = await searchHotels(searchParams)
        
        if (searchParams.page === 1) {
          setResults(searchResult.results)
        } else {
          setResults(prev => [...prev, ...searchResult.results])
        }
        
        setTotal(searchResult.total)
        setHasMore(searchResult.hasMore)
        setPage(searchResult.page)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search hotels')
        setResults([])
        setTotal(0)
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  // Convert filters to search params
  const searchParams = useMemo((): HotelSearchParams => ({
    query: filters.query || undefined,
    location: filters.location || undefined,
    stars: filters.stars.length > 0 ? filters.stars : undefined,
    priceMin: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    priceMax: filters.priceRange[1] < 10000 ? filters.priceRange[1] : undefined,
    amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
    propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes : undefined,
    boardTypes: filters.boardTypes.length > 0 ? filters.boardTypes : undefined,
    sort: filters.sort,
    page: 1,
    limit: 10
  }), [filters])

  // Search when filters change
  useEffect(() => {
    debouncedSearch(searchParams)
  }, [searchParams, debouncedSearch])

  // Set filters function
  const setFilters = useCallback((newFilters: Partial<HotelFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to first page when filters change
  }, [])

  // Fetch next page
  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      const nextPageParams = { ...searchParams, page: page + 1 }
      const searchResult = await searchHotels(nextPageParams)
      
      setResults(prev => [...prev, ...searchResult.results])
      setHasMore(searchResult.hasMore)
      setPage(searchResult.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more hotels')
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, searchParams, page])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters)
    setPage(1)
  }, [])

  // Refetch current results
  const refetch = useCallback(() => {
    debouncedSearch(searchParams)
  }, [debouncedSearch, searchParams])

  return {
    results,
    loading,
    error,
    total,
    hasMore,
    page,
    filters,
    setFilters,
    fetchNextPage,
    resetFilters,
    refetch
  }
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export default useHotelSearch


