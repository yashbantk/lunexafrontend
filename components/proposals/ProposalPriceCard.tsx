"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { convertCentsToINR } from "@/lib/utils/currencyConverter"
import { formatPrice } from "@/lib/utils/formatUtils"

interface ProposalPriceCardProps {
  proposal: {
    id: string
    totalPriceCents: number
    estimatedDateOfBooking: string
    currency?: {
      code: string
      name: string
    }
    trip: {
      totalTravelers: number
      fromCity?: {
        name: string
      }
      nationality?: {
        name: string
      }
    }
  }
  onEditProposal?: () => void
  onUpdateMarkup?: () => void
}

export function ProposalPriceCard({ 
  proposal, 
  onEditProposal, 
  onUpdateMarkup 
}: ProposalPriceCardProps) {
  const [convertedTotalPriceCents, setConvertedTotalPriceCents] = useState<number>(proposal.totalPriceCents)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Convert to INR on mount
    const convertCurrency = async () => {
      setLoading(true)
      try {
        const currencyCode = proposal.currency?.code || 'INR'
        const inrCents = await convertCentsToINR(proposal.totalPriceCents, currencyCode)
        setConvertedTotalPriceCents(inrCents)
      } catch (error) {
        console.error('Currency conversion error:', error)
        // Fallback to original amount
        setConvertedTotalPriceCents(proposal.totalPriceCents)
      } finally {
        setLoading(false)
      }
    }

    convertCurrency()
  }, [proposal.totalPriceCents, proposal.currency?.code])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Estimated Date */}
      <div className="bg-white rounded-2xl shadow-xl p-4">
        <div className="text-sm text-gray-600 mb-2">Estimated Date of Booking</div>
        <div className="text-lg font-semibold text-gray-900">{formatDate(proposal.estimatedDateOfBooking)}</div>
      </div>

      {/* Edit Proposal Button */}
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center space-x-2"
        onClick={onEditProposal}
      >
        <div className="w-4 h-4 flex flex-col space-y-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
        <span>EDIT PROPOSAL</span>
      </Button>

      {/* Price Breakdown Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Breakdown</h3>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">1 room, {proposal.trip.totalTravelers} adults</span>
            <a href="#" className="text-blue-600 hover:underline">Edit</a>
          </div>
          <div className="text-sm text-gray-600">
            Nationality: {proposal.trip.nationality?.name || 'India'}
          </div>
          <div className="text-sm text-gray-600">
            Departure City: {proposal.trip.fromCity?.name || 'Gurgaon'}
          </div>
          <a 
            href="#" 
            className="text-blue-600 hover:underline text-sm"
            onClick={onUpdateMarkup}
          >
            Update Markup
          </a>
        </div>

        <div className="space-y-3 border-t pt-4">
          {loading ? (
            <div className="text-center text-gray-500 py-4">Converting currency...</div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per adult</span>
                <span className="font-medium">{formatPrice(convertedTotalPriceCents / proposal.trip.totalTravelers, 'INR')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-gray-900">Total Price</span>
                  <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(convertedTotalPriceCents, 'INR')}</div>
                  <div className="text-xs text-gray-500">INCLUDING ALL TAXES</div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                5% GST, TCS (5% on upto 10L, 20% for above 10L) extra.
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Net Price</span>
                <span className="font-medium">{formatPrice(convertedTotalPriceCents * 0.95, 'INR')}</span>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600">Total Earnings</span>
                  <div className="w-3 h-3 text-gray-400">→</div>
                </div>
                <span className="font-medium">{formatPrice(convertedTotalPriceCents * 0.015, 'INR')} (1.5%)</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Markup</span>
                <span className="font-medium">{formatPrice(convertedTotalPriceCents * 0.015, 'INR')}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
