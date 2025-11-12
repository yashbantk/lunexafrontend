import { gql } from '@apollo/client'

export const HOTELS_QUERY = gql`
  query Hotels($order: HotelOrder, $filters: HotelFilter) {
    hotels(order: $order, filters: $filters) {
      id
      city {
        id
        name
        country {
          name
          iso2
        }
      }
      supplier {
        id
        name
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

export interface HotelFilters {
  city?: {
    id?: {
      exact?: string
    }
  }
  name?: {
    iContains?: string
    iExact?: string
  }
  star?: {
    exact?: number
    gte?: number
    lte?: number
    range?: {
      start: number
      end: number
    }
  }
  type?: {
    exact?: string
  }
  amenities?: {
    contains?: string[]
  }
  instantBooking?: {
    exact?: boolean
  }
  searchHotels?: string
  AND?: any
  OR?: any
  NOT?: any
}

export interface HotelOrder {
  name?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST'
  star?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST'
  createdAt?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST'
}

export interface GraphQLHotel {
  id: string
  city: {
    id: string
    name: string
    country: {
      name: string
      iso2: string
    }
  }
  supplier: {
    id: string
    name: string
  }
  name: string
  address: string
  type: string
  description: string
  locationUrl: string | null
  star: number
  totalRatings: number | null
  cancellationPolicy: string
  instantBooking: boolean
  cleanilessRating: string
  serviceRating: string
  comfortRating: string
  conditionRating: string
  amenitesRating: string
  neighborhoodRating: string
  amenities: any[]
  instructions: string
  policy: string
  inclusions: string
  exclusions: string
  tags: string[]
  commissionRate: string
  createdAt: string
  updatedAt: string
}

export interface HotelsResponse {
  hotels: GraphQLHotel[]
}
