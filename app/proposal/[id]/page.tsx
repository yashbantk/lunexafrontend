"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Users, 
  Star,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Phone,
  Mail,
  Globe,
  Building,
  FileText,
  Printer,
  Plane
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useProposal } from "@/hooks/useProposal"
import { useToast } from "@/hooks/useToast"
import { ProposalDetailHeader } from "@/components/proposals/ProposalDetailHeader"
import { ProposalItinerary } from "@/components/proposals/ProposalItinerary"
import { ProposalPriceBreakdown } from "@/components/proposals/ProposalPriceBreakdown"
import { ProposalActionButtons } from "@/components/proposals/ProposalActionButtons"
import { ProposalPriceCard } from "@/components/proposals/ProposalPriceCard"
import { FlightItineraryCard } from "@/components/proposals/FlightItineraryCard"
import { EnhancedPriceBreakdown } from "@/components/proposals/EnhancedPriceBreakdown"
import { ImportantNotes } from "@/components/proposals/ImportantNotes"
import { EnhancedDayItinerary } from "@/components/proposals/EnhancedDayItinerary"
import { HotelDetailsCard } from "@/components/proposals/HotelDetailsCard"
import { InclusionsSection } from "@/components/proposals/InclusionsSection"

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const proposalId = params.id as string
  
  const { proposal, loading } = useProposal(proposalId)
  const [isPrintMode, setIsPrintMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'terms' | 'help'>('itinerary')

  // Debug proposal data
  useEffect(() => {
    if (proposal) {
      console.log('Proposal data:', proposal)
      console.log('Trip data:', proposal.trip)
      console.log('Days:', proposal.trip?.days)
      console.log('Days length:', proposal.trip?.days?.length)
    }
  }, [proposal])

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
    setIsPrintMode(true)
    setTimeout(() => {
      window.print()
      setIsPrintMode(false)
    }, 100)
  }

  // Handle download PDF
  const handleDownloadPDF = () => {
    toast({ description: "PDF download feature coming soon!", type: "info" })
  }

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Proposal Abigailbury Trip`,
        text: `Check out this travel proposal: Abigailbury Trip`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ description: "Link copied to clipboard!", type: "success" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Proposal</h2>
            <p className="text-gray-600 mb-4">The requested proposal could not be found.</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push('/my-proposals')}
              variant="outline"
              className="w-full"
            >
              Back to Proposals
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposal Not Found</h2>
            <p className="text-gray-600 mb-4">
              The proposal you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/my-proposals')}
            className="w-full"
          >
            Back to Proposals
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isPrintMode ? 'print-mode' : ''}`}>
      {/* Breadcrumbs and Actions Header */}
      {!isPrintMode && (
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Lead Details</span>
                <span>&gt;</span>
                <span>View All Suggested Options</span>
                <span>&gt;</span>
                <span className="font-medium text-gray-900">Option 1 - Trip to Bali</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-none"
          >
          {/* Proposal Header */}
          {proposal && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.name || "Trip Proposal"}</h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="font-medium">Proposal No: {proposal.id}</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{proposal.trip?.fromCity?.name || "Unknown"} to {proposal.trip?.days?.[0]?.city?.name || "Destination"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{proposal.trip?.startDate ? formatDate(proposal.trip.startDate) : "Start Date"} - {proposal.trip?.durationDays || 0} days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{proposal.trip?.totalTravelers || 0} travelers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-8 border-b">
                <button 
                  onClick={() => setActiveTab('itinerary')}
                  className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
                    activeTab === 'itinerary' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  ITINERARY
                </button>
                <button 
                  onClick={() => setActiveTab('inclusions')}
                  className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
                    activeTab === 'inclusions' 
                      ? 'text-green-600 border-green-600' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  INCLUSIONS
                </button>
                <button 
                  onClick={() => setActiveTab('terms')}
                  className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
                    activeTab === 'terms' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  TERMS AND POLICIES
                </button>
                <button 
                  onClick={() => setActiveTab('help')}
                  className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
                    activeTab === 'help' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  NEED HELP
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-4 space-y-8">
              {/* Tab Content */}
              {activeTab === 'itinerary' && (
                <>
                  {/* Please Note Disclaimer */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-xl p-8 mb-8 flex items-start space-x-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-700 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-800 font-semibold mb-2">Please Note:</p>
                      <p className="text-sm text-yellow-800">
                        The timings shown for various tours and transfers is indicative and may change depending on the situation in the destination at the time of travel. Any change in timing will be communicated in the final itinerary before travel and communicated on the trip support group.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      + EXPAND ALL DAYS
                    </Button>
                  </div>


              {/* Introduction for Customer */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Introduction for Customer</h3>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <span>+</span>
                    <span>ADD</span>
                  </Button>
                </div>
                <div className="text-gray-500 text-sm">
                  Add a personalized introduction for your customer...
                </div>
              </div>

              {/* Flights Section - Only show if flights are booked */}
              {proposal?.areFlightsBooked && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Flights</h2>
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <p className="text-gray-600">Flight details will be displayed here when flights are booked.</p>
                  </div>
                </div>
              )}

              {/* Hotel Details - Only show if hotels exist */}
              {proposal?.trip?.days && proposal.trip.days.some(day => day.stay) && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Hotels</h2>
                  {proposal.trip.days
                    .filter(day => day.stay)
                    .map((day) => (
                      <HotelDetailsCard 
                        key={day.stay?.id}
                        hotel={{
                          id: day.stay?.id || "unknown",
                          name: day.stay?.room?.hotel?.name || "Hotel Name",
                          location: day.stay?.room?.hotel?.address || "Hotel Location",
                          rating: day.stay?.room?.hotel?.star || 4.0,
                          reviewCount: day.stay?.room?.hotel?.totalRatings || 315,
                          checkIn: day.stay?.checkIn || "2025-10-16T15:00:00",
                          checkOut: day.stay?.checkOut || "2025-10-19T12:00:00",
                          roomType: day.stay?.room?.name || "Standard Room",
                          mealPlan: day.stay?.mealPlan || "Breakfast",
                          refundable: true, // Default
                          image: day.stay?.room?.hotelRoomImages?.[0]?.url || "/api/placeholder/600/300",
                          amenities: day.stay?.room?.hotel?.amenities || ["Pool", "Spa", "Fitness Center", "WiFi", "Restaurant"],
                          description: day.stay?.room?.hotel?.description || "A beautiful resort with traditional architecture"
                        }}
                      />
                    ))}
                </div>
              )}

              {/* Important Notes */}
              <ImportantNotes />

              {/* Enhanced Day Itinerary - Only show if days exist */}
              {proposal?.trip?.days && proposal.trip.days.length > 0 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
                  <EnhancedDayItinerary days={proposal.trip.days.map((day, index) => ({
                    id: day.id,
                    dayNumber: day.dayNumber || index + 1,
                    date: day.date || "2025-10-16",
                    title: `Day ${day.dayNumber || index + 1}`,
                    summary: "Day activities",
                    description: "Day description", // Default description
                    activities: day.activityBookings?.map(booking => ({
                      id: booking.id,
                      title: booking.option?.activity?.title || "Activity",
                      description: booking.option?.activity?.description || "Activity description",
                      time: booking.option?.startTime || "09:00",
                      duration: `${booking.option?.durationMinutes || 60} minutes`,
                      price: (booking.priceBaseCents || 0) / 100,
                      currency: "INR",
                      type: booking.slot as 'morning' | 'afternoon' | 'evening',
                      included: true
                    })) || [],
                    accommodation: day.stay?.room?.hotel?.name || "Hotel",
                    meals: {
                      breakfast: true, // Default
                      lunch: true, // Default
                      dinner: true // Default
                    },
                    image: "/api/placeholder/600/300"
                  }))} />
                </div>
              )}
                </>
              )}

              {activeTab === 'inclusions' && (
                <InclusionsSection 
                  inclusions={{
                    accommodation: proposal?.trip?.days && proposal.trip.days.some(day => day.stay) ? proposal.trip.days
                      .filter(day => day.stay)
                      .map((day, index) => ({
                        id: `accommodation-${index + 1}`,
                        title: `Stay for ${day.stay?.nights || 1} night${(day.stay?.nights || 1) > 1 ? 's' : ''} at ${day.stay?.room?.hotel?.name || 'Hotel'}`,
                        description: `${day.stay?.room?.name || 'Standard Room'} (${day.stay?.mealPlan || 'Breakfast'})`,
                        included: true,
                        details: [`${day.stay?.nights || 1} night${(day.stay?.nights || 1) > 1 ? 's' : ''}`]
                      })) : [],
                    transfers: proposal?.trip?.transferOnly ? [
                      {
                        id: "transfer-1",
                        title: "Airport Transfer",
                        description: "Airport pickup and drop service",
                        included: true,
                        badge: "Private Transfers"
                      }
                    ] : [],
                    tours: proposal?.trip?.days && proposal.trip.days.some(day => day.activityBookings && day.activityBookings.length > 0) ? [
                      {
                        id: "tour-1",
                        title: "Guided Tours",
                        description: "Various guided tours and activities",
                        included: true,
                        badge: "Private Tours"
                      }
                    ] : [],
                    meals: [
                      {
                        id: "breakfast",
                        title: "Breakfast",
                        description: "Morning meal",
                        included: !!(proposal?.trip?.days && proposal.trip.days.some(day => day.stay?.mealPlan?.toLowerCase().includes('breakfast'))),
                        details: proposal?.trip?.days && proposal.trip.days.some(day => day.stay?.mealPlan?.toLowerCase().includes('breakfast')) ? [`${proposal.trip.days.length} days`] : []
                      },
                      {
                        id: "lunch",
                        title: "Lunch",
                        description: "Midday meal",
                        included: false
                      },
                      {
                        id: "dinner",
                        title: "Dinner",
                        description: "Evening meal",
                        included: false
                      }
                    ],
                    visa: [
                      {
                        id: "visa-1",
                        title: "Visa Requirements",
                        description: "Check visa requirements for your destination",
                        included: false
                      }
                    ],
                    travelInsurance: [
                      {
                        id: "insurance-1",
                        title: "Travel Insurance",
                        description: "Comprehensive travel insurance coverage",
                        included: false
                      }
                    ]
                  }}
                />
              )}

              {activeTab === 'terms' && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Terms and Policies</h3>
                  <p className="text-gray-600">Terms and policies content will be displayed here.</p>
                </div>
              )}

              {activeTab === 'help' && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Need Help</h3>
                  <p className="text-gray-600">Help and support content will be displayed here.</p>
                </div>
              )}

            </div>

            {/* Right Column - Price Summary */}
            <div className="xl:col-span-1">
              <div className="sticky top-24">
                {proposal && (
                  <EnhancedPriceBreakdown
                  proposal={{
                    id: proposal.id,
                    totalPriceCents: proposal.totalPriceCents,
                    estimatedDateOfBooking: proposal.estimatedDateOfBooking,
                    trip: {
                      totalTravelers: proposal.trip?.totalTravelers || 0,
                      fromCity: proposal.trip?.fromCity || { name: "Unknown" },
                      nationality: proposal.trip?.nationality || { name: "Unknown" }
                    }
                  }}
                  onEditProposal={() => console.log('Edit proposal')}
                  onUpdateMarkup={() => console.log('Update markup')}
                  onBookNow={() => console.log('Book now')}
                  onReadyToBook={() => console.log('Ready to book')}
                  onAcceptProposal={() => console.log('Accept proposal')}
                  onNeedHelp={() => console.log('Need help')}
                  onMail={() => console.log('Mail')}
                  onWhatsApp={() => console.log('WhatsApp')}
                />
                )}
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print-mode {
            background: white !important;
          }
          .print-mode .shadow-xl {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          .print-mode .bg-gradient-to-br {
            background: white !important;
          }
          .print-mode .no-print {
            display: none !important;
          }
          .print-mode button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
