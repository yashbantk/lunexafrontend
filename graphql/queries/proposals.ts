import { gql } from '@apollo/client'

export const GET_PROPOSALS = gql`
  query MyProposals($filters: ProposalFilter, $order: ProposalOrder) {
    proposals(filters: $filters, order: $order) {
      id
      version
      name
      totalPriceCents
      estimatedDateOfBooking
      areFlightsBooked
      flightsMarkup
      landMarkup
      landMarkupType
      createdAt
      updatedAt
      status
      currency {
        code
        name
      }
      trip {
        id
        org {
          id
        }
        status
        tripType
        totalTravelers
        starRating
        transferOnly
        landOnly
        travelerDetails
        markupFlightPercent
        markupLandPercent
        bookingReference
        startDate
        endDate
        durationDays

        createdBy {
          id
          email
          firstName
          lastName
          name
          countryCode
          phone
          profileImageUrl
          org {
            id
          }
        }
        customer {
          id
          name
          email
          phone
          nationality
          org {
            id
            name
            website
          }
        }
        fromCity {
          id
          name
          country {
            iso2
            name
          }
        }
        nationality {
          iso2
          name
        }
        days {
          id
          dayNumber
          date
          city {
            id
            name
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
            rate {
              room {
                id
                hotel {
                  id
                  name
                  address
                  star
                }
                name
                bedType
                baseMealPlan
              }
            }
          }
          activityBookings {
            id
            slot
            option {
              id
              activity {
                id
                title
              }
              name
            }
            pickupHotel {
              id
              name
              address
            }
            confirmationStatus
          }
        }
      }
    }
  }
`
