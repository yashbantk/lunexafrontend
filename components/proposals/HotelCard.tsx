"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Star, MapPin, ExternalLink, CheckCircle, Clock } from "lucide-react"
import { Hotel } from "@/types/proposal"
import Image from "next/image"

interface HotelCardProps {
  hotel: Hotel
  onEdit: () => void
  onRemove: () => void
}

export function HotelCard({ hotel, onEdit, onRemove }: HotelCardProps) {
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
            <div className="flex space-x-6">
              {/* Hotel Image */}
              <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={hotel.image}
                alt={hotel.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hotel Details */}
            <div className="flex-1 min-w-0">
              {/* Hotel Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(hotel.starRating)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {hotel.starRating} Star
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <span className="font-medium">{hotel.rating}</span>
                      <span>Very Good</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{hotel.address}</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Check-in/Check-out */}
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Check-in</div>
                  <div className="text-base font-medium text-gray-900">
                    {formatDate(hotel.checkIn)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Check-out</div>
                  <div className="text-base font-medium text-gray-900">
                    {formatDate(hotel.checkOut)}
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {hotel.roomType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {hotel.boardBasis}, {hotel.bedType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {hotel.nights} {hotel.nights === 1 ? 'night' : 'nights'}
                  </span>
                </div>
                {/* Confirmation Status */}
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${hotel.confirmationStatus === 'confirmed' ? 'bg-green-500' : hotel.confirmationStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{hotel.confirmationStatus || 'Pending'}</span>
                  </span>
                </div>
                {hotel.refundable && (
                  <div className="text-sm text-green-600 font-medium">
                    Fully refundable before {new Date(hotel.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  {formatPrice(hotel.pricePerNight, hotel.currency)}
                </div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3 min-w-[140px]">
              <Button
                variant="outline"
                onClick={onEdit}
                className="text-sm px-4 py-2 h-10 border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium"
              >
                Change Room
              </Button>
              <Button
                variant="outline"
                onClick={onEdit}
                className="text-sm px-4 py-2 h-10 border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium"
              >
                Change Hotel
              </Button>
              <Button
                variant="outline"
                onClick={onRemove}
                className="text-sm px-4 py-2 h-10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-medium"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
