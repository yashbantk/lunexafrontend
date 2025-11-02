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
import HotelDetailsModal from "@/components/hotels/HotelDetailsModal"
import ActivityDetailsModal from "@/components/activities/ActivityDetailsModal"

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const proposalId = params.id as string
  
  const { proposal, loading } = useProposal(proposalId)
  const [isPrintMode, setIsPrintMode] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'terms' | 'help'>('itinerary')
  
  // Modal state management
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<{
    id: string
    checkIn: string
    checkOut: string
    nights: number
  } | null>(null)
  const [isHotelDetailsOpen, setIsHotelDetailsOpen] = useState(false)
  
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<{
    activityId: string
    bookingId: string
    dayId: string
    dayIndex: number
  } | null>(null)
  const [isActivityDetailsOpen, setIsActivityDetailsOpen] = useState(false)

  // Calculate nights between check-in and check-out
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  // Handle hotel view
  const handleViewHotel = (hotelId: string, checkIn: string, checkOut: string) => {
    const nights = calculateNights(checkIn, checkOut)
    setSelectedHotelForDetails({ id: hotelId, checkIn, checkOut, nights })
    setIsHotelDetailsOpen(true)
  }

  const handleCloseHotelDetails = () => {
    setIsHotelDetailsOpen(false)
    setSelectedHotelForDetails(null)
  }

  // Handle activity view
  const handleViewActivity = (activityId: string, bookingId: string, dayId: string, dayIndex: number) => {
    setSelectedActivityForDetails({ activityId, bookingId, dayId, dayIndex })
    setIsActivityDetailsOpen(true)
  }

  const handleCloseActivityDetails = () => {
    setIsActivityDetailsOpen(false)
    setSelectedActivityForDetails(null)
  }

  // Handle transfer view (could show transfer details modal in future)
  const handleViewTransfer = () => {
    toast({ description: "Transfer details will be available soon", type: "info" })
  }

  // Debug proposal data
  useEffect(() => {
    if (proposal) {
      console.log('Proposal data:', proposal)
      console.log('Trip data:', proposal.trip)
      console.log('Days:', proposal.trip?.days)
      console.log('Days length:', proposal.trip?.days?.length)
      
      // Debug activities for each day
      proposal.trip?.days?.forEach((day: any, index: number) => {
        console.log(`Day ${index + 1} (${day.dayNumber}):`, {
          date: day.date,
          activityBookings: day.activityBookings,
          activityBookingsLength: day.activityBookings?.length || 0,
          activityBookingsData: day.activityBookings?.map((booking: any) => ({
            id: booking.id,
            slot: booking.slot,
            activityTitle: booking.option?.activity?.title,
            startTime: booking.option?.startTime,
            optionName: booking.option?.name
          }))
        })
      })
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

  // Download PDF - triggers download and opens in new tab
  const downloadPDF = async (): Promise<boolean> => {
    if (!proposalId) {
      toast({ description: "Proposal ID not found", type: "error" })
      return false
    }
    
    try {
      const pdfUrl = `/api/proposals/generate-pdf?id=${proposalId}`
      
      // Open PDF in new tab - this allows the page to load and user can print/save as PDF
      const newWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked, try fallback - open in same window temporarily
        const originalLocation = window.location.href
        window.location.href = pdfUrl
        
        // Give user time to save, then we'll redirect back (but this is not ideal)
        setTimeout(() => {
          window.location.href = originalLocation
        }, 2000)
        return true
      }
      
      // Wait for the window to load, then trigger print dialog for saving as PDF
      setTimeout(() => {
        try {
          if (newWindow && !newWindow.closed) {
            // Try to trigger print dialog in the new window
            newWindow.focus()
            // Note: We can't directly call window.print() on another window due to security,
            // but the page should have print styles and user can use Ctrl+P or Cmd+P
          }
        } catch (e) {
          console.log('Cannot access new window for print (security restriction)')
        }
      }, 1000)
      
      return true
    } catch (error) {
      console.error('Error opening PDF:', error)
      toast({ 
        description: "Failed to open PDF. Please try again.", 
        type: "error" 
      })
      return false
    }
  }

  // Handle download PDF
  const handleDownloadPDF = async () => {
    console.log('Download PDF clicked, proposalId:', proposalId)
    
    setIsDownloadingPDF(true)
    
    try {
      const success = await downloadPDF()
      if (success) {
        toast({ 
          description: "PDF downloaded successfully", 
          type: "success" 
        })
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setTimeout(() => setIsDownloadingPDF(false), 2000)
    }
  }

  // Handle WhatsApp - Download PDF and open WhatsApp
  const handleWhatsApp = async () => {
    setIsDownloadingPDF(true)
    
    try {
      // Open PDF page first (user can save it)
      const pdfUrl = `/api/proposals/generate-pdf?id=${proposalId}`
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
      
      // Small delay to let PDF page start loading
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get proposal details for WhatsApp message
      const proposalName = proposal?.name || "Travel Proposal"
      const proposalLink = window.location.href
      
      // Create WhatsApp message
      const message = encodeURIComponent(
        `Hi! Please find the travel proposal for ${proposalName}.\n\nView proposal: ${proposalLink}`
      )
      
      // Open WhatsApp (web or app) - this will open in a new tab
      const whatsappUrl = `https://wa.me/?text=${message}`
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      
      toast({ 
        description: "Opening PDF and WhatsApp...", 
        type: "success" 
      })
    } catch (error) {
      console.error('Error in WhatsApp handler:', error)
      toast({ 
        description: "Failed to process. Please try again.", 
        type: "error" 
      })
    } finally {
      setTimeout(() => setIsDownloadingPDF(false), 2000)
    }
  }

  // Handle Mail - Download PDF and open Gmail
  const handleMail = async () => {
    setIsDownloadingPDF(true)
    
    try {
      // Open PDF page first (user can save it)
      const pdfUrl = `/api/proposals/generate-pdf?id=${proposalId}`
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
      
      // Small delay to let PDF page start loading
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get proposal details for email
      const proposalName = proposal?.name || "Travel Proposal"
      const proposalLink = window.location.href
      const subject = encodeURIComponent(`Travel Proposal: ${proposalName}`)
      const body = encodeURIComponent(
        `Hi,\n\nPlease find the travel proposal attached.\n\nView proposal: ${proposalLink}\n\nBest regards`
      )
      
      // Open Gmail compose - this will open in a new tab
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`
      window.open(gmailUrl, '_blank', 'noopener,noreferrer')
      
      toast({ 
        description: "Opening PDF and Gmail...", 
        type: "success" 
      })
    } catch (error) {
      console.error('Error in Mail handler:', error)
      toast({ 
        description: "Failed to process. Please try again.", 
        type: "error" 
      })
    } finally {
      setTimeout(() => setIsDownloadingPDF(false), 2000)
    }
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

  // Handle edit proposal
  const handleEditProposal = (proposal: { trip: { id: string } | null }) => {
    if (!proposal.trip?.id) {
      toast({ description: "Trip ID not available", type: "error" })
      return
    }
    router.push(`/proposals/create/${proposal.trip.id}`)
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
            <div className="bg-white rounded-2xl p-8 mb-8">
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-8 flex items-start space-x-4">
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
              <div className="bg-white rounded-2xl p-8">
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
                  <div className="bg-white rounded-2xl p-8">
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
                    .map((day) => {
                      const hotelId = day.stay?.room?.hotel?.id
                      const checkIn = day.stay?.checkIn || "2025-10-16T15:00:00"
                      const checkOut = day.stay?.checkOut || "2025-10-19T12:00:00"
                      
                      return (
                        <HotelDetailsCard 
                          key={day.stay?.id}
                          hotel={{
                            id: day.stay?.id || "unknown",
                            name: day.stay?.room?.hotel?.name || "Hotel Name",
                            location: day.stay?.room?.hotel?.address || "Hotel Location",
                            rating: day.stay?.room?.hotel?.star || 4.0,
                            reviewCount: day.stay?.room?.hotel?.totalRatings || 315,
                            checkIn: checkIn,
                            checkOut: checkOut,
                            roomType: day.stay?.room?.name || "Standard Room",
                            mealPlan: day.stay?.mealPlan || "Breakfast",
                            refundable: true, // Default
                            image: day.stay?.room?.hotelRoomImages?.[0]?.url || "/api/placeholder/600/300",
                            amenities: day.stay?.room?.hotel?.amenities || ["Pool", "Spa", "Fitness Center", "WiFi", "Restaurant"],
                            description: day.stay?.room?.hotel?.description || "A beautiful resort with traditional architecture"
                          }}
                          onView={() => {
                            if (hotelId) {
                              handleViewHotel(hotelId, checkIn, checkOut)
                            } else {
                              toast({ description: "Hotel ID not available", type: "error" })
                            }
                          }}
                        />
                      )
                    })}
                </div>
              )}

              {/* Important Notes */}
              <ImportantNotes />

              {/* Enhanced Day Itinerary - Only show if days exist */}
              {proposal?.trip?.days && proposal.trip.days.length > 0 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
                  <EnhancedDayItinerary 
                    days={proposal.trip.days.map((day, index) => {
                    // Safely map activityBookings
                    const activities = (day.activityBookings || [])
                      .map((booking: any) => {
                        try {
                          return {
                            id: booking.option?.activity?.id || booking.id, // Use activity ID, fallback to booking ID
                            title: booking.option?.activity?.title || booking.option?.name || "Activity",
                            description: booking.option?.activity?.description || booking.option?.activity?.summary || booking.option?.name || "Activity description",
                            time: booking.option?.startTime || booking.option?.activity?.startTime || "09:00",
                            duration: `${booking.option?.durationMinutes || booking.option?.activity?.durationMinutes || 60} minutes`,
                            price: (booking.priceBaseCents || 0) / 100,
                            currency: proposal.currency?.code || "INR",
                            type: (booking.slot || booking.option?.slot || 'morning') as 'morning' | 'afternoon' | 'evening',
                            included: true,
                            notes: booking.option?.notes || booking.option?.activity?.highlights?.join(', '),
                            details: {
                              startTime: booking.option?.startTime || booking.option?.activity?.startTime,
                              pickupTime: booking.pickupRequired ? booking.option?.startTime : undefined,
                              startLocation: booking.pickupHotel?.name || booking.pickupHotel?.address,
                              inclusions: (Array.isArray(booking.option?.inclusions) ? booking.option.inclusions : []) || (Array.isArray(booking.option?.activity?.highlights) ? booking.option.activity.highlights : []) || [],
                              transfers: booking.pickupRequired ? 'Pickup from hotel' : undefined
                            },
                            // Store original booking data for the view handler
                            _bookingId: booking.id,
                            _dayId: day.id,
                            _dayIndex: index
                          }
                        } catch (error) {
                          console.error('Error mapping activity booking:', error, booking)
                          return null
                        }
                      })
                      .filter((activity): activity is NonNullable<typeof activity> => activity !== null)
                    
                    console.log(`Mapped Day ${day.dayNumber} activities:`, activities.length, activities)
                    
                    return {
                      id: day.id,
                      dayNumber: day.dayNumber || index + 1,
                      date: day.date || "2025-10-16",
                      title: `Day ${day.dayNumber || index + 1}`,
                      summary: activities.length > 0 ? `${activities.length} activit${activities.length > 1 ? 'ies' : 'y'}` : "Day activities",
                      description: day.city?.name ? `Exploring ${day.city.name}` : "Day description",
                      activities: activities,
                      accommodation: day.stay?.room?.hotel?.name || undefined,
                      meals: {
                        breakfast: day.stay?.mealPlan?.toLowerCase().includes('breakfast') || false,
                        lunch: day.stay?.mealPlan?.toLowerCase().includes('lunch') || false,
                        dinner: day.stay?.mealPlan?.toLowerCase().includes('dinner') || false
                      },
                      image: day.stay?.room?.hotelRoomImages?.[0]?.url || "/api/placeholder/600/300"
                    }
                  })}
                    onViewActivity={(activity: any) => {
                      if (activity.id && activity._bookingId && activity._dayId !== undefined && activity._dayIndex !== undefined) {
                        handleViewActivity(activity.id, activity._bookingId, activity._dayId, activity._dayIndex)
                      } else {
                        toast({ description: "Activity details not available", type: "error" })
                      }
                    }}
                    onViewTransfer={handleViewTransfer}
                  />
                </div>
              )}
                </>
              )}

              {activeTab === 'inclusions' && (
                <InclusionsSection 
                  onViewItem={(item, type) => {
                    // Handle view based on type
                    if (type === 'accommodation') {
                      // Find the hotel and open hotel details
                      const accommodationDay = proposal?.trip?.days?.find(day => day.stay)
                      if (accommodationDay?.stay?.room?.hotel?.id) {
                        const checkIn = accommodationDay.stay.checkIn || "2025-10-16T15:00:00"
                        const checkOut = accommodationDay.stay.checkOut || "2025-10-19T12:00:00"
                        handleViewHotel(accommodationDay.stay.room.hotel.id, checkIn, checkOut)
                      } else {
                        toast({ description: item.title, type: "info" })
                      }
                    } else {
                      toast({ description: `${item.title} details`, type: "info" })
                    }
                  }}
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
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Terms and Policies</h3>
                  <p className="text-gray-600">Terms and policies content will be displayed here.</p>
                </div>
              )}

              {activeTab === 'help' && (
                <div className="bg-white rounded-2xl p-8">
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
                  onEditProposal={() => proposal && handleEditProposal(proposal)}
                  onUpdateMarkup={() => proposal && handleEditProposal(proposal)}
                  onBookNow={() => console.log('Book now')}
                  onDownloadPDF={handleDownloadPDF}
                  onMail={handleMail}
                  onWhatsApp={handleWhatsApp}
                />
                )}
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </div>

      {/* Hotel Details Modal */}
      {selectedHotelForDetails && (
        <HotelDetailsModal
          isOpen={isHotelDetailsOpen}
          onClose={handleCloseHotelDetails}
          hotelId={selectedHotelForDetails.id}
          onSelectRoom={() => {
            // This is view-only mode, so we don't need room selection
            handleCloseHotelDetails()
          }}
          checkIn={selectedHotelForDetails.checkIn}
          checkOut={selectedHotelForDetails.checkOut}
          nights={selectedHotelForDetails.nights}
          adults={proposal?.trip?.travelerDetails?.adults || 2}
          childrenCount={proposal?.trip?.travelerDetails?.children || 0}
          mode="modal"
        />
      )}

      {/* Activity Details Modal */}
      {selectedActivityForDetails && (
        <ActivityDetailsModal
          isOpen={isActivityDetailsOpen}
          onClose={handleCloseActivityDetails}
          activityId={selectedActivityForDetails.activityId}
          onAddToPackage={() => {
            // This is view-only mode, so we don't need to add to package
            toast({ description: "This is view-only mode", type: "info" })
          }}
          dayId={selectedActivityForDetails.dayId}
          checkIn={proposal?.trip?.days?.[selectedActivityForDetails.dayIndex]?.stay?.checkIn || new Date().toISOString()}
          checkOut={proposal?.trip?.days?.[selectedActivityForDetails.dayIndex]?.stay?.checkOut || new Date().toISOString()}
          adults={proposal?.trip?.travelerDetails?.adults || 2}
          childrenCount={proposal?.trip?.travelerDetails?.children || 0}
          isEditMode={false}
          currentBookingId={selectedActivityForDetails.bookingId}
        />
      )}

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
