import { gql } from '@apollo/client'

export const GET_TRIP = gql`
  query Trip($tripId: ID!) {
    trip(id: $tripId) {
      id
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
        createdAt
        updatedAt
      }
      createdBy {
        id
        email
        firstName
        lastName
        name
        phone
        gender
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
        timezone
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
      days {
        id
        dayNumber
        date
        city {
          id
          name
          timezone
          lat
          lon
          createdAt
          updatedAt
        }
        stay {
          id
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
              createdAt
              updatedAt
            }
            name
            priceCents
            bedType
            baseMealPlan
            hotelRoomImages {
              id
              hotelRoom {
                pk
              }
              url
              caption
              priorityOrder
              createdAt
              updatedAt
            }
            roomAmenities {
              id
              name
              description
              createdAt
              updatedAt
            }
            rates {
              id
              room {
                pk
              }
              validFrom
              validTo
              priceCents
              refundable
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
            name
            mealPlan {
              id
              name
              mealPlanType
              mealValue
              vegType
              description
              createdAt
              updatedAt
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
              createdAt
              updatedAt
            }
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
                createdAt
                updatedAt
              }
              activityOptions {
                id
                name
                currency {
                  code
                  name
                  createdAt
                  updatedAt
                }
                mealPlan {
                  id
                  name
                  mealPlanType
                  mealValue
                  vegType
                  description
                  createdAt
                  updatedAt
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
                  createdAt
                  updatedAt
                }
                createdAt
                updatedAt
              }
              activityAddons {
                id
                name
                description
                priceCents
                createdAt
                updatedAt
              }
              activityCategoryMaps {
                id
                category {
                  id
                  name
                  description
                  createdAt
                  updatedAt
                }
                createdAt
                updatedAt
              }
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
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
`

export const GET_PROPOSAL = gql`
  query GetProposal($id: ID!) {
    proposal(id: $id) {
      id
      trip {
        id
        fromCity {
          id
          name
        }
        startDate
        endDate
        durationDays
        totalTravelers
        starRating
        currency {
          code
          name
        }
      }
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
  }
`

export const GET_PROPOSAL_DETAILS = gql`
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
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
                  createdAt
                  updatedAt
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
  }
`

export const GET_TRIP_PROPOSALS = gql`
  query GetTripProposals($tripId: ID!) {
    proposals(filters: { trip: { id: { exact: $tripId } } }) {
      id
      version
      name
      status
      createdAt
      updatedAt
    }
  }
`
