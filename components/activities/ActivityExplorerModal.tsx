'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Grid, List, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ActivityExplorerModalProps, ActivityFilters, ActivitySelection, Activity } from '@/types/activity'
import { useActivitySearch } from '@/hooks/useActivitySearch'
import FiltersPanel from './FiltersPanel'
import ActivityList from './ActivityList'
import ActivityDetailsModal from './ActivityDetailsModal'

export default function ActivityExplorerModal({
  isOpen,
  onClose,
  onSelectActivity,
  dayId,
  currentActivity,
  mode = 'add'
}: ActivityExplorerModalProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(
    currentActivity?.id
  )
  const [showFilters, setShowFilters] = useState(false)
  const [showActivityDetails, setShowActivityDetails] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const [filters, setFilters] = useState<ActivityFilters>({
    query: '',
    category: [],
    timeOfDay: [],
    duration: [60, 600],
    priceRange: [0, 1000000],
    difficulty: [],
    rating: 0,
    location: '',
    sort: 'recommended'
  })

  const {
    results,
    loading,
    error,
    hasMore,
    total,
    filters: availableFilters,
    fetchNextPage,
    setFilters: updateFilters,
    resetFilters
  } = useActivitySearch({ params: filters })

  const handleSelectActivity = (activity: any) => {
    setSelectedActivityId(activity.id)
    // For quick selection, we'll use the first available time slot
    const firstAvailableSlot = activity.availability.find((slot: any) => slot.available) || activity.availability[0]
    
    const selection = {
      activity,
      scheduleSlot: firstAvailableSlot,
      adults: 2, // Default values - in real app, get from context
      childrenCount: 0,
      extras: [],
      pickupOption: activity.pickupOptions[0], // Default to first option
      totalPrice: activity.basePrice * 2 // Default calculation
    }
    
    onSelectActivity(activity, selection)
  }

  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowActivityDetails(true)
  }

  const handleFiltersChange = (newFilters: ActivityFilters) => {
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const handleResetFilters = () => {
    const defaultFilters: ActivityFilters = {
      query: '',
      category: [],
      timeOfDay: [],
      duration: [60, 600],
      priceRange: [0, 1000000],
      difficulty: [],
      rating: 0,
      location: '',
      sort: 'recommended'
    }
    setFilters(defaultFilters)
    resetFilters()
  }

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length
    }
    if (typeof value === 'string' && value !== '') {
      return count + 1
    }
    if (typeof value === 'number' && value > 0) {
      return count + 1
    }
    return count
  }, 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full h-[95vh] max-w-[95vw] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'add' ? 'Add Activity' : 'Change Activity'}
                </h2>
                <p className="text-sm text-gray-600">
                  {total > 0 ? `${total} activities found` : 'Search for activities to add to your itinerary'}
                </p>
              </div>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-brand/10 text-brand">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full bg-brand text-white text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 min-h-0">
            {/* Desktop: Left Panel - Filters */}
            <div className="hidden md:block w-80 border-r bg-gray-50 overflow-y-auto flex-shrink-0 scrollbar-hide">
              <div className="p-4">
                <FiltersPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                  availableFilters={availableFilters}
                />
              </div>
            </div>

            {/* Mobile: Filters Overlay */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  className="md:hidden absolute inset-0 z-10 bg-white"
                >
                  <div className="p-4 h-full overflow-y-auto scrollbar-hide">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <FiltersPanel
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onReset={handleResetFilters}
                      availableFilters={availableFilters}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Panel - Results */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 flex-1 flex flex-col min-h-0">
                <ActivityList
                  activities={results}
                  loading={loading}
                  error={error}
                  hasMore={hasMore}
                  onLoadMore={fetchNextPage}
                  onSelectActivity={handleSelectActivity}
                  onViewDetails={handleViewDetails}
                  selectedActivityId={selectedActivityId}
                  viewMode={viewMode}
                  className="flex-1 min-h-0"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          isOpen={showActivityDetails}
          onClose={() => {
            setShowActivityDetails(false)
            setSelectedActivity(null)
          }}
          activityId={selectedActivity.id}
          onAddToPackage={(activity, selection) => {
            onSelectActivity(activity, selection)
            setShowActivityDetails(false)
            setSelectedActivity(null)
          }}
          dayId={dayId}
          checkIn={new Date().toISOString().split('T')[0]}
          checkOut={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          adults={2}
          childrenCount={0}
        />
      )}
    </AnimatePresence>
  )
}
