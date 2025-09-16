'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hotel } from '@/types/hotel'
import HotelCard from './HotelCard'

interface HotelListProps {
  hotels: Hotel[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onSelectHotel: (hotel: Hotel) => void
  onQuickView: (hotel: Hotel) => void
  onViewDetails: (hotel: Hotel) => void
  onCompareToggle: (hotelId: string) => void
  compareList: string[]
  viewMode: 'list' | 'grid'
  currentHotel?: Hotel
}

export default function HotelList({
  hotels,
  loading,
  error,
  hasMore,
  onLoadMore,
  onSelectHotel,
  onQuickView,
  onViewDetails,
  onCompareToggle,
  compareList,
  viewMode,
  currentHotel
}: HotelListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      await onLoadMore()
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, onLoadMore])

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || isLoadingMore || !hasMore) return
      
      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        handleLoadMore()
      }
    }

    const listElement = listRef.current
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll)
      return () => listElement.removeEventListener('scroll', handleScroll)
    }
  }, [isLoadingMore, hasMore, handleLoadMore])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading hotels</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!loading && hotels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🏨</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search criteria or filters
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Results Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {hotels.length} hotels found
          </h3>
          {compareList.length > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              {compareList.length} selected for comparison
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {currentHotel && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Current: {currentHotel.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Results List */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-hide"
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            }`}
            layout
          >
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <HotelCard
                  hotel={hotel}
                  onSelect={() => onSelectHotel(hotel)}
                  onQuickView={() => onQuickView(hotel)}
                  onViewDetails={() => onViewDetails(hotel)}
                  onCompareToggle={() => onCompareToggle(hotel.id)}
                  isComparing={compareList.includes(hotel.id)}
                  isCurrent={currentHotel?.id === hotel.id}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more hotels...</span>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !isLoadingMore && (
          <div className="flex justify-center py-8">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="px-8"
            >
              Load More Hotels
            </Button>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && hotels.length > 0 && (
          <div className="flex justify-center py-8">
            <p className="text-gray-500 text-sm">
              You&apos;ve reached the end of the results
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && hotels.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-600">Searching for hotels...</p>
          </div>
        </div>
      )}
    </div>
  )
}
