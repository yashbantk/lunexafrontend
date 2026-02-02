'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hotel } from '@/types/hotel'
import { PriceDisplay } from '@/components/PriceDisplay'

interface HotelMapPanelProps {
  hotels: Hotel[]
  onHotelSelect: (hotel: Hotel) => void
  selectedHotel?: Hotel | null
}

export default function HotelMapPanel({
  hotels,
  onHotelSelect,
  selectedHotel
}: HotelMapPanelProps) {
  const [showMap, setShowMap] = useState(true)

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h3 className="text-lg font-semibold text-gray-900">Map View</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="flex items-center space-x-2"
          >
            <Navigation className="h-4 w-4" />
            <span>{showMap ? 'Hide' : 'Show'} Map</span>
          </Button>
        </div>
      </div>

      {/* Map or List */}
      <div className="flex-1 overflow-hidden">
        {showMap ? (
          <div className="h-full relative">
            {/* Map Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h4>
                <p className="text-gray-600 text-sm">
                  Hotel locations would be displayed here
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Powered by Google Maps or similar service
                </div>
              </div>
            </div>

            {/* Map Pins (simulated) */}
            <div className="absolute inset-0 pointer-events-none">
              {hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`absolute ${
                    selectedHotel?.id === hotel.id 
                      ? 'z-10' 
                      : 'z-0'
                  }`}
                  style={{
                    left: `${20 + (index * 15) % 60}%`,
                    top: `${30 + (index * 20) % 40}%`,
                  }}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className={`h-8 w-8 p-0 rounded-full ${
                      selectedHotel?.id === hotel.id
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={() => onHotelSelect(hotel)}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedHotel?.id === hotel.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => onHotelSelect(hotel)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {hotel.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{hotel.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {hotel.badges.map((badge, badgeIndex) => (
                            <Badge
                              key={badgeIndex}
                              className={`text-xs ${getBadgeColor(badge)}`}
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-sm font-bold text-primary">
                          <PriceDisplay priceCents={hotel.minPrice * 100} sourceCurrency="INR" />
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Hotel Info */}
      {selectedHotel && (
        <div className="border-t bg-white p-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {selectedHotel.name}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHotelSelect(selectedHotel)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                <MapPin className="h-3 w-3" />
                <span>{selectedHotel.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {Array.from({ length: selectedHotel.starRating }, (_, i) => (
                    <span key={i} className="text-yellow-400 text-xs">★</span>
                  ))}
                </div>
                <div className="text-sm font-bold text-primary">
                  <PriceDisplay priceCents={selectedHotel.minPrice * 100} sourceCurrency="INR" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
