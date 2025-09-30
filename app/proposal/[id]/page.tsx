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
import { ProposalVideoPlayer } from "@/components/proposals/ProposalVideoPlayer"
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
  
  const { proposal, isLoading: loading } = useProposal(proposalId)
  const [isPrintMode, setIsPrintMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'terms' | 'help'>('itinerary')

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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Abigailbury Trip</h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="font-medium">Proposal No: {proposal.id || "128"}</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Kuta, Bali, 3 nights</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>September 30, 2025 - 3 nights/4 days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>1 room, 2 adults</span>
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

              {/* Video Player Section */}
              <ProposalVideoPlayer 
                title="Play Your Itinerary"
                duration="00:00 / 00:49"
                onPlay={() => console.log('Play video')}
              />

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

              {/* Flights Section */}
              <div className="space-y-8">
                {/* Outbound Journey */}
                <FlightItineraryCard
                  title="Outbound Journey"
                  date="2025-10-15"
                  segments={[
                    {
                      id: "segment-1",
                      airline: "AirAsia X Airways",
                      flightNumber: "D7-183",
                      aircraft: "Airbus A330",
                      departure: {
                        time: "23:20",
                        date: "2025-10-15",
                        airport: "Delhi",
                        code: "DEL",
                        terminal: "Terminal"
                      },
                      arrival: {
                        time: "07:40",
                        date: "2025-10-16",
                        airport: "Kuala Lumpur International Airport",
                        code: "KUL"
                      },
                      duration: "5h 50m",
                      baggage: "0KG",
                      meals: "At Extra Cost",
                      refundable: false,
                      cabin: "Economy"
                    },
                    {
                      id: "segment-2",
                      airline: "AirAsia X Airways",
                      flightNumber: "D7-798",
                      aircraft: "Airbus A330",
                      departure: {
                        time: "09:10",
                        date: "2025-10-16",
                        airport: "Kuala Lumpur International Airport",
                        code: "KUL",
                        terminal: "Terminal"
                      },
                      arrival: {
                        time: "12:20",
                        date: "2025-10-16",
                        airport: "Ngurah Rai Airport",
                        code: "DPS"
                      },
                      duration: "3h 10m",
                      baggage: "0KG",
                      meals: "At Extra Cost",
                      refundable: false,
                      cabin: "Economy"
                    }
                  ]}
                  layover={{
                    duration: "1h 30m",
                    airport: "Kuala Lumpur",
                    code: "KUL"
                  }}
                />

                {/* Inbound Journey */}
                <FlightItineraryCard
                  title="Inbound Journey"
                  date="2025-10-19"
                  segments={[
                    {
                      id: "segment-3",
                      airline: "Airindia",
                      flightNumber: "AI-2146",
                      aircraft: "Airbus A321",
                      departure: {
                        time: "10:00",
                        date: "2025-10-19",
                        airport: "Ngurah Rai Airport",
                        code: "DPS",
                        terminal: "Terminal I"
                      },
                      arrival: {
                        time: "15:35",
                        date: "2025-10-19",
                        airport: "Delhi",
                        code: "DEL",
                        terminal: "Terminal 3"
                      },
                      duration: "8h 5m",
                      baggage: "25KG",
                      meals: "Included",
                      refundable: true,
                      cabin: "Economy"
                    }
                  ]}
                />
              </div>

              {/* Hotel Details */}
              <HotelDetailsCard 
                hotel={{
                  id: "hotel-1",
                  name: "Risata Bali Resort and Spa",
                  location: "JL. Wana Segara, South Kuta Beach",
                  rating: 4.2,
                  reviewCount: 315,
                  checkIn: "2025-10-16T15:00:00",
                  checkOut: "2025-10-19T12:00:00",
                  roomType: "Superior Room",
                  mealPlan: "Breakfast",
                  refundable: false,
                  image: "/api/placeholder/600/300",
                  amenities: ["Pool", "Spa", "Fitness Center", "WiFi", "Restaurant"],
                  description: "A beautiful resort with traditional Balinese architecture"
                }}
              />

              {/* Important Notes */}
              <ImportantNotes />

              {/* Enhanced Day Itinerary */}
              {proposal && (
                <EnhancedDayItinerary days={[
                  {
                    id: "day-1",
                    dayNumber: 1,
                    date: "2025-10-16",
                    title: "Day 1 Arrival at Bali",
                    summary: "Arrival and transfer to hotel",
                    description: "Upon your arrival at Ngurah Rai Airport in Denpasar, Bali, our representative will meet and welcome you. You will then be taken to the hotel for your refreshment.",
                    activities: [],
                    accommodation: "Risata Bali Resort and Spa",
                    meals: {
                      breakfast: false,
                      lunch: false,
                      dinner: false
                    },
                    image: "/api/placeholder/600/300",
                    flightInfo: {
                      flightNumber: "D7-798",
                      arrivalTime: "12:20 PM",
                      arrivalDate: "16 Oct, 2025",
                      airport: "Ngurah Rai Airport, Bali"
                    },
                    transferInfo: {
                      time: "12:20",
                      type: "Private Transfer from Airport to Hotel",
                      destination: "Kuta, Legian, Tuban Kuta",
                      details: ["Private Transfers", "3 Bags"]
                    }
                  },
                  {
                    id: "day-2",
                    dayNumber: 2,
                    date: "2025-10-17",
                    title: "Day 2 Full Day Ubud and Kintamani [Customised]",
                    summary: "Full day tour of Ubud and Kintamani",
                    description: "Experience the breathtaking landscapes of Ubud and Kintamani on this private tour. Your vehicle is at your disposal throughout the day, and entrance fees to Kintamani are included. You can customize your experience by selecting up to four additional inclusions.",
                    activities: [
                      {
                        id: "activity-1",
                        title: "Ubud and Kintamani - Private - Customisable Tour",
                        description: "Experience the breathtaking landscapes of Ubud and Kintamani on this private tour.",
                        time: "08:30",
                        duration: "10 hrs",
                        price: 0,
                        currency: "USD",
                        type: "full_day",
                        included: true,
                        notes: "IF MONKEY FOREST IS SELECTED (only 2 other tours possible with this)",
                        details: {
                          startTime: "8:00 am",
                          pickupTime: "08:00 am",
                          startLocation: "Risata Bali Resort and Spa",
                          inclusions: ["Kintamani Entrance"],
                          transfers: "Private Transfers"
                        }
                      }
                    ],
                    accommodation: "Risata Bali Resort and Spa",
                    meals: {
                      breakfast: true,
                      lunch: false,
                      dinner: false
                    },
                    image: "/api/placeholder/600/300"
                  }
                ]} />
              )}
                </>
              )}

              {activeTab === 'inclusions' && (
                <InclusionsSection 
                  inclusions={{
                    accommodation: [
                      {
                        id: "accommodation-1",
                        title: "Stay for 3 nights at Risata Bali Resort and Spa",
                        description: "1 x Superior Room (Breakfast)",
                        included: true,
                        details: ["3 nights"]
                      }
                    ],
                    transfers: [
                      {
                        id: "transfer-1",
                        title: "Private Transfer from Airport to Hotel - Kuta, Legian, Tuban Kuta",
                        description: "Airport pickup service",
                        included: true,
                        badge: "Private Transfers"
                      },
                      {
                        id: "transfer-2",
                        title: "Private Transfer from Hotel to Airport - Kuta, Legian, Tuban Kuta",
                        description: "Airport drop service",
                        included: true,
                        badge: "Private Transfers"
                      }
                    ],
                    tours: [
                      {
                        id: "tour-1",
                        title: "Ubud and Kintamani - Private - Customisable Tour (upto 4 extra inclusions)",
                        description: "Starts at 8:00 am (Duration: 10 hrs), Pick up time 08:00 am, Start from Risata Bali Resort and Spa, Kintamani Entrance",
                        included: true,
                        badge: "Private Transfers"
                      }
                    ],
                    meals: [
                      {
                        id: "breakfast",
                        title: "Breakfast",
                        description: "Morning meal",
                        included: true,
                        details: ["3 days"]
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
                        title: "Indonesia - E-visa - Tourist / Single Entry / E-Visa",
                        description: "Electronic visa for Indonesia",
                        included: false
                      }
                    ],
                    travelInsurance: [
                      {
                        id: "insurance-1",
                        title: "Travel Insurance (covering Medical, Baggage Loss, Flight Cancellations or Delays) - Only for Age Below 60 Yrs",
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
              {proposal && (
                <EnhancedPriceBreakdown
                  proposal={{
                    id: proposal.id || "128",
                    totalPriceCents: 11258600,
                    estimatedDateOfBooking: "2025-09-24",
                    trip: {
                      totalTravelers: 2,
                      fromCity: { name: "Gurgaon" },
                      nationality: { name: "India" }
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
