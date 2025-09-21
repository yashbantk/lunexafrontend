import { useState, useEffect, useCallback } from 'react'
import { Activity, ActivitySearchParams, ActivitySearchResult, ActivityFilters } from '@/types/activity'
import { mockActivities, GET_ACTIVITIES } from '@/lib/mocks/activities'
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
    duration: [60, 600],
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
      : Array.from(new Set(mockActivities.flatMap(activity => activity.category))),
    timeOfDay: ['morning', 'afternoon', 'evening', 'full-day'],
    difficulties: results.length > 0
      ? Array.from(new Set(results.map(activity => activity.difficulty)))
      : Array.from(new Set(mockActivities.map(activity => activity.difficulty))),
    locations: results.length > 0
      ? Array.from(new Set(results.map(activity => activity.location)))
      : Array.from(new Set(mockActivities.map(activity => activity.location)))
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
          city: searchParams.location || null,
          durationMinutes: searchParams.duration ? {
            range: {
              start: searchParams.duration[0] || null,
              end: searchParams.duration[1] || null
            }
          } : undefined
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
      
      if (searchParams.timeOfDay && searchParams.timeOfDay.length > 0) {
        filteredActivities = filteredActivities.filter(activity =>
          activity.availability.some(slot =>
            searchParams.timeOfDay!.includes(slot.type)
          )
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
      
      // Fallback to mock data if GraphQL fails
      let filteredActivities = [...mockActivities]
      
      // Apply basic filtering to mock data
      if (searchParams.query) {
        const query = searchParams.query.toLowerCase()
        filteredActivities = filteredActivities.filter(activity =>
          activity.title.toLowerCase().includes(query) ||
          activity.shortDesc.toLowerCase().includes(query) ||
          activity.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // Apply pagination to mock data
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
      sort: newFilters.sort
    }
    
    searchActivities(searchParams, 1)
  }, [params, searchActivities])

  const resetFilters = useCallback(() => {
    const defaultFilters: ActivityFilters = {
      query: '',
      category: [],
      timeOfDay: [],
      duration: [60, 600],
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

// GraphQL Query Placeholder for documentation
export const GRAPHQL_QUERIES = {
  GET_ACTIVITIES
} as const







