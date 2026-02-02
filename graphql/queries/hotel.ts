import { gql } from '@apollo/client'

export const GET_HOTEL_DETAILS = gql`
  query Hotel($hotelId: ID!) {
    hotel(id: $hotelId) {
      id
      city {
        id
        name
        country {
          iso2
          name
          createdAt
          updatedAt
        }
        timezone
        lat
        lon
        createdAt
        updatedAt
      }
      supplier {
        id
        name
        type
        contactEmail
        contractTerms
        commissionRate
        isActive
        createdAt
        updatedAt
      }
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
      hotelImages {
        id
        url
        caption
        priorityOrder
        createdAt
        updatedAt
      }
      hotelRooms {
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
        currency {
          code
          name
          createdAt
          updatedAt
        }
        priceCents
        bedType
        baseMealPlan
        hotelRoomImages {
          id
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
            id
          }
          validFrom
          validTo
          priceCents
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
  }
`
