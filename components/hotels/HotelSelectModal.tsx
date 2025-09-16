'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, List, Grid } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HotelSelectModalProps } from '@/types/hotel'
import { useHotelSearch } from '@/hooks/useHotelSearch'
import FiltersPanel from './FiltersPanel'
import HotelList from './HotelList'
import HotelMapPanel from './HotelMapPanel'
import RoomSelector from './RoomSelector'
import HotelQuickView from './HotelQuickView'
import HotelDetailsModal from './HotelDetailsModal'

export default function HotelSelectModal({
  isOpen,
  onClose,
  onSelectHotel,
  currentHotel,
  stayId,
  checkIn,
  checkOut,
  nights,
  adults,
  childrenCount
}: HotelSelectModalProps) {
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [showRoomSelector, setShowRoomSelector] = useState(false)
  const [quickViewHotel, setQuickViewHotel] = useState<any>(null)
  const [showHotelDetails, setShowHotelDetails] = useState(false)
  const [detailsHotel, setDetailsHotel] = useState<any>(null)
  const [compareList, setCompareList] = useState<string[]>([])

  const {
    results,
    loading,
    error,
    total,
    hasMore,
    filters,
    setFilters,
    fetchNextPage,
    resetFilters
  } = useHotelSearch({
    location: 'Kuta, Bali' // Default location
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedHotel(null)
      setShowRoomSelector(false)
      setQuickViewHotel(null)
      setCompareList([])
    }
  }, [isOpen])

  const handleSelectHotel = (hotel: any) => {
    setSelectedHotel(hotel)
    setShowRoomSelector(true)
  }

  const handleRoomSelect = (room: any) => {
    onSelectHotel(selectedHotel, room)
    onClose()
  }

  const handleQuickView = (hotel: any) => {
    setQuickViewHotel(hotel)
  }

  const handleViewDetails = (hotel: any) => {
    setDetailsHotel(hotel)
    setShowHotelDetails(true)
  }

  const handleCompareToggle = (hotelId: string) => {
    setCompareList(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full h-[95vh] max-w-[95vw] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Select Hotel - {nights} Nights {filters.location || 'Kuta, Bali'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(checkIn)} - {formatDate(checkOut)} • {adults} adults, {childrenCount} children
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>View on Map</span>
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
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

                {/* Results Count */}
                <Badge variant="outline" className="text-sm">
                  {total} hotels found
                </Badge>

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
              {/* Left Panel - Filters */}
              <div className="w-80 border-r bg-gray-50 overflow-y-auto flex-shrink-0 scrollbar-hide">
                <FiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={resetFilters}
                />
              </div>

              {/* Center Panel - Results */}
              <div className="flex-1 flex flex-col min-h-0">
                <HotelList
                  hotels={results}
                  loading={loading}
                  error={error}
                  hasMore={hasMore}
                  onLoadMore={fetchNextPage}
                  onSelectHotel={handleSelectHotel}
                  onQuickView={handleQuickView}
                  onViewDetails={handleViewDetails}
                  onCompareToggle={handleCompareToggle}
                  compareList={compareList}
                  viewMode={viewMode}
                  currentHotel={currentHotel}
                />
              </div>

              {/* Right Panel - Map (optional) */}
              {showMap && (
                <div className="w-96 border-l flex-shrink-0 overflow-hidden">
                  <HotelMapPanel
                    hotels={results}
                    onHotelSelect={handleSelectHotel}
                    selectedHotel={selectedHotel}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room Selector Modal */}
      <RoomSelector
        hotel={selectedHotel}
        onSelectRoom={handleRoomSelect}
        onClose={() => setShowRoomSelector(false)}
        isOpen={showRoomSelector}
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nights}
        adults={adults}
        childrenCount={childrenCount}
      />

      {/* Quick View Modal */}
      <HotelQuickView
        hotel={quickViewHotel}
        isOpen={!!quickViewHotel}
        onClose={() => setQuickViewHotel(null)}
        onSelectHotel={handleSelectHotel}
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nights}
        adults={adults}
        childrenCount={childrenCount}
      />

      {/* Hotel Details Modal */}
      {detailsHotel && (
        <HotelDetailsModal
          isOpen={showHotelDetails}
          onClose={() => {
            setShowHotelDetails(false)
            setDetailsHotel(null)
          }}
          hotelId={detailsHotel.id}
          onSelectRoom={(hotel, room) => {
            onSelectHotel(hotel, room)
            setShowHotelDetails(false)
            setDetailsHotel(null)
          }}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          adults={adults}
          childrenCount={childrenCount}
        />
      )}
    </>
  )
}
