import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_TRIP_STAY } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'

export interface CreateTripStayInput {
  tripDay: string
  room: string
  checkIn: string
  checkOut: string
  nights?: number
  roomsCount?: number
  mealPlan?: string
  currency: string
  priceTotalCents?: number
  confirmationStatus?: string
}

export interface CreateTripStayResponse {
  createTripStay: {
    id: string
    tripDay: {
      id: string
      dayNumber: number
      date: string
    }
    room: {
      id: string
      hotel: {
        id: string
        name: string
        address: string
        type: string
        description: string
        locationUrl: string
        star: number
      }
      name: string
      priceCents: number
      bedType: string
      baseMealPlan: string
      hotelRoomImages: Array<{
        id: string
        url: string
        caption: string
        priorityOrder: number
      }>
      roomAmenities: Array<{
        id: string
        name: string
        description: string
        createdAt: string
        updatedAt: string
      }>
      maxOccupancy: number
      size: string
      sizeUnit: string
      details: string
      amenities: string[]
      tags: string[]
      inclusions: string
      exclusions: string
      createdAt: string
      updatedAt: string
    }
    checkIn: string
    checkOut: string
    nights: number
    roomsCount: number
    mealPlan: string
    currency: {
      code: string
      name: string
      createdAt: string
      updatedAt: string
    }
    priceTotalCents: number
    confirmationStatus: string
  }
}

export function useCreateTripStay() {
  const [createTripStayMutation, { loading: isCreating, error: createError }] = useMutation(CREATE_TRIP_STAY, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()

  const createTripStay = async (
    data: CreateTripStayInput,
    onSuccess?: (response: CreateTripStayResponse) => void,
    onError?: (error: string) => void
  ): Promise<CreateTripStayResponse | null> => {
    try {
      console.log('Creating trip stay with data:', data)
      
      const response = await createTripStayMutation({
        variables: { data }
      })

      console.log('Create trip stay response:', response.data)

      if (response.data && (response.data as any).createTripStay) {
        const createTripStayResponse = (response.data as any).createTripStay
        
        // Check if it's a successful creation (has id) or an error (has messages)
        // If id exists = Success, if messages exist = Error
        if (createTripStayResponse.id) {
          console.log('Trip stay created successfully:', createTripStayResponse)
          toast({ description: 'Hotel stay added successfully!', type: 'success' })
          
          if (onSuccess) {
            onSuccess({ createTripStay: createTripStayResponse } as CreateTripStayResponse)
          }
          
          return { createTripStay: createTripStayResponse } as CreateTripStayResponse
        } else if (createTripStayResponse.messages) {
          // Messages present = Error occurred
          console.log('Trip stay creation returned error messages:', createTripStayResponse.messages)
          const errorMessage = createTripStayResponse.messages[0]?.message || 'Failed to create trip stay'
          console.error('GraphQL error:', errorMessage)
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        } else {
          console.error('Unexpected response format:', createTripStayResponse)
          const errorMessage = 'Unexpected response format from createTripStay'
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        }
      } else {
        console.error('No createTripStay in response:', response.data)
        const errorMessage = 'No data returned from createTripStay mutation'
        toast({ description: errorMessage, type: 'error' })
        throw new Error(errorMessage)
      }

    } catch (err: any) {
      console.error('Error creating trip stay:', err)
      const errorMessage = err.message || 'Failed to create trip stay'
      
      // Show error in toast (if not already shown)
      if (!err.message || !err.message.includes('GraphQL error')) {
        toast({ description: errorMessage, type: 'error' })
      }
      
      if (onError) {
        onError(errorMessage)
      }
      
      return null
    }
  }

  return {
    createTripStay,
    isLoading: isCreating,
    error: createError?.message || null
  }
}
