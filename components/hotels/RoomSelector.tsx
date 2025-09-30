'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  X, 
  Check, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RoomSelectorProps } from '@/types/hotel'
import { useHotelDetails } from '@/hooks/useHotelDetails'

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Coffee,
  'Spa': Shield,
  'Air Conditioning': Shield
}

export default function RoomSelector({
  hotel,
  onSelectRoom,
  onClose,
  isOpen,
  checkIn,
  checkOut,
  nights,
  adults,
  childrenCount
}: RoomSelectorProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')

  // Use the GraphQL hotel details hook to get room data
  const { hotel: hotelDetails, loading, error } = useHotelDetails({
    hotelId: hotel?.id || '',
    checkIn,
    checkOut,
    adults,
    children: childrenCount
  })

  // Get rooms from the hotel details
  const rooms = hotelDetails?.rooms || []

  // Pre-select the first room when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id)
    }
  }, [rooms, selectedRoomId])

  // Reset selected room when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedRoomId('')
    }
  }, [isOpen])

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCancellationColor = (refundable: boolean) => {
    return refundable 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200'
  }

  const renderAmenities = (amenities: string[]) => {
    return amenities.slice(0, 4).map((amenity, index) => {
      const IconComponent = amenityIcons[amenity] || Coffee
      return (
        <div key={index} className="flex items-center space-x-1 text-xs text-gray-600">
          <IconComponent className="h-3 w-3" />
          <span>{amenity}</span>
        </div>
      )
    })
  }

  const handleSelectRoom = () => {
    const selectedRoom = rooms.find(room => room.id === selectedRoomId)
    if (selectedRoom) {
      onSelectRoom(selectedRoom)
      onClose() // Close the popup after selecting a room
    }
  }

  const selectedRoom = rooms.find(room => room.id === selectedRoomId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            <div>
              <h2 className="text-xl font-bold">Select Room - {hotel?.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(checkIn)} - {formatDate(checkOut)} • {nights} nights • {adults} adults, {childrenCount} children
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-600">Loading room options...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading rooms</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🛏️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms available</h3>
              <p className="text-gray-600">No rooms are available for the selected dates</p>
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup value={selectedRoomId} onValueChange={setSelectedRoomId}>
                {rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={`cursor-pointer transition-all duration-200 ${
                      selectedRoomId === room.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:shadow-md'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <RadioGroupItem
                            value={room.id}
                            id={room.id}
                            className="mt-1"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                  {room.name}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-4 w-4" />
                                    <span>Max {room.maxOccupancy} guests</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span>{room.bedType}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Coffee className="h-4 w-4" />
                                    <span>{room.board}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {formatPrice(room.totalPrice, room.currency)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatPrice(room.pricePerNight, room.currency)} per night
                                </div>
                              </div>
                            </div>

                            {/* Room Image */}
                            {room.images && room.images.length > 0 && (
                              <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden mb-3">
                                <Image
                                  src={room.images[0]}
                                  alt={room.name}
                                  width={96}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {renderAmenities(room.amenities)}
                            </div>

                            {/* Cancellation Policy */}
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${getCancellationColor(room.refundable)}`}>
                                {room.refundable ? 'Refundable' : 'Non-refundable'}
                              </Badge>
                              <span className="text-xs text-gray-600">
                                {room.cancellationPolicy}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {rooms.length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t bg-white">
            <div className="text-sm text-gray-600">
              {selectedRoom && (
                <div>
                  <span className="font-medium">Selected: </span>
                  <span>{selectedRoom.name}</span>
                  <span className="ml-2 font-bold text-primary">
                    {formatPrice(selectedRoom.totalPrice, selectedRoom.currency)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSelectRoom}
                disabled={!selectedRoomId}
                className="px-8"
              >
                <Check className="h-4 w-4 mr-2" />
                Select Room
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
