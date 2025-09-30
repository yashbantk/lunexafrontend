"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, MessageCircle, Calendar, CreditCard } from "lucide-react"

interface EnhancedPriceBreakdownProps {
  proposal: {
    id: string
    totalPriceCents: number
    estimatedDateOfBooking: string
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
  onBookNow?: () => void
  onReadyToBook?: () => void
  onAcceptProposal?: () => void
  onNeedHelp?: () => void
  onMail?: () => void
  onWhatsApp?: () => void
}

export function EnhancedPriceBreakdown({ 
  proposal, 
  onEditProposal, 
  onUpdateMarkup,
  onBookNow,
  onReadyToBook,
  onAcceptProposal,
  onNeedHelp,
  onMail,
  onWhatsApp
}: EnhancedPriceBreakdownProps) {
  // Format currency
  const formatCurrency = (cents: number) => {
    const amount = cents / 100
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const totalPrice = proposal.totalPriceCents / 100
  const pricePerAdult = totalPrice / proposal.trip.totalTravelers
  const netPrice = totalPrice * 0.95
  const totalEarnings = totalPrice * 0.015
  const gstAmount = totalPrice * 0.05
  const tcsAmount = totalPrice > 1000000 ? totalPrice * 0.20 : totalPrice * 0.05

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Estimated Date */}
      <div className="bg-white rounded-2xl shadow-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <div className="text-sm text-gray-600">Estimated Date of Booking</div>
        </div>
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
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price per adult</span>
            <span className="font-medium">{formatCurrency(pricePerAdult * 100)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <span className="text-lg font-bold text-gray-900">Total Price</span>
              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(proposal.totalPriceCents)}</div>
              <div className="text-xs text-gray-500">INCLUDING ALL TAXES</div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            5% GST, TCS (5% on upto 10L, 20% for above 10L) extra.
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Net Price</span>
            <span className="font-medium">{formatCurrency(netPrice * 100)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-gray-600">Total Earnings</span>
              <div className="w-3 h-3 text-gray-400">→</div>
            </div>
            <span className="font-medium">{formatCurrency(totalEarnings * 100)} (1.5%)</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Markup</span>
            <span className="font-medium">{formatCurrency(totalEarnings * 100)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
          onClick={onBookNow}
        >
          BOOK NOW
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2 py-2"
            onClick={onReadyToBook}
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">READY TO BOOK?</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2 py-2"
            onClick={onAcceptProposal}
          >
            <CheckCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm">ACCEPT PROPOSAL</span>
          </Button>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center space-x-2 py-2"
          onClick={onNeedHelp}
        >
          <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 text-xs">?</span>
          </div>
          <span className="text-sm">NEED HELP</span>
        </Button>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="flex items-center justify-center space-x-2 py-2"
          onClick={onMail}
        >
          <Mail className="w-4 h-4" />
          <span className="text-sm">MAIL</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center space-x-2 py-2"
          onClick={onWhatsApp}
        >
          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-xs">W</span>
          </div>
          <span className="text-sm">WHATSAPP LINK</span>
        </Button>
      </div>

      {/* Payment Schedule */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-yellow-600" />
          <div>
            <div className="font-medium text-yellow-800">
              {formatCurrency(proposal.totalPriceCents)} due on {formatDate(proposal.estimatedDateOfBooking)}
            </div>
            <div className="text-sm text-yellow-700">
              Payment required to confirm booking
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
