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
import { PriceDisplay } from '@/components/PriceDisplay'

// Constants for default values
const DEFAULT_DURATION: [number, number] = [1, 1440]; // 1 minute to 24 hours
const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000000];
const DEFAULT_RATING = 0;

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
    duration: DEFAULT_DURATION,
    priceRange: DEFAULT_PRICE_RANGE,
    difficulty: [],
    rating: DEFAULT_RATING,
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
      duration: DEFAULT_DURATION,
      priceRange: DEFAULT_PRICE_RANGE,
      difficulty: [],
      rating: DEFAULT_RATING,
      location: '',
      sort: 'recommended'
    }
    setFilters(defaultFilters)
    resetFilters()
  }

  const handleRemoveFilter = (key: keyof ActivityFilters, value?: any) => {
    const newFilters = { ...filters }
    
    if (key === 'category' || key === 'timeOfDay' || key === 'difficulty') {
      newFilters[key] = (newFilters[key] as string[]).filter(item => item !== value)
    } else if (key === 'duration') {
      newFilters.duration = DEFAULT_DURATION
    } else if (key === 'priceRange') {
      newFilters.priceRange = DEFAULT_PRICE_RANGE
    } else if (key === 'rating') {
      newFilters.rating = DEFAULT_RATING
    } else if (key === 'query') {
      newFilters.query = ''
    } else if (key === 'location') {
      newFilters.location = ''
      newFilters.cityId = ''
    }

    setFilters(newFilters)
    updateFilters(newFilters)
  }


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatTimeOfDay = (value: string) => {
    switch(value) {
        case 'morning': return 'Morning'
        case 'afternoon': return 'Afternoon'
        case 'evening': return 'Evening'
        case 'full-day': return 'Full Day'
        default: return value
    }
  }

  const activeFiltersList = [
    ...(filters.query ? [{ key: 'query', label: `Search: "${filters.query}"` }] : []),
    ...(filters.location ? [{ key: 'location', label: filters.location }] : []),
    ...filters.category.map(cat => ({ key: 'category', label: cat, value: cat })),
    ...filters.timeOfDay.map(t => ({ key: 'timeOfDay', label: formatTimeOfDay(t), value: t })),
    ...filters.difficulty.map(d => ({ key: 'difficulty', label: d, value: d })),
    ...(filters.rating > 0 ? [{ key: 'rating', label: `${filters.rating}+ Stars` }] : []),
    { key: 'duration', label: `${formatDuration(filters.duration[0])} - ${formatDuration(filters.duration[1])}` },
    { key: 'priceRange', label: <span className="flex items-center gap-1"><PriceDisplay priceCents={filters.priceRange[0] * 100} sourceCurrency="IDR" /> - <PriceDisplay priceCents={filters.priceRange[1] * 100} sourceCurrency="IDR" /></span> },
  ]

  const activeFiltersCount = activeFiltersList.length

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

          {/* Active Filters Bar */}
          {activeFiltersList.length > 0 && (
            <div className="bg-gray-50 border-b px-6 py-3 flex items-center flex-wrap gap-2 transition-all duration-200 ease-in-out">
              <span className="text-sm font-medium text-gray-500 mr-2">Selected Filters:</span>
              {activeFiltersList.map((filter, index) => (
                <Badge
                  key={`${filter.key}-${index}`}
                  variant="secondary"
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1 text-sm font-normal flex items-center gap-2"
                >
                  {filter.label}
                  <button
                    onClick={() => handleRemoveFilter(filter.key as keyof ActivityFilters, (filter as any).value)}
                    className="hover:bg-gray-100 rounded-full p-0.5 transition-colors focus:outline-none"
                    aria-label={`Remove filter ${typeof filter.label === 'string' ? filter.label : 'filter'}`}
                  >
                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-brand hover:text-brand/80 ml-auto h-7 px-2"
              >
                Clear All
              </Button>
            </div>
          )}

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
