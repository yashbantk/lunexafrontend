"use client"

import { motion } from "framer-motion"
import { MapPin, Star, Clock, Users, Utensils, Wifi, Car, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HotelDetailsCardProps {
  hotel: {
    id: string
    name: string
    location: string
    rating: number
    reviewCount: number
    checkIn: string
    checkOut: string
    roomType: string
    mealPlan: string
    refundable: boolean
    image: string
    amenities: string[]
    description?: string
  }
}

export function HotelDetailsCard({ hotel }: HotelDetailsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Hotel Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              {renderStars(hotel.rating)}
              <span className="text-sm text-gray-600">({hotel.reviewCount} ratings)</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            VIEW
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{hotel.location}</span>
        </div>
      </div>

      {/* Hotel Image */}
      <div className="relative">
        <img 
          src={hotel.image} 
          alt={hotel.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {hotel.rating} Very Good
          </div>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="p-6">
        {/* Check-in/Check-out */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Check-in</div>
              <div className="font-medium text-gray-900">{formatDate(hotel.checkIn)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Check-out</div>
              <div className="font-medium text-gray-900">{formatDate(hotel.checkOut)}</div>
            </div>
          </div>
        </div>

        {/* Room & Meals */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">1 x {hotel.roomType} ({hotel.mealPlan})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Utensils className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Meals Included - {hotel.mealPlan}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${hotel.refundable ? 'text-green-600' : 'text-red-600'}`}>
              {hotel.refundable ? 'Refundable' : 'Non-refundable'}
            </span>
          </div>
        </div>

        {/* Hotel Description */}
        {hotel.description && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">What to know about this hotel</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <div>• Local Shopping</div>
                <div>• Hotel Condition</div>
                <div>• WiFi Quality</div>
                <div>• Indian Cuisine</div>
                <div>• Lift Details</div>
              </div>
              <div className="space-y-2">
                <div>• Pool & Spa</div>
                <div>• Mall Proximity</div>
                <div>• Lobby Atmosphere</div>
                <div>• Dining Variety</div>
                <div>• Spicy Options</div>
              </div>
              <div className="space-y-2">
                <div>• Metro Proximity</div>
                <div>• Room Size</div>
                <div>• Beach Proximity</div>
                <div>• Hotel Age</div>
              </div>
            </div>
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
