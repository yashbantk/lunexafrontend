import React, { useState, useCallback } from 'react'
import { useQuery } from '@apollo/client/react'
import { Hotel, Room } from '@/types/hotel'
import { GET_HOTEL_DETAILS } from '@/graphql/queries/hotel'
import { transformGraphQLHotelToHotel } from '@/lib/transformers/hotel'

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
}

export function useHotelDetails({
  hotelId,
  checkIn,
  checkOut,
  adults,
  children
}: UseHotelDetailsProps): UseHotelDetailsReturn {
  const [hotel, setHotel] = useState<Hotel | null>(null)

  // Use Apollo Client's useQuery hook
  const { data, loading, error, refetch } = useQuery(GET_HOTEL_DETAILS as any, {
    variables: { hotelId },
    skip: !hotelId, // Skip query if no hotelId
    errorPolicy: 'all', // Return both data and errors
    notifyOnNetworkStatusChange: true
  })

  // Handle data when it changes
  React.useEffect(() => {
    if ((data as any)?.hotel) {
      console.log('GraphQL response:', data)
      const transformedHotel = transformGraphQLHotelToHotel((data as any).hotel)
      setHotel(transformedHotel)
      console.log('Transformed hotel:', transformedHotel)
    }
  }, [data])

  // Handle errors when they change
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching hotel details:', error)
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

  return {
    hotel,
    loading,
    error: error?.message || null,
    refetch: () => refetch(),
    updateRoomPrices
  }
}

// Export GraphQL query functions for direct use if needed
export const fetchHotelDetailsFromGraphQL = async (variables: {
  hotelId: string
}) => {
  try {
    const { apolloClient } = await import('@/lib/graphql/client')
    const result = await apolloClient.query({
      query: GET_HOTEL_DETAILS as any,
      variables,
      errorPolicy: 'all'
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







