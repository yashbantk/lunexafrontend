import { useState, useEffect, useCallback } from 'react'
import { Activity, ActivitySelection, ScheduleSlot, Extra, PickupOption } from '@/types/activity'
import { mockActivities, GET_ACTIVITY_DETAILS } from '@/lib/mocks/activities'
import { apolloClient } from '@/lib/graphql/client'
import { ACTIVITY_QUERY, ActivityResponse } from '@/graphql/queries/activities'
import { transformGraphQLActivityToActivity } from '@/lib/transformers/activity'

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

  // GraphQL implementation for fetching activity details
  const fetchActivityDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Make GraphQL request with the activity ID as-is
      const result = await apolloClient.query({
        query: ACTIVITY_QUERY,
        variables: { activityId: activityId },
        fetchPolicy: 'no-cache'
      })

      // Transform GraphQL response to Activity format
      const transformedActivity = transformGraphQLActivityToActivity((result.data as any).activity)
      setActivity(transformedActivity)
      
    } catch (err) {
      console.error('GraphQL activity details fetch failed, falling back to mock data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch activity details')
      
      // Fallback to mock data if GraphQL fails
      // const foundActivity = mockActivities.find(a => a.id === activityId)
      // if (foundActivity) {
      //   setActivity(foundActivity)
      //   setError(null) // Clear error if mock data is found
      // } else {
      //   setError('Activity not found')
      // }
    } finally {
      setLoading(false)
    }
  }, [activityId, checkIn, checkOut, adults, childrenCount])

  const calculatePrice = useCallback((selection: Partial<ActivitySelection>): number => {
    if (!activity) return 0
    
    let totalPrice = 0
    
    // Base price from selected option
    const selectedOption = selection.selectedOption || (activity.activityOptions.length === 1 ? activity.activityOptions[0] : null)
    if (selectedOption) {
      totalPrice = (selectedOption.priceCents / 100) * (adults + childrenCount)
    } else {
      // Fallback to activity base price
      if (activity.pricingType === 'person') {
        totalPrice = activity.basePrice * (adults + childrenCount)
      } else {
        totalPrice = activity.basePrice
      }
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
    
    // Only require option selection if there are multiple options
    if (activity.activityOptions.length > 1 && !selection.selectedOption) {
      console.log('Validation: Multiple options but no selectedOption', {
        activityOptionsLength: activity.activityOptions.length,
        selectedOption: selection.selectedOption,
        activityOptions: activity.activityOptions
      })
      errors.push('Please select an activity option')
    }
    
    if (!selection.scheduleSlot) {
      errors.push('Please select a time slot')
    }
    
    // Get the selected option (either explicitly selected or the only available option)
    const selectedOption = selection.selectedOption || (activity.activityOptions.length === 1 ? activity.activityOptions[0] : null)
    
    // Validate participants based on selected option
    if (selectedOption && selection.adults !== undefined) {
      const totalPax = selection.adults + (selection.childrenCount || 0)
      
      // Minimum participants should be 1
      if (totalPax < 1) {
        errors.push('At least 1 participant is required')
      }
      
      // Maximum participants based on selected option
      if (totalPax > selectedOption.maxParticipants) {
        errors.push(`Maximum ${selectedOption.maxParticipants} participants allowed for this option`)
      }
    }
    
    // Validate against schedule slot availability
    if (selection.scheduleSlot && selection.adults !== undefined) {
      const totalPax = selection.adults + (selection.childrenCount || 0)
      
      // Check slot capacity
      if (totalPax > selection.scheduleSlot.maxPax) {
        errors.push(`This time slot can only accommodate ${selection.scheduleSlot.maxPax} participants`)
      }
      
      // Check available spots
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

// // GraphQL Query Placeholder for documentation
// export const GRAPHQL_QUERIES = {
//   GET_ACTIVITY_DETAILS
// } as const
