"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Home, 
  Clock, 
  Star
} from "lucide-react"

interface ProposalItineraryProps {
  days: {
    id: string
    dayNumber: number
    date: string
    city: {
      id: string
      name: string
    }
    stay?: {
      id: string
      room: {
        id: string
        hotel: {
          id: string
          name: string
          star: number
        }
        name: string
      }
      nights: number
      mealPlan: string
    }
    activityBookings: {
      id: string
      slot: string
      option: {
        id: string
        activity: {
          id: string
          title: string
        }
        name: string
        startTime?: string
        durationMinutes: number
      }
    }[]
  }[]
}

export function ProposalItinerary({ days }: ProposalItineraryProps) {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format time
  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Day-by-Day Itinerary</h3>
      <div className="space-y-6">
        {days.map((day, index) => (
          <motion.div
            key={day.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Day {day.dayNumber} - {day.city.name}
                </h3>
                <p className="text-sm text-gray-600">{formatDate(day.date)}</p>
              </div>
              <Badge variant="outline">Day {day.dayNumber}</Badge>
            </div>

            {/* Hotel Stay */}
            {day.stay && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Accommodation</span>
                </div>
                <div className="text-sm text-blue-800">
                  <div className="font-medium">{day.stay.room.hotel.name}</div>
                  <div>{day.stay.room.name} • {day.stay.nights} night(s)</div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {day.stay.room.hotel.star} stars
                    </span>
                    <span>{day.stay.mealPlan}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Activities */}
            {day.activityBookings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Activities</span>
                </div>
                {day.activityBookings.map((activity) => (
                  <div key={activity.id} className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-green-900">
                          {activity.option.activity.title}
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                          {activity.option.name}
                        </div>
                        {activity.option.startTime && (
                          <div className="text-xs text-green-600 mt-1">
                            {formatTime(activity.option.startTime)} • {activity.option.durationMinutes} minutes
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.slot}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
