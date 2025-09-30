"use client"

import { motion } from "framer-motion"
import { ChevronDown, Plane, Car, Clock, MapPin, Users, Utensils, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  title: string
  description: string
  time: string
  duration: string
  price: number
  currency: string
  type: 'morning' | 'afternoon' | 'evening' | 'full_day'
  included: boolean
  image?: string
  notes?: string
  details?: {
    startTime?: string
    pickupTime?: string
    startLocation?: string
    inclusions?: string[]
    transfers?: string
    bags?: string
  }
}

interface Day {
  id: string
  dayNumber: number
  date: string
  title: string
  summary: string
  activities: Activity[]
  accommodation?: string
  transfers?: string[]
  meals: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  image?: string
  description?: string
  flightInfo?: {
    flightNumber: string
    arrivalTime: string
    arrivalDate: string
    airport: string
  }
  transferInfo?: {
    time: string
    type: string
    destination: string
    details: string[]
  }
}

interface EnhancedDayItineraryProps {
  days: Day[]
}

export function EnhancedDayItinerary({ days }: EnhancedDayItineraryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'TBD') return 'TBD'
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {days.map((day, index) => (
        <motion.div
          key={day.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Day Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-gray-900">{day.title}</h3>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
              <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
            </div>
          </div>

          {/* Day Content */}
          <div className="p-6">
            {/* Day Image */}
            {day.image && (
              <div className="mb-6">
                <img 
                  src={day.image} 
                  alt={day.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Day Description */}
            {day.description && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{day.description}</p>
              </div>
            )}

            {/* Flight Information */}
            {day.flightInfo && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Plane className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {day.flightInfo.flightNumber} - Flight arriving on {day.flightInfo.arrivalDate} at {day.flightInfo.arrivalTime} - {day.flightInfo.airport}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Information */}
            {day.transferInfo && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {day.transferInfo.time} {day.transferInfo.type} - {day.transferInfo.destination}
                        </div>
                        {day.transferInfo.details && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {day.transferInfo.details.map((detail, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {detail}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        VIEW
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activities */}
            {day.activities && day.activities.length > 0 && (
              <div className="space-y-4">
                {day.activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          {activity.details?.startTime && (
                            <div className="text-sm text-gray-600">
                              Starts at {activity.details.startTime} (Duration: {activity.duration})
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        VIEW
                      </Button>
                    </div>

                    {activity.description && (
                      <p className="text-gray-700 mb-3">{activity.description}</p>
                    )}

                    {/* Activity Details */}
                    {activity.details && (
                      <div className="space-y-2 text-sm text-gray-600">
                        {activity.details.pickupTime && (
                          <div>Pick up time {activity.details.pickupTime}</div>
                        )}
                        {activity.details.startLocation && (
                          <div>Start from {activity.details.startLocation}</div>
                        )}
                        {activity.details.inclusions && activity.details.inclusions.length > 0 && (
                          <div>
                            {activity.details.inclusions.map((inclusion, idx) => (
                              <span key={idx}>
                                {inclusion}
                                {idx < activity.details.inclusions.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                        {activity.details.transfers && (
                          <div>{activity.details.transfers}</div>
                        )}
                      </div>
                    )}

                    {/* Activity Notes */}
                    {activity.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-blue-900">Notes:</div>
                            <div className="text-sm text-blue-800">{activity.notes}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Accommodation */}
            {day.accommodation && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Overnight stay at {day.accommodation}</span>
                </div>
              </div>
            )}

            {/* Meals */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Meals</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Utensils className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Breakfast</span>
                  {day.meals.breakfast ? (
                    <span className="text-xs text-green-600 font-medium">Included</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">Not Included</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Utensils className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Lunch</span>
                  {day.meals.lunch ? (
                    <span className="text-xs text-green-600 font-medium">Included</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">Not Included</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Utensils className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Dinner</span>
                  {day.meals.dinner ? (
                    <span className="text-xs text-green-600 font-medium">Included</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">Not Included</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
