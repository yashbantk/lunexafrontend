"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plane, Clock, MapPin, CheckCircle } from "lucide-react"
import { Flight } from "@/types/proposal"
import { PriceDisplay } from "@/components/PriceDisplay"

interface FlightCardProps {
  flight: Flight
  onEdit: () => void
  onRemove: () => void
}

export function FlightCard({ flight, onEdit, onRemove }: FlightCardProps) {
  const getFlightTypeColor = (type: string) => {
    return type === 'return' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const getStopsText = (stops: number) => {
    if (stops === 0) return 'Non-Stop'
    return `${stops} ${stops === 1 ? 'Stop' : 'Stops'}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Flight Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Plane className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-gray-900">
                    {flight.airline} {flight.flightNumber}
                  </span>
                </div>
                <Badge className={getFlightTypeColor(flight.type)}>
                  {flight.type === 'return' ? 'Return' : 'Outbound'}
                </Badge>
              </div>

              {/* Flight Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Departure */}
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {flight.departureTime}
                  </div>
                  <div className="text-sm text-gray-600">
                    {flight.departureDate}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {flight.from}
                  </div>
                </div>

                {/* Duration & Stops */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {flight.duration}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {getStopsText(flight.stops)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {flight.class}
                  </div>
                </div>

                {/* Arrival */}
                <div className="space-y-1 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {flight.arrivalTime}
                  </div>
                  <div className="text-sm text-gray-600">
                    {flight.arrivalDate}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {flight.to}
                  </div>
                </div>
              </div>

              {/* Flight Info */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {flight.refundable ? 'Refundable' : 'Non-refundable'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    <PriceDisplay priceCents={flight.price * 100} sourceCurrency="INR" />
                  </div>
                  <div className="text-xs text-gray-500">per person</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
