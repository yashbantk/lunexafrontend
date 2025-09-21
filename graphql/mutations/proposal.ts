import { gql } from '@apollo/client'

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
          activity {
            id
            title
            rating
            durationMinutes
          }
          option {
            id
            name
            priceCents
            durationMinutes
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
