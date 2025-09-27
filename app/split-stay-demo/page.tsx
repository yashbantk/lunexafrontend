'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Split, 
  Calendar, 
  Hotel, 
  Users, 
  MapPin,
  Star,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react'
import { SplitStayManager } from '@/components/hotels/SplitStayManager'
import { SplitStayValidation } from '@/components/hotels/SplitStayValidation'

interface SplitStaySegment {
  id: string
  duration: number
  startDate: string
  endDate: string
  hotel?: any
  segmentIndex: number
}

export default function SplitStayDemoPage() {
  const [splitStaySegments, setSplitStaySegments] = useState<SplitStaySegment[]>([])
  const [showValidation, setShowValidation] = useState(false)

  // Demo trip data
  const tripData = {
    totalNights: 4,
    totalDays: 5,
    startDate: '2025-03-15T00:00:00Z',
    endDate: '2025-03-19T00:00:00Z',
    adults: 2,
    childrenCount: 0,
    cityId: '2',
    cityName: 'Miami',
    destination: 'Miami, Florida'
  }

  const handleSplitStayChange = (segments: SplitStaySegment[]) => {
    setSplitStaySegments(segments)
  }

  const handleFixError = (errorType: string, segmentIndex?: number) => {
    console.log('Fix error:', errorType, segmentIndex)
    // In a real app, this would trigger the appropriate fix action
  }

  const getTotalPrice = () => {
    return splitStaySegments.reduce((total, segment) => {
      if (segment.hotel) {
        return total + (segment.hotel.minPrice * segment.duration)
      }
      return total
    }, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getCompletedSegments = () => {
    return splitStaySegments.filter(segment => segment.hotel).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Split Stay Demo</h1>
                <p className="text-gray-600">Experience the new Split Stay booking feature</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                Demo Mode
              </Badge>
              <Button
                variant="outline"
                onClick={() => setShowValidation(!showValidation)}
                className="text-sm"
              >
                {showValidation ? 'Hide' : 'Show'} Validation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Split Stay Manager */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-primary text-white rounded-lg">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Trip Overview</h2>
                      <p className="text-gray-600">Configure your split stay accommodation</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-gray-900">{tripData.destination}</div>
                        <div className="text-sm text-gray-600">Destination</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-gray-900">{tripData.totalNights} nights</div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {tripData.adults} adult{tripData.adults !== 1 ? 's' : ''}
                          {tripData.childrenCount > 0 && `, ${tripData.childrenCount} child${tripData.childrenCount !== 1 ? 'ren' : ''}`}
                        </div>
                        <div className="text-sm text-gray-600">Travelers</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Split Stay Manager */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <SplitStayManager
                totalNights={tripData.totalNights}
                totalDays={tripData.totalDays}
                startDate={tripData.startDate}
                endDate={tripData.endDate}
                adults={tripData.adults}
                childrenCount={tripData.childrenCount}
                cityId={tripData.cityId}
                cityName={tripData.cityName}
                onSplitStayChange={handleSplitStayChange}
              />
            </motion.div>

            {/* Validation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {showValidation && (
                <SplitStayValidation
                  segments={splitStaySegments}
                  totalNights={tripData.totalNights}
                  startDate={tripData.startDate}
                  endDate={tripData.endDate}
                  onFixError={handleFixError}
                />
              )}
            </motion.div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="sticky top-8 space-y-6"
            >
              {/* Booking Summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Split className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-900">Split Stay Summary</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Nights</span>
                      <span className="font-medium">{tripData.totalNights}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Segments</span>
                      <span className="font-medium">{splitStaySegments.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-medium text-green-600">
                        {getCompletedSegments()}/{splitStaySegments.length}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Estimated Total</span>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Highlights */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Stay Benefits</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Hotel className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Multiple Experiences</div>
                        <div className="text-sm text-gray-600">
                          Stay in different areas and hotel types
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Flexible Duration</div>
                        <div className="text-sm text-gray-600">
                          Choose how many nights at each hotel
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Easy Management</div>
                        <div className="text-sm text-gray-600">
                          Modify any segment independently
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Actions */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Actions</h3>
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // Reset to default state
                        setSplitStaySegments([])
                      }}
                    >
                      Reset Demo
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // Load sample data
                        const sampleSegments: SplitStaySegment[] = [
                          {
                            id: 'segment-0',
                            duration: 2,
                            startDate: '2025-03-15T00:00:00Z',
                            endDate: '2025-03-17T00:00:00Z',
                            segmentIndex: 0
                          },
                          {
                            id: 'segment-1',
                            duration: 2,
                            startDate: '2025-03-17T00:00:00Z',
                            endDate: '2025-03-19T00:00:00Z',
                            segmentIndex: 1
                          }
                        ]
                        setSplitStaySegments(sampleSegments)
                      }}
                    >
                      Load Sample Data
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowValidation(!showValidation)}
                    >
                      {showValidation ? 'Hide' : 'Show'} Validation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
