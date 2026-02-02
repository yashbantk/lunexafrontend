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
          rate {
            room {
              amenities
              baseMealPlan
              bedType
              maxOccupancy
              id
              hotel {
                id
                address
                name
                star
              }
            }
          }
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

export const UPDATE_PROPOSAL = gql`
  mutation UpdateProposal($data: ProposalPartialInput!) {
    updateProposal(data: $data) {
      ... on ProposalType {
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
          org {
            id
            name
            billingEmail
            logoUrl
            address
            phone
            email
            website
            taxNumber
            taxRate
          }
          createdBy {
            id
            email
            firstName
            lastName
            name
            countryCode
            phone
            profileImageUrl
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
              rate {
                room {
                  id
                  hotel {
                    id
                    name
                    address
                    type
                    description
                    locationUrl
                    star
                    totalRatings
                    cancellationPolicy
                    instantBooking
                    cleanilessRating
                    serviceRating
                    comfortRating
                    conditionRating
                    amenitesRating
                    neighborhoodRating
                    amenities
                    instructions
                    policy
                    inclusions
                    exclusions
                    tags
                    commissionRate
                  }
                  name
                  priceCents
                  bedType
                  baseMealPlan
                  hotelRoomImages {
                    id
                    url
                    caption
                    priorityOrder
                  }
                  roomAmenities {
                    id
                    name
                    description
                  }
                  maxOccupancy
                  size
                  sizeUnit
                  details
                  amenities
                  tags
                  inclusions
                  exclusions
                }
              }
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
              option {
                id
                activity {
                  id
                  title
                  summary
                  description
                  rating
                  durationMinutes
                  startTime
                  highlights
                  cancellationPolicy
                  slot
                  tags
                  instantBooking
                  commissionRate
                  activityImages {
                    id
                    url
                    caption
                    priorityOrder
                  }
                  activityAddons {
                    id
                    name
                    description
                    priceCents
                  }
                  activityCategoryMaps {
                    id
                    category {
                      id
                      name
                    }
                  }
                }
                name
                mealPlan {
                  id
                  name
                  mealPlanType
                  mealValue
                  vegType
                  description
                }
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
                season {
                  id
                  name
                  startDate
                  endDate
                }
              }
              paxAdults
              paxChildren
              priceBaseCents
              priceAddonsCents
              pickupRequired
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

export const DELETE_TRIP_STAY = gql`
  mutation DeleteTripStay($data: BookingDeleteInput!) {
    deleteTripStay(data: $data) {
      ... on TripStayType {
        id
      }
      ... on OperationInfo {
        messages {
          code
          message
          kind
          field
        }
      }
    }
  }
`

export const CREATE_TRIP_STAY = gql`
  mutation CreateTripStay($data: TripStayInput!) {
    createTripStay(data: $data) {
      ... on TripStayType {
        id
        tripDay {
          id
          dayNumber
          date
        }
        rate {
          room {
            id
            hotel {
              id
              name
              address
              type
              description
              locationUrl
              star
            }
            name
            priceCents
            bedType
            baseMealPlan
            hotelRoomImages {
              id
              url
              caption
              priorityOrder
            }
            roomAmenities {
              id
              name
              description
              createdAt
              updatedAt
            }
            maxOccupancy
            size
            sizeUnit
            details
            amenities
            tags
            inclusions
            exclusions
            createdAt
            updatedAt
          }
        }
        checkIn
        checkOut
        nights
        roomsCount
        mealPlan
        currency {
          code
          name
          createdAt
          updatedAt
        }
        priceTotalCents
        confirmationStatus
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

export const UPDATE_TRIP_STAYS = gql`
  mutation UpdateTripStays($data: [TripStayPartialInput!]!) {
    updateTripStays(data: $data) {
      id
      tripDay {
        id
        dayNumber
        date
      }
      checkIn
      checkOut
      nights
      roomsCount
      mealPlan
      currency {
        code
        name
        createdAt
        updatedAt
      }
      priceTotalCents
      confirmationStatus
      rate {
        room {
          amenities
          baseMealPlan
          bedType
          maxOccupancy
          id
          hotel {
            id
            address
            name
            star
          }
        }
      }
    }
  }
`

export const CREATE_TRANSFER = gql`
  mutation CreateTransfer($data: TransferInput!) {
    createTransfer(data: $data) {
      ... on TransferType {
        id
        tripDay {
          id
          dayNumber
          date
        }
        transferProduct {
          id
          name
          description
          city {
            id
            name
            country {
              iso2
              name
            }
          }
          vehicle {
            id
            type
            name
            capacityAdults
            capacityChildren
          }
          currency {
            code
            name
          }
          priceCents
        }
        pickupTime
        pickupLocation
        dropoffLocation
        vehiclesCount
        paxAdults
        paxChildren
        currency {
          code
          name
        }
        priceTotalCents
        confirmationStatus
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

export const DELETE_TRANSFER = gql`
  mutation DeleteTransfer($data: BookingDeleteInput!) {
    deleteTransfer(data: $data) {
      ... on TransferType {
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

export const UPDATE_TRIP = gql`
  mutation UpdateTrip($data: TripPartialInput!) {
    updateTrip(data: $data) {
      ... on TripType {
        id
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

export const UPDATE_TRANSFER = gql`
  mutation UpdateTransfer($data: TransferPartialInput!) {
    updateTransfer(data: $data) {
      ... on TransferType {
        id
        tripDay {
          id
          dayNumber
          date
        }
        transferProduct {
          id
          name
          description
          city {
            id
            name
            country {
              iso2
              name
            }
          }
          vehicle {
            id
            type
            name
            capacityAdults
            capacityChildren
          }
          currency {
            code
            name
          }
          priceCents
        }
        pickupTime
        pickupLocation
        dropoffLocation
        vehiclesCount
        paxAdults
        paxChildren
        currency {
          code
          name
        }
        priceTotalCents
        confirmationStatus
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
