'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Activity, ActivityListProps } from '@/types/activity'
import ActivityCard from './ActivityCard'

export default function ActivityList({
  activities,
  loading,
  error,
  hasMore,
  onLoadMore,
  onSelectActivity,
  onViewDetails,
  selectedActivityId,
  viewMode,
  className = ''
}: ActivityListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      onLoadMore()
    }
  }, [loading, hasMore, onLoadMore])

  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom && hasMore && !loading) {
        handleLoadMore()
      }
    }

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [handleLoadMore, hasMore, loading])

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Activities</h3>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <Button onClick={handleLoadMore} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (!loading && activities.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Search className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
        <p className="text-gray-600 text-center mb-4">
          Try adjusting your filters or search terms to find more activities.
        </p>
        <Button onClick={handleLoadMore} variant="outline">
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Activities
          </h2>
          {activities.length > 0 && (
            <span className="text-sm text-gray-500">
              ({activities.length} results)
            </span>
          )}
        </div>
      </div>

      {/* Results List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ActivityCard
                  activity={activity}
                  onSelect={onSelectActivity}
                  onViewDetails={onViewDetails}
                  isSelected={selectedActivityId === activity.id}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              <span className="text-sm text-gray-600">Loading activities...</span>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && activities.length > 0 && (
          <div className="flex justify-center py-6">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="px-8"
            >
              Load More Activities
            </Button>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && activities.length > 0 && (
          <div className="flex justify-center py-6">
            <p className="text-sm text-gray-500">
              You&apos;ve reached the end of the results
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
