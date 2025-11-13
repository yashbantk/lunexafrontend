'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Star, 
  MapPin, 
  Eye, 
  ExternalLink,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Coffee,
  Shield
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hotel } from '@/types/hotel'

interface HotelCardProps {
  hotel: Hotel
  onSelect: () => void
  onQuickView: () => void
  onViewDetails: () => void
  onCompareToggle: () => void
  isComparing: boolean
  isCurrent?: boolean
  viewMode: 'list' | 'grid'
}

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Beach Access': Waves,
  'Fitness Center': Dumbbell,
  'Restaurant': Coffee,
  'Spa': Shield
}

export default function HotelCard({
  hotel,
  onSelect,
  onQuickView,
  onViewDetails,
  onCompareToggle,
  isComparing,
  isCurrent,
  viewMode
}: HotelCardProps) {
  const [imageError, setImageError] = useState(false)

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
    const topAmenities = hotel.amenities.slice(0, 4)
    return topAmenities.map((amenity, index) => {
      const IconComponent = amenityIcons[amenity] || Coffee
      return (
        <div key={index} className="flex items-center space-x-1 text-xs text-gray-600">
          <IconComponent className="h-3 w-3" />
          <span>{amenity}</span>
        </div>
      )
    })
  }

  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card className={`h-full hover:shadow-xl transition-shadow duration-200 ${
          isCurrent ? 'ring-2 ring-green-500' : ''
        }`}>
          <CardContent className="p-0">
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              {!imageError ? (
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🏨</span>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col space-y-1">
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

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Name & Rating */}
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                  {hotel.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(hotel.starRating)}
                  </div>
                  <span className="text-xs text-gray-600">
                    {hotel.rating} ({hotel.ratingsCount} reviews)
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{hotel.location}</span>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2">
                {renderAmenities()}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onQuickView}
                    className="text-xs px-3 py-1 h-7"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewDetails}
                    className="text-xs px-3 py-1 h-7 text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button
                    onClick={onSelect}
                    size="sm"
                    className="text-xs px-3 py-1 h-7"
                  >
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // List view
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`hover:shadow-lg transition-shadow duration-200 ${
        isCurrent ? 'ring-2 ring-green-500' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {/* Image */}
            <div className="relative w-32 h-24 overflow-hidden rounded-lg flex-shrink-0">
              {!imageError ? (
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">🏨</span>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col space-y-1">
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

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex">
                      {renderStars(hotel.starRating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {hotel.rating} ({hotel.ratingsCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{hotel.location}</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-3 mb-3">
                {renderAmenities()}
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 min-w-[120px]">
              <Button
                variant="outline"
                onClick={onQuickView}
                className="text-sm px-4 py-2 h-9"
              >
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Button>
              <Button
                variant="outline"
                onClick={onViewDetails}
                className="text-sm px-4 py-2 h-9 text-primary border-primary hover:bg-primary hover:text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                onClick={onSelect}
                className="text-sm px-4 py-2 h-9"
              >
                Select Room
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
