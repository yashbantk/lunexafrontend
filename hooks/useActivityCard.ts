import { useState, useEffect, useCallback } from 'react'
import { Activity } from '@/types/activity'
import { apolloClient } from '@/lib/graphql/client'
import { ACTIVITY_QUERY } from '@/graphql/queries/activities'
import { transformGraphQLActivityToActivity } from '@/lib/transformers/activity'
import { mockActivities } from '@/lib/mocks/activities'

interface UseActivityCardProps {
  activityId: string
}

interface UseActivityCardReturn {
  activity: Activity | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useActivityCard({ activityId }: UseActivityCardProps): UseActivityCardReturn {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Make GraphQL request
      const result = await apolloClient.query({
        query: ACTIVITY_QUERY,
        variables: { activityId },
        fetchPolicy: 'no-cache'
      })

      // Transform GraphQL response to Activity format
      const transformedActivity = transformGraphQLActivityToActivity((result.data as any).activity)
      setActivity(transformedActivity)
      
    } catch (err) {
      console.error('GraphQL activity fetch failed, falling back to mock data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch activity')
      
      // Fallback to mock data if GraphQL fails
      const foundActivity = mockActivities.find(a => a.id === activityId)
      if (foundActivity) {
        setActivity(foundActivity)
        setError(null) // Clear error if mock data is found
      } else {
        setError('Activity not found')
      }
    } finally {
      setLoading(false)
    }
  }, [activityId])

  const refetch = useCallback(() => {
    fetchActivity()
  }, [fetchActivity])

  useEffect(() => {
    if (activityId) {
      fetchActivity()
    }
  }, [fetchActivity, activityId])

  return {
    activity,
    loading,
    error,
    refetch
  }
}
