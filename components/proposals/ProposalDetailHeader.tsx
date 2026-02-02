"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Printer,
  Calendar, 
  Users, 
  Star
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import { useState, useEffect } from "react"
import { convertCentsToINR } from "@/lib/utils/currencyConverter"
import { formatPrice } from "@/lib/utils/formatUtils"

interface ProposalDetailHeaderProps {
  proposal: {
    id: string
    name: string
    status: string
    version: number
    totalPriceCents: number
    currency: string | {
      code: string
      name: string
    }
    trip: {
      fromCity: {
        name: string
      }
      startDate: string
      endDate: string
      durationDays: number
      totalTravelers: number
      starRating: number | null
      travelerDetails: {
        adults: number
        children: number
      }
    }
  }
  onPrint?: () => void
  onDownloadPDF?: () => void
  onShare?: () => void
}

export function ProposalDetailHeader({ 
  proposal, 
  onPrint, 
  onDownloadPDF, 
  onShare 
}: ProposalDetailHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [convertedTotalPriceCents, setConvertedTotalPriceCents] = useState<number>(proposal.totalPriceCents)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Convert to INR on mount
    const convertCurrency = async () => {
      setLoading(true)
      try {
        const currencyCode = typeof proposal.currency === 'string' 
          ? proposal.currency 
          : proposal.currency?.code || 'INR'
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
  }, [proposal.totalPriceCents, proposal.currency])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Handle print
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  // Handle download PDF
  const handleDownloadPDF = () => {
    if (onDownloadPDF) {
      onDownloadPDF()
    } else {
      toast({ description: "PDF download feature coming soon!", type: "info" })
    }
  }

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare()
    } else if (navigator.share) {
      navigator.share({
        title: `Proposal ${proposal.name}`,
        text: `Check out this travel proposal: ${proposal.name}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ description: "Link copied to clipboard!", type: "success" })
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{proposal.name}</h1>
            <Badge variant={proposal.status === 'draft' ? 'secondary' : 'default'}>
              {proposal.status.toUpperCase()}
            </Badge>
            <Badge variant="outline">v{proposal.version}</Badge>
          </div>
          <p className="text-lg text-gray-600">
            {proposal.trip.fromCity?.name || 'Unknown City'} • {formatDate(proposal.trip.startDate)} - {formatDate(proposal.trip.endDate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {proposal.trip.durationDays} days • {proposal.trip.totalTravelers} travelers
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            {loading ? 'Loading...' : formatPrice(convertedTotalPriceCents, 'INR')}
          </div>
          <div className="text-sm text-gray-500">Total Price (INR)</div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Duration</div>
            <div className="text-sm text-gray-600">{proposal.trip.durationDays} days</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Travelers</div>
            <div className="text-sm text-gray-600">
              {proposal.trip.travelerDetails?.adults || 0} adults, {proposal.trip.travelerDetails?.children || 0} children
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Hotel Rating</div>
            <div className="text-sm text-gray-600">
              {proposal.trip.starRating ? `${proposal.trip.starRating} star` : 'Not specified'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
