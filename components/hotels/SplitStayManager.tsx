'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Split, 
  Calendar, 
  Hotel, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Settings,
  Eye,
  Edit
} from 'lucide-react'
import { Hotel as HotelType } from '@/types/hotel'
import { SplitStayToggle } from './SplitStayToggle'
import { SplitStayDurationSelector } from './SplitStayDurationSelector'
import { SplitStayDisplay } from './SplitStayDisplay'
import HotelSelectModal from './HotelSelectModal'

interface SplitStaySegment {
  id: string
  duration: number
  startDate: string
  endDate: string
  hotel?: HotelType
  segmentIndex: number
}

interface SplitStayManagerProps {
  totalNights: number
  totalDays: number
  startDate: string
  endDate: string
  adults: number
  childrenCount: number
  cityId?: string
  cityName?: string
  onSplitStayChange: (segments: SplitStaySegment[]) => void
  isEnabled?: boolean
  onToggle?: (enabled: boolean) => void
  className?: string
}

type SplitStayStep = 'toggle' | 'duration' | 'hotels' | 'display'

export function SplitStayManager({
  totalNights,
  totalDays,
  startDate,
  endDate,
  adults,
  childrenCount,
  cityId,
  cityName,
  onSplitStayChange,
  isEnabled: externalIsEnabled,
  onToggle: externalOnToggle,
  className = ''
}: SplitStayManagerProps) {
  const [internalIsEnabled, setInternalIsEnabled] = useState(false)
  const isEnabled = externalIsEnabled !== undefined ? externalIsEnabled : internalIsEnabled
  const [currentStep, setCurrentStep] = useState<SplitStayStep>('toggle')
  const [durations, setDurations] = useState<number[]>([])
  const [segments, setSegments] = useState<SplitStaySegment[]>([])
  const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(null)
  const [showHotelSelector, setShowHotelSelector] = useState(false)

  // Initialize segments when durations change
  useEffect(() => {
    if (durations.length > 0) {
      const newSegments: SplitStaySegment[] = []
      let currentDate = new Date(startDate)
      
      durations.forEach((duration, index) => {
        const segmentStartDate = new Date(currentDate)
        const segmentEndDate = new Date(currentDate)
        segmentEndDate.setDate(segmentEndDate.getDate() + duration)
        
        newSegments.push({
          id: `segment-${index}`,
          duration,
          startDate: segmentStartDate.toISOString(),
          endDate: segmentEndDate.toISOString(),
          segmentIndex: index
        })
        
        currentDate = segmentEndDate
      })
      
      setSegments(newSegments)
    }
  }, [durations, startDate])

  // Notify parent of changes
  useEffect(() => {
    if (segments.length > 0) {
      onSplitStayChange(segments)
    }
  }, [segments, onSplitStayChange])

  const handleToggle = (enabled: boolean) => {
    if (externalOnToggle) {
      externalOnToggle(enabled)
    } else {
      setInternalIsEnabled(enabled)
    }
    
    if (enabled) {
      setCurrentStep('duration')
    } else {
      setCurrentStep('toggle')
      setDurations([])
      setSegments([])
    }
  }

  const handleDurationChange = (newDurations: number[]) => {
    setDurations(newDurations)
    if (newDurations.length > 1) {
      setCurrentStep('hotels')
    }
  }

  const handleHotelSelect = (hotel: any, room: any) => {
    if (editingSegmentIndex === null) return
    
    // Convert the selected hotel to HotelType format
    const hotelType: HotelType = {
      id: hotel.id,
      name: hotel.name,
      location: hotel.location || hotel.address,
      address: hotel.address,
      rating: hotel.rating,
      ratingsCount: hotel.ratingsCount || 0,
      starRating: hotel.starRating,
      images: hotel.images || [hotel.image],
      badges: hotel.badges || [],
      rooms: hotel.rooms || [],
      amenities: hotel.amenities || [],
      minPrice: hotel.minPrice || room?.pricePerNight || 0,
      maxPrice: hotel.maxPrice || room?.pricePerNight || 0,
      refundable: hotel.refundable || true,
      preferred: hotel.preferred || false,
      coordinates: hotel.coordinates || { lat: 0, lng: 0 }
    }
    
    const updatedSegments = segments.map(segment => 
      segment.segmentIndex === editingSegmentIndex 
        ? { ...segment, hotel: hotelType }
        : segment
    )
    setSegments(updatedSegments)
    setShowHotelSelector(false)
    setEditingSegmentIndex(null)
  }

  const handleEditSegment = (segmentIndex: number) => {
    setEditingSegmentIndex(segmentIndex)
    setShowHotelSelector(true)
  }

  const handleRemoveSegment = (segmentIndex: number) => {
    const updatedDurations = durations.filter((_, index) => index !== segmentIndex)
    setDurations(updatedDurations)
  }

  const handleSelectHotel = (segmentIndex: number) => {
    setEditingSegmentIndex(segmentIndex)
    setShowHotelSelector(true)
  }

  const getStepProgress = () => {
    if (!isEnabled) return 0
    if (durations.length === 0) return 25
    if (segments.some(s => !s.hotel)) return 50
    if (segments.every(s => s.hotel)) return 100
    return 75
  }

  const getCompletedSegments = () => {
    return segments.filter(segment => segment.hotel).length
  }

  const getTotalPrice = () => {
    return segments.reduce((total, segment) => {
      if (segment.hotel) {
        return total + (segment.hotel.minPrice * segment.duration)
      }
      return total
    }, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Indicator */}
      {isEnabled && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Split className="h-5 w-5 text-primary" />
                <span className="font-semibold text-gray-900">Split Stay Progress</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {getStepProgress()}% Complete
              </Badge>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
              <span>Duration Split</span>
              <span>Hotel Selection</span>
              <span>Review & Confirm</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Toggle */}
      <SplitStayToggle
        isEnabled={isEnabled}
        onToggle={handleToggle}
        totalNights={totalNights}
        totalDays={totalDays}
      />

      {/* Step 2: Duration Selector */}
      <AnimatePresence>
        {isEnabled && currentStep === 'duration' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SplitStayDurationSelector
              totalNights={totalNights}
              totalDays={totalDays}
              onDurationChange={handleDurationChange}
              initialDurations={durations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Hotel Selection */}
      <AnimatePresence>
        {isEnabled && currentStep === 'hotels' && !showHotelSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SplitStayDisplay
              segments={segments}
              onEditSegment={handleEditSegment}
              onRemoveSegment={handleRemoveSegment}
              onSelectHotel={handleSelectHotel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotel Selector Modal */}
      <HotelSelectModal
        isOpen={showHotelSelector}
        onClose={() => {
          setShowHotelSelector(false)
          setEditingSegmentIndex(null)
        }}
        onSelectHotel={handleHotelSelect}
        currentHotel={editingSegmentIndex !== null ? segments[editingSegmentIndex]?.hotel : undefined}
        stayId={editingSegmentIndex !== null ? `split-stay-${editingSegmentIndex}` : 'split-stay'}
        checkIn={editingSegmentIndex !== null ? segments[editingSegmentIndex]?.startDate || startDate : startDate}
        checkOut={editingSegmentIndex !== null ? segments[editingSegmentIndex]?.endDate || endDate : endDate}
        nights={editingSegmentIndex !== null ? segments[editingSegmentIndex]?.duration || 1 : 1}
        adults={adults}
        childrenCount={childrenCount}
        cityId={cityId}
        cityName={cityName}
      />

      {/* Summary */}
      {isEnabled && segments.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Split Stay Summary</h3>
                  <p className="text-sm text-gray-600">
                    {getCompletedSegments()}/{segments.length} segments configured
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(getTotalPrice())}
                </div>
                <div className="text-sm text-gray-600">Total estimated cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
