'use client'

import { useActivityCard } from '@/hooks/useActivityCard'
import ActivityCard from './ActivityCard'
import { Activity } from '@/types/activity'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ActivityCardWithGraphQLProps {
  activityId: string
  onSelect: (activity: Activity) => void
  onViewDetails: (activity: Activity) => void
  isSelected?: boolean
  viewMode: 'list' | 'grid'
  className?: string
}

export default function ActivityCardWithGraphQL({
  activityId,
  onSelect,
  onViewDetails,
  isSelected = false,
  viewMode,
  className = ''
}: ActivityCardWithGraphQLProps) {
  const { activity, loading, error, refetch } = useActivityCard({ activityId })

  // Loading state
  if (loading) {
    return (
      <Card className={`${className} ${viewMode === 'grid' ? 'h-full' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand" />
              <p className="text-sm text-gray-600">Loading activity...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={`${className} ${viewMode === 'grid' ? 'h-full' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={refetch}
                className="text-xs text-brand hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No activity found
  if (!activity) {
    return (
      <Card className={`${className} ${viewMode === 'grid' ? 'h-full' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Activity not found</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render the activity card with real data
  return (
    <ActivityCard
      activity={activity}
      onSelect={onSelect}
      onViewDetails={onViewDetails}
      isSelected={isSelected}
      viewMode={viewMode}
      className={className}
    />
  )
}
