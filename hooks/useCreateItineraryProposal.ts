import { useState } from 'react'
import { gqlRequest } from '@/lib/graphql/client'
import { CREATE_ITINERARY_PROPOSAL } from '@/graphql/mutations/proposal'

// Type definitions for the mutation response
export interface CreateItineraryProposalResponse {
  createItineraryProposal: {
    trip: {
      id: string
      org: {
        id: string
        name: string
        billingEmail: string
        logoUrl: string
        phone: string
        email: string
        website: string
        taxNumber: string
      }
      createdBy: {
        id: string
        email: string
        firstName: string
        lastName: string
      }
      customer: {
        id: string
        name: string
        email: string
        phone: string
        nationality: string
      }
      fromCity: {
        id: string
        name: string
        country: {
          iso2: string
          name: string
        }
      }
      startDate: string
      endDate: string
      durationDays: number
      nationality: {
        iso2: string
        name: string
      }
      status: string
      tripType: string
      totalTravelers: number
      starRating: number
      transferOnly: boolean
      landOnly: boolean
      travelerDetails: any
      currency: {
        code: string
        name: string
      }
      markupFlightPercent: number
      markupLandPercent: number
      bookingReference: string
      createdAt: string
      updatedAt: string
    }
    destinations: Array<{
      id: string
      numberOfDays: number
      destination: {
        id: string
        title: string
        description: string
        heroImageUrl: string
        highlights: string[]
      }
      order: number
    }>
    days: Array<{
      id: string
      dayNumber: number
      date: string
      city: {
        id: string
        name: string
        timezone: string
      }
      stay: {
        id: string
        checkIn: string
        checkOut: string
        nights: number
        roomsCount: number
        mealPlan: string
        priceTotalCents: number
        confirmationStatus: string
      }
      activityBookings: Array<{
        id: string
        slot: string
        paxAdults: number
        paxChildren: number
        priceBaseCents: number
        priceAddonsCents: number
        pickupRequired: boolean
        confirmationStatus: string
        activity: {
          id: string
          title: string
          rating: number
          durationMinutes: number
        }
        option: {
          id: string
          name: string
          priceCents: number
          durationMinutes: number
        }
        pickupHotel: {
          id: string
          name: string
          address: string
          star: number
        }
      }>
    }>
    stays: Array<{
      id: string
      checkIn: string
      checkOut: string
      nights: number
      roomsCount: number
      mealPlan: string
      priceTotalCents: number
      confirmationStatus: string
      room: {
        id: string
        name: string
        priceCents: number
        bedType: string
        maxOccupancy: number
        hotel: {
          id: string
          name: string
          address: string
          star: number
        }
      }
    }>
  }
}

export interface CreateItineraryProposalInput {
  fromCity: string
  startDate: string
  nationality: string
  status?: string
  tripType?: string
  totalTravelers?: number
  starRating?: number
  transferOnly?: boolean
  landOnly?: boolean
  travelerDetails?: any
  currency: string
  markupFlightPercent?: number
  markupLandPercent?: number
  bookingReference?: string
  roomsCount?: number
  destinations: Array<{
    destination: string
    numberOfDays: number
    order: number
  }>
}

export function useCreateItineraryProposal() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createItineraryProposal = async (input: CreateItineraryProposalInput): Promise<CreateItineraryProposalResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Creating itinerary proposal with input:', input)
      
      const response = await gqlRequest<CreateItineraryProposalResponse>(
        CREATE_ITINERARY_PROPOSAL,
        { input }
      )

      console.log('Itinerary proposal created successfully:', response)
      return response

    } catch (err: any) {
      console.error('Error creating itinerary proposal:', err)
      
      // Extract error message from GraphQL response
      let errorMessage = 'Failed to create itinerary proposal'
      
      if (err?.response?.errors?.[0]?.message) {
        errorMessage = err.response.errors[0].message
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      return null

    } finally {
      setIsLoading(false)
    }
  }

  return {
    createItineraryProposal,
    isLoading,
    error
  }
}
