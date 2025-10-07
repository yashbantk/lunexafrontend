"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  Send, 
  Eye, 
  Plus, 
  Plane, 
  Home, 
  Car,
  CheckCircle
} from "lucide-react"
import { Proposal } from "@/types/proposal"

interface PriceSummaryProps {
  proposal: Proposal | null
  onSaveProposal: () => void
  onPreview: () => void
}

export function PriceSummary({ proposal, onSaveProposal, onPreview }: PriceSummaryProps) {
  if (!proposal) return null

  const formatPrice = (price: number) => {
    const currency = proposal?.currency || 'INR'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(price)
  }

  const { priceBreakdown } = proposal

  return (
    <div className="space-y-4">
      {/* Price Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-primary" />
              Price Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per adult</span>
                <span className="font-medium">{formatPrice(priceBreakdown.pricePerAdult)}</span>
              </div>
              {priceBreakdown.pricePerChild > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per child</span>
                  <span className="font-medium">{formatPrice(priceBreakdown.pricePerChild)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">{formatPrice(priceBreakdown.taxes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Markup ({proposal.markupPercent}%)</span>
                <span className="font-medium">{formatPrice(priceBreakdown.markup)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total Price</span>
                  <span>{formatPrice(priceBreakdown.total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={onSaveProposal}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save As Proposal
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Send to client')}
                  className="text-xs"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Send
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="w-full text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trip Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Trip Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Flights */}
            {proposal.flights && proposal.flights.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Plane className="h-4 w-4 mr-2 text-primary" />
                  Flights Included
                </h4>
                <ul className="space-y-1">
                  {proposal.flights.map((flight) => (
                    <li key={flight.id} className="text-sm text-gray-700 flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      {flight.airline} {flight.flightNumber} from {flight.from} to {flight.to}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hotels */}
            {proposal.hotels && proposal.hotels.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Home className="h-4 w-4 mr-2 text-primary" />
                  Accommodation
                </h4>
                <ul className="space-y-1">
                  {proposal.hotels.map((hotel) => (
                    <li key={hotel.id} className="text-sm text-gray-700">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        <div>
                          <div>{hotel.nights} {hotel.nights === 1 ? 'night' : 'nights'} in {hotel.name}</div>
                          <div className="text-xs text-gray-500">
                            {hotel.roomType} • {hotel.boardBasis}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transfers */}
            {proposal.addTransfers && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Car className="h-4 w-4 mr-2 text-primary" />
                  Transfers
                </h4>
                <ul className="space-y-1">
                  <li className="text-sm text-gray-700 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    Private Transfer from Airport to Hotel
                  </li>
                  <li className="text-sm text-gray-700 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    Private Transfer from Hotel to Airport
                  </li>
                </ul>
              </div>
            )}

            {/* Quick Add Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => console.log('Quick add')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Quick Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


