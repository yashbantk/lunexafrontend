import { useState, useEffect, useCallback, useMemo } from 'react'
import { gqlRequest } from '@/lib/graphql/client'
import { HOTELS_QUERY, HotelFilters, HotelOrder, GraphQLHotel, HotelsResponse } from '@/graphql/queries/hotels'
import { Hotel } from '@/types/hotel'

interface UseHotelsGraphQLParams {
  cityId?: string
  currentHotelName?: string
  initialFilters?: Partial<HotelFilters>
  initialOrder?: HotelOrder
}

interface UseHotelsGraphQLReturn {
  hotels: Hotel[]
  loading: boolean
  error: string | null
  total: number
  filters: HotelFilters
  order: HotelOrder
  setFilters: (filters: Partial<HotelFilters>) => void
  setOrder: (order: HotelOrder) => void
  refetch: () => void
  resetFilters: () => void
}

// Convert GraphQL hotel to our Hotel type
const convertGraphQLHotel = (gqlHotel: GraphQLHotel): Hotel => {
  return {
    id: gqlHotel.id,
    name: gqlHotel.name,
    address: gqlHotel.address,
    rating: parseFloat(gqlHotel.cleanilessRating) || 0,
    ratingsCount: gqlHotel.totalRatings || 0,
    starRating: gqlHotel.star,
    images: ['/api/placeholder/300/200'], // Placeholder - you might want to fetch actual images
    location: `${gqlHotel.city.name}, ${gqlHotel.city.country.name}`,
    coordinates: {
      lat: 0, // Not available in GraphQL response
      lng: 0
    },
    amenities: gqlHotel.amenities || [],
    minPrice: 0, // Will be populated from room data
    maxPrice: 0, // Will be populated from room data
    refundable: true, // Default value
    rooms: [], // Will be populated separately
    policies: {
      cancellation: gqlHotel.cancellationPolicy,
      checkIn: '14:00',
      checkOut: '11:00',
      children: 'Children welcome',
      infants: 'Infants welcome',
      pets: 'Pets allowed',
      smoking: 'Non-smoking',
      ageRestriction: '18+'
    },
    reviews: [], // Will be populated separately
    badges: gqlHotel.tags || [],
    shortDescription: gqlHotel.description,
    longDescription: gqlHotel.description
  }
}

const initialFilters: HotelFilters = {
  searchHotels: undefined,
  AND: {
    star: {
      exact: undefined
    }
  }
}

const initialOrder: HotelOrder = {
  name: 'ASC'
}

export const useHotelsGraphQL = ({
  cityId,
  currentHotelName,
  initialFilters: customFilters,
  initialOrder: customOrder
}: UseHotelsGraphQLParams = {}): UseHotelsGraphQLReturn => {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filters, setFiltersState] = useState<HotelFilters>({
    ...initialFilters,
    ...customFilters
  })
  const [order, setOrderState] = useState<HotelOrder>({
    ...initialOrder,
    ...customOrder
  })

  // Build filters based on props
  const buildFilters = useCallback((): HotelFilters => {
    const baseFilters: HotelFilters = { ...filters }

    // Add city filter if cityId is provided
    // if (cityId) {
    //   baseFilters.city = { pk: cityId }
    // }

    // Exclude current hotel if currentHotelName is provided (for "Change Room" functionality)
    // if (currentHotelName) {
    //   baseFilters.NOT = {
    //     name: {
    //       iExact: currentHotelName
    //     }
    //   }
    // }

    return baseFilters
  }, [filters, cityId, currentHotelName])

  // Fetch hotels
  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryFilters = buildFilters()
      
      console.log('Fetching hotels with filters:', queryFilters)
      console.log('Order:', order)
      console.log('City ID:', cityId)
      console.log('Current Hotel Name:', currentHotelName)

      const response = await gqlRequest<HotelsResponse>(HOTELS_QUERY, {
        filters: queryFilters,
        order: order
      })

      const convertedHotels = response.hotels.map(convertGraphQLHotel)
      setHotels(convertedHotels)
      setTotal(convertedHotels.length)
    } catch (err) {
      console.error('Error fetching hotels:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch hotels')
      setHotels([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [buildFilters, order])

  // Fetch hotels when filters or order change
  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  // Set filters function
  const setFilters = useCallback((newFilters: Partial<HotelFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Set order function
  const setOrder = useCallback((newOrder: HotelOrder) => {
    setOrderState(newOrder)
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters)
  }, [])

  // Refetch function
  const refetch = useCallback(() => {
    fetchHotels()
  }, [fetchHotels])

  return {
    hotels,
    loading,
    error,
    total,
    filters,
    order,
    setFilters,
    setOrder,
    refetch,
    resetFilters
  }
}

export default useHotelsGraphQL
