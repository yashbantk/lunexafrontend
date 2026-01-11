'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, X, Bed, Users, Maximize2, Wifi, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Room } from '@/types/hotel'
import { convertCentsToINR } from '@/lib/utils/currencyConverter'
import { formatPrice } from '@/lib/utils/formatUtils'

interface RoomRowProps {
  room: Room
  onSelect: (room: Room) => void
  isSelected?: boolean
  showImages?: boolean
  className?: string
}

export default function RoomRow({ 
  room, 
  onSelect, 
  isSelected = false, 
  showImages = true,
  className = '' 
}: RoomRowProps) {
  const [imageError, setImageError] = useState(false)
  const [convertedTotalPrice, setConvertedTotalPrice] = useState<number>(room.totalPrice)
  const [convertedPerNight, setConvertedPerNight] = useState<number>(room.pricePerNight)
  const [priceLoading, setPriceLoading] = useState(true)

  // Convert prices to INR
  useEffect(() => {
    const convertPrices = async () => {
      setPriceLoading(true)
      try {
        const currency = room.currency || 'INR'
        const totalPriceCents = Math.round(room.totalPrice * 100)
        const pricePerNightCents = Math.round(room.pricePerNight * 100)

        const convertedTotal = await convertCentsToINR(totalPriceCents, currency)
        const convertedPerNight = await convertCentsToINR(pricePerNightCents, currency)

        setConvertedTotalPrice(convertedTotal / 100)
        setConvertedPerNight(convertedPerNight / 100)
      } catch (error) {
        console.error('Currency conversion error:', error)
        // Fallback to original prices
        setConvertedTotalPrice(room.totalPrice)
        setConvertedPerNight(room.pricePerNight)
      } finally {
        setPriceLoading(false)
      }
    }

    convertPrices()
  }, [room.totalPrice, room.pricePerNight, room.currency])

  const getCancellationColor = (refundable: boolean) => {
    return refundable ? 'text-green-600' : 'text-red-600'
  }

  const getCancellationIcon = (refundable: boolean) => {
    return refundable ? (
      <Check className="h-3 w-3" />
    ) : (
      <X className="h-3 w-3" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${className}`}
    >
      <div className="flex gap-4">
        {/* Room Image */}
        {showImages && room.images && room.images.length > 0 && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {!imageError ? (
              <Image
                src={room.images[0]}
                alt={room.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Bed className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* Room Details */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            {/* Room Name and Group */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {room.name}
              </h3>
              {room.group && (
                <p className="text-xs text-gray-500 mt-1">
                  {room.group}
                </p>
              )}
            </div>

            {/* Bed Type and Occupancy */}
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Bed className="h-3 w-3" />
                <span>{room.bedType}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Up to {room.maxOccupancy} guests</span>
              </div>
              {room.roomSize && (
                <div className="flex items-center space-x-1">
                  <Maximize2 className="h-3 w-3" />
                  <span>{room.roomSize}</span>
                </div>
              )}
            </div>

            {/* Board Basis */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {room.board}
              </Badge>
              {room.amenities.includes('Breakfast Included') && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Breakfast Included
                </Badge>
              )}
            </div>

            {/* Room Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {room.amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-1 text-xs text-gray-500">
                    {amenity === 'Air Conditioning' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    {amenity === 'Mini Bar' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                    {amenity === 'Safe' && <div className="h-2 w-2 rounded-full bg-yellow-500" />}
                    {amenity === 'Balcony' && <div className="h-2 w-2 rounded-full bg-green-500" />}
                    {amenity === 'Sea View' && <div className="h-2 w-2 rounded-full bg-cyan-500" />}
                    <span>{amenity}</span>
                  </div>
                ))}
                {room.amenities.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{room.amenities.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex flex-col items-end space-y-2 min-w-[120px]">
          {/* Price */}
          <div className="text-right">
            {priceLoading ? (
              <div className="text-xs text-gray-500">Loading...</div>
            ) : (
              <>
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(convertedTotalPrice * 100, 'INR')}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPrice(convertedPerNight * 100, 'INR')}/night
                </div>
              </>
            )}
          </div>

          {/* Cancellation Policy */}
          <div className={`flex items-center space-x-1 text-xs ${getCancellationColor(room.refundable)}`}>
            {getCancellationIcon(room.refundable)}
            <span className="max-w-[100px] truncate">
              {room.refundable ? 'Refundable' : 'Non-refundable'}
            </span>
          </div>

          {/* Select Button */}
          <Button
            onClick={() => onSelect(room)}
            size="sm"
            className={`w-full text-xs ${
              isSelected 
                ? 'bg-primary text-white' 
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>

      {/* Cancellation Policy Details */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className={`text-xs ${getCancellationColor(room.refundable)}`}>
          {room.cancellationPolicy}
        </p>
      </div>
    </motion.div>
  )
}







