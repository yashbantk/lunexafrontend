import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
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
      } | null
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
  const [createItineraryProposalMutation, { loading: isLoading, error }] = useMutation(CREATE_ITINERARY_PROPOSAL as any, {
    errorPolicy: 'all'
  })

  const createItineraryProposal = async (input: CreateItineraryProposalInput): Promise<CreateItineraryProposalResponse | null> => {
    try {
      console.log('Creating itinerary proposal with input:', input)
      
      const response = await createItineraryProposalMutation({
        variables: { input }
      })

      console.log('Itinerary proposal created successfully:', response.data)
      return response.data as CreateItineraryProposalResponse

    } catch (err: any) {
      console.error('Error creating itinerary proposal:', err)
      return null
    }
  }

  return {
    createItineraryProposal,
    isLoading,
    error: error?.message || null
  }
}
