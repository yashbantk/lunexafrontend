import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_TRANSFER, DELETE_TRANSFER, UPDATE_TRANSFER } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'

// Type definitions for the transfer booking
export interface TransferBookingInput {
  tripDay: string // Required
  transferProduct: string // Required
  pickupTime: string // Required (Time format: "HH:MM:SS")
  currency: string // Required
  confirmationStatus: string // Required
  pickupLocation?: string // Optional
  dropoffLocation?: string // Optional
  vehiclesCount?: number // Optional
  paxAdults?: number // Optional
  paxChildren?: number // Optional
  priceTotalCents?: number // Optional
}

export interface TransferBookingResponse {
  createTransfer: {
    id: string
    tripDay: {
      id: string
      dayNumber: number
      date: string
    }
    transferProduct: {
      id: string
      name: string
      description: string
      city: {
        id: string
        name: string
        country: {
          iso2: string
          name: string
        }
      }
      vehicle: {
        id: string
        type: string
        name: string
        capacityAdults: number
        capacityChildren: number
      }
      currency: {
        id: string
        code: string
        name: string
      }
      priceCents: number
    }
    pickupTime: string
    pickupLocation: string | null
    dropoffLocation: string | null
    vehiclesCount: number | null
    paxAdults: number
    paxChildren: number
    currency: {
      id: string
      code: string
      name: string
    }
    priceTotalCents: number | null
    confirmationStatus: string
  }
}

export function useTransferBooking() {
  const [createTransferMutation, { loading: isCreating, error: createError }] = useMutation(CREATE_TRANSFER, {
    errorPolicy: 'all'
  })
  
  const [deleteTransferMutation, { loading: isDeleting, error: deleteError }] = useMutation(DELETE_TRANSFER, {
    errorPolicy: 'all'
  })

  const [updateTransferMutation, { loading: isUpdating, error: updateError }] = useMutation(UPDATE_TRANSFER, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()

  const createTransfer = async (
    data: TransferBookingInput,
    onSuccess?: (response: TransferBookingResponse) => void,
    onError?: (error: string) => void
  ): Promise<TransferBookingResponse | null> => {
    try {
      console.log('Creating transfer with data:', data)
      
      const response = await createTransferMutation({
        variables: { data }
      })

      if (response.data && (response.data as any).createTransfer) {
        const result = response.data as any
        // Check if it's an OperationInfo (error)
        if (result.createTransfer.__typename === 'OperationInfo') {
          const messages = result.createTransfer.messages || []
          const errorMessage = messages.map((m: any) => m.message).join(', ') || 'Failed to create transfer'
          throw new Error(errorMessage)
        }

        console.log('Transfer created successfully:', response.data)
        toast({ description: 'Transfer booking added successfully!', type: 'success' })
        
        if (onSuccess) {
          onSuccess(response.data as TransferBookingResponse)
        }
        
        return response.data as TransferBookingResponse
      } else {
        throw new Error('No data returned from createTransfer mutation')
      }

    } catch (err: any) {
      console.error('Error creating transfer:', err)
      const errorMessage = err.message || 'Failed to create transfer booking'
      toast({ description: errorMessage, type: 'error' })
      
      if (onError) {
        onError(errorMessage)
      }
      
      return null
    }
  }

  const deleteTransfer = async (
    bookingId: string,
    onSuccess?: (response: { id: string }) => void,
    onError?: (error: string) => void
  ): Promise<{ id: string } | null> => {
    try {
      console.log('Deleting transfer with ID:', bookingId)
      
      const response = await deleteTransferMutation({
        variables: { 
          data: { id: bookingId }
        }
      })

      if (response.data && (response.data as any).deleteTransfer) {
        const result = response.data as any
        // Check if it's an OperationInfo (error)
        if (result.deleteTransfer.__typename === 'OperationInfo') {
          const messages = result.deleteTransfer.messages || []
          const errorMessage = messages.map((m: any) => m.message).join(', ') || 'Failed to delete transfer'
          throw new Error(errorMessage)
        }

        console.log('Transfer deleted successfully:', response.data)
        toast({ description: 'Transfer booking removed successfully!', type: 'success' })
        
        if (onSuccess) {
          onSuccess(response.data as { id: string })
        }
        
        return response.data as { id: string }
      } else {
        throw new Error('No data returned from deleteTransfer mutation')
      }

    } catch (err: any) {
      console.error('Error deleting transfer:', err)
      const errorMessage = err.message || 'Failed to delete transfer booking'
      toast({ description: errorMessage, type: 'error' })
      
      if (onError) {
        onError(errorMessage)
      }
      
      return null
    }
  }

  const updateTransfer = async (
    data: { id: string } & Partial<TransferBookingInput>,
    onSuccess?: (response: any) => void,
    onError?: (error: string) => void
  ): Promise<any | null> => {
    try {
      console.log('Updating transfer with data:', data)
      
      const response = await updateTransferMutation({
        variables: { data }
      })

      if (response.data && (response.data as any).updateTransfer) {
        const result = response.data as any
        // Check if it's an OperationInfo (error)
        if (result.updateTransfer.__typename === 'OperationInfo') {
          const messages = result.updateTransfer.messages || []
          const errorMessage = messages.map((m: any) => m.message).join(', ') || 'Failed to update transfer'
          throw new Error(errorMessage)
        }

        console.log('Transfer updated successfully:', response.data)
        toast({ description: 'Transfer booking updated successfully!', type: 'success' })
        
        if (onSuccess) {
          onSuccess(response.data)
        }
        
        return response.data
      } else {
        throw new Error('No data returned from updateTransfer mutation')
      }

    } catch (err: any) {
      console.error('Error updating transfer:', err)
      const errorMessage = err.message || 'Failed to update transfer booking'
      toast({ description: errorMessage, type: 'error' })
      
      if (onError) {
        onError(errorMessage)
      }
      
      return null
    }
  }

  return {
    createTransfer,
    deleteTransfer,
    updateTransfer,
    isLoading: isCreating || isDeleting || isUpdating,
    error: createError?.message || deleteError?.message || updateError?.message || null
  }
}










