import { gql } from '@apollo/client'

export const TRANSFER_PRODUCTS_QUERY = gql`
  query TransferProducts($filters: TransferProductFilter, $order: TransferProductOrder) {
    transferProducts(filters: $filters, order: $order) {
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
      vehicle {
        id
        type
        name
        capacityAdults
        capacityChildren
        amenities
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
      description
      currency {
        code
        name
        createdAt
        updatedAt
      }
      priceCents
      cancellationPolicy
      commissionRate
      createdAt
      updatedAt
    }
  }
`

export interface TransferProductFilter {
  searchTransferProducts?: string | null
  AND?: {
    city?: {
      id: {
        exact?: string | null
      }
    }
    vehicle?: {
      type?: {
        exact?: string | null
      }
    }
  } | null
}

export interface TransferProductOrder {
  name?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST' | null
  priceCents?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST' | null
  createdAt?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST' | null
}

export interface GraphQLTransferProduct {
  id: string
  city: {
    id: string
    name: string
    country: {
      iso2: string
      name: string
      createdAt: string
      updatedAt: string
    }
    timezone: string
    lat: number
    lon: number
    createdAt: string
    updatedAt: string
  }
  vehicle: {
    id: string
    type: string
    name: string
    capacityAdults: number
    capacityChildren: number
    amenities: any
    createdAt: string
    updatedAt: string
  }
  supplier: {
    id: string
    name: string
    type: string
    contactEmail: string
    contractTerms: string
    commissionRate: number
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  name: string
  description: string
  currency: {
    code: string
    name: string
    createdAt: string
    updatedAt: string
  }
  priceCents: number
  cancellationPolicy: string | null
  commissionRate: number
  createdAt: string
  updatedAt: string
}

export interface TransferProductsResponse {
  transferProducts: GraphQLTransferProduct[]
}

export const TRANSFER_PRODUCT_QUERY = gql`
  query TransferProduct($transferProductId: ID!) {
    transferProduct(id: $transferProductId) {
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
      vehicle {
        id
        type
        name
        capacityAdults
        capacityChildren
        amenities
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
      description
      currency {
        code
        name
        createdAt
        updatedAt
      }
      priceCents
      cancellationPolicy
      commissionRate
      createdAt
      updatedAt
    }
  }
`

export interface TransferProductResponse {
  transferProduct: GraphQLTransferProduct
}

export const TRANSFERS_QUERY = gql`
  query Transfers($filters: TransferFilter, $order: TransferOrder) {
    transfers(filters: $filters, order: $order) {
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
        cancellationPolicy
        commissionRate
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
  }
`

export interface TransferFilter {
  tripDay?: {
    id?: {
      exact?: string | null
    }
  } | null
}

export interface TransferOrder {
  pickupTime?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST' | null
}

export interface GraphQLTransfer {
  id: string
  tripDay: {
    id: string
    dayNumber: number
    date: string
  }
  transferProduct: GraphQLTransferProduct
  pickupTime: string
  pickupLocation: string | null
  dropoffLocation: string | null
  vehiclesCount: number | null
  paxAdults: number
  paxChildren: number
  currency: {
    code: string
    name: string
  }
  priceTotalCents: number | null
  confirmationStatus: string
}

export interface TransfersResponse {
  transfers: GraphQLTransfer[]
}

