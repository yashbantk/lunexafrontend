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
      org?: {
        id: string
        name: string
        website?: string
      }
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
        checkIn: string
        checkOut: string
        nights: number
        roomsCount: number
        mealPlan: string
        priceTotalCents: number
        confirmationStatus: string
        rate?: {
          room: {
            id: string
            hotel: {
              id: string
              name: string
              address: string
              star: number
            }
            name: string
            bedType: string
            baseMealPlan: string
          }
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
  // Transform flat filters to GraphQL nested structure
  const apiFilters: any = {}
  
  if (filters) {
    if (filters.status) {
      apiFilters.status = { exact: filters.status }
    }
    
    if (filters.tripType) {
      apiFilters.trip = {
        ...(apiFilters.trip || {}),
        tripType: { exact: filters.tripType }
      }
    }

    if (filters.createdBy) {
      apiFilters.trip = {
        ...(apiFilters.trip || {}),
        createdBy: { id: { exact: filters.createdBy } }
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      apiFilters.updatedAt = {}
      if (filters.dateFrom) apiFilters.updatedAt.gte = filters.dateFrom
      if (filters.dateTo) apiFilters.updatedAt.lte = filters.dateTo
    }
  }

  const { data, loading, error, refetch } = useQuery<{ proposals: Proposal[] }>(GET_PROPOSALS, {
    variables: {
      filters: Object.keys(apiFilters).length > 0 ? apiFilters : null,
      order: order || null
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true // Ensure loading state updates correctly
  })

  return {
    proposals: data?.proposals || [],
    loading,
    error,
    refetch
  }
}
