import { gql } from '@apollo/client'

export const CREATE_ACTIVITY_BOOKING = gql`
  mutation CreateActivityBooking($data: ActivityBookingInput!) {
    createActivityBooking(data: $data) {
      ... on ActivityBookingType {
        id
        slot
        paxAdults
        paxChildren
        priceBaseCents
        priceAddonsCents
        pickupRequired
        confirmationStatus
        option {
          id
          name
          priceCents
          priceCentsChild
          durationMinutes
          maxParticipants
          maxParticipantsChild
          isRefundable
          isRecommended
          isAvailable
          refundPolicy
          cancellationPolicy
          notes
          startTime
          endTime
          inclusions
          exclusions
          createdAt
          updatedAt
        }
        pickupHotel {
          id
          name
          address
          star
        }
      }
      ... on OperationInfo {
        messages {
          code
          field
          kind
          message
        }
      }
    }
  }
`

export const CREATE_ITINERARY_PROPOSAL = gql`
  mutation CreateItineraryProposal($input: CreateItineraryProposalInput!) {
    createItineraryProposal(input: $input) {
      trip {
        id
        org {
          id
          name
          billingEmail
          logoUrl
          phone
          email
          website
          taxNumber
        }
        createdBy {
          id
          email
          firstName
          lastName
        }
        customer {
          id
          name
          email
          phone
          nationality
        }
        fromCity {
          id
          name
          country {
            iso2
            name
          }
        }
        startDate
        endDate
        durationDays
        nationality {
          iso2
          name
        }
        status
        tripType
        totalTravelers
        starRating
        transferOnly
        landOnly
        travelerDetails
        currency {
          code
          name
        }
        markupFlightPercent
        markupLandPercent
        bookingReference
        createdAt
        updatedAt
      }

      destinations {
        id
        numberOfDays
        destination {
          id
          title
          description
          heroImageUrl
          highlights
        }
        order
      }

      days {
        id
        dayNumber
        date
        city {
          id
          name
          timezone
        }
        stay {
          id
          checkIn
          checkOut
          nights
          roomsCount
          mealPlan
          priceTotalCents
          confirmationStatus
        }
        activityBookings {
          id
          slot
          paxAdults
          paxChildren
          priceBaseCents
          priceAddonsCents
          pickupRequired
          confirmationStatus
          option {
            id
            name
            priceCents
            durationMinutes
            startTime
            endTime
          }
          pickupHotel {
            id
            name
            address
            star
          }
        }
      }

      stays {
        id
        checkIn
        checkOut
        nights
        roomsCount
        mealPlan
        priceTotalCents
        confirmationStatus
        room {
          id
          name
          priceCents
          bedType
          maxOccupancy
          hotel {
            id
            name
            address
            star
          }
        }
      }
    }
  }
`

export const DELETE_ACTIVITY_BOOKING = gql`
  mutation DeleteActivityBooking($data: BookingDeleteInput!) {
    deleteActivityBooking(data: $data) {
      ... on ActivityBookingType {
        id
      }
      ... on OperationInfo {
        messages {
          kind
          message
          field
          code
        }
      }
    }
  }
`

export const CREATE_PROPOSAL = gql`
  mutation CreateProposal($data: ProposalInput!) {
    createProposal(data: $data) {
      ... on ProposalType {
        id
        version
        name
        status
        totalPriceCents
        estimatedDateOfBooking
        areFlightsBooked
        flightsMarkup
        landMarkup
        landMarkupType
        createdAt
        updatedAt
      }
      ... on OperationInfo {
        messages {
          kind
          message
          field
          code
        }
      }
    }
  }
`
