"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ProposalHeader } from "@/components/proposals/ProposalHeader"
import { FlightCard } from "@/components/proposals/FlightCard"
import { HotelCard } from "@/components/proposals/HotelCard"
import { DayAccordion } from "@/components/proposals/DayAccordion"
import { PriceSummary } from "@/components/proposals/PriceSummary"
import { AddEditModal } from "@/components/proposals/AddEditModal"
import HotelSelectModal from "@/components/hotels/HotelSelectModal"
import HotelDetailsModal from "@/components/hotels/HotelDetailsModal"
import { SplitStayManager } from "@/components/hotels/SplitStayManager"
import ActivityExplorerModal from "@/components/activities/ActivityExplorerModal"
import ActivityDetailsModal from "@/components/activities/ActivityDetailsModal"
import TransferExplorerModal from "@/components/transfers/TransferExplorerModal"
import TransferDetailsModal from "@/components/transfers/TransferDetailsModal"
import { Proposal, Day, Flight, Hotel, Activity, PriceBreakdown } from "@/types/proposal"
import { Hotel as HotelType } from "@/types/hotel"
import { Activity as ActivityType, ActivitySelection } from "@/types/activity"
import { TransferProduct, TransferSelection } from "@/types/transfer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateItineraryProposalResponse } from "@/hooks/useCreateItineraryProposal"
import { useActivityBooking, ActivityBookingInput, ActivityBookingResponse } from "@/hooks/useActivityBooking"
import { useTransferBooking, TransferBookingInput } from "@/hooks/useTransferBooking"
import { useTrip, TripData } from "@/hooks/useTrip"
import { useCreateProposal, ProposalInput } from "@/hooks/useCreateProposal"
import { useUpdateProposal, ProposalPartialInput } from "@/hooks/useUpdateProposal"
import { useLazyQuery } from "@apollo/client/react"
import { GET_TRIP_PROPOSALS } from "@/graphql/queries/proposal"
import { useDeleteTripStay } from "@/hooks/useDeleteTripStay"
import { useCreateTripStay } from "@/hooks/useCreateTripStay"
import { useUpdateTripStays, TripStayPartialInput } from "@/hooks/useUpdateTripStays"
import { 
  filterActivitiesBySlot, 
  filterActivitiesByStartTime, 
  hasTimeConflict, 
  getBlockedTimeSlots,
  getAvailableTimeSlots,
  calculateEndTime,
  DaySlot,
  ActivityTimeBlock
} from "@/lib/utils/activitySlotFilter"

