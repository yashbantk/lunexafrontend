'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  X, 
  Star, 
  MapPin, 
  ExternalLink, 
  Wifi, 
  Car, 
  Waves, 
  Dumbbell, 
  Coffee, 
  Shield,
  Users,
  Clock,
  Check
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { HotelQuickViewProps } from '@/types/hotel'

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Beach Access': Waves,
  'Fitness Center': Dumbbell,
  'Restaurant': Coffee,
  'Spa': Shield,
  'Air Conditioning': Shield
}

export default function HotelQuickView({
  hotel,
  isOpen,
  onClose,
  onSelectHotel,
  checkIn,
  checkOut,
  nights,
  adults,
  childrenCount
}: HotelQuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  if (!hotel) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'PREFERRED':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Refundable':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Non-refundable':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const renderAmenities = () => {
    return hotel.amenities.map((amenity, index) => {
      const IconComponent = amenityIcons[amenity] || Coffee
      return (
        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
          <IconComponent className="h-4 w-4" />
          <span>{amenity}</span>
        </div>
      )
    })
  }

  const handleSelectHotel = () => {
    // For quick view, we'll select the first available room
    const firstRoom = hotel.rooms[0]
    if (firstRoom) {
      onSelectHotel(hotel, firstRoom)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Hotel Preview</h2>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(checkIn)} - {formatDate(checkOut)} • {nights} nights
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                {!imageError && hotel.images.length > 0 ? (
                  <Image
                    src={hotel.images[currentImageIndex]}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-6xl">🏨</span>
                  </div>
                )}
              </div>
              
              {/* Image Navigation */}
              {hotel.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-2">
                    {hotel.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {hotel.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    className={`text-xs ${getBadgeColor(badge)}`}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Hotel Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex">
                      {renderStars(hotel.starRating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {hotel.rating} ({hotel.ratingsCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{hotel.address}</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {renderAmenities()}
                  </div>
                </div>

                {/* Available Rooms */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Available Rooms</h4>
                  <div className="space-y-3">
                    {hotel.rooms.slice(0, 3).map((room, index) => (
                      <Card key={room.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{room.name}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>Max {room.maxOccupancy}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>{room.bedType}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Coffee className="h-3 w-3" />
                                <span>{room.board}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              {formatPrice(room.pricePerNight)}
                            </div>
                            <div className="text-xs text-gray-500">per night</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {formatPrice(hotel.minPrice)}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                      <div className="text-lg font-semibold text-gray-900 mt-2">
                        {formatPrice(hotel.minPrice * nights)} total
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Price per night</span>
                        <span>{formatPrice(hotel.minPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Nights</span>
                        <span>{nights}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Guests</span>
                        <span>{adults} adults, {childrenCount} children</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(hotel.minPrice * nights)}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSelectHotel}
                      className="w-full mb-3"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Select This Hotel
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="w-full"
                    >
                      View All Rooms
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
