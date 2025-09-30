import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_PROPOSAL } from '@/graphql/mutations/proposal'
import { useToast } from './useToast'
import { useRouter } from 'next/navigation'

// Type definitions for the proposal creation
export interface ProposalInput {
  trip: string // Required - Trip ID
  name?: string // Optional - Proposal name
  status?: string // Optional - Proposal status
  currency?: string // Optional - Currency ID
  totalPriceCents?: number // Optional - Total price in cents
  estimatedDateOfBooking?: string // Optional - Estimated booking date
  areFlightsBooked?: boolean // Optional - Whether flights are booked
  flightsMarkup?: number // Optional - Flight markup percentage
  landMarkup?: number // Optional - Land markup percentage
  landMarkupType?: string // Optional - Land markup type
  version?: number // Optional - Proposal version
}

export interface ProposalResponse {
  createProposal: {
    id: string
    version: number
    name: string
    status: string
    totalPriceCents: number
    estimatedDateOfBooking: string
    areFlightsBooked: boolean
    flightsMarkup: number
    landMarkup: number
    landMarkupType: string
    createdAt: string
    updatedAt: string
  }
}

export function useCreateProposal() {
  const [createProposalMutation, { loading: isCreating, error: createError }] = useMutation(CREATE_PROPOSAL, {
    errorPolicy: 'all'
  })
  
  const { toast } = useToast()
  const router = useRouter()

  // Function to get the next version number for a trip
  const getNextVersionNumber = async (tripId: string): Promise<number> => {
    // For now, always return version 1
    // TODO: Implement proper version tracking
    return 1
  }

  const createProposal = async (
    data: ProposalInput,
    onSuccess?: (response: ProposalResponse) => void,
    onError?: (error: string) => void
  ): Promise<ProposalResponse | null> => {
    try {
      console.log('Creating proposal with data:', data)
      
      // Get the next version number for this trip
      let nextVersion = await getNextVersionNumber(data.trip)
      console.log('Next version number:', nextVersion)
      
      // Update the data with the correct version
      let proposalData = {
        ...data,
        version: nextVersion
      }
      
      // Try to create the proposal with retry logic for version conflicts
      let response
      let attempts = 0
      const maxAttempts = 5
      
      while (attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1} with version ${nextVersion}`)
        
        response = await createProposalMutation({
          variables: { data: proposalData }
        })

        console.log('Full response data:', response.data)
        
        if (response.data && (response.data as any).createProposal) {
          const createProposalResponse = (response.data as any).createProposal
          
          // Check if it's a successful creation (has id) or an error (has messages)
          // If id exists = Success, if messages exist = Error
          if (createProposalResponse.id) {
            console.log('Proposal created successfully:', createProposalResponse)
            toast({ description: `Proposal v${nextVersion} created successfully!`, type: 'success' })
            
            if (onSuccess) {
              onSuccess({ createProposal: createProposalResponse } as ProposalResponse)
            }
            
            return { createProposal: createProposalResponse } as ProposalResponse
          } else if (createProposalResponse.messages) {
            // Messages present = Error occurred
            console.log('Proposal creation returned error messages:', createProposalResponse.messages)
            
            // Check if it's a unique constraint error that we can retry
            const uniqueError = createProposalResponse.messages.find((msg: any) => 
              msg.code === 'unique_together' && msg.message.includes('Trip and Version')
            )
            
            if (uniqueError && attempts < maxAttempts - 1) {
              console.log('Unique constraint error detected, trying next version...')
              nextVersion++
              proposalData = { ...proposalData, version: nextVersion }
              attempts++
              continue
            } else {
              // Show error message in toast and throw
              const errorMessage = createProposalResponse.messages[0]?.message || 'Failed to create proposal'
              console.error('GraphQL error:', errorMessage)
              toast({ description: errorMessage, type: 'error' })
              throw new Error(errorMessage)
            }
          } else {
            console.error('Unexpected response format:', createProposalResponse)
            throw new Error('Unexpected response format from createProposal')
          }
        } else {
          console.error('No createProposal in response:', response.data)
          const errorMessage = 'No data returned from createProposal mutation'
          toast({ description: errorMessage, type: 'error' })
          throw new Error(errorMessage)
        }
      }
      
      // If we get here, all attempts failed
      const errorMessage = `Failed to create proposal after ${maxAttempts} attempts`
      toast({ description: errorMessage, type: 'error' })
      throw new Error(errorMessage)

    } catch (err: any) {
      console.error('Error creating proposal:', err)
      const errorMessage = err.message || 'Failed to create proposal'
      
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

  const createProposalAndRedirect = async (
    data: ProposalInput,
    redirectPath?: string
  ): Promise<ProposalResponse | null> => {
    const result = await createProposal(data)
    
    console.log('createProposalAndRedirect result:', result)
    
    if (result && result.createProposal) {
      const proposalId = result.createProposal.id
      console.log('Proposal ID from result:', proposalId)
      
      if (proposalId) {
        const redirectTo = redirectPath || `/proposal/${proposalId}`
        console.log('Redirecting to:', redirectTo)
        router.push(redirectTo)
      } else {
        console.error('No proposal ID found in result:', result)
        toast({ description: 'Proposal created but no ID returned', type: 'error' })
      }
    } else {
      console.error('No createProposal in result:', result)
    }
    
    return result
  }

  return {
    createProposal,
    createProposalAndRedirect,
    isLoading: isCreating,
    error: createError?.message || null
  }
}