export default function CreateProposalPage() {
  const params = useParams()
  const tripId = params.id as string
  
  // Use local state instead of useProposal hook to avoid hardcoded data
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const proposalRef = useRef<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'flight' | 'hotel' | 'activity' | 'day'>('flight')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isHotelSelectOpen, setIsHotelSelectOpen] = useState(false)
  const [editingHotelIndex, setEditingHotelIndex] = useState<number | null>(null)
  const [editingHotelDayId, setEditingHotelDayId] = useState<string | null>(null)
  const [isHotelDetailsOpen, setIsHotelDetailsOpen] = useState(false)
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<Hotel | null>(null)
  const [selectedHotelDayId, setSelectedHotelDayId] = useState<string | null>(null)
  const [isActivityExplorerOpen, setIsActivityExplorerOpen] = useState(false)
  const [isActivityDetailsOpen, setIsActivityDetailsOpen] = useState(false)
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<Activity | null>(null)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)
  const [editingActivityBookingId, setEditingActivityBookingId] = useState<string | null>(null)
  const [isTransferExplorerOpen, setIsTransferExplorerOpen] = useState(false)
  const [isTransferDetailsOpen, setIsTransferDetailsOpen] = useState(false)
  const [selectedTransferForDetails, setSelectedTransferForDetails] = useState<TransferProduct | null>(null)
  const [editingTransferBookingId, setEditingTransferBookingId] = useState<string | null>(null)
  
  // Split Stay state - with persistence
  const [isSplitStayEnabled, setIsSplitStayEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`splitStayEnabled_${tripId}`)
      return saved === 'true'
    }
    return false
  })
  const [splitStaySegments, setSplitStaySegments] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`splitStaySegments_${tripId}`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return []
        }
      }
    }
    return []
  })
  
  // Activity slot filtering state
  const [selectedSlot, setSelectedSlot] = useState<DaySlot | null>(null)
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<ActivityTimeBlock[]>([])
  
  // Trip data hook
  const { trip, loading: tripLoading, error: tripError, refetch: refetchTrip, notFound } = useTrip(tripId)
  
  // Activity booking hook
  const { createActivityBooking, deleteActivityBooking, isLoading: isCreatingActivityBooking } = useActivityBooking()
  
  // Transfer booking hook
  const { createTransfer, deleteTransfer, isLoading: isCreatingTransfer } = useTransferBooking()
  
  // Proposal creation hook
  const { createProposalAndRedirect, isLoading: isCreatingProposal } = useCreateProposal()
  
  // Proposal update hook
  const { updateProposalAndRedirect, isLoading: isUpdatingProposal } = useUpdateProposal()
  
  // Router for navigation
  const router = useRouter()
  
  // Lazy query for fetching existing proposals
  const [fetchTripProposals] = useLazyQuery<{ proposals: Array<{ id: string; version: number; name: string; status: string; flightsMarkup?: number | null; landMarkup?: number | null; landMarkupType?: string | null; createdAt: string; updatedAt: string }> }>(GET_TRIP_PROPOSALS)
  
  // Delete trip stay hook
  const { deleteTripStay, isLoading: isDeletingTripStay } = useDeleteTripStay()
  
  // Create trip stay hook
  const { createTripStay, isLoading: isCreatingTripStay } = useCreateTripStay()
  
  // Update trip stays hook
  const { updateTripStays, isLoading: isUpdatingTripStays } = useUpdateTripStays()

  // Utility function to get currency symbol
  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: Record<string, string> = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AED': 'د.إ',
      'SAR': 'ر.س'
    }
    return symbols[currencyCode] || currencyCode
  }

  // Local functions for proposal management
  const updateProposal = (updatedProposal: Proposal) => {
    setProposal(updatedProposal)
  }

  // Price calculation utility function
  const calculatePriceBreakdown = (proposal: Proposal): PriceBreakdown => {
    // Calculate hotel costs
    const hotelCosts = proposal.hotels.reduce((sum, hotel) => {
      return sum + (hotel.pricePerNight * hotel.nights)
    }, 0)

    // Calculate flight costs (if any)
    const flightCosts = proposal.flights.reduce((sum, flight) => {
      return sum + flight.price
    }, 0)

    // Calculate activity costs
    const activityCosts = proposal.days.reduce((sum, day) => {
      return sum + day.activities.reduce((daySum, activity) => {
        return daySum + (activity.price || 0)
      }, 0)
    }, 0)

    // Calculate subtotal
    const subtotal = hotelCosts + flightCosts + activityCosts

    // Calculate taxes (10%)
    const taxes = subtotal * 0.1

    // Calculate markup using land markup percentage
    const markupPercent = proposal.markupLandPercent || 0
    const markup = subtotal * (markupPercent / 100)

    // Calculate total
    const total = subtotal + taxes + markup

    // Calculate per-person prices
    const totalTravelers = proposal.adults + proposal.children
    const pricePerAdult = totalTravelers > 0 ? total / totalTravelers : 0
    const pricePerChild = totalTravelers > 0 ? (total / totalTravelers) * 0.7 : 0

    return {
      pricePerAdult,
      pricePerChild,
      subtotal,
      taxes,
      markup,
      total,
      currency: proposal.currency
    }
  }

  // Update proposal with recalculated prices
  const updateProposalWithPrices = (updatedProposal: Proposal) => {
    const recalculatedPrices = calculatePriceBreakdown(updatedProposal)
    const proposalWithUpdatedPrices = {
      ...updatedProposal,
      priceBreakdown: recalculatedPrices
    }
    setProposal(proposalWithUpdatedPrices)
    proposalRef.current = proposalWithUpdatedPrices
  }

  const saveProposal = useCallback(async (proposalToSave: Proposal | null) => {
    console.log('saveProposal called - this should only happen when user clicks "Save as Proposal"')
    
    if (!proposalToSave || !trip) {
      console.error('No proposal or trip data available')
      return
    }
    
    // Calculate total price from proposal
    const totalPriceCents = proposalToSave.priceBreakdown?.total 
      ? Math.round(proposalToSave.priceBreakdown.total * 100)
      : 0
    
    // Prepare common data
    const proposalName = proposalToSave.tripName || `Proposal for ${trip.fromCity.name}`
    const flightsMarkup = Number(proposalToSave.markupFlightPercent) || 0
    const landMarkup = Number(proposalToSave.markupLandPercent) || 0
    
    // First, try to update existing proposal
    let updateSuccess = false
    try {
      console.log('Attempting to update proposal first...')
      
      // Check if a proposal already exists for this trip
      const { data } = await fetchTripProposals({
        variables: { tripId: trip.id }
      })
      
      let existingProposal = null
      if (data?.proposals && data.proposals.length > 0) {
        // Get the first (most recent) proposal - sort by createdAt desc if available
        existingProposal = data.proposals.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })[0]
      }
      
      if (existingProposal?.id) {
        // Try to update existing proposal
        console.log('Found existing proposal, attempting to update:', existingProposal.id)
        
        const updateData: ProposalPartialInput = {
          id: existingProposal.id,
          name: proposalName,
          status: 'draft',
          currency: { set: trip.currency?.code || 'INR' },
          totalPriceCents,
          estimatedDateOfBooking: new Date().toISOString(),
          areFlightsBooked: false,
          flightsMarkup,
          landMarkup,
          landMarkupType: 'percentage'
        }
        
        console.log('Updating proposal with data:', updateData)
        const updateResult = await updateProposalAndRedirect(updateData)
        
        // If update was successful, we're done
        if (updateResult) {
          console.log('Proposal updated successfully')
          updateSuccess = true
          return
        }
      } else {
        console.log('No existing proposal found, will create new one')
      }
    } catch (updateError: any) {
      console.log('Update failed, will create new proposal:', updateError?.message)
      // Continue to create new proposal below
    }
    
    // If update failed or no proposal exists, create a new one
    if (!updateSuccess) {
      try {
        console.log('Creating new proposal...')
        
        const proposalData: ProposalInput = {
          trip: trip.id, // Required - Trip ID
          name: proposalName, // Optional - Proposal name
          status: 'draft', // Optional - Proposal status
          currency: 'INR', // Optional - Currency code
          totalPriceCents, // Optional - Total price in cents
          estimatedDateOfBooking: new Date().toISOString(), // Optional - Estimated booking date
          areFlightsBooked: false, // Optional - Whether flights are booked
          flightsMarkup, // Optional - Flight markup percentage
          landMarkup, // Optional - Land markup percentage
          landMarkupType: 'percentage' // Optional - Land markup type
          // version will be automatically determined by the hook
        }
        
        console.log('Creating proposal with data:', proposalData)
        await createProposalAndRedirect(proposalData)
      } catch (createError: any) {
        console.error('Error creating proposal:', createError)
        // Error handling is done in the hooks
      }
    }
  }, [trip, createProposalAndRedirect, updateProposalAndRedirect, fetchTripProposals])

  const handlePreviewProposal = useCallback(async (proposalToPreview: Proposal | null) => {
    console.log('handlePreviewProposal called')
    
    if (!proposalToPreview || !trip) {
      console.error('No proposal or trip data available')
      return
    }
    
    try {
      // First, check if a proposal already exists for this trip
      const { data } = await fetchTripProposals({
        variables: { tripId: trip.id }
      })
      
      if (data?.proposals && data.proposals.length > 0) {
        // Get the most recent proposal - sort by createdAt desc
        const existingProposal = data.proposals.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })[0]
        
        console.log('Found existing proposal, redirecting to:', existingProposal.id)
        // Redirect to the existing proposal
        router.push(`/proposal/${existingProposal.id}`)
      } else {
        // No existing proposal, create one first and then redirect
        console.log('No existing proposal found, creating one for preview...')
        
        // Calculate total price from proposal
        const totalPriceCents = proposalToPreview.priceBreakdown?.total 
          ? Math.round(proposalToPreview.priceBreakdown.total * 100)
          : 0
        
        // Prepare proposal data
        const proposalData: ProposalInput = {
          trip: trip.id,
          name: proposalToPreview.tripName || `Proposal for ${trip.fromCity.name}`,
          status: 'draft',
          currency: 'INR',
          totalPriceCents,
          estimatedDateOfBooking: new Date().toISOString(),
          areFlightsBooked: false,
          flightsMarkup: Number(proposalToPreview.markupFlightPercent) || 0,
          landMarkup: Number(proposalToPreview.markupLandPercent) || 0,
          landMarkupType: 'percentage'
        }
        
        // Create proposal and redirect
        await createProposalAndRedirect(proposalData)
      }
    } catch (error: any) {
      console.error('Error in handlePreviewProposal:', error)
      
      // If creation fails, try to fetch existing proposals again
      try {
        const { data } = await fetchTripProposals({
          variables: { tripId: trip.id }
        })
        
        if (data?.proposals && data.proposals.length > 0) {
          const existingProposal = data.proposals.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA
          })[0]
          
          router.push(`/proposal/${existingProposal.id}`)
        }
      } catch (fetchError) {
        console.error('Error fetching existing proposals in preview:', fetchError)
      }
    }
  }, [trip, router, fetchTripProposals, createProposalAndRedirect])

  // Restore split stay state from localStorage when trip loads
  // Also sync with actual trip stay data if available
  useEffect(() => {
    if (trip && typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem(`splitStayEnabled_${tripId}`)
      if (savedEnabled === 'true') {
        setIsSplitStayEnabled(true)
      }
      
      const savedSegments = localStorage.getItem(`splitStaySegments_${tripId}`)
      if (savedSegments) {
        try {
          const parsed = JSON.parse(savedSegments)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Sync segments with actual trip stay data if available
            const syncedSegments = parsed.map((segment: any) => {
              if (segment.hotel && trip.days && trip.days.length > 0) {
                // Try to find matching day and update hotel info from trip data
                const segmentStartDate = new Date(segment.startDate)
                segmentStartDate.setHours(0, 0, 0, 0)
                const segmentEndDate = new Date(segment.endDate)
                segmentEndDate.setHours(0, 0, 0, 0)
                
                const sortedDays = [...trip.days].sort((a, b) => {
                  if (a.dayNumber !== undefined && b.dayNumber !== undefined) {
                    return a.dayNumber - b.dayNumber
                  }
                  return new Date(a.date).getTime() - new Date(b.date).getTime()
                })
                
                const matchingDay = sortedDays.find((day) => {
                  const dayDate = new Date(day.date)
                  dayDate.setHours(0, 0, 0, 0)
                  return dayDate >= segmentStartDate && dayDate < segmentEndDate
                })
                
                if (matchingDay?.stay?.room?.hotel && segment.hotel.id === matchingDay.stay.room.hotel.id) {
                  // Update segment with actual hotel data from trip
                  return {
                    ...segment,
                    hotel: {
                      ...segment.hotel,
                      id: matchingDay.stay.room.hotel.id,
                      name: matchingDay.stay.room.hotel.name,
                      address: matchingDay.stay.room.hotel.address,
                      starRating: matchingDay.stay.room.hotel.star || segment.hotel.starRating || 0,
                      images: segment.hotel.images || [],
                      rooms: segment.hotel.rooms || [],
                      minPrice: segment.hotel.minPrice || (matchingDay.stay.room.priceCents || 0) / 100
                    },
                    selectedRoom: segment.selectedRoom || {
                      id: matchingDay.stay.room.id,
                      name: matchingDay.stay.room.name,
                      priceCents: matchingDay.stay.room.priceCents,
                      baseMealPlan: matchingDay.stay.room.baseMealPlan
                    }
                  }
                }
              }
              return segment
            })
            
            setSplitStaySegments(syncedSegments)
            // Update localStorage with synced data
            localStorage.setItem(`splitStaySegments_${tripId}`, JSON.stringify(syncedSegments))
          }
        } catch (e) {
          console.error('Error parsing saved segments:', e)
        }
      }
    }
  }, [trip, tripId])

  // Convert Trip data to Proposal format
  const convertTripToProposalFormat = useCallback((tripData: TripData): Proposal => {
    const trip = tripData
    
    console.log('=== CONVERSION DEBUG ===')
    console.log('Input trip data:', trip)
    console.log('trip.fromCity:', trip.fromCity)
    console.log('trip.nationality:', trip.nationality)
    console.log('trip.starRating:', trip.starRating)
    
    // Convert days to the existing Day format
    const convertedDays: Day[] = trip.days.map((day: any) => ({
      id: day.id,
      dayNumber: day.dayNumber,
      date: day.date,
      title: `Day ${day.dayNumber} - ${day.city.name}`,
      summary: day.stay ? `Stay at ${day.stay.roomsCount} room(s) for ${day.stay.nights} nights` : '',
      activities: day.activityBookings.map((activity: any) => ({
        id: activity.id,
        title: activity.option.name,
        description: `Duration: ${activity.option.durationMinutes} minutes`,
        time: activity.option.startTime || 'TBD',
        duration: `${activity.option.durationMinutes} minutes`,
        price: (activity.priceBaseCents + activity.priceAddonsCents) / 100,
        currency: 'INR',
        type: activity.slot as 'morning' | 'afternoon' | 'evening' | 'full_day',
        included: false
      })),
      accommodation: day.stay && day.stay.room && day.stay.room.hotel ? `${day.stay.roomsCount} room(s) at ${day.stay.room.hotel.name} (${day.stay.room.name}, ${day.stay.mealPlan})` : undefined,
      transfers: (day.transfers || []).map((transfer: any) => ({
        ...transfer,
        name: transfer.transferProduct?.name || transfer.name || 'Transfer',
        price: transfer.priceTotalCents ? transfer.priceTotalCents / 100 : null,
        currencyCode: transfer.currency?.code || trip.currency?.code || 'INR',
      })),
      meals: {
        breakfast: day.stay?.mealPlan?.toLowerCase().includes('breakfast') || false,
        lunch: day.stay?.mealPlan?.toLowerCase().includes('lunch') || false,
        dinner: day.stay?.mealPlan?.toLowerCase().includes('dinner') || false
      }
    }))
    
    // Convert stays to Hotel format - collect all unique hotels from all days
    // Use a combination of hotel ID and check-in date as key to handle same hotel on different dates
    const hotelMap = new Map<string, Hotel>()
    
    trip.days
      .filter((day: any) => day.stay && day.stay.room && day.stay.room.hotel)
      .forEach((day: any) => {
        const hotelId = day.stay.room.hotel.id
        const checkIn = day.stay.checkIn
        
        // Create a unique key combining hotel ID and check-in date
        // This allows the same hotel to appear multiple times if on different date ranges
        const hotelKey = `${hotelId}-${checkIn}`
        
        // Only add if this specific hotel+date combination doesn't exist
        if (!hotelMap.has(hotelKey)) {
          hotelMap.set(hotelKey, {
            id: `${hotelId}-${checkIn}`, // Use composite ID to allow same hotel on different dates
            name: day.stay.room.hotel.name,
            address: day.stay.room.hotel.address,
            rating: day.stay.room.hotel.star,
            starRating: day.stay.room.hotel.star,
            image: '/api/placeholder/300/200', // Placeholder image
            checkIn: day.stay.checkIn,
            checkOut: day.stay.checkOut,
            roomType: day.stay.room.name,
            boardBasis: day.stay.mealPlan,
            bedType: day.stay.room.bedType,
            nights: day.stay.nights,
            refundable: true,
            pricePerNight: day.stay.priceTotalCents / 100 / day.stay.nights,
            currency: 'INR',
            confirmationStatus: day.stay.confirmationStatus
          })
        }
      })
    
    const convertedHotels: Hotel[] = Array.from(hotelMap.values())
    
    // Debug logging to verify all hotels are collected
    console.log('=== HOTEL CONVERSION DEBUG ===')
    console.log('Total days with stays:', trip.days.filter((day: any) => day.stay && day.stay.room && day.stay.room.hotel).length)
    console.log('Total converted hotels:', convertedHotels.length)
    console.log('Hotels:', convertedHotels.map(h => ({ 
      id: h.id, 
      name: h.name, 
      checkIn: h.checkIn, 
      checkOut: h.checkOut, 
      nights: h.nights 
    })))
    
    // Create initial proposal without price breakdown (will be calculated later)
    console.log('=== PROPOSAL CREATION DEBUG ===')
    console.log('trip.fromCity?.name:', trip.fromCity?.name)
    console.log('trip.nationality?.name:', trip.nationality?.name)
    console.log('trip.starRating?.toString():', trip.starRating?.toString())
    
    const initialProposal: Proposal = {
      id: trip.id,
      tripName: `${trip.fromCity?.name || 'Trip'} Trip`,
      fromDate: trip.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      toDate: trip.endDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      origin: trip.fromCity?.name || 'Unknown',
      nationality: trip.nationality?.name || 'India',
      starRating: trip.starRating?.toString() || '3',
      landOnly: trip.landOnly,
      addTransfers: !trip.transferOnly,
      rooms: convertedHotels.length > 0 ? convertedHotels[0].nights : 1,
      adults: trip.travelerDetails?.adults || 2,
      children: trip.travelerDetails?.children || 0,
      clientName: trip.customer?.name || '',
      clientEmail: trip.customer?.email || '',
      clientPhone: trip.customer?.phone || '',
      internalNotes: '',
      salesperson: trip.createdBy?.firstName + ' ' + trip.createdBy?.lastName || '',
      validityDays: 30,
      markupFlightPercent: trip.markupFlightPercent ? (isNaN(parseFloat(trip.markupFlightPercent)) ? null : parseFloat(trip.markupFlightPercent)) : null,
      markupLandPercent: trip.markupLandPercent ? (isNaN(parseFloat(trip.markupLandPercent)) ? null : parseFloat(trip.markupLandPercent)) : null,
      currency: 'INR',
      flights: [], // Empty for now
      hotels: convertedHotels,
      days: convertedDays,
      priceBreakdown: {
        pricePerAdult: 0,
        pricePerChild: 0,
        subtotal: 0,
        taxes: 0,
        markup: 0,
        total: 0,
        currency: 'INR'
      }, // Will be calculated by calculatePriceBreakdown
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      // Additional fields for better data display
      tripStatus: trip.status,
      tripType: trip.tripType,
      totalTravelers: trip.totalTravelers,
      durationDays: trip.durationDays,
      destinations: trip.days.map((day: any, index: number) => ({
        id: day.city.id,
        name: day.city.name,
        numberOfDays: 1,
        order: index + 1
      }))
    }

    // Calculate the price breakdown using the new function
    const priceBreakdown = calculatePriceBreakdown(initialProposal)
    
    return {
      ...initialProposal,
      priceBreakdown
    }
  }, [calculatePriceBreakdown])

  // Update blocked time slots from trip data
  const updateBlockedTimeSlots = useCallback((tripData: TripData) => {
    const blockedSlots: ActivityTimeBlock[] = []
    
    tripData.days.forEach(day => {
      day.activityBookings.forEach(booking => {
        // Use the option start time, or default to '09:00' if not available
        const startTime = booking.option.startTime || '09:00'
        const endTime = calculateEndTime(startTime, booking.option.durationMinutes)
        
        blockedSlots.push({
          id: booking.id,
          startTime,
          endTime,
          title: booking.option.name,
          slot: booking.slot as DaySlot, // Use the actual slot type from the booking
          dayId: day.id // Add day ID to filter by day
        })
      })
    })
    
    setBlockedTimeSlots(blockedSlots)
  }, [])

  // Load trip data and convert to proposal format
  useEffect(() => {
    const loadTripAndProposalData = async () => {
      if (trip && !tripLoading) {
        try {
          console.log('=== TRIP DATA DEBUG ===')
          console.log('Full trip object:', JSON.stringify(trip, null, 2))
          console.log('Trip nationality:', trip.nationality)
          console.log('Trip starRating:', trip.starRating)
          console.log('Trip fromCity:', trip.fromCity)
          console.log('Trip fromCity name:', trip.fromCity?.name)
          console.log('Trip nationality name:', trip.nationality?.name)
          console.log('Trip starRating type:', typeof trip.starRating)
          console.log('Trip starRating value:', trip.starRating)
          
          // Convert the trip data to proposal format
          let convertedProposal = convertTripToProposalFormat(trip)
          
          // Check if there's an existing proposal and merge its data
          try {
            const { data } = await fetchTripProposals({
              variables: { tripId: trip.id }
            })
            
            if (data?.proposals && data.proposals.length > 0) {
              // Get the first (most recent) proposal
              const existingProposal = data.proposals.sort((a: any, b: any) => {
                const dateA = new Date(a.createdAt || 0).getTime()
                const dateB = new Date(b.createdAt || 0).getTime()
                return dateB - dateA
              })[0]
              
              console.log('Found existing proposal, merging data:', existingProposal)
              
              // Merge existing proposal data with converted proposal
              if (existingProposal.landMarkup != null) {
                convertedProposal.markupLandPercent = existingProposal.landMarkup
              }
              if (existingProposal.flightsMarkup != null) {
                convertedProposal.markupFlightPercent = existingProposal.flightsMarkup
              }
              
              console.log('Updated proposal with existing data:', convertedProposal)
            }
          } catch (proposalError) {
            console.log('No existing proposal found or error fetching:', proposalError)
            // Continue with trip-based data
          }
          
          console.log('Converted proposal:', convertedProposal)
          updateProposalWithPrices(convertedProposal)
          setIsLoading(false)
          
          // Update blocked time slots from existing activities
          updateBlockedTimeSlots(trip)
          
          console.log('Loaded and converted trip data to proposal:', convertedProposal)
        } catch (error) {
          console.error('Error converting trip data:', error)
          setIsLoading(false)
        }
      } else if (!tripLoading && !trip) {
        // Trip loading is complete but no trip data found
        setIsLoading(false)
      }
    }
    
    loadTripAndProposalData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id, tripLoading])

  // Auto-save functionality removed - only save when user explicitly clicks "Save as Proposal"

  // Keyboard shortcuts - Ctrl+S to save proposal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        if (proposalRef.current) {
          saveProposal(proposalRef.current)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveProposal])

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
    const updatedProposal = {
      ...proposal,
      [field]: value
    }
    // If markup is changed, recalculate prices
    if (field === 'markupLandPercent' || field === 'markupFlightPercent') {
      updateProposalWithPrices(updatedProposal)
    } else {
      updateProposal(updatedProposal)
    }
  }

  // Convert proposal Hotel to HotelType for the modal
  const convertProposalHotelToHotelType = (proposalHotel: Hotel): HotelType | undefined => {
    if (!proposalHotel) return undefined
    
    return {
      id: proposalHotel.id,
      name: proposalHotel.name,
      location: proposalHotel.address,
      address: proposalHotel.address,
      rating: proposalHotel.rating,
      ratingsCount: 0, // Default value since proposal hotel doesn't have this
      starRating: proposalHotel.starRating,
      images: [proposalHotel.image],
      badges: proposalHotel.refundable ? ['Refundable'] : [],
      rooms: [], // Will be populated by the modal
      amenities: [],
      minPrice: proposalHotel.pricePerNight,
      maxPrice: proposalHotel.pricePerNight,
      refundable: proposalHotel.refundable,
      preferred: false,
      coordinates: { lat: 0, lng: 0 } // Default coordinates
    }
  }

  const handleHotelSelect = async (hotel: HotelType, room: any) => {
    if (!proposal || !trip) return

    try {
      // Find the trip day for this hotel
      // If editing existing hotel, use the tracked day ID or find the day with this hotel
      // If adding new hotel, use the first day that doesn't have a stay
      let targetDay
      if (editingHotelIndex !== null) {
        // First try to use the tracked day ID if available
        if (editingHotelDayId) {
          targetDay = trip.days.find(day => day.id === editingHotelDayId)
        }
        
        // If not found by ID, find by hotel ID (for backward compatibility)
        if (!targetDay) {
          targetDay = trip.days.find(day => 
            day.stay && day.stay.room.hotel.id === proposal.hotels[editingHotelIndex].id
          )
        }
      } else {
        // Find the first day without a stay (for new hotel)
        targetDay = trip.days.find(day => !day.stay)
      }
      
      // Fallback to first day if no suitable day found
      if (!targetDay) {
        targetDay = trip.days[0]
      }

      if (!targetDay) {
        console.error('No trip day found for hotel change')
        return
      }

      // Validate that we have a room ID
      if (!room.id) {
        console.error('No room ID found in room object:', room)
        throw new Error('No room ID found in selected room')
      }

      // Calculate check-in and check-out dates
      const checkIn = proposal.hotels[editingHotelIndex || 0]?.checkIn || new Date().toISOString().split('T')[0]
      const checkOut = proposal.hotels[editingHotelIndex || 0]?.checkOut || new Date().toISOString().split('T')[0]
      const nights = proposal.hotels[editingHotelIndex || 0]?.nights || 1

      // Check if we're updating an existing trip stay or creating a new one
      if (targetDay.stay?.id) {
        // Update existing trip stay using updateTripStays mutation
        console.log('Updating existing trip stay:', targetDay.stay.id)
        
        const tripStayInput: TripStayPartialInput = {
          id: targetDay.stay.id,
          room: { set: room.id },
          checkIn,
          checkOut,
          nights,
          roomsCount: 1,
          mealPlan: room.baseMealPlan || room.boardBasis || room.board || 'BB',
          currency: { set: trip.currency?.code || 'INR' },
          priceTotalCents: (room.priceCents || room.pricePerNight * 100) * nights,
          confirmationStatus: 'pending'
        }

        await updateTripStays([tripStayInput], async (response) => {
          console.log('Trip stay updated successfully:', response)
          
          // Update proposal with new trip data
          // Note: If the response doesn't have complete hotel data, we'll refetch the trip
          if (response.updateTripStays && response.updateTripStays.length > 0 && trip) {
            // Check if the response has complete hotel data
            const hasCompleteHotelData = response.updateTripStays.every((stay: any) => 
              stay.room && stay.room.hotel && stay.room.hotel.id
            )
            
            if (hasCompleteHotelData) {
              // Use the response data directly
              const updatedTripData = {
                ...trip,
                days: trip.days.map((day: any) => {
                  const updatedStay = response.updateTripStays.find((stay: any) => stay.tripDay.id === day.id)
                  if (updatedStay && updatedStay.room && updatedStay.room.hotel) {
                    return {
                      ...day,
                      stay: {
                        ...day.stay,
                        ...updatedStay,
                        room: updatedStay.room
                      }
                    }
                  }
                  return day
                })
              } as TripData
              
              const updatedProposal = convertTripToProposalFormat(updatedTripData)
              updateProposalWithPrices(updatedProposal)
            } else {
              // If hotel data is missing, refetch trip to get complete data
              console.log('Hotel data missing in response, refetching trip...')
              if (refetchTrip) {
                const refetchResult = await refetchTrip()
                const updatedTripData = refetchResult?.data?.trip
                if (updatedTripData) {
                  const updatedProposal = convertTripToProposalFormat(updatedTripData)
                  updateProposalWithPrices(updatedProposal)
                }
              }
            }
          }
        }, (error) => {
          console.error('Error updating trip stay:', error)
          // On error, refetch trip to get the latest state
          if (refetchTrip) {
            setTimeout(async () => {
              await refetchTrip()
            }, 500)
          }
        })

        // Refresh trip data in background
        setTimeout(async () => {
          if (refetchTrip) {
            await refetchTrip()
          }
        }, 500)
      } else {
        // Create new trip stay (only if day doesn't have a stay)
        console.log('Creating new trip stay for day:', targetDay.id)
        
        const tripStayData = {
          tripDay: targetDay.id,
          room: room.id,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: nights,
          roomsCount: 1,
          mealPlan: room.baseMealPlan || room.boardBasis || room.board || 'BB',
          currency: 'INR',
          priceTotalCents: (room.priceCents || room.pricePerNight * 100) * nights,
          confirmationStatus: 'pending'
        }

        await createTripStay(tripStayData)
        await refetchTrip()
      }

    } catch (error) {
      console.error('Error handling hotel selection:', error)
    }

    setIsHotelSelectOpen(false)
    setEditingHotelIndex(null)
    setEditingHotelDayId(null)
  }

  const handleChangeHotel = (index: number) => {
    if (!trip || !proposal) return
    
    // Find the day that has this hotel
    const hotel = proposal.hotels[index]
    // Extract hotel ID from composite ID (format: "hotelId-checkIn" or just "hotelId")
    const hotelId = hotel.id.includes('-') ? hotel.id.split('-')[0] : hotel.id
    
    // Find day by matching hotel ID and check-in date
    const dayWithHotel = trip.days.find(day => 
      day.stay && 
      day.stay.room.hotel.id === hotelId &&
      day.stay.checkIn === hotel.checkIn
    )
    
    setEditingHotelIndex(index)
    setEditingHotelDayId(dayWithHotel?.id || null)
    setIsHotelSelectOpen(true)
  }

  const handleChangeRoom = (hotel: Hotel) => {
    if (!trip || !proposal) return
    
    // Extract hotel ID from composite ID (format: "hotelId-checkIn" or just "hotelId")
    const hotelId = hotel.id.includes('-') ? hotel.id.split('-')[0] : hotel.id
    
    // Find day by matching hotel ID and check-in date
    const dayWithHotel = trip.days.find(day => 
      day.stay && 
      day.stay.room.hotel.id === hotelId &&
      day.stay.checkIn === hotel.checkIn
    )
    
    setSelectedHotelForDetails(hotel)
    setSelectedHotelDayId(dayWithHotel?.id || null)
    setIsHotelDetailsOpen(true)
  }

  const handleCloseHotelDetails = () => {
    setIsHotelDetailsOpen(false)
    setSelectedHotelForDetails(null)
    setSelectedHotelDayId(null)
  }

  // Split Stay handlers
  const handleSplitStayChange = useCallback(async (segments: any[]) => {
    console.log('CreateProposalPage: handleSplitStayChange called', segments)
    
    // Check if segments have actually changed to prevent infinite loops
    const segmentsChanged = JSON.stringify(segments) !== JSON.stringify(splitStaySegments)
    
    if (!segmentsChanged) {
      console.log('CreateProposalPage: Segments unchanged, skipping update')
      return
    }
    
    // Detect which segments have hotels that weren't there before
    const previousSegments = splitStaySegments || []
    const segmentsWithNewHotels = segments.filter((segment, index) => {
      const prevSegment = previousSegments[index]
      return segment.hotel && (!prevSegment || !prevSegment.hotel)
    })
    
    setSplitStaySegments(segments)
    
    // Persist segments to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`splitStaySegments_${tripId}`, JSON.stringify(segments))
    }
    
    // Update trip stays for segments that have hotels selected (call mutation whenever any segment gets a hotel)
    if (segments.length > 0 && segments.some(segment => segment.hotel) && trip && trip.days) {
      try {
        // Build array of TripStayPartialInput objects for the mutation
        // Only process segments that have hotels
        const tripStayInputs: TripStayPartialInput[] = []
        
        // Sort trip days by dayNumber to ensure correct order
        const sortedTripDays = [...trip.days].sort((a, b) => {
          if (a.dayNumber !== undefined && b.dayNumber !== undefined) {
            return a.dayNumber - b.dayNumber
          }
          // Fallback to date comparison if dayNumber is not available
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
        
        console.log('Sorted trip days:', sortedTripDays.map(d => ({
          dayNumber: d.dayNumber,
          date: d.date,
          tripStayId: d.stay?.id,
          stayCheckIn: d.stay?.checkIn,
          stayCheckOut: d.stay?.checkOut
        })))
        
        // Sort segments by segmentIndex to ensure correct order
        const sortedSegments = [...segments].sort((a, b) => a.segmentIndex - b.segmentIndex)
        
        console.log('Sorted segments:', sortedSegments.map(s => ({
          segmentIndex: s.segmentIndex,
          startDate: s.startDate,
          endDate: s.endDate,
          duration: s.duration,
          hotel: s.hotel?.name
        })))
        
        // Track which days have already been assigned to prevent duplicates
        const assignedDayIds = new Set<string>()
        
        // Calculate cumulative day offsets for each segment
        // Segment 0 starts at day 1, Segment 1 starts after Segment 0's duration, etc.
        // Only include segments with hotels in the offset calculation
        const segmentDayOffsets: number[] = []
        let cumulativeOffset = 0
        sortedSegments.forEach((segment, index) => {
          segmentDayOffsets.push(cumulativeOffset)
          // Only add to cumulative offset if this segment has a hotel
          // This ensures correct day matching even if some segments don't have hotels yet
          if (segment.hotel) {
            cumulativeOffset += segment.duration
          }
        })
        
        console.log('Segment day offsets:', segmentDayOffsets.map((offset, idx) => ({
          segmentIndex: sortedSegments[idx].segmentIndex,
          offset,
          duration: sortedSegments[idx].duration,
          hasHotel: !!sortedSegments[idx].hotel
        })))
        
        sortedSegments.forEach((segment, segmentArrayIndex) => {
          // Skip segments without hotels
          if (!segment.hotel) {
            return
          }
          
          // Get the selected room - prefer segment.selectedRoom, then hotel.rooms
          let selectedRoom = segment.selectedRoom
          
          // If no selectedRoom in segment, try to get it from hotel.rooms
          if (!selectedRoom || !selectedRoom.id) {
            if (segment.hotel.rooms && segment.hotel.rooms.length > 0) {
              const roomFromHotel = segment.hotel.rooms.find((r: any) => r.selected) || segment.hotel.rooms[0]
              if (roomFromHotel && roomFromHotel.id) {
                selectedRoom = {
                  id: roomFromHotel.id,
                  name: roomFromHotel.name || 'Standard Room',
                  priceCents: roomFromHotel.priceCents,
                  pricePerNight: roomFromHotel.pricePerNight,
                  baseMealPlan: roomFromHotel.baseMealPlan,
                  boardBasis: roomFromHotel.boardBasis
                }
              }
            }
          }
          
          if (!selectedRoom || !selectedRoom.id) {
            console.warn('Segment missing room ID:', segment)
            return
          }
          
          // Calculate check-in and check-out dates for this segment
          const segmentStartDate = new Date(segment.startDate)
          segmentStartDate.setHours(0, 0, 0, 0) // Normalize to start of day
          const segmentEndDate = new Date(segment.endDate)
          segmentEndDate.setHours(0, 0, 0, 0) // Normalize to start of day
          
          // Format dates as YYYY-MM-DD for GraphQL Date type
          const checkIn = segmentStartDate.toISOString().split('T')[0]
          const checkOut = segmentEndDate.toISOString().split('T')[0]
          
          // Find all trip days within this segment's date range
          // Prioritize dayNumber-based matching for accuracy, then fallback to date-based matching
          let segmentDays: any[] = []
          
          // First, try dayNumber-based matching if available (more reliable)
          // Calculate the correct day range based on cumulative offsets from previous segments
          if (segment.segmentIndex !== undefined) {
            // Calculate cumulative offset: how many days have been used by previous segments
            const dayOffset = segmentDayOffsets[segmentArrayIndex] || 0
            const expectedDayStart = dayOffset + 1
            const expectedDayEnd = expectedDayStart + segment.duration
            
            console.log(`Segment ${segment.segmentIndex} matching:`, {
              dayOffset,
              expectedDayStart,
              expectedDayEnd,
              duration: segment.duration,
              shouldMatchDays: `${expectedDayStart} to ${expectedDayEnd - 1}`
            })
            
            const dayNumberBasedDays = sortedTripDays.filter((day) => {
              if (day.dayNumber === undefined) return false
              // Match days based on cumulative offset
              const dayMatches = day.dayNumber >= expectedDayStart && day.dayNumber < expectedDayEnd
              
              // Also check if this day has already been assigned to another segment
              if (dayMatches && day.stay?.id) {
                if (assignedDayIds.has(day.stay.id)) {
                  console.warn(`Day ${day.dayNumber} with tripStay ID ${day.stay.id} already assigned to another segment, skipping for segment ${segment.segmentIndex}`)
                  return false
                }
              }
              
              return dayMatches
            }).sort((a, b) => {
              if (a.dayNumber !== undefined && b.dayNumber !== undefined) {
                return a.dayNumber - b.dayNumber
              }
              return new Date(a.date).getTime() - new Date(b.date).getTime()
            })
            
            if (dayNumberBasedDays.length > 0) {
              console.log(`Using dayNumber-based matching for segment ${segment.segmentIndex}:`, dayNumberBasedDays.map(d => ({
                dayNumber: d.dayNumber,
                tripStayId: d.stay?.id,
                date: d.date
              })))
              segmentDays = dayNumberBasedDays
            }
          }
          
          // If dayNumber matching didn't work, fallback to date-based matching
          if (segmentDays.length === 0) {
            console.log(`DayNumber matching failed for segment ${segment.segmentIndex}, trying date-based matching`)
            segmentDays = sortedTripDays.filter((day) => {
              const dayDate = new Date(day.date)
              dayDate.setHours(0, 0, 0, 0)
              // Day should be >= segment start and < segment end
              const dateMatches = dayDate >= segmentStartDate && dayDate < segmentEndDate
              
              // Also check if this day has already been assigned to another segment
              if (dateMatches && day.stay?.id) {
                if (assignedDayIds.has(day.stay.id)) {
                  console.warn(`Day ${day.dayNumber} with tripStay ID ${day.stay.id} already assigned to another segment, skipping for segment ${segment.segmentIndex}`)
                  return false
                }
              }
              
              return dateMatches
            }).sort((a, b) => {
              // Ensure days are sorted by dayNumber
              if (a.dayNumber !== undefined && b.dayNumber !== undefined) {
                return a.dayNumber - b.dayNumber
              }
              return new Date(a.date).getTime() - new Date(b.date).getTime()
            })
            
            if (segmentDays.length > 0) {
              console.log(`Using date-based matching for segment ${segment.segmentIndex}:`, segmentDays.map(d => ({
                dayNumber: d.dayNumber,
                tripStayId: d.stay?.id,
                date: d.date
              })))
            }
          }
          
          if (segmentDays.length === 0) {
            console.warn('No trip days found for segment date range:', {
              segmentIndex: segment.segmentIndex,
              segmentStartDate: segmentStartDate.toISOString(),
              segmentEndDate: segmentEndDate.toISOString(),
              segmentDuration: segment.duration,
              allDays: sortedTripDays.map(d => ({
                dayNumber: d.dayNumber,
                date: d.date,
                normalizedDate: new Date(d.date).toISOString().split('T')[0]
              }))
            })
            return
          }
          
          console.log(`Segment ${segment.segmentIndex} (${segment.duration} nights):`, {
            startDate: segmentStartDate.toISOString().split('T')[0],
            endDate: segmentEndDate.toISOString().split('T')[0],
            matchedDays: segmentDays.map(d => ({ 
              dayNumber: d.dayNumber, 
              date: d.date,
              tripStayId: d.stay?.id
            })),
            expectedDayCount: segment.duration,
            actualDayCount: segmentDays.length
          })
          
          // Verify we matched the correct number of days
          if (segmentDays.length !== segment.duration) {
            console.warn(`Segment ${segment.segmentIndex} expected ${segment.duration} days but matched ${segmentDays.length} days`)
          }
          
          // Get currency code
          const currencyCode = trip.currency?.code || 'INR'
          
          // Calculate price (use room price or hotel min price)
          const pricePerNight = selectedRoom.priceCents || (selectedRoom.pricePerNight ? selectedRoom.pricePerNight * 100 : 0) || segment.hotel.minPrice * 100 || 0
          const priceTotalCents = pricePerNight * segment.duration
          
          // For each day in this segment, create a TripStayPartialInput
          // Only process days that haven't been assigned to another segment
          segmentDays.forEach((day) => {
            if (!day.stay || !day.stay.id) {
              console.warn('Day missing stay ID:', day)
              return
            }
            
            // Skip if this day has already been assigned to another segment
            if (assignedDayIds.has(day.stay.id)) {
              console.warn(`Skipping duplicate tripStay ID ${day.stay.id} for segment ${segment.segmentIndex}, day ${day.dayNumber} - already assigned`)
              return
            }
            
            console.log(`Creating tripStay input for segment ${segment.segmentIndex}, day ${day.dayNumber}:`, {
              tripStayId: day.stay.id,
              dayNumber: day.dayNumber,
              date: day.date,
              segmentIndex: segment.segmentIndex,
              segmentStartDate: segmentStartDate.toISOString().split('T')[0],
              segmentEndDate: segmentEndDate.toISOString().split('T')[0]
            })
            
            const tripStayInput: TripStayPartialInput = {
              id: day.stay.id,
              room: { set: selectedRoom.id },
              checkIn,
              checkOut,
              nights: segment.duration,
              roomsCount: 1, // Default to 1 room, could be configurable
              mealPlan: selectedRoom.baseMealPlan || selectedRoom.boardBasis || 'BB',
              currency: { set: currencyCode },
              priceTotalCents,
              confirmationStatus: 'pending'
            }
            
            tripStayInputs.push(tripStayInput)
            
            // Mark this day as assigned immediately after adding to inputs
            assignedDayIds.add(day.stay.id)
          })
        })
        
        // Only call mutation if we have inputs (only for segments with hotels)
        if (tripStayInputs.length > 0) {
          console.log(`Updating trip stays for ${tripStayInputs.length} day(s) with inputs:`, tripStayInputs.map(input => ({
            tripStayId: input.id,
            roomId: input.room?.set,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            nights: input.nights
          })))
          
          const result = await updateTripStays(tripStayInputs, async (response) => {
            console.log('Trip stays updated successfully:', response)
            
            // Update segments with the hotel data that was just saved
            // This ensures the UI reflects the selection immediately
            const updatedSegments = segments.map(segment => {
              // Keep the segment as-is with its hotel selection
              return segment
            })
            
            // Persist the updated segments (they already have hotel data)
            setSplitStaySegments(updatedSegments)
            if (typeof window !== 'undefined') {
              localStorage.setItem(`splitStaySegments_${tripId}`, JSON.stringify(updatedSegments))
            }
            
            // Immediately update the proposal with the response data to show updated hotels in itinerary
            if (response.updateTripStays && response.updateTripStays.length > 0 && trip) {
              console.log('Updating proposal with response data:', response.updateTripStays)
              
              // Check if the response has complete hotel data
              const hasCompleteHotelData = response.updateTripStays.every((stay: any) => 
                stay.room && stay.room.hotel && stay.room.hotel.id
              )
              
              if (hasCompleteHotelData) {
                // Create a temporary trip object with updated stays for immediate UI update
                // Map each stay in response to its corresponding day
                const updatedTripDays = trip.days.map((day: any) => {
                  // Find matching updated stay from response - check both tripDay.id and tripDay.dayNumber
                  const updatedStay = response.updateTripStays.find((stay: any) => {
                    return stay.tripDay.id === day.id || stay.tripDay.dayNumber === day.dayNumber
                  })
                  
                  if (updatedStay && updatedStay.room && updatedStay.room.hotel) {
                    console.log(`Updating day ${day.dayNumber} with stay:`, {
                      hotelName: updatedStay.room.hotel.name,
                      roomName: updatedStay.room.name,
                      mealPlan: updatedStay.mealPlan,
                      tripDayId: updatedStay.tripDay.id,
                      dayId: day.id
                    })
                    
                    // Completely replace the stay with the updated one from response
                    return {
                      ...day,
                      stay: {
                        id: updatedStay.id,
                        tripDay: updatedStay.tripDay,
                        room: updatedStay.room,
                        checkIn: updatedStay.checkIn,
                        checkOut: updatedStay.checkOut,
                        nights: updatedStay.nights,
                        roomsCount: updatedStay.roomsCount,
                        mealPlan: updatedStay.mealPlan,
                        currency: updatedStay.currency,
                        priceTotalCents: updatedStay.priceTotalCents,
                        confirmationStatus: updatedStay.confirmationStatus
                      }
                    }
                  }
                  return day
                })
                
                // Create updated trip object with new days
                const updatedTripData = {
                  ...trip,
                  days: updatedTripDays
                } as TripData
                
                console.log('Converting updated trip data to proposal format...')
                // Convert to proposal format and update immediately
                const updatedProposal = convertTripToProposalFormat(updatedTripData)
                console.log('Updated proposal accommodation data:', updatedProposal.days.map(d => ({
                  dayNumber: d.dayNumber,
                  accommodation: d.accommodation
                })))
                
                updateProposalWithPrices(updatedProposal)
              } else {
                // If hotel data is missing, refetch trip to get complete data
                console.log('Hotel data missing in response, refetching trip...')
                if (refetchTrip) {
                  const refetchResult = await refetchTrip()
                  const updatedTripData = refetchResult?.data?.trip
                  if (updatedTripData) {
                    const updatedProposal = convertTripToProposalFormat(updatedTripData)
                    updateProposalWithPrices(updatedProposal)
                  }
                }
              }
            } else {
              // Fallback: Update proposal with split stay hotels if response format is different
              const splitStayHotels: Hotel[] = updatedSegments
                .filter(segment => segment.hotel)
                .map(segment => ({
                  id: segment.hotel!.id,
                  name: segment.hotel!.name,
                  address: segment.hotel!.address,
                  rating: segment.hotel!.rating,
                  starRating: segment.hotel!.starRating,
                  image: segment.hotel!.images?.[0],
                  checkIn: segment.startDate,
                  checkOut: segment.endDate,
                  roomType: segment.selectedRoom?.name || segment.hotel!.rooms?.[0]?.name || 'Standard Room',
                  boardBasis: segment.selectedRoom?.baseMealPlan || segment.selectedRoom?.boardBasis || segment.hotel!.rooms?.[0]?.baseMealPlan || 'Room Only',
                  bedType: segment.hotel!.rooms?.[0]?.bedType || 'Double',
                  nights: segment.duration,
                  refundable: segment.hotel!.refundable ?? true,
                  pricePerNight: segment.selectedRoom?.pricePerNight || segment.hotel!.minPrice,
                  currency: trip?.currency?.code || proposal?.currency || 'INR',
                  confirmationStatus: 'pending'
                }))
              
              if (proposal) {
                const updatedProposal = {
                  ...proposal,
                  hotels: splitStayHotels
                }
                updateProposalWithPrices(updatedProposal)
              }
            }
            
            // Refresh trip data in background without blocking UI
            // Use a small delay to ensure mutation completes first
            setTimeout(async () => {
              if (refetchTrip) {
                try {
                  const refreshedTrip = await refetchTrip()
                  
                  // After refetch, update the proposal with new trip data
                  if (refreshedTrip?.data?.trip) {
                    const updatedTripData = refreshedTrip.data.trip as TripData
                    console.log('Refreshed trip data after mutation:', updatedTripData)
                    console.log('Trip days with stays:', updatedTripData.days.map((d: any) => ({
                      dayNumber: d.dayNumber,
                      hotelName: d.stay?.room?.hotel?.name,
                      roomName: d.stay?.room?.name,
                      mealPlan: d.stay?.mealPlan
                    })))
                    
                    // Convert updated trip data to proposal format to refresh itinerary
                    const updatedProposal = convertTripToProposalFormat(updatedTripData)
                    console.log('Updated proposal after refetch - accommodation:', updatedProposal.days.map(d => ({
                      dayNumber: d.dayNumber,
                      accommodation: d.accommodation
                    })))
                    updateProposalWithPrices(updatedProposal)
                    
                    // Update blocked time slots
                    updateBlockedTimeSlots(updatedTripData)
                    
                    // Also sync segments with actual trip stay data
                    const tripDays = updatedTripData.days.sort((a: any, b: any) => {
                      if (a.dayNumber !== undefined && b.dayNumber !== undefined) {
                        return a.dayNumber - b.dayNumber
                      }
                      return new Date(a.date).getTime() - new Date(b.date).getTime()
                    })
                    
                    // Update segments to reflect the actual hotel data from trip
                    const syncedSegments = updatedSegments.map((segment, index) => {
                      const segmentStartDate = new Date(segment.startDate)
                      segmentStartDate.setHours(0, 0, 0, 0)
                      const segmentEndDate = new Date(segment.endDate)
                      segmentEndDate.setHours(0, 0, 0, 0)
                      
                      // Find matching days
                      const matchingDays = tripDays.filter((day: any) => {
                        const dayDate = new Date(day.date)
                        dayDate.setHours(0, 0, 0, 0)
                        return dayDate >= segmentStartDate && dayDate < segmentEndDate
                      })
                      
                      // If we have matching days with hotel data, update segment
                      if (matchingDays.length > 0 && matchingDays[0].stay?.room?.hotel) {
                        const hotelData = matchingDays[0].stay.room.hotel
                        const roomData = matchingDays[0].stay.room
                        
                        // Only update if hotel matches (preserve user selection)
                        if (!segment.hotel || segment.hotel.id === hotelData.id) {
                          return {
                            ...segment,
                            hotel: {
                              ...segment.hotel,
                              id: hotelData.id,
                              name: hotelData.name,
                              address: hotelData.address,
                              starRating: hotelData.star || segment.hotel?.starRating || 0,
                              images: segment.hotel?.images || [],
                              rooms: segment.hotel?.rooms || [],
                              minPrice: (roomData.priceCents || 0) / 100
                            },
                            selectedRoom: segment.selectedRoom || {
                              id: roomData.id,
                              name: roomData.name,
                              priceCents: roomData.priceCents,
                              baseMealPlan: roomData.baseMealPlan
                            }
                          }
                        }
                      }
                      
                      return segment
                    })
                    
                    setSplitStaySegments(syncedSegments)
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(`splitStaySegments_${tripId}`, JSON.stringify(syncedSegments))
                    }
                  }
                } catch (error) {
                  console.error('Error refreshing trip data:', error)
                }
              }
            }, 500) // Small delay to ensure mutation completes
          }, (error) => {
            console.error('Error updating trip stays:', error)
            // On error, refetch trip to get the latest state
            if (refetchTrip) {
              setTimeout(async () => {
                await refetchTrip()
              }, 500)
            }
          })
        } else {
          console.warn('No trip stay inputs generated from segments')
        }
      } catch (error) {
        console.error('Error in handleSplitStayChange:', error)
      }
    }
  }, [proposal, updateProposalWithPrices, splitStaySegments, trip, updateTripStays, refetchTrip, convertTripToProposalFormat, tripId])

  const handleSplitStayToggle = (enabled: boolean) => {
    setIsSplitStayEnabled(enabled)
    
    // Persist split stay state
    if (typeof window !== 'undefined') {
      localStorage.setItem(`splitStayEnabled_${tripId}`, enabled.toString())
      if (!enabled) {
        // Clear split stay segments when disabled
        setSplitStaySegments([])
        localStorage.removeItem(`splitStaySegments_${tripId}`)
      }
    }
  }

  const handleRoomSelect = async (hotel: any, room: any) => {
    if (!proposal || !selectedHotelForDetails || !trip) return

    try {
      // Find the trip day - use tracked day ID if available, otherwise find by hotel ID
      let tripDay
      if (selectedHotelDayId) {
        tripDay = trip.days.find(day => day.id === selectedHotelDayId)
      }
      
      // Fallback to finding by hotel ID if day ID not found
      if (!tripDay) {
        tripDay = trip.days.find(day => 
          day.stay && day.stay.room.hotel.id === selectedHotelForDetails.id
        )
      }
      
      if (!tripDay?.stay?.id) {
        console.error('No trip stay found for hotel:', selectedHotelForDetails.id)
        return
      }

      // Validate that we have a room ID
      if (!room.id) {
        console.error('No room ID found in room object in handleRoomSelect:', room)
        throw new Error('No room ID found in selected room')
      }

      // Update existing trip stay using updateTripStays mutation (instead of delete + create)
      console.log('Updating existing trip stay:', tripDay.stay.id, 'with new room:', room.id)
      
      const tripStayInput: TripStayPartialInput = {
        id: tripDay.stay.id,
        room: { set: room.id },
        checkIn: selectedHotelForDetails.checkIn || new Date().toISOString().split('T')[0],
        checkOut: selectedHotelForDetails.checkOut || new Date().toISOString().split('T')[0],
        nights: selectedHotelForDetails.nights || 1,
        roomsCount: 1,
        mealPlan: room.baseMealPlan || room.boardBasis || room.board || 'BB',
        currency: { set: trip.currency?.code || 'INR' },
        priceTotalCents: (room.priceCents || room.pricePerNight * 100) * (selectedHotelForDetails.nights || 1),
        confirmationStatus: 'pending'
      }

      await updateTripStays([tripStayInput], async (response) => {
        console.log('Trip stay updated successfully:', response)
        
        // Update proposal with new trip data
        // Note: If the response doesn't have complete hotel data, we'll refetch the trip
        if (response.updateTripStays && response.updateTripStays.length > 0 && trip) {
          // Check if the response has complete hotel data
          const hasCompleteHotelData = response.updateTripStays.every((stay: any) => 
            stay.room && stay.room.hotel && stay.room.hotel.id
          )
          
          if (hasCompleteHotelData) {
            // Use the response data directly
            const updatedTripData = {
              ...trip,
              days: trip.days.map((day: any) => {
                const updatedStay = response.updateTripStays.find((stay: any) => stay.tripDay.id === day.id)
                if (updatedStay && updatedStay.room && updatedStay.room.hotel) {
                  return {
                    ...day,
                    stay: {
                      ...day.stay,
                      ...updatedStay,
                      room: updatedStay.room
                    }
                  }
                }
                return day
              })
            } as TripData
            
            const updatedProposal = convertTripToProposalFormat(updatedTripData)
            updateProposalWithPrices(updatedProposal)
          } else {
            // If hotel data is missing, refetch trip to get complete data
            console.log('Hotel data missing in response, refetching trip...')
            if (refetchTrip) {
              const refetchResult = await refetchTrip()
              const updatedTripData = refetchResult?.data?.trip
              if (updatedTripData) {
                const updatedProposal = convertTripToProposalFormat(updatedTripData)
                updateProposalWithPrices(updatedProposal)
              }
            }
          }
        }
      }, (error) => {
        console.error('Error updating trip stay:', error)
        // On error, refetch trip to get the latest state
        if (refetchTrip) {
          setTimeout(async () => {
            await refetchTrip()
          }, 500)
        }
      })

      // Refresh trip data in background
      setTimeout(async () => {
        if (refetchTrip) {
          await refetchTrip()
        }
      }, 500)

    } catch (error) {
      console.error('Error handling room selection:', error)
    }

    // Close the modal
    handleCloseHotelDetails()
  }

  const handleActivitySelect = async (activity: ActivityType, selection: ActivitySelection, bookingIdToDelete?: string) => {
    console.log('handleActivitySelect called', {
      activityId: activity.id,
      bookingIdToDelete,
      proposal: !!proposal,
      trip: !!trip
    })

    if (!proposal || !trip) {
      console.log('Missing proposal or trip data')
      return
    }

    try {
      // Determine the target day ID
      let targetDayId: string
      
      if (editingDayIndex !== null && trip) {
        // Use the actual day ID from the trip data
        targetDayId = trip.days[editingDayIndex].id
        console.log('Using editing day ID:', targetDayId)
      } else if (trip && trip.days.length > 0) {
        // Use the first day's ID
        targetDayId = trip.days[0].id
        console.log('Using first day ID:', targetDayId)
      } else {
        // Fallback to creating a new day (this shouldn't happen in normal flow)
        console.warn('No valid day found for activity booking')
        return
      }

      // Check for time conflicts only if the activity has a startTime
      if (activity.startTime) {
        // Get blocked slots for the specific day
        const dayBlockedSlots = blockedTimeSlots.filter(slot => {
          const day = trip.days.find(day => day.id === targetDayId)
          return day?.activityBookings.some(booking => booking.id === slot.id)
        })
        
        if (hasTimeConflict(activity, dayBlockedSlots)) {
          throw new Error('This activity conflicts with existing activities in the same time slot. Please choose a different time or remove conflicting activities.')
        }
      }

      // If we're editing, delete the old booking first
      if (bookingIdToDelete) {
        console.log('Deleting old activity booking:', bookingIdToDelete)
        const deleteResult = await deleteActivityBooking(bookingIdToDelete)
        console.log('Delete result:', deleteResult)
      }

      // Use the new activity booking function
      console.log('Calling handleActivityBookingFromSelection')
      await handleActivityBookingFromSelection(targetDayId, activity, selection)
      console.log('handleActivityBookingFromSelection completed')

      // Close the modal
      setIsActivityExplorerOpen(false)
      setEditingDayIndex(null)
      setEditingActivityBookingId(null)

    } catch (error: any) {
      console.error('Error in handleActivitySelect:', error)
      // The error handling is already done in the activity booking function
      // The user will see the error toast from the useActivityBooking hook
    }
  }

  const handleAddActivity = (dayIndex?: number) => {
    setEditingDayIndex(dayIndex !== undefined ? dayIndex : null)
    setIsActivityExplorerOpen(true)
  }

  const handleTransferSelect = async (transferProduct: TransferProduct, selection: TransferSelection, bookingIdToDelete?: string) => {
    console.log('handleTransferSelect called', {
      transferProductId: transferProduct.id,
      bookingIdToDelete,
      proposal: !!proposal,
      trip: !!trip
    })

    if (!proposal || !trip) {
      console.log('Missing proposal or trip data')
      return
    }

    try {
      // Determine the target day ID
      let targetDayId: string
      
      if (editingDayIndex !== null && trip) {
        targetDayId = trip.days[editingDayIndex].id
        console.log('Using editing day ID:', targetDayId)
      } else if (trip && trip.days.length > 0) {
        targetDayId = trip.days[0].id
        console.log('Using first day ID:', targetDayId)
      } else {
        console.warn('No valid day found for transfer booking')
        return
      }

      // If we're editing, delete the old booking first
      if (bookingIdToDelete) {
        console.log('Deleting old transfer booking:', bookingIdToDelete)
        const deleteResult = await deleteTransfer(bookingIdToDelete)
        console.log('Delete result:', deleteResult)
      }

      // Create transfer booking
      const transferInput: TransferBookingInput = {
        tripDay: targetDayId,
        transferProduct: transferProduct.id,
        pickupTime: selection.pickupTime,
        currency: selection.currency,
        confirmationStatus: selection.confirmationStatus,
        pickupLocation: selection.pickupLocation,
        dropoffLocation: selection.dropoffLocation,
        vehiclesCount: selection.vehiclesCount,
        paxAdults: selection.paxAdults,
        paxChildren: selection.paxChildren,
        priceTotalCents: selection.priceTotalCents
      }

      console.log('Creating transfer with input:', transferInput)
      const result = await createTransfer(transferInput, (response) => {
        console.log('Transfer created successfully:', response)
        // Refetch trip data to update UI
        refetchTrip()
      })

      if (result) {
        // Close the modal
        setIsTransferExplorerOpen(false)
        setEditingDayIndex(null)
        setEditingTransferBookingId(null)
      }

    } catch (error: any) {
      console.error('Error in handleTransferSelect:', error)
    }
  }

  const handleAddTransfer = (dayIndex?: number) => {
    setEditingDayIndex(dayIndex !== undefined ? dayIndex : null)
    setIsTransferExplorerOpen(true)
  }

  // Utility function to add activity booking with minimal parameters
  const addActivityToDay = async (
    dayIndex: number,
    activityId: string,
    optionId: string,
    slot: string = '09:00',
    currency?: string,
    pickupHotelId?: string,
    confirmationStatus: string = 'pending',
    adults?: number,
    children?: number,
    priceBaseCents?: number,
    priceAddonsCents?: number,
    pickupRequired?: boolean
  ) => {
    if (!trip) {
      throw new Error('No trip data available')
    }

    const day = trip.days[dayIndex]
    if (!day) {
      throw new Error(`Day at index ${dayIndex} not found`)
    }

    const dayId = day.id
    const tripCurrency = currency || trip.currency.code
    const hotelId = pickupHotelId || (day.stay ? day.stay.room.hotel.id : null)

    if (!hotelId) {
      throw new Error(`No hotel found for day at index ${dayIndex}`)
    }

    const bookingData = {
      activityId, // Required
      optionId, // Required
      slot, // Required
      currency: tripCurrency, // Required
      pickupHotelId: hotelId, // Required - Use actual hotel ID
      confirmationStatus, // Required
      // Optional fields
      paxAdults: adults,
      paxChildren: children,
      priceBaseCents,
      priceAddonsCents,
      pickupRequired
    }

    return await addActivityBookingToDay(dayId, bookingData)
  }

  // Comprehensive function to add activity booking to a specific day
  const addActivityBookingToDay = async (
    dayId: string,
    activityData: {
      activityId: string
      optionId: string
      slot: string
      currency: string
      pickupHotelId: string
      confirmationStatus: string
      paxAdults?: number
      paxChildren?: number
      priceBaseCents?: number
      priceAddonsCents?: number
      pickupRequired?: boolean
    }
  ) => {
    try {
      // Validate required fields according to schema
      if (!dayId || !activityData.activityId || !activityData.optionId || !activityData.slot || !activityData.currency || !activityData.pickupHotelId || !activityData.confirmationStatus) {
        throw new Error('Missing required fields: dayId, activityId, optionId, slot, currency, pickupHotelId, or confirmationStatus')
      }

      // Validate that pickupHotelId is a valid number (hotel ID)
      const hotelId = parseInt(activityData.pickupHotelId)
      if (isNaN(hotelId)) {
        throw new Error(`Invalid hotel ID: ${activityData.pickupHotelId}. Hotel ID must be a number.`)
      }

      // Normalize slot type: convert "full-day" to "full_day" for backend compatibility
      const normalizeSlotType = (slot: string): string => {
        return slot === 'full-day' ? 'full_day' : slot
      }

      // Prepare the activity booking input according to schema
      const bookingInput: ActivityBookingInput = {
        tripDay: dayId, // Required
        slot: normalizeSlotType(activityData.slot), // Required - Normalize slot type (full-day -> full_day)
        option: activityData.optionId, // Required
        currency: activityData.currency, // Required
        pickupHotel: hotelId.toString(), // Required - Convert to string for GraphQL
        confirmationStatus: activityData.confirmationStatus, // Required
        // Optional fields
        paxAdults: activityData.paxAdults,
        paxChildren: activityData.paxChildren,
        priceBaseCents: activityData.priceBaseCents,
        priceAddonsCents: activityData.priceAddonsCents,
        pickupRequired: activityData.pickupRequired
      }

      console.log('Adding activity booking to day:', dayId, 'with data:', bookingInput)
      console.log('PAYLOAD BEING SENT - Slot type:', bookingInput.slot, 'from scheduleSlot.type:', bookingInput.slot)

      // Call the GraphQL mutation
      const response = await createActivityBooking(
        bookingInput,
        // Success callback - update UI immediately
        async (response: ActivityBookingResponse) => {
          console.log('Activity booking created successfully:', response)
          
          // Immediately update blocked time slots from the response if it has the necessary data
          if (response.createActivityBooking && response.createActivityBooking.option) {
            const booking = response.createActivityBooking
            const option = booking.option
            
            // Calculate start and end time
            const startTime = option.startTime || '09:00'
            const endTime = calculateEndTime(startTime, option.durationMinutes)
            
            // Add the new blocked time slot immediately
            setBlockedTimeSlots(prev => {
              // Check if this booking already exists (avoid duplicates)
              const existingIndex = prev.findIndex(slot => slot.id === booking.id)
              if (existingIndex >= 0) {
                // Update existing slot
                const updated = [...prev]
                updated[existingIndex] = {
                  id: booking.id,
                  startTime,
                  endTime,
                  title: option.name,
                  slot: booking.slot as DaySlot,
                  dayId: dayId // Use the dayId parameter from the function
                }
                return updated
              } else {
                // Add new slot
                return [...prev, {
                  id: booking.id,
                  startTime,
                  endTime,
                  title: option.name,
                  slot: booking.slot as DaySlot,
                  dayId: dayId // Use the dayId parameter from the function
                }]
              }
            })
          }
          
          // Update the trip data and refetch to get the latest data
          console.log('Activity booking created successfully, refetching trip data...')
          try {
            // Add a small delay to ensure backend has processed the booking
            await new Promise(resolve => setTimeout(resolve, 300))
            
            const refetchResult = await refetchTrip()
            const updatedTripData = refetchResult?.data?.trip
            
            if (updatedTripData) {
              // Update blocked time slots with the newly refetched trip data (this will sync everything)
              updateBlockedTimeSlots(updatedTripData)
              
              // Convert and update proposal with new trip data
              const updatedProposal = convertTripToProposalFormat(updatedTripData)
              updateProposalWithPrices(updatedProposal)
            }
          } catch (refetchError) {
            console.error('Error refetching trip data:', refetchError)
          }
        },
        // Error callback
        (error: string) => {
          console.error('Failed to create activity booking:', error)
        }
      )

      return response

    } catch (error: any) {
      console.error('Error in addActivityBookingToDay:', error)
      throw error
    }
  }

  // Helper function to add activity booking from activity selection
  const handleActivityBookingFromSelection = async (
    dayId: string,
    activity: ActivityType,
    selection: ActivitySelection
  ) => {
    try {
      if (!trip) {
        throw new Error('No trip data available')
      }

      // Find the day to get the hotel ID from the stay
      const day = trip.days.find(d => d.id === dayId)
      if (!day || !day.stay) {
        throw new Error('No stay found for the selected day')
      }

      const hotelId = day.stay.room.hotel.id

      // Ensure hotel ID is a valid number
      if (!hotelId || isNaN(parseInt(hotelId.toString()))) {
        throw new Error(`Invalid hotel ID from trip data: ${hotelId}. Hotel ID must be a valid number.`)
      }

      console.log('Activity booking data:', {
        dayId,
        hotelId,
        hotelIdType: typeof hotelId,
        activityId: activity.id,
        optionId: selection.scheduleSlot.id,
        slot: selection.scheduleSlot.type,
        slotDurationMins: selection.scheduleSlot.durationMins,
        currency: 'INR',
        pickupOption: selection.pickupOption
      })

      // Normalize slot type: convert "full-day" to "full_day" for backend compatibility
      const normalizeSlotType = (slot: string): string => {
        return slot === 'full-day' ? 'full_day' : slot
      }

      // Log the slot type transformation
      const normalizedSlot = normalizeSlotType(selection.scheduleSlot.type)
      console.log('Slot type transformation:', {
        original: selection.scheduleSlot.type,
        normalized: normalizedSlot,
        durationMins: selection.scheduleSlot.durationMins
      })

      // Convert activity selection to booking data according to schema
      const bookingData = {
        activityId: activity.id, // Required
        optionId: selection.scheduleSlot.id, // Required - Use schedule slot ID as option
        slot: normalizedSlot, // Required - Normalize slot type (full-day -> full_day)
        currency: 'INR', // Required - Use trip currency
        pickupHotelId: hotelId, // Required - Always use actual hotel ID from trip data
        confirmationStatus: 'pending', // Required
        // Optional fields
        paxAdults: selection.adults,
        paxChildren: selection.childrenCount,
        priceBaseCents: Math.round(selection.totalPrice * 100), // Convert to cents
        priceAddonsCents: Math.round((selection.extras?.reduce((sum: number, extra: any) => sum + extra.price, 0) || 0) * 100),
        pickupRequired: selection.pickupOption.type !== 'no_pickup'
      }

      // Add the activity booking
      await addActivityBookingToDay(dayId, bookingData)
      
    } catch (error: any) {
      console.error('Error handling activity booking from selection:', error)
      throw error
    }
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

  // Check for invalid trip ID
  if (!tripId || tripId === 'undefined' || tripId === 'null') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Trip ID</h2>
            <p className="text-gray-600 mb-4">
              The trip ID in the URL is invalid or missing.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check the URL and try again, or create a new proposal.
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/proposal'}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create New Proposal
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip data...</p>
        </div>
      </div>
    )
  }

  if (tripError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Trip</h2>
          <p className="text-gray-600 mb-6">{tripError}</p>
          <button 
            onClick={() => refetchTrip()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mr-4"
          >
            Retry
          </button>
          <button 
            onClick={() => window.location.href = '/proposal'}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Create New Proposal
          </button>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
            <p className="text-gray-600 mb-4">
              The trip with ID <span className="font-mono bg-gray-100 px-2 py-1 rounded">{tripId}</span> could not be found.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This could be because the trip doesn&apos;t exist, you don&apos;t have permission to view it, or it may have been deleted.
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => refetchTrip()}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/proposal'}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Create New Proposal
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
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


             {/* Date Availability Calendar
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.05 }}
             >
               <div className="bg-white rounded-2xl p-6">
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

             {/* Flights Section - Hidden for now */}
            {false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl p-6">
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
            )}

            {/* Hotels Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Hotels</h2>
                  <div className="flex items-center space-x-3">
                    {!isSplitStayEnabled && (
                      <button
                        onClick={() => {
                          setEditingHotelIndex(null)
                          setEditingHotelDayId(null)
                          setIsHotelSelectOpen(true)
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        + Add Hotel
                      </button>
                    )}
                  </div>
                </div>

                {/* Split Stay Manager */}
                <div className="mb-6">
                  <SplitStayManager
                    totalNights={trip?.durationDays || proposal?.durationDays || 1}
                    totalDays={trip?.durationDays || proposal?.durationDays || 1}
                    startDate={trip?.startDate || proposal?.fromDate || new Date().toISOString()}
                    endDate={trip?.endDate || proposal?.toDate || new Date().toISOString()}
                    adults={trip?.travelerDetails?.adults || proposal?.adults || 2}
                    childrenCount={trip?.travelerDetails?.children || proposal?.children || 0}
                    cityId={trip?.days?.[0]?.city?.id || proposal?.destinations?.[0]?.id || '2'}
                    cityName={trip?.days?.[0]?.city?.name || proposal?.destinations?.[0]?.name || 'Miami'}
                    onSplitStayChange={handleSplitStayChange}
                    isEnabled={isSplitStayEnabled}
                    onToggle={handleSplitStayToggle}
                    initialSegments={splitStaySegments}
                  />
                </div>

                {/* Regular Hotel Cards (when Split Stay is disabled) */}
                {!isSplitStayEnabled && (
                  <div className="space-y-4">
                    {proposal?.hotels?.map((hotel, index) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        onEdit={() => handleChangeHotel(index)}
                        onChangeRoom={() => handleChangeRoom(hotel)}
                        onChangeHotel={() => handleChangeHotel(index)}
                        onRemove={async () => {
                          if (!trip || !proposal) return
                          
                          // Extract hotel ID from composite ID (format: "hotelId-checkIn" or just "hotelId")
                          const hotelId = hotel.id.includes('-') ? hotel.id.split('-')[0] : hotel.id
                          
                          // Find the corresponding trip stay for this hotel by matching hotel ID and check-in date
                          const tripDay = trip.days.find(day => 
                            day.stay && 
                            day.stay.room.hotel.id === hotelId &&
                            day.stay.checkIn === hotel.checkIn
                          )
                          
                          if (!tripDay?.stay?.id) {
                            console.error('No trip stay found for hotel:', hotel.id)
                            return
                          }
                          
                          try {
                            // Call the delete API
                            await deleteTripStay(tripDay.stay.id)
                            
                            // Refresh trip data to get updated information
                            await refetchTrip()
                          } catch (error) {
                            console.error('Error deleting trip stay:', error)
                          }
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Split Stay Summary (when enabled) */}
                {isSplitStayEnabled && splitStaySegments.length > 0 && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Split Stay Summary</h3>
                    <div className="space-y-2">
                      {splitStaySegments.map((segment, index) => (
                        <div key={segment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {segment.hotel?.name || `Segment ${index + 1}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                {segment.duration} {segment.duration === 1 ? 'night' : 'nights'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">
                              {getCurrencySymbol(trip?.currency?.code || proposal?.currency || 'INR')}{segment.hotel?.minPrice * segment.duration || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Day-by-Day Itinerary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-6">
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
                      dayIndex={index}
                      blockedTimeSlots={blockedTimeSlots}
                      hideTimeline={false}
                      onEdit={() => handleEditItem('day', day)}
                      onRemove={() => {
                        if (!proposal) return
                        updateProposal({
                          ...proposal,
                          days: proposal.days.filter((d: Day) => d.id !== day.id)
                        })
                      }}
                      onAddActivity={() => handleAddActivity(index)}
                      onEditActivity={(activity, dayIndex) => {
                        // Find the actual activity data from trip data
                        const currentBooking = trip?.days
                          .flatMap(day => day.activityBookings)
                          .find(booking => booking.id === activity.id)
                        
                        if (currentBooking?.option.activity) {
                          // Create activity object that matches the Activity interface from proposal
                          const activityData: Activity = {
                            id: currentBooking.option.activity.id,
                            title: currentBooking.option.activity.title,
                            description: currentBooking.option.activity.description || currentBooking.option.activity.summary || '',
                            time: currentBooking.option.startTime || 'TBD',
                            duration: `${currentBooking.option.durationMinutes} minutes`,
                            price: (currentBooking.priceBaseCents + currentBooking.priceAddonsCents) / 100,
                            currency: trip?.currency?.code || 'INR',
                            type: currentBooking.slot as 'morning' | 'afternoon' | 'evening',
                            included: false // Default to false, can be updated based on business logic
                          }
                          
                          setSelectedActivityForDetails(activityData)
                          setIsActivityDetailsOpen(true)
                          setEditingDayIndex(dayIndex)
                          setEditingActivityBookingId(activity.id) // Store the booking ID for deletion
                          console.log('Edit activity:', activityData, 'in day:', dayIndex)
                        } else {
                          console.error('Activity data not found for booking:', activity.id)
                        }
                      }}
                      onRemoveActivity={async (activityId, dayIndex) => {
                        console.log('onRemoveActivity called with:', { activityId, dayIndex, proposal: !!proposal })
                        
                        if (!proposal) {
                          console.error('No proposal available')
                          return
                        }
                        
                        try {
                          console.log('Calling deleteActivityBooking with ID:', activityId)
                          // Call the delete mutation
                          const result = await deleteActivityBooking(activityId)
                          console.log('Delete result:', result)
                          
                          if (result) {
                            console.log('Activity deleted successfully, updating local state')
                            // Update local state to remove the activity
                            const updatedDays = [...proposal.days]
                            updatedDays[dayIndex] = {
                              ...updatedDays[dayIndex],
                              activities: updatedDays[dayIndex].activities.filter(a => a.id !== activityId)
                            }
                            updateProposalWithPrices({
                              ...proposal,
                              days: updatedDays
                            })
                            
                            // Refresh trip data to get updated activity bookings
                          if (refetchTrip) {
                            console.log('Refreshing trip data')
                            refetchTrip().then((refetchResult) => {
                              const updatedTripData = refetchResult?.data?.trip
                              if (updatedTripData) {
                                updateBlockedTimeSlots(updatedTripData)
                                const updatedProposal = convertTripToProposalFormat(updatedTripData)
                                updateProposalWithPrices(updatedProposal)
                              }
                            })
                          }
                          } else {
                            console.error('Delete result was null/undefined')
                          }
                        } catch (error) {
                          console.error('Error removing activity:', error)
                          // The error toast will be shown by the useActivityBooking hook
                        }
                      }}
                      onAddTransfer={() => handleAddTransfer(index)}
                      onEditTransfer={(transfer, dayIndex) => {
                        // Find the actual transfer data from trip data
                        // Note: Transfers might not be in the trip days structure, so we'll search through all days
                        const currentTransfer = trip?.days
                          .flatMap((day: any) => (day as any).transfers || [])
                          .find((t: any) => t.id === transfer.id)
                        
                        if (currentTransfer?.transferProduct) {
                          setSelectedTransferForDetails({
                            id: currentTransfer.transferProduct.id,
                            name: currentTransfer.transferProduct.name || 'Transfer',
                            description: currentTransfer.transferProduct.description || '',
                            city: {
                              id: currentTransfer.transferProduct.city?.id || '',
                              name: currentTransfer.transferProduct.city?.name || '',
                              country: {
                                iso2: currentTransfer.transferProduct.city?.country?.iso2 || '',
                                name: currentTransfer.transferProduct.city?.country?.name || ''
                              }
                            },
                            vehicle: {
                              id: currentTransfer.transferProduct.vehicle?.id || '',
                              type: currentTransfer.transferProduct.vehicle?.type || '',
                              name: currentTransfer.transferProduct.vehicle?.name || '',
                              capacityAdults: currentTransfer.transferProduct.vehicle?.capacityAdults || 0,
                              capacityChildren: currentTransfer.transferProduct.vehicle?.capacityChildren || 0,
                              amenities: currentTransfer.transferProduct.vehicle?.amenities || {}
                            },
                            supplier: {
                              id: currentTransfer.transferProduct.supplier?.id || '',
                              name: currentTransfer.transferProduct.supplier?.name || ''
                            },
                            currency: {
                              code: currentTransfer.currency?.code || trip?.currency?.code || 'INR',
                              name: currentTransfer.currency?.name || trip?.currency?.name || 'Indian Rupee'
                            },
                            priceCents: currentTransfer.transferProduct.priceCents || 0,
                            cancellationPolicy: currentTransfer.transferProduct.cancellationPolicy,
                            commissionRate: currentTransfer.transferProduct.commissionRate || 0
                          })
                          setIsTransferDetailsOpen(true)
                          setEditingDayIndex(dayIndex)
                          setEditingTransferBookingId(transfer.id)
                        }
                      }}
                      onRemoveTransfer={async (transferId, dayIndex) => {
                        console.log('onRemoveTransfer called with:', { transferId, dayIndex })
                        
                        if (!proposal) {
                          console.error('No proposal available')
                          return
                        }
                        
                        try {
                          console.log('Calling deleteTransfer with ID:', transferId)
                          const result = await deleteTransfer(transferId)
                          if (result) {
                            console.log('Transfer deleted successfully, refetching trip data')
                            await refetchTrip()
                          }
                        } catch (error) {
                          console.error('Error removing transfer:', error)
                        }
                      }}
                    />
                  ))}
                </div>
               </div>
             </motion.div>

             {/* Optional Sections - Hidden for now */}
             {false && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
             >
               <div className="bg-white rounded-2xl p-6">
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
             )}

             {/* Proposal Metadata */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.5 }}
             >
               <div className="bg-white rounded-2xl p-6">
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
                    <Label htmlFor="markupFlightPercent">Flight Markup %</Label>
                    <Input
                      id="markupFlightPercent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={proposal?.markupFlightPercent ?? ''}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        if (inputValue === '') {
                          handleFieldChange('markupFlightPercent', null)
                        } else {
                          const numValue = parseFloat(inputValue)
                          if (!isNaN(numValue) && numValue >= 0) {
                            handleFieldChange('markupFlightPercent', numValue)
                          }
                        }
                      }}
                      placeholder="Enter flight markup %"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="markupLandPercent">Land Markup %</Label>
                    <Input
                      id="markupLandPercent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={proposal?.markupLandPercent ?? ''}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        if (inputValue === '') {
                          handleFieldChange('markupLandPercent', null)
                        } else {
                          const numValue = parseFloat(inputValue)
                          if (!isNaN(numValue) && numValue >= 0) {
                            handleFieldChange('markupLandPercent', numValue)
                          }
                        }
                      }}
                      placeholder="Enter land markup %"
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
          setEditingHotelDayId(null)
        }}
        onSelectHotel={handleHotelSelect}
        currentHotel={editingHotelIndex !== null && proposal?.hotels[editingHotelIndex] ? convertProposalHotelToHotelType(proposal.hotels[editingHotelIndex]) : undefined}
        stayId="stay-1"
        checkIn={proposal?.hotels[editingHotelIndex || 0]?.checkIn || trip?.startDate || new Date().toISOString()}
        checkOut={proposal?.hotels[editingHotelIndex || 0]?.checkOut || trip?.endDate || new Date().toISOString()}
        nights={proposal?.hotels[editingHotelIndex || 0]?.nights || trip?.durationDays || 1}
        adults={trip?.travelerDetails?.adults || proposal?.adults || 2}
        childrenCount={trip?.travelerDetails?.children || proposal?.children || 0}
        cityId={editingHotelDayId ? trip?.days.find(d => d.id === editingHotelDayId)?.city?.id : (trip?.days?.[0]?.city?.id || proposal?.destinations?.[0]?.id || '2')}
        cityName={editingHotelDayId ? trip?.days.find(d => d.id === editingHotelDayId)?.city?.name : (trip?.days?.[0]?.city?.name || proposal?.destinations?.[0]?.name || 'Miami')}
      />

      {/* Hotel Details Modal for Room Selection */}
      {selectedHotelForDetails && (
        <HotelDetailsModal
          isOpen={isHotelDetailsOpen}
          onClose={handleCloseHotelDetails}
          hotelId={selectedHotelForDetails.id}
          onSelectRoom={handleRoomSelect}
          checkIn={selectedHotelForDetails.checkIn}
          checkOut={selectedHotelForDetails.checkOut}
          nights={selectedHotelForDetails.nights}
          adults={proposal?.adults || 2}
          childrenCount={proposal?.children || 0}
          mode="modal"
        />
      )}

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

      {/* Activity Details Modal */}
      {selectedActivityForDetails && (
        <ActivityDetailsModal
          isOpen={isActivityDetailsOpen}
          onClose={() => {
            setIsActivityDetailsOpen(false)
            setSelectedActivityForDetails(null)
            setEditingDayIndex(null)
            setEditingActivityBookingId(null)
          }}
          activityId={selectedActivityForDetails.id}
          onAddToPackage={handleActivitySelect}
          dayId={editingDayIndex !== null ? proposal?.days[editingDayIndex]?.id || 'day-1' : 'day-1'}
          checkIn={proposal?.fromDate || ''}
          checkOut={proposal?.toDate || ''}
          adults={proposal?.adults || 0}
          childrenCount={proposal?.children || 0}
          isEditMode={!!editingActivityBookingId}
          currentBookingId={editingActivityBookingId || undefined}
          currentSelection={editingActivityBookingId && trip ? (() => {
            // Find the current booking data from trip
            const currentBooking = trip.days
              .flatMap(day => day.activityBookings)
              .find(booking => booking.id === editingActivityBookingId)
            
            if (currentBooking) {
              return {
                selectedOption: {
                  id: currentBooking.option.id,
                  name: currentBooking.option.name,
                  priceCents: currentBooking.option.priceCents,
                  priceCentsChild: currentBooking.option.priceCentsChild,
                  durationMinutes: currentBooking.option.durationMinutes,
                  maxParticipants: currentBooking.option.maxParticipants,
                  maxParticipantsChild: currentBooking.option.maxParticipantsChild,
                  isRefundable: currentBooking.option.isRefundable,
                  isRecommended: currentBooking.option.isRecommended,
                  isAvailable: currentBooking.option.isAvailable,
                  refundPolicy: currentBooking.option.refundPolicy,
                  cancellationPolicy: currentBooking.option.cancellationPolicy,
                  notes: currentBooking.option.notes,
                  startTime: currentBooking.option.startTime,
                  endTime: currentBooking.option.endTime,
                  inclusions: currentBooking.option.inclusions,
                  exclusions: currentBooking.option.exclusions,
                  currency: {
                    code: 'INR', // Default currency
                    name: 'Indian Rupee'
                  },
                  mealPlan: currentBooking.option.mealPlan ? {
                    id: currentBooking.option.mealPlan.id,
                    name: currentBooking.option.mealPlan.name,
                    mealPlanType: currentBooking.option.mealPlan.mealPlanType,
                    mealValue: currentBooking.option.mealPlan.mealValue,
                    vegType: currentBooking.option.mealPlan.vegType,
                    description: currentBooking.option.mealPlan.description
                  } : undefined,
                  season: currentBooking.option.season ? {
                    id: currentBooking.option.season.id,
                    name: currentBooking.option.season.name,
                    startDate: currentBooking.option.season.startDate,
                    endDate: currentBooking.option.season.endDate
                  } : undefined
                },
                scheduleSlot: {
                  id: currentBooking.option.id,
                  startTime: currentBooking.option.startTime,
                  durationMins: currentBooking.option.durationMinutes,
                  type: currentBooking.slot as 'morning' | 'afternoon' | 'evening' | 'full-day',
                  available: true,
                  maxPax: currentBooking.option.maxParticipants,
                  currentBookings: 0
                },
                pickupOption: {
                  id: currentBooking.pickupHotel?.id || 'no-pickup',
                  label: currentBooking.pickupHotel?.name || 'No Pickup',
                  price: 0,
                  description: currentBooking.pickupHotel?.address || '',
                  type: 'hotel' as const
                },
                adults: currentBooking.paxAdults || proposal?.adults || 0,
                childrenCount: currentBooking.paxChildren || proposal?.children || 0,
                extras: [],
                notes: ''
              }
            }
            return undefined
          })() : undefined}
        />
      )}

      {/* Transfer Explorer Modal */}
      <TransferExplorerModal
        isOpen={isTransferExplorerOpen}
        onClose={() => {
          setIsTransferExplorerOpen(false)
          setEditingDayIndex(null)
        }}
        onSelectTransfer={handleTransferSelect}
        dayId={editingDayIndex !== null ? proposal?.days[editingDayIndex]?.id || 'day-1' : 'day-1'}
        mode="add"
      />

      {/* Transfer Details Modal */}
      {selectedTransferForDetails && (
        <TransferDetailsModal
          isOpen={isTransferDetailsOpen}
          onClose={() => {
            setIsTransferDetailsOpen(false)
            setSelectedTransferForDetails(null)
            setEditingDayIndex(null)
            setEditingTransferBookingId(null)
          }}
          transferProductId={selectedTransferForDetails.id}
          onAddToPackage={handleTransferSelect}
          dayId={editingDayIndex !== null ? proposal?.days[editingDayIndex]?.id || 'day-1' : 'day-1'}
          adults={proposal?.adults || 0}
          childrenCount={proposal?.children || 0}
          isEditMode={!!editingTransferBookingId}
          currentBookingId={editingTransferBookingId || undefined}
        />
      )}
    </div>
  )
}
