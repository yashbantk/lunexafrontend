"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { TopBar } from "@/components/proposals/TopBar"
import { ProposalHeader } from "@/components/proposals/ProposalHeader"
import { FlightCard } from "@/components/proposals/FlightCard"
import { HotelCard } from "@/components/proposals/HotelCard"
import { DayAccordion } from "@/components/proposals/DayAccordion"
import { PriceSummary } from "@/components/proposals/PriceSummary"
import { AddEditModal } from "@/components/proposals/AddEditModal"
import HotelSelectModal from "@/components/hotels/HotelSelectModal"
import ActivityExplorerModal from "@/components/activities/ActivityExplorerModal"
import { Proposal, Day, Flight, Hotel, Activity, PriceBreakdown } from "@/types/proposal"
import { Hotel as HotelType } from "@/types/hotel"
import { Activity as ActivityType, ActivitySelection } from "@/types/activity"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateItineraryProposalResponse } from "@/hooks/useCreateItineraryProposal"

export default function CreateProposalPage() {
  const params = useParams()
  const tripId = params.id as string
  
  // Use local state instead of useProposal hook to avoid hardcoded data
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'flight' | 'hotel' | 'activity' | 'day'>('flight')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isHotelSelectOpen, setIsHotelSelectOpen] = useState(false)
  const [editingHotelIndex, setEditingHotelIndex] = useState<number | null>(null)
  const [isActivityExplorerOpen, setIsActivityExplorerOpen] = useState(false)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)
  
  // State for the proposal data from the mutation response
  const [proposalData, setProposalData] = useState<CreateItineraryProposalResponse['createItineraryProposal'] | null>(null)
  const [hasLoadedData, setHasLoadedData] = useState(false)

  // Local functions for proposal management
  const updateProposal = (updatedProposal: Proposal) => {
    setProposal(updatedProposal)
  }

  const saveProposal = useCallback(async (proposalToSave: Proposal | null) => {
    if (!proposalToSave) return
    
    try {
      // Simulate API call
      console.log('Saving proposal:', proposalToSave)
      // In real implementation, this would be an API call
      // await api.saveProposal(proposalToSave)
    } catch (error) {
      console.error('Error saving proposal:', error)
    }
  }, [])

  // Convert GraphQL response data to Proposal format
  const convertToProposalFormat = (data: CreateItineraryProposalResponse['createItineraryProposal']): Proposal => {
    const { trip, destinations, days, stays } = data
    
    // Convert destinations to a simple string format for the proposal
    const destinationString = destinations.map(dest => `${dest.destination.title} (${dest.numberOfDays} days)`).join(', ')
    
    // Convert days to the existing Day format
    const convertedDays: Day[] = days.map(day => ({
      id: day.id,
      dayNumber: day.dayNumber,
      date: day.date,
      title: `Day ${day.dayNumber} - ${day.city.name}`,
      summary: day.stay ? `Stay at ${day.stay.roomsCount} room(s) for ${day.stay.nights} nights` : '',
      activities: day.activityBookings.map(activity => ({
        id: activity.id,
        title: activity.activity.title,
        description: `Duration: ${activity.activity.durationMinutes} minutes`,
        time: activity.slot || 'TBD',
        duration: `${activity.activity.durationMinutes} minutes`,
        price: (activity.priceBaseCents + activity.priceAddonsCents) / 100,
        currency: trip.currency.code,
        type: 'morning' as const,
        included: false
      })),
      accommodation: day.stay ? `${day.stay.roomsCount} room(s)` : undefined,
      transfers: [],
      meals: {
        breakfast: day.stay?.mealPlan?.toLowerCase().includes('breakfast') || false,
        lunch: day.stay?.mealPlan?.toLowerCase().includes('lunch') || false,
        dinner: day.stay?.mealPlan?.toLowerCase().includes('dinner') || false
      }
    }))
    
    // Convert stays to Hotel format
    const convertedHotels: Hotel[] = stays.map(stay => ({
      id: stay.id,
      name: stay.room.hotel.name,
      address: stay.room.hotel.address,
      rating: stay.room.hotel.star,
      starRating: stay.room.hotel.star,
      image: '/api/placeholder/300/200', // Placeholder image
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      roomType: stay.room.name,
      boardBasis: stay.mealPlan,
      bedType: stay.room.bedType,
      nights: stay.nights,
      refundable: true,
      pricePerNight: stay.priceTotalCents / 100 / stay.nights, // Use total price divided by nights
      currency: trip.currency.code,
      confirmationStatus: stay.confirmationStatus
    }))
    
    // Create a basic price breakdown using actual data
    const totalPrice = convertedHotels.reduce((sum, hotel) => sum + (hotel.pricePerNight * hotel.nights), 0)
    const markupPercent = parseFloat(trip.markupLandPercent?.toString() || '0') || 0
    const priceBreakdown: PriceBreakdown = {
      pricePerAdult: totalPrice / trip.totalTravelers,
      pricePerChild: totalPrice / trip.totalTravelers * 0.7, // 70% of adult price
      subtotal: totalPrice,
      taxes: totalPrice * 0.1, // 10% tax
      markup: totalPrice * (markupPercent / 100),
      total: totalPrice * 1.1 + (totalPrice * (markupPercent / 100)),
      currency: trip.currency.code
    }
    
    return {
      id: trip.id,
      tripName: `${trip.fromCity.name} to ${destinations.map(d => d.destination.title).join(', ')}`,
      fromDate: trip.startDate.split('T')[0],
      toDate: trip.endDate.split('T')[0],
      origin: trip.fromCity.name,
      nationality: trip.nationality.name,
      starRating: trip.starRating?.toString() || '3',
      landOnly: trip.landOnly,
      addTransfers: !trip.transferOnly,
      rooms: stays.length > 0 ? stays[0].roomsCount : 1, // Use actual rooms count from stays
      adults: trip.travelerDetails?.adults || 2,
      children: trip.travelerDetails?.children || 0,
      clientName: trip.customer?.name || '',
      clientEmail: trip.customer?.email || '',
      clientPhone: trip.customer?.phone || '',
      internalNotes: trip.travelerDetails?.specialRequests || '',
      salesperson: trip.createdBy?.firstName + ' ' + trip.createdBy?.lastName || '',
      validityDays: 7,
      markupPercent: trip.markupLandPercent,
      currency: trip.currency.code,
      flights: [], // Empty for now
      hotels: convertedHotels,
      days: convertedDays,
      priceBreakdown,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      // Additional fields for better data display
      tripStatus: trip.status,
      tripType: trip.tripType,
      totalTravelers: trip.totalTravelers,
      durationDays: trip.durationDays,
      destinations: destinations.map(dest => ({
        id: dest.id,
        name: dest.destination.title,
        numberOfDays: dest.numberOfDays,
        order: dest.order
      }))
    }
  }

  // Load proposal data from sessionStorage on component mount
  useEffect(() => {
    if (hasLoadedData) return // Prevent multiple loads
    
    const loadProposalData = () => {
      try {
        // First try to get from sessionStorage
        let storedData = sessionStorage.getItem('proposalData')
        
        // If no data in sessionStorage, use the provided JSON data for testing
        if (!storedData) {
          const testData = {
            "trip": {
              "id": "42",
              "org": null,
              "createdBy": {
                "id": "1",
                "email": "abhiyadav2345@gmail.com",
                "firstName": "",
                "lastName": ""
              },
              "customer": null,
              "fromCity": {
                "id": "3",
                "name": "Mumbai",
                "country": {
                  "iso2": "IN",
                  "name": "IN"
                }
              },
              "startDate": "2025-09-19T22:30:00",
              "endDate": "2025-09-20T22:30:00",
              "durationDays": 1,
              "nationality": {
                "iso2": "IN",
                "name": "IN"
              },
              "status": "draft",
              "tripType": "leisure",
              "totalTravelers": 2,
              "starRating": "3.0",
              "transferOnly": false,
              "landOnly": false,
              "travelerDetails": {
                "adults": 2,
                "children": 0,
                "specialRequests": null
              },
              "currency": {
                "code": "USD",
                "name": "US Dollar"
              },
              "markupFlightPercent": "0",
              "markupLandPercent": "0",
              "bookingReference": null,
              "createdAt": "2025-09-17T17:00:34.106758+00:00",
              "updatedAt": "2025-09-17T17:00:34.106764+00:00"
            },
            "destinations": [
              {
                "id": "44",
                "numberOfDays": 1,
                "destination": {
                  "id": "2",
                  "title": "Miami",
                  "description": "",
                  "heroImageUrl": "https://f49b62996ffc.ngrok-free.app/admin/core/destination/add/",
                  "highlights": []
                },
                "order": 1
              }
            ],
            "days": [
              {
                "id": "83",
                "dayNumber": 1,
                "date": "2025-09-19T00:00:00",
                "city": {
                  "id": "2",
                  "name": "Miami",
                  "timezone": "America/New_York"
                },
                "stay": {
                  "id": "30",
                  "checkIn": "2025-09-19",
                  "checkOut": "2025-09-20",
                  "nights": 1,
                  "roomsCount": 1,
                  "mealPlan": "Product",
                  "priceTotalCents": 312,
                  "confirmationStatus": "pending"
                },
                "activityBookings": []
              }
            ],
            "stays": [
              {
                "id": "30",
                "checkIn": "2025-09-19",
                "checkOut": "2025-09-20",
                "nights": 1,
                "roomsCount": 1,
                "mealPlan": "Product",
                "priceTotalCents": 312,
                "confirmationStatus": "pending",
                "room": {
                  "id": "8",
                  "name": "Luxury Room",
                  "priceCents": 312,
                  "bedType": "das",
                  "maxOccupancy": 3,
                  "hotel": {
                    "id": "5",
                    "name": "Miami Hotel",
                    "address": "dsada",
                    "star": 3
                  }
                }
              }
            ]
          }
          storedData = JSON.stringify(testData)
          // Store in sessionStorage for future use
          sessionStorage.setItem('proposalData', storedData)
        }
        
        const parsedData = JSON.parse(storedData)
        console.log('Parsed data:', parsedData)
        setProposalData(parsedData)
        
        // Convert the data to the existing proposal format and update the proposal
        const convertedProposal = convertToProposalFormat(parsedData)
        updateProposal(convertedProposal)
        setHasLoadedData(true)
        setIsLoading(false) // Set loading to false when data is loaded
        
        console.log('Loaded and converted proposal data:', convertedProposal)
      } catch (error) {
        console.error('Error loading proposal data:', error)
        setIsLoading(false) // Set loading to false even on error
      }
    }

    loadProposalData()
  }, [hasLoadedData]) // Removed updateProposal from dependencies

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (proposal) {
        saveProposal(proposal)
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [proposal, saveProposal])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        saveProposal(proposal)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [proposal, saveProposal])

  const handleAddItem = (type: 'flight' | 'hotel' | 'activity' | 'day') => {
    setModalType(type)
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEditItem = (type: 'flight' | 'hotel' | 'activity' | 'day', item: any) => {
    setModalType(type)
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleFieldChange = (field: string, value: any) => {
    if (!proposal) return
    updateProposal({
      ...proposal,
      [field]: value
    })
  }

  const handleHotelSelect = (hotel: HotelType, room: any) => {
    if (!proposal) return

    // Convert hotel type to proposal hotel type
    const proposalHotel: Hotel = {
      id: hotel.id,
      name: hotel.name,
      image: hotel.images[0],
      rating: hotel.rating,
      starRating: hotel.starRating,
      address: hotel.address,
      checkIn: proposal.hotels[editingHotelIndex || 0]?.checkIn || new Date().toISOString(),
      checkOut: proposal.hotels[editingHotelIndex || 0]?.checkOut || new Date().toISOString(),
      roomType: room.name,
      boardBasis: room.board,
      bedType: room.bedType,
      nights: proposal.hotels[editingHotelIndex || 0]?.nights || 1,
      pricePerNight: room.pricePerNight,
      refundable: room.refundable,
      currency: 'INR'
    }

    if (editingHotelIndex !== null) {
      // Update existing hotel
      const updatedHotels = [...proposal.hotels]
      updatedHotels[editingHotelIndex] = proposalHotel
      updateProposal({
        ...proposal,
        hotels: updatedHotels
      })
    } else {
      // Add new hotel
      updateProposal({
        ...proposal,
        hotels: [...proposal.hotels, proposalHotel]
      })
    }

    setIsHotelSelectOpen(false)
    setEditingHotelIndex(null)
  }

  const handleChangeHotel = (index: number) => {
    setEditingHotelIndex(index)
    setIsHotelSelectOpen(true)
  }

  const handleActivitySelect = (activity: ActivityType, selection: ActivitySelection) => {
    if (!proposal) return

    // Convert activity selection to proposal activity
    const proposalActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: activity.title,
      description: activity.shortDesc,
      duration: `${Math.floor(activity.durationMins / 60)}h ${activity.durationMins % 60}m`,
      price: selection.totalPrice,
      currency: 'INR',
      time: selection.scheduleSlot.startTime,
      type: selection.scheduleSlot.type === 'full-day' ? 'morning' : selection.scheduleSlot.type as 'morning' | 'afternoon' | 'evening',
      included: activity.included.length > 0
    }

    // Add to the specific day or create a new day
    if (editingDayIndex !== null) {
      const updatedDays = [...proposal.days]
      updatedDays[editingDayIndex] = {
        ...updatedDays[editingDayIndex],
        activities: [...(updatedDays[editingDayIndex].activities || []), proposalActivity]
      }
      updateProposal({
        ...proposal,
        days: updatedDays
      })
    } else {
      // Add to first day or create a new day
      if (proposal.days.length > 0) {
        const updatedDays = [...proposal.days]
        updatedDays[0] = {
          ...updatedDays[0],
          activities: [...(updatedDays[0].activities || []), proposalActivity]
        }
        updateProposal({
          ...proposal,
          days: updatedDays
        })
      } else {
        // Create a new day with the activity
        const newDay: Day = {
          id: `day-${Date.now()}`,
          dayNumber: 1,
          date: new Date().toISOString(),
          title: 'Day 1',
          summary: '',
          activities: [proposalActivity],
          transfers: [],
          meals: {
            breakfast: false,
            lunch: false,
            dinner: false
          },
          arrival: {
            flight: '',
            time: '',
            description: '',
            date: new Date().toISOString()
          },
          departure: {
            flight: '',
            time: '',
            description: '',
            date: new Date().toISOString()
          }
        }
        updateProposal({
          ...proposal,
          days: [...proposal.days, newDay]
        })
      }
    }

    setIsActivityExplorerOpen(false)
    setEditingDayIndex(null)
  }

  const handleAddActivity = (dayIndex?: number) => {
    setEditingDayIndex(dayIndex !== undefined ? dayIndex : null)
    setIsActivityExplorerOpen(true)
  }

  const handleSaveItem = (item: any) => {
    if (!proposal) return
    
    if (editingItem) {
      // Update existing item
      const updatedProposal = { ...proposal }
      const arrayKey = `${modalType}s` as keyof Proposal
      if (Array.isArray(updatedProposal[arrayKey])) {
        (updatedProposal[arrayKey] as any[]) = (updatedProposal[arrayKey] as any[]).map((i: any) => 
          i.id === editingItem.id ? { ...i, ...item } : i
        )
      }
      updateProposal(updatedProposal)
    } else {
      // Add new item
      const updatedProposal = { ...proposal }
      const arrayKey = `${modalType}s` as keyof Proposal
      if (Array.isArray(updatedProposal[arrayKey])) {
        (updatedProposal[arrayKey] as any[]) = [...(updatedProposal[arrayKey] as any[]), { ...item, id: Date.now().toString() }]
      }
      updateProposal(updatedProposal)
    }
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal data...</p>
        </div>
      </div>
    )
  }

  if (!proposalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Proposal Data Found</h2>
          <p className="text-gray-600 mb-6">The proposal data could not be loaded. Please try creating a new proposal.</p>
          <button 
            onClick={() => window.location.href = '/proposal'}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create New Proposal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <TopBar 
        totalPrice={proposal?.priceBreakdown?.total || 0}
        currency={proposal?.currency || 'USD'}
        adults={proposal?.adults || 2}
        childrenCount={proposal?.children || 0}
        onSaveDraft={() => saveProposal(proposal)}
      />
      
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProposalHeader 
                proposal={proposal}
                onUpdate={updateProposal}
              />
             </motion.div>

             {/* Destination Details */}
             {proposal?.destinations && proposal.destinations.length > 0 && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.05 }}
               >
                 <div className="bg-white rounded-2xl shadow-xl p-6">
                   <h2 className="text-xl font-semibold text-gray-900 mb-4">Destination Details</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {proposal.destinations.map((destination, index) => (
                       <div key={destination.id} className="p-4 border border-gray-200 rounded-lg">
                         <div className="flex items-center justify-between mb-2">
                           <h3 className="font-medium text-gray-900">{destination.name}</h3>
                           <span className="text-sm text-gray-500">#{destination.order}</span>
                         </div>
                         <div className="text-sm text-gray-600">
                           {destination.numberOfDays} {destination.numberOfDays === 1 ? 'day' : 'days'}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </motion.div>
             )}

             {/* Date Availability Calendar
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.05 }}
             >
               <div className="bg-white rounded-2xl shadow-xl p-6">
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Near by travel dates with special price</h2>
                 <div className="grid grid-cols-7 gap-2">
                   {Array.from({ length: 14 }, (_, i) => {
                     const date = new Date(2025, 9, 8 + i) // October 8-21, 2025
                     const isSelected = i === 6 // Sunday, 19 Oct
                     const isWeekend = date.getDay() === 0 || date.getDay() === 6
                     
                     return (
                       <div key={i} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
                         isSelected 
                           ? 'bg-primary text-white' 
                           : isWeekend 
                             ? 'bg-gray-100 hover:bg-gray-200' 
                             : 'bg-white hover:bg-gray-50 border border-gray-200'
                       }`}>
                         <div className="text-xs font-medium">
                           {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                         </div>
                         <div className="text-sm font-semibold mt-1">
                           {date.getDate()}
                         </div>
                         <div className="text-xs mt-1">
                           {date.toLocaleDateString('en-US', { month: 'short' })}
                         </div>
                         {!isSelected && (
                           <div className="mt-2">
                             <div className="text-xs text-gray-500 mb-1">Special Price</div>
                             <button className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90">
                               Check Price
                             </button>
                           </div>
                         )}
                         {isSelected && (
                           <div className="mt-2 text-xs">Selected Date</div>
                         )}
                       </div>
                     )
                   })}
                 </div>
               </div>
             </motion.div> */}

             {/* Flights Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Flights</h2>
                  <button
                    onClick={() => handleAddItem('flight')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    + Add Flight
                  </button>
                </div>
                <div className="space-y-4">
                  {proposal?.flights?.map((flight, index) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      onEdit={() => handleEditItem('flight', flight)}
                      onRemove={() => {
                        if (!proposal) return
                        updateProposal({
                          ...proposal,
                          flights: proposal.flights.filter((f: Flight) => f.id !== flight.id)
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Hotels Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Hotels</h2>
                  <button
                    onClick={() => {
                      setEditingHotelIndex(null)
                      setIsHotelSelectOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    + Add Hotel
                  </button>
                </div>
                <div className="space-y-4">
                  {proposal?.hotels?.map((hotel, index) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onEdit={() => handleChangeHotel(index)}
                      onRemove={() => {
                        if (!proposal) return
                        updateProposal({
                          ...proposal,
                          hotels: proposal.hotels.filter((h: Hotel) => h.id !== hotel.id)
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Day-by-Day Itinerary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
                  <button
                    onClick={() => handleAddItem('day')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    + Add Day
                  </button>
                </div>
                <div className="space-y-4">
                  {proposal?.days?.map((day, index) => (
                    <DayAccordion
                      key={day.id}
                      day={day}
                      onEdit={() => handleEditItem('day', day)}
                      onRemove={() => {
                        if (!proposal) return
                        updateProposal({
                          ...proposal,
                          days: proposal.days.filter((d: Day) => d.id !== day.id)
                        })
                      }}
                      onAddActivity={() => handleAddActivity(index)}
                    />
                  ))}
                </div>
               </div>
             </motion.div>

             {/* Optional Sections */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
             >
               <div className="bg-white rounded-2xl shadow-xl p-6">
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Services</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Visa Section */}
                   <div className="space-y-4">
                     <h3 className="font-medium text-gray-900">Visa</h3>
                     <div className="p-4 border border-gray-200 rounded-lg">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="font-medium text-gray-900">Indonesia - E-visa</div>
                           <div className="text-sm text-gray-600">Tourist / Single Entry / E-Visa</div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <span className="text-sm text-red-600 font-medium">Not Included</span>
                           <button className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
                             + ADD
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Travel Insurance Section */}
                   <div className="space-y-4">
                     <h3 className="font-medium text-gray-900">Travel Insurance</h3>
                     <div className="p-4 border border-gray-200 rounded-lg">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="font-medium text-gray-900">Comprehensive Travel Insurance</div>
                           <div className="text-sm text-gray-600">Coverage for medical, trip cancellation, and baggage</div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <span className="text-sm text-red-600 font-medium">Not Included</span>
                           <button className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
                             + ADD
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </motion.div>

             {/* Proposal Metadata */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.5 }}
             >
               <div className="bg-white rounded-2xl shadow-xl p-6">
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposal Details</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="clientName">Client Name</Label>
                     <Input
                       id="clientName"
                       value={proposal?.clientName || ''}
                       onChange={(e) => handleFieldChange('clientName', e.target.value)}
                       placeholder="Enter client name"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="clientEmail">Client Email</Label>
                     <Input
                       id="clientEmail"
                       type="email"
                       value={proposal?.clientEmail || ''}
                       onChange={(e) => handleFieldChange('clientEmail', e.target.value)}
                       placeholder="Enter client email"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="clientPhone">Client Phone</Label>
                     <Input
                       id="clientPhone"
                       value={proposal?.clientPhone || ''}
                       onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
                       placeholder="Enter client phone"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="salesperson">Salesperson</Label>
                     <Input
                       id="salesperson"
                       value={proposal?.salesperson || ''}
                       onChange={(e) => handleFieldChange('salesperson', e.target.value)}
                       placeholder="Enter salesperson name"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="validityDays">Validity (Days)</Label>
                     <Input
                       id="validityDays"
                       type="number"
                       value={proposal?.validityDays || 7}
                       onChange={(e) => handleFieldChange('validityDays', parseInt(e.target.value))}
                       placeholder="7"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="markupPercent">Markup %</Label>
                     <Input
                       id="markupPercent"
                       type="number"
                       value={proposal?.markupPercent || 5}
                       onChange={(e) => handleFieldChange('markupPercent', parseFloat(e.target.value))}
                       placeholder="5"
                     />
                   </div>
                 </div>
                 <div className="mt-4">
                   <Label htmlFor="internalNotes">Internal Notes</Label>
                   <Textarea
                     id="internalNotes"
                     value={proposal?.internalNotes || ''}
                     onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
                     placeholder="Add any internal notes or special instructions..."
                     rows={3}
                   />
                 </div>
               </div>
             </motion.div>
           </div>

           {/* Right Column - Price Summary */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-24"
            >
              <PriceSummary
                proposal={proposal}
                onSaveProposal={() => saveProposal(proposal)}
                onExportPDF={() => window.print()}
                onPreview={() => console.log('Preview proposal')}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        item={editingItem}
        onSave={handleSaveItem}
        proposal={proposal || undefined}
      />

      {/* Hotel Selection Modal */}
      <HotelSelectModal
        isOpen={isHotelSelectOpen}
        onClose={() => {
          setIsHotelSelectOpen(false)
          setEditingHotelIndex(null)
        }}
        onSelectHotel={handleHotelSelect}
        currentHotel={undefined}
        stayId="stay-1"
        checkIn={proposal?.hotels[editingHotelIndex || 0]?.checkIn || new Date().toISOString()}
        checkOut={proposal?.hotels[editingHotelIndex || 0]?.checkOut || new Date().toISOString()}
        nights={proposal?.hotels[editingHotelIndex || 0]?.nights || 1}
        adults={2}
        childrenCount={0}
      />

      {/* Activity Explorer Modal */}
      <ActivityExplorerModal
        isOpen={isActivityExplorerOpen}
        onClose={() => {
          setIsActivityExplorerOpen(false)
          setEditingDayIndex(null)
        }}
        onSelectActivity={handleActivitySelect}
        dayId={editingDayIndex !== null ? proposal?.days[editingDayIndex]?.id || 'day-1' : 'day-1'}
        mode="add"
      />
    </div>
  )
}
