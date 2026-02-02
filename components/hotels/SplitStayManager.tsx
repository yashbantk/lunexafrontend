'use client'

import { useState, useEffect, useRef } from 'react'
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
  selectedRoom?: {
    id: string
    name: string
    priceCents?: number
    pricePerNight?: number
    baseMealPlan?: string
    boardBasis?: string
  }
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
  initialSegments?: SplitStaySegment[]
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
  initialSegments = [],
  className = ''
}: SplitStayManagerProps) {
  // All hooks must be called before any conditional returns  
  const [internalIsEnabled, setInternalIsEnabled] = useState(false)
  const isEnabled = externalIsEnabled !== undefined ? externalIsEnabled : internalIsEnabled
  const [currentStep, setCurrentStep] = useState<SplitStayStep>(initialSegments.length > 0 ? 'hotels' : 'toggle')
  const [durations, setDurations] = useState<number[]>(initialSegments.map(s => s.duration))
  const [segments, setSegments] = useState<SplitStaySegment[]>(initialSegments)
  const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(null)
  const [showHotelSelector, setShowHotelSelector] = useState(false)
  const previousSegmentsRef = useRef<SplitStaySegment[]>([])
  const previousInitialSegmentsRef = useRef<SplitStaySegment[]>(initialSegments)
  
  // Restore segments from initialSegments prop when they change externally (from parent)
  useEffect(() => {
    const previousInitialStr = JSON.stringify(previousInitialSegmentsRef.current)
    const currentInitialStr = JSON.stringify(initialSegments)
    
    // Only update if initialSegments actually changed (to avoid overwriting user selections)
    if (previousInitialStr !== currentInitialStr) {
      previousInitialSegmentsRef.current = initialSegments
      
      if (initialSegments && initialSegments.length > 0) {
        setSegments(initialSegments)
        
        // Extract durations and set step if needed
        const initialDurations = initialSegments.map(s => s.duration)
        if (initialDurations.length > 0 && initialDurations.reduce((a, b) => a + b, 0) === totalNights) {
          setDurations(initialDurations)
          // Always show hotels step if we have segments
          setCurrentStep('hotels')
        }
      } else if (initialSegments.length === 0) {
        // Reset if initialSegments is empty
        setSegments([])
        setDurations([])
      }
    }
  }, [initialSegments, totalNights])

  // Initialize segments when durations change
  useEffect(() => {
    
    if (durations.length > 0) {
      const newSegments: SplitStaySegment[] = []
      let currentDate = new Date(startDate)
      
      // Preserve existing hotel selections when recreating segments
      const existingSegmentsMap = new Map(
        segments.map(s => [s.segmentIndex, { hotel: s.hotel, selectedRoom: s.selectedRoom }])
      )
      
      durations.forEach((duration, index) => {
        const segmentStartDate = new Date(currentDate)
        const segmentEndDate = new Date(currentDate)
        segmentEndDate.setDate(segmentEndDate.getDate() + duration)
        
        // Check if we have existing hotel data for this segment index
        const existingSegment = existingSegmentsMap.get(index)
        
        const segment: SplitStaySegment = {
          id: `segment-${index}`,
          duration,
          startDate: segmentStartDate.toISOString(),
          endDate: segmentEndDate.toISOString(),
          segmentIndex: index
        }
        
        // Preserve hotel and room selection if it exists
        if (existingSegment) {
          segment.hotel = existingSegment.hotel
          segment.selectedRoom = existingSegment.selectedRoom
        }
        
        newSegments.push(segment)
        currentDate = segmentEndDate
      })
      
      setSegments(newSegments)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durations, startDate]) // segments is read but not in deps to avoid circular updates

  // Notify parent of changes
  useEffect(() => {
    if (segments.length > 0) {
      // Check if segments have actually changed to prevent infinite loops
      const segmentsChanged = JSON.stringify(segments) !== JSON.stringify(previousSegmentsRef.current)
      
      if (segmentsChanged) {
        previousSegmentsRef.current = segments
        
        // If we have segments (with or without hotels), ensure we're on the hotels step
        // This keeps the UI visible so users can see selections and continue selecting
        if (segments.length > 0 && currentStep !== 'hotels') {
          setCurrentStep('hotels')
        }
        
        onSplitStayChange(segments)
      }
    }
  }, [segments, currentStep, onSplitStayChange]) // Added missing dependencies

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
    } else {
      setCurrentStep('toggle')
    }
  }

  const handleHotelSelect = (hotel: any, room: any) => {
    if (editingSegmentIndex === null) {
      console.error('SplitStayManager: No editing segment index set')
      return
    }
    
    if (!hotel || !room) {
      console.error('SplitStayManager: Missing hotel or room data', { hotel, room })
      return
    }
    
    try {
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
      
      // Store the selected room information
      const selectedRoom = room ? {
        id: room.id,
        name: room.name || 'Standard Room',
        priceCents: room.priceCents,
        pricePerNight: room.pricePerNight,
        baseMealPlan: room.baseMealPlan,
        boardBasis: room.boardBasis
      } : undefined
      
      const updatedSegments = segments.map(segment => 
        segment.segmentIndex === editingSegmentIndex 
          ? { ...segment, hotel: hotelType, selectedRoom }
          : segment
      )
      
      setSegments(updatedSegments)
      
      // Close the hotel selector modal but keep the split stay UI visible
      setShowHotelSelector(false)
      setEditingSegmentIndex(null)
      
      // Ensure we stay on the hotels step to show the selected hotel
      if (currentStep !== 'hotels') {
        setCurrentStep('hotels')
      }
    } catch (error) {
      console.error('SplitStayManager: Error in handleHotelSelect', error)
    }
  }

  const handleEditSegment = (segmentIndex: number) => {
    if (segmentIndex >= segments.length) {
      console.error('SplitStayManager: Invalid segment index', { segmentIndex, segmentsLength: segments.length })
      return
    }
    
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

  // Don't render split stay manager for trips with 1 day or less
  if (totalNights <= 1) {
    return null
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

      {/* Step 3: Hotel Selection - Always show when enabled and segments exist */}
      <AnimatePresence>
        {isEnabled && segments.length > 0 && !showHotelSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            key="hotels-display"
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
