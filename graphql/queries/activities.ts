import { gql } from '@apollo/client'

export const ACTIVITIES_QUERY = gql`
  query Activities($filters: ActivityFilter, $order: ActivityOrder) {
    activities(filters: $filters, order: $order) {
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
      title
      summary
      description
      rating
      durationMinutes
      highlights
      cancellationPolicy
      slot
      tags
      instantBooking
      commissionRate
      activityImages {
        id
        activity {
          id
          title
          summary
          description
          rating
          durationMinutes
          highlights
          cancellationPolicy
          slot
          tags
          instantBooking
          commissionRate
          createdAt
          updatedAt
        }
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
  }
`

export interface ActivityFilter {
  searchActivities?: string | null
  AND?: {
    city?: {
      id:{
        exact?: string | null
      }
    }
    durationMinutes?: {
      range?: {
        start?: number | null
        end?: number | null
      }
    }
  } | null
}

export interface ActivityOrder {
  rating?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST' | null
  title?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST' | null
  durationMinutes?: 'ASC' | 'DESC' | 'ASC_NULLS_FIRST' | 'ASC_NULLS_LAST' | 'DESC_NULLS_FIRST' | 'DESC_NULLS_LAST' | null
}

export interface GraphQLActivity {
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
  supplier: {
    id: string
    name: string
    type: string
    contactEmail: string
    contractTerms: any
    commissionRate: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  title: string
  summary: string
  description: string
  rating: string
  durationMinutes: number
  highlights: string[]
  cancellationPolicy: string | null
  slot: number
  tags: string[]
  instantBooking: boolean
  commissionRate: string
  activityImages: {
    id: string
    activity: {
      id: string
      title: string
      summary: string
      description: string
      rating: string
      durationMinutes: number
      highlights: string[]
      cancellationPolicy: string | null
      slot: number
      tags: string[]
      instantBooking: boolean
      commissionRate: string
      createdAt: string
      updatedAt: string
    }
    url: string
    caption: string
    priorityOrder: number
    createdAt: string
    updatedAt: string
  }[]
  activityOptions: {
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
      mealValue: string | null
      vegType: string
      description: string
      createdAt: string
      updatedAt: string
    } | null
    priceCents: number
    priceCentsChild: number | null
    durationMinutes: number
    maxParticipants: number
    maxParticipantsChild: number | null
    isRefundable: boolean
    isRecommended: boolean
    isAvailable: boolean
    refundPolicy: string | null
    cancellationPolicy: string | null
    notes: string | null
    startTime: string
    endTime: string
    inclusions: string | null
    exclusions: string | null
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
  }[]
  activityAddons: {
    id: string
    name: string
    description: string
    priceCents: number
    createdAt: string
    updatedAt: string
  }[]
  activityCategoryMaps: {
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
  }[]
  createdAt: string
  updatedAt: string
}

export interface ActivitiesResponse {
  activities: GraphQLActivity[]
}

export const ACTIVITY_QUERY = gql`
  query Activity($activityId: ID!) {
    activity(id: $activityId) {
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
      title
      summary
      description
      rating
      durationMinutes
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
  }
`

export interface ActivityResponse {
  activity: GraphQLActivity
}
