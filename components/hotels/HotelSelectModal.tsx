'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, List, Grid, SortAsc, SortDesc } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { HotelSelectModalProps } from '@/types/hotel'
import { useHotelsGraphQL } from '@/hooks/useHotelsGraphQL'
import { HotelFilters, HotelOrder } from '@/graphql/queries/hotels'
import GraphQLFiltersPanel from './GraphQLFiltersPanel'
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
  childrenCount,
  cityId,
  cityName
}: HotelSelectModalProps) {
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [showRoomSelector, setShowRoomSelector] = useState(false)
  const [quickViewHotel, setQuickViewHotel] = useState<any>(null)
  const [showHotelDetails, setShowHotelDetails] = useState(false)
  const [detailsHotel, setDetailsHotel] = useState<any>(null)
  const [compareList, setCompareList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'star' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  const [isSearching, setIsSearching] = useState(false)

  // Extract city ID from props, current hotel, or use a default
  const resolvedCityId = cityId || '2' // Default to Miami city ID
  const resolvedCityName = cityName || 'Miami'
  const currentHotelName = currentHotel?.name

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('HotelSelectModal opened with:', {
        currentHotel,
        cityId,
        currentHotelName,
        isChangeRoom: !!currentHotelName
      })
    }
  }, [isOpen, currentHotel, cityId, currentHotelName])

  const {
    hotels,
    loading,
    error,
    total,
    filters,
    order,
    setFilters,
    setOrder,
    refetch,
    resetFilters
  } = useHotelsGraphQL({
    cityId: resolvedCityId,
    currentHotelName
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedHotel(null)
      setShowRoomSelector(false)
      setQuickViewHotel(null)
      setCompareList([])
      setSearchQuery('')
      setSortBy('name')
      setSortOrder('ASC')
      setIsSearching(false)
    }
  }, [isOpen])

  // Debounced search function - memoized to prevent re-creation
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setIsSearching(false)
      console.log('Debounced search triggered with query:', query, 'length:', query.length)
      // Only search if query is empty or has at least 2 characters
      if (query.length === 0 || query.length >= 2) {
        console.log('Applying search filter for query:', query)
        setFilters({
          searchHotels: query || undefined
        })
      } else {
        console.log('Query too short, not searching')
      }
    }, 500), // 500ms debounce delay
    [setFilters]
  )

  // Handle search input change - memoized to prevent re-creation
  const handleSearchChange = useCallback((value: string) => {
    console.log('Search input changed to:', value, 'length:', value.length)
    setSearchQuery(value)
    if (value.length > 0 && value.length < 2) {
      setIsSearching(false) // Don't show searching for short queries
      console.log('Query too short, not showing searching state')
    } else {
      setIsSearching(true) // Show searching state
      console.log('Query valid, showing searching state')
    }
  }, [])

  // Update search query with debouncing
  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  // Update sort order
  useEffect(() => {
    setOrder({
      [sortBy]: sortOrder
    })
  }, [sortBy, sortOrder, setOrder])

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
            <div className="p-6 border-b bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentHotelName ? 'Change Hotel' : 'Select Hotel'} - {nights} Nights {resolvedCityName}
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

              {/* Search and Sort Controls */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  {/* Search Input */}
                  <SearchInput
                    value={searchQuery}
                    onChange={handleSearchChange}
                    isSearching={isSearching}
                    loading={loading}
                    disabled={loading}
                  />

                  {/* Sort Controls */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Select 
                      value={sortBy} 
                      onValueChange={(value: 'name' | 'star' | 'price') => setSortBy(value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="star">Star Rating</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                      className="h-8 w-8 p-0"
                      disabled={loading}
                    >
                      {sortOrder === 'ASC' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Search Help Text */}
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <span>Please type at least 2 characters to search</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 min-h-0">
              {/* Left Panel - Filters */}
              <div className="w-80 border-r bg-gray-50 overflow-y-auto flex-shrink-0 scrollbar-hide">
                <GraphQLFiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={resetFilters}
                />
              </div>

              {/* Center Panel - Results */}
              <div className="flex-1 flex flex-col min-h-0">
                {error && (
                  <div className="p-6 bg-red-50 border-b border-red-200">
                    <div className="flex items-center space-x-2 text-red-800">
                      <X className="h-5 w-5" />
                      <span className="font-medium">Error loading hotels</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetch}
                      className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
                
                {loading && hotels.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading hotels...</p>
                    </div>
                  </div>
                )}

                {!loading && !error && hotels.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your search criteria or filters to find more options.
                      </p>
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="text-gray-600"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                {hotels.length > 0 && (
                  <HotelList
                    hotels={hotels}
                    loading={loading}
                    error={null}
                    hasMore={false}
                    onLoadMore={() => {}}
                    onSelectHotel={handleSelectHotel}
                    onQuickView={handleQuickView}
                    onViewDetails={handleViewDetails}
                    onCompareToggle={handleCompareToggle}
                    compareList={compareList}
                    viewMode={viewMode}
                    currentHotel={currentHotel}
                  />
                )}
              </div>

              {/* Right Panel - Map (optional) */}
              {showMap && (
                <div className="w-96 border-l flex-shrink-0 overflow-hidden">
                  <HotelMapPanel
                    hotels={hotels}
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
        onViewDetails={handleViewDetails}
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

// Search Input Component - isolated to prevent re-renders
const SearchInput = React.memo(({ 
  value, 
  onChange, 
  isSearching, 
  loading, 
  disabled 
}: {
  value: string
  onChange: (value: string) => void
  isSearching: boolean
  loading: boolean
  disabled: boolean
}) => {
  return (
    <div className="flex-1 max-w-md relative">
      <Input
        placeholder="Search hotels by name... (min 2 characters)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        disabled={disabled}
      />
      {isSearching && !loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      {value.length > 0 && value.length < 2 && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="text-gray-400 text-xs">Type more...</div>
        </div>
      )}
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
