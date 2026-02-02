import React, { useState, useCallback } from 'react'
import { useQuery } from '@apollo/client/react'
import { Hotel, Room } from '@/types/hotel'
import { GET_HOTEL_DETAILS } from '@/graphql/queries/hotel'
import { transformGraphQLHotelToHotel } from '@/lib/transformers/hotel'

// Type for the GraphQL response
interface HotelDetailsResponse {
  hotel?: any // We'll use any for now since the GraphQL response structure is complex
}

interface UseHotelDetailsProps {
  hotelId: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
}

interface UseHotelDetailsReturn {
  hotel: Hotel | null
  loading: boolean
  error: string | null
  refetch: () => void
  updateRoomPrices: (roomId: string, prices: { pricePerNight: number; totalPrice: number; refundable: boolean }) => void
  manualFetch: () => Promise<void>
}

export function useHotelDetails({
  hotelId,
  checkIn,
  checkOut,
  adults,
  children
}: UseHotelDetailsProps): UseHotelDetailsReturn {
  const [hotel, setHotel] = useState<Hotel | null>(null)

  // Use Apollo Client's useQuery hook with better error handling
  const { data, loading, error, refetch } = useQuery<HotelDetailsResponse>(GET_HOTEL_DETAILS, {
    variables: { hotelId },
    skip: !hotelId, // Skip query if no hotelId
    errorPolicy: 'all', // Return both data and errors
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network' // Try cache first, then network
  })

  // Handle data when it changes
  React.useEffect(() => {
    if (data?.hotel) {
      try {
        const transformedHotel = transformGraphQLHotelToHotel(data.hotel)
        setHotel(transformedHotel)
      } catch (transformError) {
        console.error('Error transforming hotel data:', transformError)
        setHotel(null)
      }
    } else if (data && !data.hotel) {
      console.warn('No hotel data found in response:', data)
      setHotel(null)
    }
  }, [data])

  // Handle errors when they change
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching hotel details:', error)
      setHotel(null)
    }
  }, [error])

  const updateRoomPrices = useCallback((roomId: string, prices: { pricePerNight: number; totalPrice: number; refundable: boolean }) => {
    if (!hotel) return
    
    setHotel(prevHotel => {
      if (!prevHotel) return null
      
      const updatedRooms = prevHotel.rooms.map(room => 
        room.id === roomId 
          ? { ...room, ...prices }
          : room
      )
      
      return {
        ...prevHotel,
        rooms: updatedRooms
      }
    })
  }, [hotel])

  // Enhanced refetch function with error handling
  const enhancedRefetch = useCallback(async () => {
    try {
      const result = await refetch()
      return result
    } catch (refetchError) {
      console.error('Error during refetch:', refetchError)
      throw refetchError
    }
  }, [refetch])

  // Manual fetch function as fallback
  const manualFetch = useCallback(async () => {
    if (!hotelId) return
    
    try {
      const fetchedHotel = await fetchHotelDetailsFromGraphQL({ hotelId })
      setHotel(fetchedHotel)
    } catch (fetchError) {
      console.error('Manual fetch failed:', fetchError)
      setHotel(null)
    }
  }, [hotelId])

  return {
    hotel,
    loading,
    error: error?.message || null,
    refetch: enhancedRefetch,
    updateRoomPrices,
    manualFetch
  }
}

// Export GraphQL query functions for direct use if needed
export const fetchHotelDetailsFromGraphQL = async (variables: {
  hotelId: string
}) => {
  try {
    const { apolloClient } = await import('@/lib/graphql/client')
    const result = await apolloClient.query({
      query: GET_HOTEL_DETAILS,
      variables,
      errorPolicy: 'all',
      fetchPolicy: 'network-only' // Always fetch fresh data
    })
    
    if ((result.data as any)?.hotel) {
      return transformGraphQLHotelToHotel((result.data as any).hotel)
    }
    throw new Error('Hotel not found')
  } catch (error) {
    console.error('Error fetching hotel details:', error)
    throw error
  }
}

// Export GraphQL query for documentation
export const GRAPHQL_QUERIES = {
  GET_HOTEL_DETAILS
} as const







