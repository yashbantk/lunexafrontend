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
import HotelDetailsModal from "@/components/hotels/HotelDetailsModal"
import { SplitStayManager } from "@/components/hotels/SplitStayManager"
import ActivityExplorerModal from "@/components/activities/ActivityExplorerModal"
import ActivityDetailsModal from "@/components/activities/ActivityDetailsModal"
import { Proposal, Day, Flight, Hotel, Activity, PriceBreakdown } from "@/types/proposal"
import { Hotel as HotelType } from "@/types/hotel"
import { Activity as ActivityType, ActivitySelection } from "@/types/activity"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateItineraryProposalResponse } from "@/hooks/useCreateItineraryProposal"
import { useActivityBooking, ActivityBookingInput, ActivityBookingResponse } from "@/hooks/useActivityBooking"
import { useTrip, TripData } from "@/hooks/useTrip"
import { useCreateProposal, ProposalInput } from "@/hooks/useCreateProposal"
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
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'flight' | 'hotel' | 'activity' | 'day'>('flight')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isHotelSelectOpen, setIsHotelSelectOpen] = useState(false)
  const [editingHotelIndex, setEditingHotelIndex] = useState<number | null>(null)
  const [isHotelDetailsOpen, setIsHotelDetailsOpen] = useState(false)
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<Hotel | null>(null)
  const [isActivityExplorerOpen, setIsActivityExplorerOpen] = useState(false)
  const [isActivityDetailsOpen, setIsActivityDetailsOpen] = useState(false)
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<Activity | null>(null)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)
  const [editingActivityBookingId, setEditingActivityBookingId] = useState<string | null>(null)
  
  // Split Stay state
  const [isSplitStayEnabled, setIsSplitStayEnabled] = useState(false)
  const [splitStaySegments, setSplitStaySegments] = useState<any[]>([])
  
  // Activity slot filtering state
  const [selectedSlot, setSelectedSlot] = useState<DaySlot | null>(null)
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<ActivityTimeBlock[]>([])
  
  // Trip data hook
  const { trip, loading: tripLoading, error: tripError, refetch: refetchTrip, notFound } = useTrip(tripId)
  
  // Activity booking hook
  const { createActivityBooking, deleteActivityBooking, isLoading: isCreatingActivityBooking } = useActivityBooking()
  
  // Proposal creation hook
  const { createProposalAndRedirect, isLoading: isCreatingProposal } = useCreateProposal()

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

    // Calculate markup
    const markupPercent = proposal.markupPercent || 0
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
  }

  const saveProposal = useCallback(async (proposalToSave: Proposal | null) => {
    console.log('saveProposal called - this should only happen when user clicks "Save as Proposal"')
    
    if (!proposalToSave || !trip) {
      console.error('No proposal or trip data available')
      return
    }
    
    try {
      console.log('Saving proposal:', proposalToSave)
      
      // Calculate total price from proposal
      const totalPriceCents = proposalToSave.priceBreakdown?.total 
        ? Math.round(proposalToSave.priceBreakdown.total * 100)
        : 0
      
      // Prepare proposal data
      const proposalData: ProposalInput = {
        trip: trip.id, // Required - Trip ID
        name: proposalToSave.tripName || `Proposal for ${trip.fromCity.name}`, // Optional - Proposal name
        status: 'draft', // Optional - Proposal status
        currency: trip.currency.code, // Optional - Currency code
        totalPriceCents, // Optional - Total price in cents
        estimatedDateOfBooking: new Date().toISOString(), // Optional - Estimated booking date
        areFlightsBooked: false, // Optional - Whether flights are booked
        flightsMarkup: Number(trip.markupFlightPercent) || 0, // Optional - Flight markup percentage
        landMarkup: Number(trip.markupLandPercent) || 0, // Optional - Land markup percentage
        landMarkupType: 'percentage' // Optional - Land markup type
        // version will be automatically determined by the hook
      }
      
      console.log('Creating proposal with data:', proposalData)
      
      // Create proposal and redirect
      await createProposalAndRedirect(proposalData)
      
    } catch (error) {
      console.error('Error saving proposal:', error)
    }
  }, [trip, createProposalAndRedirect])

  // Convert Trip data to Proposal format
  const convertTripToProposalFormat = (tripData: TripData): Proposal => {
    const trip = tripData
    
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
        currency: trip.currency.code,
        type: activity.slot as 'morning' | 'afternoon' | 'evening' | 'full_day',
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
    const convertedHotels: Hotel[] = trip.days
      .filter((day: any) => day.stay)
      .map((day: any) => ({
        id: day.stay.room.hotel.id,
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
      currency: trip.currency.code,
        confirmationStatus: day.stay.confirmationStatus
    }))
    
    // Create initial proposal without price breakdown (will be calculated later)
    const initialProposal: Proposal = {
      id: trip.id,
      tripName: `${trip.fromCity.name} Trip`,
      fromDate: trip.startDate.split('T')[0],
      toDate: trip.endDate.split('T')[0],
      origin: trip.fromCity.name,
      nationality: trip.nationality.name,
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
      markupPercent: parseFloat(trip.markupLandPercent),
      currency: trip.currency.code,
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
        currency: trip.currency.code
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
  }

  // Load trip data and convert to proposal format
  useEffect(() => {
    if (trip && !tripLoading) {
      try {
        console.log('Trip data loaded:', trip)
        
        // Convert the trip data to proposal format
        const convertedProposal = convertTripToProposalFormat(trip)
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
  }, [trip, tripLoading])

  // Update blocked time slots from trip data
  const updateBlockedTimeSlots = (tripData: TripData) => {
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
          slot: booking.slot as DaySlot // Use the actual slot type from the booking
        })
      })
    })
    
    setBlockedTimeSlots(blockedSlots)
  }

  // Auto-save functionality removed - only save when user explicitly clicks "Save as Proposal"

  // Keyboard shortcuts - Ctrl+S to save proposal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        if (proposal) {
          saveProposal(proposal)
        }
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
      const updatedProposal = {
        ...proposal,
        hotels: updatedHotels
      }
      updateProposalWithPrices(updatedProposal)
    } else {
      // Add new hotel
      const updatedProposal = {
        ...proposal,
        hotels: [...proposal.hotels, proposalHotel]
      }
      updateProposalWithPrices(updatedProposal)
    }

    setIsHotelSelectOpen(false)
    setEditingHotelIndex(null)
  }

  const handleChangeHotel = (index: number) => {
    setEditingHotelIndex(index)
    setIsHotelSelectOpen(true)
  }

  const handleChangeRoom = (hotel: Hotel) => {
    setSelectedHotelForDetails(hotel)
    setIsHotelDetailsOpen(true)
  }

  const handleCloseHotelDetails = () => {
    setIsHotelDetailsOpen(false)
    setSelectedHotelForDetails(null)
  }

  // Split Stay handlers
  const handleSplitStayChange = (segments: any[]) => {
    setSplitStaySegments(segments)
    
    if (segments.length > 0 && segments.every(segment => segment.hotel)) {
      // Convert split stay segments to regular hotels
      const splitStayHotels: Hotel[] = segments.map(segment => ({
        id: segment.hotel.id,
        name: segment.hotel.name,
        address: segment.hotel.address,
        rating: segment.hotel.rating,
        starRating: segment.hotel.starRating,
        image: segment.hotel.images[0],
        checkIn: segment.startDate,
        checkOut: segment.endDate,
        roomType: 'Standard Room', // Default room type
        boardBasis: 'Room Only', // Default board basis
        bedType: 'Double', // Default bed type
        nights: segment.duration,
        refundable: true,
        pricePerNight: segment.hotel.minPrice,
        currency: 'USD',
        confirmationStatus: 'pending'
      }))
      
      // Update proposal with split stay hotels
      if (proposal) {
        const updatedProposal = {
          ...proposal,
          hotels: splitStayHotels
        }
        updateProposalWithPrices(updatedProposal)
      }
    }
  }

  const handleSplitStayToggle = (enabled: boolean) => {
    setIsSplitStayEnabled(enabled)
    
    if (!enabled) {
      // Clear split stay segments when disabled
      setSplitStaySegments([])
    }
  }

  const handleRoomSelect = (room: any) => {
    if (!proposal || !selectedHotelForDetails) return

    // Find the hotel index in the proposal
    const hotelIndex = proposal.hotels.findIndex(h => h.id === selectedHotelForDetails.id)
    if (hotelIndex === -1) return

    // Update the hotel with new room details
    const updatedHotels = [...proposal.hotels]
    updatedHotels[hotelIndex] = {
      ...updatedHotels[hotelIndex],
      roomType: room.name,
      boardBasis: room.board,
      bedType: room.bedType,
      pricePerNight: room.pricePerNight,
      currency: room.currency || 'USD',
      refundable: room.refundable
    }

    // Update proposal with recalculated prices
    const updatedProposal = {
      ...proposal,
      hotels: updatedHotels
    }
    updateProposalWithPrices(updatedProposal)

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
        const dayBlockedSlots = blockedTimeSlots.filter(slot => 
          trip.days.find(day => day.id === targetDayId)?.activityBookings.some(booking => booking.id === slot.id)
        )
        
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

      // Prepare the activity booking input according to schema
      const bookingInput: ActivityBookingInput = {
        tripDay: dayId, // Required
        slot: activityData.slot, // Required
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

      // Call the GraphQL mutation
      const response = await createActivityBooking(
        bookingInput,
        // Success callback - update UI immediately
        (response: ActivityBookingResponse) => {
          console.log('Activity booking created successfully:', response)
          
          // Update the trip data and refetch to get the latest data
          console.log('Activity booking created successfully, refetching trip data...')
          refetchTrip().then(() => {
            // Update blocked time slots after successful booking
            if (trip) {
              updateBlockedTimeSlots(trip)
            }
          })
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
        currency: trip.currency.code,
        pickupOption: selection.pickupOption
      })

      // Convert activity selection to booking data according to schema
      const bookingData = {
        activityId: activity.id, // Required
        optionId: selection.scheduleSlot.id, // Required - Use schedule slot ID as option
        slot: selection.scheduleSlot.type, // Required - Use slot type (morning/afternoon/evening/full-day)
        currency: trip.currency.code, // Required - Use trip currency
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
              This could be because the trip doesn't exist, you don't have permission to view it, or it may have been deleted.
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
      <TopBar 
        totalPrice={proposal?.priceBreakdown?.total || 0}
        currency={proposal?.currency || 'USD'}
        adults={proposal?.adults || 2}
        childrenCount={proposal?.children || 0}
        onSaveDraft={() => saveProposal(proposal)}
        isSaving={isCreatingProposal}
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Hotels</h2>
                  <div className="flex items-center space-x-3">
                    {!isSplitStayEnabled && (
                      <button
                        onClick={() => {
                          setEditingHotelIndex(null)
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
                    totalNights={proposal?.durationDays || 1}
                    totalDays={proposal?.durationDays || 1}
                    startDate={proposal?.fromDate || new Date().toISOString()}
                    endDate={proposal?.toDate || new Date().toISOString()}
                    adults={proposal?.adults || 2}
                    childrenCount={proposal?.children || 0}
                    cityId={proposal?.destinations?.[0]?.id || '2'}
                    cityName={proposal?.destinations?.[0]?.name || 'Miami'}
                    onSplitStayChange={handleSplitStayChange}
                    isEnabled={isSplitStayEnabled}
                    onToggle={handleSplitStayToggle}
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
                        onRemove={() => {
                          if (!proposal) return
                          const updatedProposal = {
                            ...proposal,
                            hotels: proposal.hotels.filter((h: Hotel) => h.id !== hotel.id)
                          }
                          updateProposalWithPrices(updatedProposal)
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
                              ${segment.hotel?.minPrice * segment.duration || 0}
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
                      dayIndex={index}
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
                            currency: trip?.currency?.code || 'USD',
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
                        if (!proposal) return
                        
                        try {
                          // Call the delete mutation
                          const result = await deleteActivityBooking(activityId)
                          
                          if (result) {
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
                              refetchTrip()
                            }
                          }
                        } catch (error) {
                          console.error('Error removing activity:', error)
                          // The error toast will be shown by the useActivityBooking hook
                        }
                      }}
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
        currentHotel={editingHotelIndex !== null && proposal?.hotels[editingHotelIndex] ? convertProposalHotelToHotelType(proposal.hotels[editingHotelIndex]) : undefined}
        stayId="stay-1"
        checkIn={proposal?.hotels[editingHotelIndex || 0]?.checkIn || new Date().toISOString()}
        checkOut={proposal?.hotels[editingHotelIndex || 0]?.checkOut || new Date().toISOString()}
        nights={proposal?.hotels[editingHotelIndex || 0]?.nights || 1}
        adults={proposal?.adults || 2}
        childrenCount={proposal?.children || 0}
        cityId={proposal?.destinations?.[0]?.id || '2'}
        cityName={proposal?.destinations?.[0]?.name || 'Miami'}
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
                    code: 'USD', // Default currency
                    name: 'US Dollar'
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
    </div>
  )
}
