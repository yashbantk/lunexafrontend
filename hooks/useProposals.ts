import { useQuery } from '@apollo/client/react'
import { GET_PROPOSALS } from '@/graphql/queries/proposals'

export interface ProposalFilters {
  status?: string
  tripType?: string
  createdBy?: string
  dateFrom?: string
  dateTo?: string
}

export interface ProposalOrder {
  createdAt?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST'
  updatedAt?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST'
  name?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST'
  totalPriceCents?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST'
}

export interface Proposal {
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
  trip: {
    id: string
    status: string
    tripType: string
    totalTravelers: number
    starRating: number
    transferOnly: boolean
    landOnly: boolean
    travelerDetails: any
    markupFlightPercent: number
    markupLandPercent: number
    bookingReference: string
    startDate: string
    endDate: string
    durationDays: number
    createdBy: {
      id: string
      email: string
      firstName: string
      lastName: string
      name: string
      countryCode: string
      phone: string
      profileImageUrl: string
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
    nationality: {
      iso2: string
      name: string
    }
    days: Array<{
      id: string
      dayNumber: number
      date: string
      city: {
        id: string
        name: string
      }
      stay?: {
        id: string
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
            totalRatings: number
          }
          name: string
          priceCents: number
          bedType: string
          baseMealPlan: string
        }
      }
      activityBookings: Array<{
        id: string
        slot: string
        option: {
          id: string
          activity: {
            id: string
            title: string
          }
          name: string
        }
        pickupHotel: {
          id: string
          name: string
          address: string
        }
        confirmationStatus: string
      }>
    }>
  }
}

export function useProposals(filters?: ProposalFilters, order?: ProposalOrder) {
  const { data, loading, error, refetch } = useQuery<{ proposals: Proposal[] }>(GET_PROPOSALS, {
    variables: {
      filters: filters || null,
      order: order || null
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network'
  })

  return {
    proposals: data?.proposals || [],
    loading,
    error,
    refetch
  }
}
