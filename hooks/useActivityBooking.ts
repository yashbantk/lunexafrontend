import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_ACTIVITY_BOOKING, DELETE_ACTIVITY_BOOKING } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'

// Type definitions for the activity booking
export interface ActivityBookingInput {
  tripDay: string // Required
  slot: string // Required
  option: string // Required
  currency: string // Required
  pickupHotel: string // Required
  confirmationStatus: string // Required
  paxAdults?: number // Optional
  paxChildren?: number // Optional
  priceBaseCents?: number // Optional
  priceAddonsCents?: number // Optional
  pickupRequired?: boolean // Optional
}

export interface ActivityBookingResponse {
  createActivityBooking: {
    id: string
    slot: string
    paxAdults: number
    paxChildren: number
    priceBaseCents: number
    priceAddonsCents: number
    pickupRequired: boolean
    confirmationStatus: string
    option: {
      id: string
      name: string
      priceCents: number
      priceCentsChild: number
      durationMinutes: number
      maxParticipants: number
      maxParticipantsChild: number
      isRefundable: boolean
      isRecommended: boolean
      isAvailable: boolean
      refundPolicy: string
      cancellationPolicy: string
      notes: string
      startTime: string
      endTime: string
      inclusions: string[]
      exclusions: string[]
      createdAt: string
      updatedAt: string
    }
    pickupHotel?: {
      id: string
      name: string
      address: string
      star: number
    }
  }
}

export function useActivityBooking() {
  const [createActivityBookingMutation, { loading: isCreating, error: createError }] = useMutation(CREATE_ACTIVITY_BOOKING, {
    errorPolicy: 'all'
  })
  
  const [deleteActivityBookingMutation, { loading: isDeleting, error: deleteError }] = useMutation(DELETE_ACTIVITY_BOOKING, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()

  const createActivityBooking = async (
    data: ActivityBookingInput,
    onSuccess?: (response: ActivityBookingResponse) => void,
    onError?: (error: string) => void
  ): Promise<ActivityBookingResponse | null> => {
    try {
      
      const response = await createActivityBookingMutation({
        variables: { data }
      })

      if (response.data && (response.data as any).createActivityBooking) {
        toast({ description: 'Activity booking added successfully!', type: 'success' })
        
        if (onSuccess) {
          onSuccess(response.data as ActivityBookingResponse)
        }
        
        return response.data as ActivityBookingResponse
      } else {
        throw new Error('No data returned from createActivityBooking mutation')
      }

    } catch (err: any) {
      console.error('Error creating activity booking:', err)
      const errorMessage = err.message || 'Failed to create activity booking'
      toast({ description: errorMessage, type: 'error' })
      
      if (onError) {
        onError(errorMessage)
      }
      
      return null
    }
  }

  const deleteActivityBooking = async (
    bookingId: string,
    onSuccess?: (response: { id: string }) => void,
    onError?: (error: string) => void
  ): Promise<{ id: string } | null> => {
    try {
      
      const response = await deleteActivityBookingMutation({
        variables: { 
          data: { id: bookingId }
        }
      })

      if (response.data && (response.data as any).deleteActivityBooking) {
        toast({ description: 'Activity booking removed successfully!', type: 'success' })
        
        if (onSuccess) {
          onSuccess(response.data as { id: string })
        }
        
        return response.data as { id: string }
      } else {
        throw new Error('No data returned from deleteActivityBooking mutation')
      }

    } catch (err: any) {
      console.error('Error deleting activity booking:', err)
      const errorMessage = err.message || 'Failed to delete activity booking'
      toast({ description: errorMessage, type: 'error' })
      
      if (onError) {
        onError(errorMessage)
      }
      
      return null
    }
  }

  return {
    createActivityBooking,
    deleteActivityBooking,
    isLoading: isCreating || isDeleting,
    error: createError?.message || deleteError?.message || null
  }
}
