import { useState, useEffect, useCallback } from 'react'
import { Activity, ActivitySelection, ScheduleSlot, Extra, PickupOption } from '@/types/activity'
import { mockActivities, GET_ACTIVITY_DETAILS } from '@/lib/mocks/activities'

interface UseActivityDetailsProps {
  activityId: string
  checkIn: string
  checkOut: string
  adults: number
  childrenCount: number
}

interface UseActivityDetailsReturn {
  activity: Activity | null
  loading: boolean
  error: string | null
  refetch: () => void
  calculatePrice: (selection: Partial<ActivitySelection>) => number
  validateSelection: (selection: Partial<ActivitySelection>) => string[]
}

export function useActivityDetails({
  activityId,
  checkIn,
  checkOut,
  adults,
  childrenCount
}: UseActivityDetailsProps): UseActivityDetailsReturn {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TODO: GraphQL - Replace with real GraphQL call
  const fetchActivityDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // TODO: GraphQL - Replace mock with real GraphQL call
      // const variables = { id: activityId, checkIn, checkOut, adults, children }
      // const result = await graphQLClient.request(GET_ACTIVITY_DETAILS, variables)
      // setActivity(result.activity)
      
      // Mock implementation
      const foundActivity = mockActivities.find(a => a.id === activityId)
      if (!foundActivity) {
        throw new Error('Activity not found')
      }
      
      setActivity(foundActivity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity details')
    } finally {
      setLoading(false)
    }
  }, [activityId, checkIn, checkOut, adults, childrenCount])

  const calculatePrice = useCallback((selection: Partial<ActivitySelection>): number => {
    if (!activity) return 0
    
    let totalPrice = 0
    
    // Base price
    if (activity.pricingType === 'person') {
      totalPrice = activity.basePrice * (adults + childrenCount)
    } else {
      totalPrice = activity.basePrice
    }
    
    // Add extras
    if (selection.extras) {
      selection.extras.forEach(extra => {
        if (extra.priceType === 'per_person') {
          totalPrice += extra.price * (adults + childrenCount)
        } else {
          totalPrice += extra.price
        }
      })
    }
    
    // Add pickup option
    if (selection.pickupOption) {
      totalPrice += selection.pickupOption.price
    }
    
    return totalPrice
  }, [activity, adults, childrenCount])

  const validateSelection = useCallback((selection: Partial<ActivitySelection>): string[] => {
    const errors: string[] = []
    
    if (!activity) {
      errors.push('Activity not loaded')
      return errors
    }
    
    if (!selection.scheduleSlot) {
      errors.push('Please select a time slot')
    }
    
    if (selection.adults !== undefined && selection.adults < activity.minPax) {
      errors.push(`Minimum ${activity.minPax} participants required`)
    }
    
    if (selection.adults !== undefined && selection.adults > activity.maxPax) {
      errors.push(`Maximum ${activity.maxPax} participants allowed`)
    }
    
    if (selection.scheduleSlot && selection.adults !== undefined) {
      const totalPax = selection.adults + (selection.childrenCount || 0)
      if (totalPax > selection.scheduleSlot.maxPax) {
        errors.push(`This time slot can only accommodate ${selection.scheduleSlot.maxPax} participants`)
      }
      
      const availableSpots = selection.scheduleSlot.maxPax - selection.scheduleSlot.currentBookings
      if (totalPax > availableSpots) {
        errors.push(`Only ${availableSpots} spots available for this time slot`)
      }
    }
    
    if (selection.pickupOption && selection.pickupOption.type === 'hotel' && !selection.pickupOption.locations?.length) {
      errors.push('Please select a pickup location')
    }
    
    return errors
  }, [activity])

  const refetch = useCallback(() => {
    fetchActivityDetails()
  }, [fetchActivityDetails])

  useEffect(() => {
    fetchActivityDetails()
  }, [fetchActivityDetails])

  return {
    activity,
    loading,
    error,
    refetch,
    calculatePrice,
    validateSelection
  }
}

// TODO: GraphQL - Export GraphQL query functions for real integration
export const fetchActivityDetailsFromGraphQL = async (variables: {
  id: string
  checkIn: string
  checkOut: string
  adults: number
  childrenCount: number
}) => {
  // TODO: GraphQL - Implement real GraphQL call
  // return await graphQLClient.request(GET_ACTIVITY_DETAILS, variables)
  throw new Error('GraphQL integration not implemented yet')
}

// GraphQL Query Placeholder for documentation
export const GRAPHQL_QUERIES = {
  GET_ACTIVITY_DETAILS
} as const
