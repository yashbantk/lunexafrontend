"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  Eye, 
  Plus, 
  Plane, 
  Home, 
  Car,
  CheckCircle,
  Users
} from "lucide-react"
import { Proposal } from "@/types/proposal"
import { convertCentsToINR } from '@/lib/utils/currencyConverter'
import { formatPrice } from '@/lib/utils/formatUtils'
import { useState, useEffect } from 'react'

interface PriceSummaryProps {
  proposal: Proposal | null
  onSaveProposal: () => void
  onPreview: () => void
}

export function PriceSummary({ proposal, onSaveProposal, onPreview }: PriceSummaryProps) {
  const [prices, setPrices] = useState({
    total: 0,
    pricePerAdult: 0,
    pricePerChild: 0,
    taxes: 0,
    markup: 0
  })

  useEffect(() => {
    if (!proposal) return

    const convert = async () => {
       const currency = proposal.currency || 'INR'
       const { priceBreakdown } = proposal
       
       const [total, perAdult, perChild, taxes, markup] = await Promise.all([
         convertCentsToINR(priceBreakdown.total, currency),
         convertCentsToINR(priceBreakdown.pricePerAdult, currency),
         convertCentsToINR(priceBreakdown.pricePerChild, currency),
         convertCentsToINR(priceBreakdown.taxes, currency),
         convertCentsToINR(priceBreakdown.markup, currency)
       ])
       
       setPrices({ total, pricePerAdult: perAdult, pricePerChild: perChild, taxes, markup })
    }
    convert()
  }, [proposal])

  if (!proposal) return null

  const { priceBreakdown } = proposal
  const totalAdults = proposal.adults || 0
  const totalChildren = proposal.children || 0

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
            {/* Total Price and Travelers Info */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatPrice(prices.total, 'INR')}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{totalAdults} {totalAdults === 1 ? 'adult' : 'adults'}{totalChildren > 0 ? `, ${totalChildren} ${totalChildren === 1 ? 'child' : 'children'}` : ''}</span>
              </div>
            </div>
            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per adult</span>
                <span className="font-medium">{formatPrice(prices.pricePerAdult, 'INR')}</span>
              </div>
              {prices.pricePerChild > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per child</span>
                  <span className="font-medium">{formatPrice(prices.pricePerChild, 'INR')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">{formatPrice(prices.taxes, 'INR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Markup {proposal.markupLandPercent != null ? `(${proposal.markupLandPercent}%)` : ''}</span>
                <span className="font-medium">{formatPrice(prices.markup, 'INR')}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total Price</span>
                  <span>{formatPrice(prices.total, 'INR')}</span>
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
              {/* <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="w-full text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview Proposal
              </Button> */}
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
            {/* <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {}}
              >
                <Plus className="h-3 w-3 mr-1" />
                Quick Add
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


