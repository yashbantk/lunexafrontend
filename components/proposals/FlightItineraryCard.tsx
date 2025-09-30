"use client"

import { motion } from "framer-motion"
import { Plane, Clock, MapPin, Briefcase, Utensils, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FlightSegment {
  id: string
  airline: string
  flightNumber: string
  aircraft: string
  departure: {
    time: string
    date: string
    airport: string
    code: string
    terminal?: string
  }
  arrival: {
    time: string
    date: string
    airport: string
    code: string
    terminal?: string
  }
  duration: string
  baggage: string
  meals: string
  refundable: boolean
  cabin: string
}

interface FlightItineraryCardProps {
  title: string
  date: string
  segments: FlightSegment[]
  layover?: {
    duration: string
    airport: string
    code: string
  }
}

export function FlightItineraryCard({ title, date, segments, layover }: FlightItineraryCardProps) {
  const formatTime = (time: string) => {
    return time
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-xl p-8 mb-8 w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Plane className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-gray-600">{formatDate(date)}</div>
      </div>

      <div className="space-y-6">
        {segments.map((segment, index) => (
          <div key={segment.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            {/* Flight Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plane className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{segment.airline}</div>
                  <div className="text-sm text-gray-600">{segment.flightNumber} • {segment.aircraft}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-semibold text-gray-900">{segment.duration}</div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Departure */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatTime(segment.departure.time)}</div>
                <div className="text-sm text-gray-600">{formatDate(segment.departure.date)}</div>
                <div className="font-medium text-gray-900">{segment.departure.airport}</div>
                <div className="text-sm text-gray-600">{segment.departure.code}</div>
                {segment.departure.terminal && (
                  <div className="text-xs text-gray-500">Terminal {segment.departure.terminal}</div>
                )}
              </div>

              {/* Flight Path */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plane className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatTime(segment.arrival.time)}</div>
                <div className="text-sm text-gray-600">{formatDate(segment.arrival.date)}</div>
                <div className="font-medium text-gray-900">{segment.arrival.airport}</div>
                <div className="text-sm text-gray-600">{segment.arrival.code}</div>
                {segment.arrival.terminal && (
                  <div className="text-xs text-gray-500">Terminal {segment.arrival.terminal}</div>
                )}
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Baggage</div>
                  <div className="font-medium text-gray-900">{segment.baggage}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Utensils className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Meals</div>
                  <div className="font-medium text-gray-900">{segment.meals}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Refundable</div>
                  <div className="font-medium text-gray-900">{segment.refundable ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div>
                  <div className="text-sm text-gray-600">Cabin</div>
                  <div className="font-medium text-gray-900">{segment.cabin}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Layover Information */}
        {layover && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">
                  {layover.duration} layover in {layover.airport}
                </div>
                <div className="text-sm text-yellow-700">
                  {layover.code} • Please ensure you have sufficient time for connections
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
