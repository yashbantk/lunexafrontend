'use client'

import { Star, MapPin, Clock, Users, Wifi, Car } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Hotel } from '@/types/hotel'

interface HotelHeaderProps {
  hotel: Hotel
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  childrenCount: number
}

export default function HotelHeader({ 
  hotel, 
  checkIn, 
  checkOut, 
  nights, 
  adults, 
  childrenCount 
}: HotelHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDistanceToCenter = () => {
    // Mock distance calculation - in real app, this would be calculated
    return '0.1 mi from city center'
  }

  const getCheckInOutTimes = () => {
    return {
      checkIn: hotel.policies?.checkIn || '15:00',
      checkOut: hotel.policies?.checkOut || '12:00'
    }
  }

  const { checkIn: checkInTime, checkOut: checkOutTime } = getCheckInOutTimes()

  return (
    <div className="space-y-4">
      {/* Hotel Name and Rating */}
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
          {hotel.name}
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Star Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < hotel.starRating 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">
              {hotel.starRating} star hotel
            </span>
          </div>
          
          {/* Overall Rating */}
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-white px-2 py-1 rounded-lg text-sm font-semibold">
              {hotel.rating}
            </div>
            <span className="text-sm text-gray-600">
              Very Good ({hotel.ratingsCount} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Address and Location */}
      <div className="flex items-start space-x-2">
        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-gray-700">{hotel.address}</p>
          <p className="text-sm text-gray-500">{getDistanceToCenter()}</p>
        </div>
      </div>

      {/* Badges */}
      {hotel.badges && hotel.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hotel.badges.map((badge, index) => (
            <Badge
              key={index}
              variant={badge === 'Preferred' ? 'default' : 'secondary'}
              className={`text-xs ${
                badge === 'Preferred' 
                  ? 'bg-primary text-white' 
                  : badge === 'Refundable'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {badge}
            </Badge>
          ))}
        </div>
      )}

      {/* Trip Details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Check-in/out</span>
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(checkIn)} - {formatDate(checkOut)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Guests</span>
          </div>
          <div className="text-sm text-gray-600">
            {adults} adult{adults !== 1 ? 's' : ''}
            {childrenCount > 0 && `, ${childrenCount} child${childrenCount !== 1 ? 'ren' : ''}`}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Duration</span>
          </div>
          <div className="text-sm text-gray-600">
            {nights} night{nights !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Check-in time</span>
          </div>
          <div className="text-sm text-gray-600">
            {checkInTime}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Check-out time</span>
          </div>
          <div className="text-sm text-gray-600">
            {checkOutTime}
          </div>
        </div>
      </div>

      {/* Quick Amenities */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Wifi className="h-4 w-4" />
          <span>Free WiFi</span>
        </div>
        <div className="flex items-center space-x-1">
          <Car className="h-4 w-4" />
          <span>Parking</span>
        </div>
        {hotel.amenities.includes('Outdoor Pool') && (
          <div className="flex items-center space-x-1">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <span>Pool</span>
          </div>
        )}
        {hotel.amenities.includes('Spa & Wellness Center') && (
          <div className="flex items-center space-x-1">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span>Spa</span>
          </div>
        )}
      </div>
    </div>
  )
}
