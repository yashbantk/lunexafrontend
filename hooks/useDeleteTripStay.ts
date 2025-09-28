import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { DELETE_TRIP_STAY } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'

export interface DeleteTripStayInput {
  id: string
}

export interface DeleteTripStayResponse {
  deleteTripStay: {
    id: string
  }
}

export function useDeleteTripStay() {
  const [deleteTripStayMutation, { loading: isDeleting, error: deleteError }] = useMutation(DELETE_TRIP_STAY, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()

  const deleteTripStay = async (
    stayId: string,
    onSuccess?: (response: DeleteTripStayResponse) => void,
    onError?: (error: string) => void
  ): Promise<DeleteTripStayResponse | null> => {
    try {
      console.log('Deleting trip stay with ID:', stayId)
      
      const response = await deleteTripStayMutation({
        variables: { 
          data: { id: stayId }
        }
      })

      console.log('Delete trip stay response:', response.data)

      if (response.data && (response.data as any).deleteTripStay) {
        const deleteTripStayResponse = (response.data as any).deleteTripStay
        
        // Check if it's a successful deletion (has id) or an error (has messages)
        // If id exists = Success, if messages exist = Error
        if (deleteTripStayResponse.id) {
          console.log('Trip stay deleted successfully:', deleteTripStayResponse)
          toast({ description: 'Hotel stay removed successfully!', type: 'success' })
          
          if (onSuccess) {
            onSuccess({ deleteTripStay: deleteTripStayResponse } as DeleteTripStayResponse)
          }
          
          return { deleteTripStay: deleteTripStayResponse } as DeleteTripStayResponse
        } else if (deleteTripStayResponse.messages) {
          // Messages present = Error occurred
          console.log('Trip stay deletion returned error messages:', deleteTripStayResponse.messages)
          const errorMessage = deleteTripStayResponse.messages[0]?.message || 'Failed to delete trip stay'
          console.error('GraphQL error:', errorMessage)
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        } else {
          console.error('Unexpected response format:', deleteTripStayResponse)
          const errorMessage = 'Unexpected response format from deleteTripStay'
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        }
      } else {
        console.error('No deleteTripStay in response:', response.data)
        const errorMessage = 'No data returned from deleteTripStay mutation'
        toast({ description: errorMessage, type: 'error' })
        throw new Error(errorMessage)
      }

    } catch (err: any) {
      console.error('Error deleting trip stay:', err)
      const errorMessage = err.message || 'Failed to delete trip stay'
      
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
    deleteTripStay,
    isLoading: isDeleting,
    error: deleteError?.message || null
  }
}
