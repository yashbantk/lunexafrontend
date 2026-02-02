import { useState, useEffect, useCallback } from 'react'
import { Activity, ActivitySearchParams, ActivitySearchResult, ActivityFilters } from '@/types/activity'
// import { mockActivities, GET_ACTIVITIES } from '@/lib/mocks/activities'
import { apolloClient } from '@/lib/graphql/client'
import { ACTIVITIES_QUERY, ActivityFilter, ActivityOrder } from '@/graphql/queries/activities'
import { transformGraphQLActivitiesToActivities } from '@/lib/transformers/activity'

interface UseActivitySearchProps {
  params: ActivitySearchParams
}

interface UseActivitySearchReturn {
  results: Activity[]
  loading: boolean
  error: string | null
  hasMore: boolean
  total: number
  page: number
  filters: {
    categories: string[]
    timeOfDay: string[]
    difficulties: string[]
    locations: string[]
  }
  fetchNextPage: () => void
  setFilters: (filters: ActivityFilters) => void
  resetFilters: () => void
}

export function useActivitySearch({ params }: UseActivitySearchProps): UseActivitySearchReturn {
  const [results, setResults] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFiltersState] = useState<ActivityFilters>({
    query: '',
    category: [],
    timeOfDay: [],
    duration: [1, 1440],
    priceRange: [0, 1000000],
    difficulty: [],
    rating: 0,
    location: '',
    sort: 'recommended'
  })

  // Extract available filters from current results or fallback to mock data
  const availableFilters = {
    categories: results.length > 0 
      ? Array.from(new Set(results.flatMap(activity => activity.category)))
      : [],
    timeOfDay: ['morning', 'afternoon', 'evening', 'full-day'],
    difficulties: results.length > 0
      ? Array.from(new Set(results.map(activity => activity.difficulty)))
      : [],
    locations: results.length > 0
      ? Array.from(new Set(results.map(activity => activity.location)))
      : [],
  }

  // GraphQL implementation for activity search
  const searchActivities = useCallback(async (searchParams: ActivitySearchParams, pageNum: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Convert search parameters to GraphQL filter format
      const filters: ActivityFilter = {
        searchActivities: searchParams.query || null,
        AND: {
          city: searchParams.cityId ? {
            id: {
              exact: searchParams.cityId
            }
          } : undefined,
          durationMinutes: (searchParams.duration && (searchParams.duration[0] > 1 || searchParams.duration[1] < 1440)) ? {
            range: {
              start: searchParams.duration[0] || null,
              end: searchParams.duration[1] || null
            }
          } : undefined
        }
      }

      // Handle time of day filtering using Start Time field with ranges
      if (searchParams.timeOfDay && searchParams.timeOfDay.length > 0) {
        // Map time of day labels to start time ranges
        const timeRanges: Record<string, { start: string, end: string }> = {
          'morning': { start: '00:00:00', end: '11:59:59' },
          'afternoon': { start: '12:00:00', end: '16:59:59' },
          'evening': { start: '17:00:00', end: '23:59:59' },
          'full-day': { start: '00:00:00', end: '11:00:00' } // Full day activities usually start in the morning
        }

        // Helper to create a range filter object
        const createRangeFilter = (range: { start: string, end: string }) => ({
          startTime: {
            range: {
              start: range.start,
              end: range.end
            }
          }
        })

        // Filter valid ranges based on selection
        const selectedRanges = searchParams.timeOfDay
          .map(t => timeRanges[t])
          .filter(Boolean)

        if (selectedRanges.length > 0) {
          if (!filters.AND) filters.AND = {}
          
          // If only one range is selected, apply it directly
          if (selectedRanges.length === 1) {
             Object.assign(filters.AND, createRangeFilter(selectedRanges[0]))
          } else {
            // If multiple ranges, we need to construct an OR chain
            // Since the schema defines OR as a single ActivityFilter object (not a list),
            // we chain them: Filter1 OR (Filter2 OR (Filter3...))
            
            // Start with the first range
            let orChain: ActivityFilter = createRangeFilter(selectedRanges[0])
            
            // Chain the rest
            for (let i = 1; i < selectedRanges.length; i++) {
              orChain = {
                ...createRangeFilter(selectedRanges[i]),
                OR: orChain
              }
            }
            
            // Assign the final chain to the main filter's AND condition
            // Note: This assumes we want (Other Filters) AND (TimeRange1 OR TimeRange2 OR ...)
            // But filters.AND expects fields, not a nested OR directly at the top level of AND?
            // Actually ActivityFilter structure is: { startTime: ..., OR: ... }
            // So to say "City AND (Time1 OR Time2)", we might need:
            // { city: ..., AND: { OR: { ... } } } ? No, AND is also ActivityFilter.
            
            // Let's try to inject the OR structure into the filters object.
            // But we already have 'city' and 'duration' in filters.AND.
            // If we put the OR chain inside filters.AND, it works if ActivityFilter has OR.
            
            filters.AND.AND = orChain
          }
        }
      }

      // Convert sort parameter to GraphQL order format
      const order: ActivityOrder = {}
      if (searchParams.sort === 'rating') {
        order.rating = 'DESC'
      } else if (searchParams.sort === 'price_asc') {
        // Note: Price sorting would need to be implemented on the backend
        // For now, we'll use title sorting as a fallback
        order.title = 'ASC'
      } else if (searchParams.sort === 'price_desc') {
        order.title = 'DESC'
      } else if (searchParams.sort === 'duration') {
        order.durationMinutes = 'ASC'
      } else {
        // Default to rating for 'recommended' and other sorts
        order.rating = 'DESC'
      }

      // Make GraphQL request
      const result = await apolloClient.query({
        query: ACTIVITIES_QUERY,
        variables: { filters, order },
        fetchPolicy: 'no-cache'
      })

      // Transform GraphQL response to Activity format
      const transformedActivities = transformGraphQLActivitiesToActivities((result.data as any).activities)
      
      // Apply additional client-side filtering for features not supported by GraphQL
      let filteredActivities = [...transformedActivities]
      
      // Apply additional client-side filters for features not supported by GraphQL
      if (searchParams.category && searchParams.category.length > 0) {
        filteredActivities = filteredActivities.filter(activity =>
          searchParams.category!.some(cat => activity.category.includes(cat))
        )
      }
      
      if (searchParams.difficulty && searchParams.difficulty.length > 0) {
        filteredActivities = filteredActivities.filter(activity =>
          searchParams.difficulty!.includes(activity.difficulty)
        )
      }
      
      if (searchParams.priceRange) {
        const [minPrice, maxPrice] = searchParams.priceRange
        filteredActivities = filteredActivities.filter(activity =>
          activity.basePrice >= minPrice && activity.basePrice <= maxPrice
        )
      }
      
      if (searchParams.rating && searchParams.rating > 0) {
        filteredActivities = filteredActivities.filter(activity =>
          activity.rating >= searchParams.rating!
        )
      }
      
      // Apply sorting
      switch (searchParams.sort) {
        case 'price_asc':
          filteredActivities.sort((a, b) => a.basePrice - b.basePrice)
          break
        case 'price_desc':
          filteredActivities.sort((a, b) => b.basePrice - a.basePrice)
          break
        case 'rating':
          filteredActivities.sort((a, b) => b.rating - a.rating)
          break
        case 'duration':
          filteredActivities.sort((a, b) => a.durationMins - b.durationMins)
          break
        case 'popularity':
          filteredActivities.sort((a, b) => b.reviewsCount - a.reviewsCount)
          break
        case 'recommended':
        default:
          // Keep original order (recommended first)
          break
      }
      
      // Apply pagination
      const limit = searchParams.limit || 10
      const startIndex = (pageNum - 1) * limit
      const endIndex = startIndex + limit
      const paginatedResults = filteredActivities.slice(startIndex, endIndex)
      
      const hasMoreResults = endIndex < filteredActivities.length
      
      if (pageNum === 1) {
        setResults(paginatedResults)
      } else {
        setResults(prev => [...prev, ...paginatedResults])
      }
      
      setTotal(filteredActivities.length)
      setPage(pageNum)
      setHasMore(hasMoreResults)
      
    } catch (err) {
      console.error('GraphQL activity search failed, falling back to mock data:', err)
      setError(err instanceof Error ? err.message : 'Failed to search activities')
      
      // // Fallback to mock data if GraphQL fails
      // let filteredActivities = [...transformedActivities]
      
      // // Apply basic filtering to mock data
      // if (searchParams.query) {
      //   const query = searchParams.query.toLowerCase()
      //   filteredActivities = filteredActivities.filter(activity =>
      //     activity.title.toLowerCase().includes(query) ||
      //     activity.shortDesc.toLowerCase().includes(query) ||
      //     activity.tags.some(tag => tag.toLowerCase().includes(query))
      //   )
      // }
      
      // Apply pagination to mock data
      // const limit = searchParams.limit || 10
      // const startIndex = (pageNum - 1) * limit
      // const endIndex = startIndex + limit
      // const paginatedResults = [].slice(startIndex, endIndex)
      
      // const hasMoreResults = endIndex < [].length
      
      // if (pageNum === 1) {
      //   setResults(paginatedResults)
      // } else {
      //   setResults(prev => [...prev, ...paginatedResults])
      // }
      
      // setTotal(filteredActivities.length)
      // setPage(pageNum)
      // setHasMore(hasMoreResults)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchNextPage = useCallback(() => {
    if (!loading && hasMore) {
      searchActivities(params, page + 1)
    }
  }, [searchActivities, params, page, loading, hasMore])

  const setFilters = useCallback((newFilters: ActivityFilters) => {
    setFiltersState(newFilters)
    setPage(1)
    
    const searchParams: ActivitySearchParams = {
      ...params,
      query: newFilters.query,
      category: newFilters.category,
      timeOfDay: newFilters.timeOfDay,
      duration: newFilters.duration,
      priceRange: newFilters.priceRange,
      difficulty: newFilters.difficulty,
      rating: newFilters.rating,
      location: newFilters.location,
      cityId: newFilters.cityId,
      sort: newFilters.sort
    }
    
    searchActivities(searchParams, 1)
  }, [params, searchActivities])

  const resetFilters = useCallback(() => {
    const defaultFilters: ActivityFilters = {
      query: '',
      category: [],
      timeOfDay: [],
      duration: [1, 1440],
      priceRange: [0, 1000000],
      difficulty: [],
      rating: 0,
      location: '',
      sort: 'recommended'
    }
    
    setFilters(defaultFilters)
  }, [setFilters])

  useEffect(() => {
    searchActivities(params, 1)
  }, [searchActivities, params])

  return {
    results,
    loading,
    error,
    hasMore,
    total,
    page,
    filters: availableFilters,
    fetchNextPage,
    setFilters,
    resetFilters
  }
}

// TODO: GraphQL - Export GraphQL query functions for real integration
export const fetchActivitiesFromGraphQL = async (variables: {
  params: ActivitySearchParams
  page?: number
}) => {
  // TODO: GraphQL - Implement real GraphQL call
  // return await graphQLClient.request(GET_ACTIVITIES, variables)
  throw new Error('GraphQL integration not implemented yet')
}

// // GraphQL Query Placeholder for documentation
// export const GRAPHQL_QUERIES = {
//   GET_ACTIVITIES
// } as const







