import { useQuery } from '@apollo/client/react'
import { GET_PROPOSAL_DETAILS } from '@/graphql/queries/proposal'

export interface ProposalDetails {
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
    starRating: number | null
    transferOnly: boolean
    landOnly: boolean
    travelerDetails: {
      adults: number
      children: number
      specialRequests: string | null
    }
    markupFlightPercent: number
    markupLandPercent: number
    bookingReference: string | null
    startDate: string
    endDate: string
    durationDays: number
    org: {
      id: string
      name: string
      billingEmail: string | null
      logoUrl: string | null
      address: string | null
      phone: string | null
      email: string | null
      website: string | null
      taxNumber: string | null
      taxRate: number | null
    } | null
    createdBy: {
      id: string
      email: string
      firstName: string
      lastName: string
      name: string
      countryCode: string | null
      phone: string | null
      profileImageUrl: string | null
    } | null
    customer: {
      id: string
      name: string
      email: string
      phone: string | null
      nationality: string | null
    } | null
    fromCity: {
      id: string
      name: string
      country: {
        iso2: string
        name: string
      } | null
    } | null
    nationality: {
      iso2: string
      name: string
    } | null
    days: Array<{
      id: string
      dayNumber: number
      date: string
      city: {
        id: string
        name: string
      } | null
      stay: {
        id: string
        checkIn: string
        checkOut: string
        nights: number
        roomsCount: number
        mealPlan: string | null
        priceTotalCents: number | null
        confirmationStatus: string
        rate?: {
          room: {
            id: string
            hotel: {
              id: string
              name: string
              address: string | null
              star: number | null
            } | null
            name: string
            amenities: string[] | null
            bedType: string | null
            baseMealPlan: string | null
            maxOccupancy: number | null
            hotelRoomImages: Array<{
              id: string
              url: string
              caption: string | null
              priorityOrder: number | null
            }> | null
            roomAmenities: Array<{
              id: string
              name: string
              description: string | null
            }> | null
            size: number | null
            sizeUnit: string | null
            inclusions: string[] | null
            exclusions: string[] | null
          } | null
        } | null
      } | null
      activityBookings: Array<{
        id: string
        slot: string
        option: {
          id: string
          activity: {
            id: string
            title: string
            summary: string | null
            description: string | null
            rating: number | null
            durationMinutes: number | null
            startTime: string | null
            highlights: string[] | null
            cancellationPolicy: string | null
            slot: string | null
            tags: string[] | null
            instantBooking: boolean | null
            commissionRate: number | null
            activityImages: Array<{
              id: string
              url: string
              caption: string | null
              priorityOrder: number | null
              createdAt: string
              updatedAt: string
            }> | null
            activityAddons: Array<{
              id: string
              name: string
              description: string | null
              priceCents: number | null
            }> | null
            activityCategoryMaps: Array<{
              id: string
              category: {
                id: string
                name: string
              } | null
            }> | null
          } | null
          name: string
          mealPlan: {
            id: string
            name: string
            mealPlanType: string
            mealValue: string | null
            vegType: string | null
            description: string | null
          } | null
          priceCents: number | null
          priceCentsChild: number | null
          durationMinutes: number | null
          maxParticipants: number | null
          maxParticipantsChild: number | null
          isRefundable: boolean | null
          isRecommended: boolean | null
          isAvailable: boolean | null
          refundPolicy: string | null
          cancellationPolicy: string | null
          notes: string | null
          startTime: string | null
          endTime: string | null
          inclusions: string[] | null
          exclusions: string[] | null
          season: {
            id: string
            name: string
            startDate: string
            endDate: string
          } | null
        } | null
        paxAdults: number | null
        paxChildren: number | null
        priceBaseCents: number | null
        priceAddonsCents: number | null
        pickupRequired: boolean | null
        pickupHotel: {
          id: string
          name: string
          address: string | null
        } | null
        confirmationStatus: string
      }> | null
      transfers: Array<{
        id: string
        pickupTime: string | null
        pickupLocation: string | null
        dropoffLocation: string | null
        vehiclesCount: number | null
        paxAdults: number
        paxChildren: number
        priceTotalCents: number | null
        confirmationStatus: string
        transferProduct: {
          id: string
          name: string
          description: string | null
          priceCents: number | null
          cancellationPolicy: string | null
          commissionRate: number | null
          createdAt: string
          updatedAt: string
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
            name: string
            capacityAdults: number | null
            capacityChildren: number | null
            type: string | null
            amenities: any
          }
          currency: {
            code: string
            name: string | null
          }
        }
        currency: {
          code: string
          name: string | null
        }
      }> | null
    }> | null
  } | null
}

export function useProposal(proposalId: string) {
  const { data, loading, error } = useQuery<
    { proposal: ProposalDetails },
    { proposalId: string }
  >(GET_PROPOSAL_DETAILS, {
    variables: { proposalId: proposalId },
    skip: !proposalId,
  })

  return {
    proposal: data?.proposal,
    loading,
    error: error?.message,
  }
}