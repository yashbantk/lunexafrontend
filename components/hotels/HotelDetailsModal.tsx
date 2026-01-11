'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Star, Heart, Share2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHotelDetails } from '@/hooks/useHotelDetails'
import { Hotel, Room } from '@/types/hotel'
import { HotelDetailsModalProps } from '@/types/hotel'
import GalleryCarousel from './GalleryCarousel'
import HotelHeader from './HotelHeader'
import RoomList from './RoomList'
import FacilitiesPanel from './FacilitiesPanel'
import PoliciesPanel from './PoliciesPanel'
import ReviewsPanel from './ReviewsPanel'
import HotelMapPlaceholder from './HotelMapPlaceholder'
import { convertCentsToINR } from '@/lib/utils/currencyConverter'
import { formatPrice } from '@/lib/utils/formatUtils'

export default function HotelDetailsModal({
  isOpen,
  onClose,
  hotelId,
  onSelectRoom,
  checkIn,
  checkOut,
  nights,
  adults,
  childrenCount,
  mode = 'modal'
}: HotelDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'facilities' | 'policies' | 'reviews'>('rooms')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [showPriceConfirmation, setShowPriceConfirmation] = useState(false)
  const [priceDelta, setPriceDelta] = useState(0)
  const [convertedRoomPrice, setConvertedRoomPrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)

  const { hotel, loading, error } = useHotelDetails({
    hotelId,
    checkIn,
    checkOut,
    adults,
    children: childrenCount
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('rooms')
      setSelectedRoom(null)
      setShowMap(false)
      setShowPriceConfirmation(false)
    }
  }, [isOpen])

  const handleSelectRoom = (room: Room) => {
    if (!hotel) return

    // Calculate price delta (mock calculation)
    const currentPrice = 0 // In real app, get current proposal price
    const newPrice = room.totalPrice
    const delta = newPrice - currentPrice
    const deltaPercentage = currentPrice > 0 ? (delta / currentPrice) * 100 : 0

    setSelectedRoom(room)
    setPriceDelta(deltaPercentage)

    // Show confirmation if price change is significant
    if (deltaPercentage > 5) {
      setShowPriceConfirmation(true)
    } else {
      confirmRoomSelection(room)
    }
  }

  const confirmRoomSelection = (room: Room) => {
    if (!hotel) return
    onSelectRoom(hotel, room)
    onClose()
  }

  const handleConfirmPriceChange = () => {
    if (selectedRoom) {
      confirmRoomSelection(selectedRoom)
    }
    setShowPriceConfirmation(false)
  }

  const handleCancelPriceChange = () => {
    setSelectedRoom(null)
    setShowPriceConfirmation(false)
  }

  // Convert selected room price to INR
  useEffect(() => {
    const convertPrice = async () => {
      if (!selectedRoom) {
        setConvertedRoomPrice(null)
        return
      }

      setPriceLoading(true)
      try {
        const currency = selectedRoom.currency || hotel?.rooms[0]?.currency || 'INR'
        const priceCents = Math.round(selectedRoom.totalPrice * 100)
        const converted = await convertCentsToINR(priceCents, currency)
        setConvertedRoomPrice(converted / 100)
      } catch (error) {
        console.error('Currency conversion error:', error)
        setConvertedRoomPrice(selectedRoom.totalPrice)
      } finally {
        setPriceLoading(false)
      }
    }

    convertPrice()
  }, [selectedRoom, hotel])

  if (!isOpen) return null

  return (
    <>
      {/* Main Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full h-[95vh] max-w-7xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-white">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-gray-900">Hotel Details</h1>
                  {hotel && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < hotel.starRating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {hotel.rating} ({hotel.ratingsCount} reviews)
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMap(true)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    View on Map
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading hotel details...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Hotel</h3>
                      <p className="text-gray-500 mb-4">{error}</p>
                      <Button onClick={onClose}>Close</Button>
                    </div>
                  </div>
                ) : hotel ? (
                  <div className="h-full overflow-y-auto scrollbar-hide">
                    <div className="p-6 space-y-8">
                      {/* Gallery */}
                      <GalleryCarousel
                        images={hotel.images}
                        hotelName={hotel.name}
                        className="w-full"
                      />

                      {/* Hotel Header */}
                      <HotelHeader
                        hotel={hotel}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        nights={nights}
                        adults={adults}
                        childrenCount={childrenCount}
                      />

                      {/* Tabs */}
                      <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                          {[
                            { id: 'rooms', label: 'Available Rooms', count: hotel.rooms.length },
                            { id: 'facilities', label: 'Facilities', count: hotel.amenities.length },
                            { id: 'policies', label: 'Policies' },
                            { id: 'reviews', label: 'Reviews', count: hotel.reviews?.length || 0 }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {tab.label}
                              {tab.count !== undefined && (
                                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                  {tab.count}
                                </span>
                              )}
                            </button>
                          ))}
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="min-h-[400px]">
                        {activeTab === 'rooms' && (
                          <RoomList
                            rooms={hotel.rooms}
                            onSelectRoom={handleSelectRoom}
                            selectedRoomId={selectedRoom?.id}
                          />
                        )}
                        
                        {activeTab === 'facilities' && (
                          <FacilitiesPanel amenities={hotel.amenities} />
                        )}
                        
                        {activeTab === 'policies' && hotel.policies && (
                          <PoliciesPanel policies={hotel.policies} />
                        )}
                        
                        {activeTab === 'reviews' && hotel.reviews && (
                          <ReviewsPanel
                            reviews={hotel.reviews}
                            overallRating={hotel.rating}
                            ratingCount={hotel.ratingsCount}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              {selectedRoom && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedRoom.name}</h3>
                      <p className="text-sm text-gray-600">
                        {priceLoading ? 'Loading...' : convertedRoomPrice !== null ? formatPrice(convertedRoomPrice * 100, 'INR') : formatPrice(selectedRoom.totalPrice * 100, 'INR')} for {nights} night{nights !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRoom(null)}
                      >
                        Change Room
                      </Button>
                      <Button
                        onClick={() => confirmRoomSelection(selectedRoom)}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        Select This Room
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      {hotel && (
        <HotelMapPlaceholder
          hotel={hotel}
          isOpen={showMap}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* Price Confirmation Modal */}
      <AnimatePresence>
        {showPriceConfirmation && selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
            onClick={handleCancelPriceChange}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Price Change Confirmation
                </h3>
                <p className="text-gray-600 mb-4">
                  Selecting this room will change the total price by{' '}
                  <span className={`font-semibold ${
                    priceDelta > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {priceDelta > 0 ? '+' : ''}{priceDelta.toFixed(1)}%
                  </span>
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Total:</span>
                    <span className="font-semibold text-gray-900">
                      {priceLoading ? 'Loading...' : convertedRoomPrice !== null ? formatPrice(convertedRoomPrice * 100, 'INR') : formatPrice(selectedRoom.totalPrice * 100, 'INR')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelPriceChange}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmPriceChange}
                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                  >
                    Confirm Selection
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
