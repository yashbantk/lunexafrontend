'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Hotel, 
  Calendar, 
  MapPin, 
  Star, 
  Edit, 
  Trash2, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'
import { Hotel as HotelType } from '@/types/hotel'
import { PriceDisplay } from '@/components/PriceDisplay'

interface SplitStaySegment {
  id: string
  duration: number
  startDate: string
  endDate: string
  hotel?: HotelType
  segmentIndex: number
}

interface SplitStayDisplayProps {
  segments: SplitStaySegment[]
  onEditSegment: (segmentIndex: number) => void
  onRemoveSegment: (segmentIndex: number) => void
  onSelectHotel: (segmentIndex: number) => void
  className?: string
}

export function SplitStayDisplay({
  segments,
  onEditSegment,
  onRemoveSegment,
  onSelectHotel,
  className = ''
}: SplitStayDisplayProps) {
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null)

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
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getSegmentStatus = (segment: SplitStaySegment) => {
    if (segment.hotel) {
      return { status: 'complete', color: 'green', text: 'Hotel Selected' }
    }
    return { status: 'pending', color: 'amber', text: 'Hotel Needed' }
  }

  const getTotalNights = () => {
    return segments.reduce((total, segment) => total + segment.duration, 0)
  }

  const getCompletedSegments = () => {
    return segments.filter(segment => segment.hotel).length
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary text-white rounded-lg">
                <Hotel className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Split Stay Overview</h3>
                <p className="text-sm text-gray-600">
                  {getCompletedSegments()} of {segments.length} segments completed
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {getTotalNights()} nights
              </div>
              <div className="text-sm text-gray-600">Total duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segments */}
      <div className="space-y-4">
        {segments.map((segment, index) => {
          const status = getSegmentStatus(segment)
          const isLast = index === segments.length - 1
          
          return (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connection Line */}
              {!isLast && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300 z-0" />
              )}
              
              <Card className={`relative z-10 transition-all duration-200 ${
                segment.hotel 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-amber-200 bg-amber-50/50'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Segment Number */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        segment.hotel ? 'bg-green-500' : 'bg-amber-500'
                      }`}>
                        {segment.segmentIndex + 1}
                      </div>

                      {/* Segment Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge variant="outline" className="text-sm">
                            Segment {segment.segmentIndex + 1}
                          </Badge>
                          <Badge 
                            variant={segment.hotel ? "default" : "secondary"}
                            className={`text-sm ${
                              segment.hotel 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {segment.duration} {segment.duration === 1 ? 'night' : 'nights'}
                          </Badge>
                          <div className={`flex items-center space-x-1 text-sm ${
                            segment.hotel ? 'text-green-700' : 'text-amber-700'
                          }`}>
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatDate(segment.startDate)} - {formatDate(segment.endDate)}
                            </span>
                          </div>
                        </div>

                        {/* Hotel Information */}
                        {segment.hotel ? (
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={segment.hotel.images[0]}
                                  alt={segment.hotel.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {segment.hotel.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex items-center space-x-1">
                                    {renderStars(segment.hotel.starRating)}
                                  </div>
                                  <span className="text-sm text-gray-600">{segment.hotel.rating}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate">{segment.hotel.location}</span>
                                </div>
                                <div className="mt-2">
                                  <div className="text-lg font-bold text-primary">
                                    <PriceDisplay priceCents={segment.hotel.minPrice * 100} sourceCurrency="INR" /> per night
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50/50">
                            <div className="text-center">
                              <Hotel className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                              <p className="text-amber-800 font-medium mb-2">No hotel selected</p>
                              <p className="text-sm text-amber-700 mb-3">
                                Choose a hotel for this {segment.duration}-night segment
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSelectHotel(segment.segmentIndex)}
                                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                              >
                                Select Hotel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {segment.hotel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectHotel(segment.segmentIndex)}
                          className="text-primary border-primary hover:bg-primary hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      )}
                      
                      {segments.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveSegment(segment.segmentIndex)}
                          className="text-red-500 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className={`flex items-center space-x-2 ${
                      segment.hotel ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {segment.hotel ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {status.text}
                      </span>
                    </div>
                    
                    {segment.hotel && (
                      <div className="text-sm text-gray-600">
                        Total: <PriceDisplay priceCents={segment.hotel.minPrice * segment.duration * 100} sourceCurrency="INR" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Footer */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">
                Split Stay Configuration
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {getCompletedSegments()}/{segments.length} segments configured
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
