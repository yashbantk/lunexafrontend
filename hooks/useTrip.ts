import { useQuery } from '@apollo/client/react'
import { GET_TRIP } from '@/graphql/queries/proposal'

// Type definitions for the trip data
export interface TripData {
  id: string
  org: {
    id: string
    name: string
    billingEmail: string
    logoUrl: string
    address: string
    phone: string
    email: string
    website: string
    taxNumber: string
    taxRate: number
    createdAt: string
    updatedAt: string
  } | null
  createdBy: {
    id: string
    email: string
    firstName: string
    lastName: string
    name: string | null
    phone: string | null
    gender: string
    profileImageUrl: string | null
  }
  customer: {
    id: string
    name: string
    email: string
    phone: string
    nationality: string
  } | null
  fromCity: {
    id: string
    name: string
    country: {
      iso2: string
      name: string
    }
    timezone: string
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
  starRating: string
  transferOnly: boolean
  landOnly: boolean
  travelerDetails: any
  currency: {
    code: string
    name: string
  }
  markupFlightPercent: string
  markupLandPercent: string
  bookingReference: string | null
  createdAt: string
  updatedAt: string
  days: Array<{
    id: string
    dayNumber: number
    date: string
    city: {
      id: string
      name: string
      timezone: string
      lat: number
      lon: number
      createdAt: string
      updatedAt: string
    }
    stay: {
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
          cancellationPolicy: string
          instantBooking: boolean
          cleanilessRating: string
          serviceRating: string
          comfortRating: string
          conditionRating: string
          amenitesRating: string
          neighborhoodRating: string
          amenities: string[]
          instructions: string
          policy: string
          inclusions: string
          exclusions: string
          tags: string[]
          commissionRate: string
          createdAt: string
          updatedAt: string
        }
        name: string
        priceCents: number
        bedType: string
        baseMealPlan: string
        hotelRoomImages: Array<{
          id: string
          hotelRoom: { pk: number }
          url: string
          caption: string
          priorityOrder: number
          createdAt: string
          updatedAt: string
        }>
        roomAmenities: Array<{
          id: string
          name: string
          description: string
          createdAt: string
          updatedAt: string
        }>
        rates: Array<{
          id: string
          room: { pk: number }
          validFrom: string
          validTo: string
          priceCents: number
          refundable: boolean
          createdAt: string
          updatedAt: string
        }>
        maxOccupancy: number
        size: string
        sizeUnit: string
        details: string
        amenities: string[]
        tags: string[]
        inclusions: string
        exclusions: string
        createdAt: string
        updatedAt: string
      }
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
      option: {
        id: string
        name: string
        mealPlan: {
          id: string
          name: string
          mealPlanType: string
          mealValue: number
          vegType: string
          description: string
          createdAt: string
          updatedAt: string
        } | null
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
        inclusions: string
        exclusions: string
        season: {
          id: string
          name: string
          startDate: string
          endDate: string
          createdAt: string
          updatedAt: string
        } | null
        activity: {
          id: string
          title: string
          summary: string
          description: string
          rating: number
          durationMinutes: number
          startTime: string
          highlights: string[]
          cancellationPolicy: string
          slot: number
          tags: string[]
          instantBooking: boolean
          commissionRate: number
          activityImages: Array<{
            id: string
            url: string
            caption: string
            priorityOrder: number
            createdAt: string
            updatedAt: string
          }>
          activityOptions: Array<{
            id: string
            name: string
            currency: {
              code: string
              name: string
              createdAt: string
              updatedAt: string
            }
            mealPlan: {
              id: string
              name: string
              mealPlanType: string
              mealValue: number
              vegType: string
              description: string
              createdAt: string
              updatedAt: string
            } | null
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
            inclusions: string
            exclusions: string
            season: {
              id: string
              name: string
              startDate: string
              endDate: string
              createdAt: string
              updatedAt: string
            } | null
            createdAt: string
            updatedAt: string
          }>
          activityAddons: Array<{
            id: string
            name: string
            description: string
            priceCents: number
            createdAt: string
            updatedAt: string
          }>
          activityCategoryMaps: Array<{
            id: string
            category: {
              id: string
              name: string
              description: string
              createdAt: string
              updatedAt: string
            }
            createdAt: string
            updatedAt: string
          }>
          createdAt: string
          updatedAt: string
        }
        createdAt: string
        updatedAt: string
      }
      paxAdults: number
      paxChildren: number
      priceBaseCents: number
      priceAddonsCents: number
      pickupRequired: boolean
      pickupHotel: {
        id: string
        name: string
        address: string
      } | null
      confirmationStatus: string
    }>
  }>
}

export interface TripResponse {
  trip: TripData
}

export function useTrip(tripId: string) {
  const { data, loading, error, refetch } = useQuery<TripResponse>(GET_TRIP, {
    variables: { tripId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    skip: !tripId // Skip query if no tripId provided
  })

  // Check if trip was not found (query completed but trip is null)
  const notFound = !loading && !error && data && data.trip === null

  return {
    trip: data?.trip || null,
    loading,
    error: error?.message || null,
    refetch,
    notFound
  }
}
