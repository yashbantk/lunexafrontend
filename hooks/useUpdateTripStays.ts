import { useMutation } from '@apollo/client/react'
import { UPDATE_TRIP_STAYS } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'

export interface TripStayPartialInput {
  id: string
  tripDay?: { set: string }
  room?: { set: string }
  checkIn?: string
  checkOut?: string
  nights?: number
  roomsCount?: number
  mealPlan?: string
  currency?: { set: string }
  priceTotalCents?: number
  confirmationStatus?: string
}

export interface UpdateTripStaysResponse {
  updateTripStays: Array<{
    id: string
    tripDay: {
      id: string
      dayNumber: number
      date: string
    }
    rate: {
      room: {
        amenities: string[]
        baseMealPlan: string
        bedType: string
        maxOccupancy: number
        id: string
        hotel: {
          id: string
          address: string
          name: string
          star: number
        }
      }
    } | null
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
  }>
}

export function useUpdateTripStays() {
  const [updateTripStaysMutation, { loading: isUpdating, error: updateError }] = useMutation(UPDATE_TRIP_STAYS, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()

  const updateTripStays = async (
    data: TripStayPartialInput[],
    onSuccess?: (response: UpdateTripStaysResponse) => void,
    onError?: (error: string) => void
  ): Promise<UpdateTripStaysResponse | null> => {
    try {
      
      const response = await updateTripStaysMutation({
        variables: { data }
      })


      // Check for GraphQL errors in the response
      // Apollo Client returns errors in response.data.errors or response.errors
      const graphqlErrors = (response as any).errors || (response.data as any)?.errors
      if (graphqlErrors && graphqlErrors.length > 0) {
        const errorMessages = graphqlErrors.map((err: any) => err.message).join(', ')
        console.error('GraphQL errors in response:', graphqlErrors)
        toast({ description: errorMessages, type: 'error' })
        
        if (onError) {
          onError(errorMessages)
        }
        
        throw new Error(errorMessages)
      }

      if (response.data && (response.data as any).updateTripStays) {
        const updateTripStaysResponse = (response.data as any).updateTripStays
        
        // The response is always an array of TripStayType objects
        if (Array.isArray(updateTripStaysResponse)) {
          // Check if array is empty
          if (updateTripStaysResponse.length === 0) {
            console.error('Empty response from updateTripStays mutation')
            const errorMessage = 'No trip stays were updated'
            toast({ description: errorMessage, type: 'error' })
            throw new Error(errorMessage)
          }
          
          // All items in the array should be successful TripStayType objects
          // (since the backend returns array directly, not union types)
          toast({ 
            description: `Successfully updated ${updateTripStaysResponse.length} hotel stay${updateTripStaysResponse.length > 1 ? 's' : ''}!`, 
            type: 'success' 
          })
          
          if (onSuccess) {
            onSuccess({ updateTripStays: updateTripStaysResponse } as UpdateTripStaysResponse)
          }
          
          return { updateTripStays: updateTripStaysResponse } as UpdateTripStaysResponse
        } else {
          console.error('Unexpected response format - expected array:', updateTripStaysResponse)
          const errorMessage = 'Unexpected response format from updateTripStays - expected array'
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        }
      } else {
        console.error('No updateTripStays in response:', response.data)
        const errorMessage = 'No data returned from updateTripStays mutation'
        toast({ description: errorMessage, type: 'error' })
        throw new Error(errorMessage)
      }

    } catch (err: any) {
      console.error('Error updating trip stays:', err)
      const errorMessage = err.message || 'Failed to update trip stays'
      
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
    updateTripStays,
    isLoading: isUpdating,
    error: updateError?.message || null
  }
}

