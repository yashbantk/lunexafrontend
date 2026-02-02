import { useMutation } from '@apollo/client/react'
import { UPDATE_TRIP } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'

export interface TripPartialInput {
  id: string
  status?: string
  tripType?: string
  startDate?: string
  endDate?: string
  durationDays?: number
  totalTravelers?: number
  starRating?: number
  transferOnly?: boolean
  landOnly?: boolean
  travelerDetails?: any
  markupFlightPercent?: number
  markupLandPercent?: number
  bookingReference?: string
  customer?: { set?: string }
}

export interface UpdateTripResponse {
  updateTrip: {
    id: string
    status: string
    tripType: string
    // Add other fields as needed
  }
}

export function useUpdateTrip() {
  const [updateTripMutation, { loading: isUpdating, error: updateError }] = useMutation(UPDATE_TRIP, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()

  const updateTrip = async (
    data: TripPartialInput,
    onSuccess?: (response: UpdateTripResponse) => void,
    onError?: (error: string) => void
  ): Promise<UpdateTripResponse | null> => {
    try {
      const response = await updateTripMutation({
        variables: { data }
      })

      if (response.data && (response.data as any).updateTrip) {
        const updateTripResponse = (response.data as any).updateTrip
        
        // Check if it's a successful update (has id) or an error (has messages)
        if (updateTripResponse.id) {
          toast({ description: 'Trip updated successfully!', type: 'success' })
          
          if (onSuccess) {
            onSuccess({ updateTrip: updateTripResponse } as UpdateTripResponse)
          }
          
          return { updateTrip: updateTripResponse } as UpdateTripResponse
        } else if (updateTripResponse.messages) {
          // Messages present = Error occurred
          const errorMessage = updateTripResponse.messages[0]?.message || 'Failed to update trip'
          console.error('GraphQL error:', errorMessage)
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        } else {
          console.error('Unexpected response format:', updateTripResponse)
          throw new Error('Unexpected response format from updateTrip')
        }
      } else {
        console.error('No updateTrip in response:', response.data)
        const errorMessage = 'No data returned from updateTrip mutation'
        toast({ description: errorMessage, type: 'error' })
        throw new Error(errorMessage)
      }

    } catch (err: any) {
      console.error('Error updating trip:', err)
      const errorMessage = err.message || 'Failed to update trip'
      
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
    updateTrip,
    isLoading: isUpdating,
    error: updateError?.message || null
  }
}

