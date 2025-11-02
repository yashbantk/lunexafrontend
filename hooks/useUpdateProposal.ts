import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { UPDATE_PROPOSAL } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'
import { useRouter } from 'next/navigation'

// Type definitions for the proposal update
export interface ProposalPartialInput {
  id?: string | null
  trip?: { set?: string | null } | null
  name?: string | null
  status?: string | null
  currency?: { set?: string | null } | null
  totalPriceCents?: number | null
  estimatedDateOfBooking?: string | null
  areFlightsBooked?: boolean | null
  flightsMarkup?: number | null
  landMarkup?: number | null
  landMarkupType?: string | null
  version?: number | null
}

export interface ProposalUpdateResponse {
  updateProposal: {
    id: string
    version: number
    name: string
    totalPriceCents: number
    estimatedDateOfBooking: string
    areFlightsBooked: boolean
    flightsMarkup: number
    landMarkup: number
    landMarkupType: string
    createdAt: string
    updatedAt: string
    status: string
    currency: {
      code: string
      name: string
    }
    trip: any
  }
}

export function useUpdateProposal() {
  const [updateProposalMutation, { loading: isUpdating, error: updateError }] = useMutation(UPDATE_PROPOSAL, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()
  const router = useRouter()

  const updateProposal = async (
    data: ProposalPartialInput,
    onSuccess?: (response: ProposalUpdateResponse) => void,
    onError?: (error: string) => void
  ): Promise<ProposalUpdateResponse | null> => {
    try {
      console.log('Updating proposal with data:', data)
      
      const response = await updateProposalMutation({
        variables: { data }
      })

      console.log('Full response data:', response.data)
      
      if (response.data && (response.data as any).updateProposal) {
        const updateProposalResponse = (response.data as any).updateProposal
        
        // Check if it's a successful update (has id) or an error (has messages)
        if (updateProposalResponse.id) {
          console.log('Proposal updated successfully:', updateProposalResponse)
          toast({ description: 'Proposal updated successfully!', type: 'success' })
          
          if (onSuccess) {
            onSuccess({ updateProposal: updateProposalResponse } as ProposalUpdateResponse)
          }
          
          return { updateProposal: updateProposalResponse } as ProposalUpdateResponse
        } else if (updateProposalResponse.messages) {
          // Messages present = Error occurred
          const errorMessage = updateProposalResponse.messages[0]?.message || 'Failed to update proposal'
          console.error('GraphQL error:', errorMessage)
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        } else {
          console.error('Unexpected response format:', updateProposalResponse)
          throw new Error('Unexpected response format from updateProposal')
        }
      } else {
        console.error('No updateProposal in response:', response.data)
        const errorMessage = 'No data returned from updateProposal mutation'
        toast({ description: errorMessage, type: 'error' })
        throw new Error(errorMessage)
      }

    } catch (err: any) {
      console.error('Error updating proposal:', err)
      const errorMessage = err.message || 'Failed to update proposal'
      
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

  const updateProposalAndRedirect = async (
    data: ProposalPartialInput,
    redirectPath?: string
  ): Promise<ProposalUpdateResponse | null> => {
    const result = await updateProposal(data)
    
    console.log('updateProposalAndRedirect result:', result)
    
    if (result && result.updateProposal) {
      const proposalId = result.updateProposal.id
      console.log('Proposal ID from result:', proposalId)
      
      if (proposalId) {
        const redirectTo = redirectPath || `/proposal/${proposalId}`
        console.log('Redirecting to:', redirectTo)
        router.push(redirectTo)
      } else {
        console.error('No proposal ID found in result:', result)
        toast({ description: 'Proposal updated but no ID returned', type: 'error' })
      }
    } else {
      console.error('No updateProposal in result:', result)
    }
    
    return result
  }

  return {
    updateProposal,
    updateProposalAndRedirect,
    isLoading: isUpdating,
    error: updateError?.message || null
  }
}

