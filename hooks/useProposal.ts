import { useState, useEffect } from 'react'
import { Proposal, Flight, Hotel, Day, PriceBreakdown } from '@/types/proposal'

// Mock data
const mockProposal: Proposal = {
  id: '1',
  tripName: 'Bali Adventure Trip',
  fromDate: '2025-10-15',
  toDate: '2025-10-19',
  origin: 'Delhi',
  nationality: 'India',
  starRating: '5',
  landOnly: false,
  addTransfers: true,
  rooms: 1,
  adults: 2,
  children: 0,
  clientName: 'John Doe',
  clientEmail: 'john@example.com',
  clientPhone: '+91 9876543210',
  internalNotes: 'VIP client - high priority',
  salesperson: 'Sarah Johnson',
  validityDays: 7,
  markupPercent: 5,
  currency: 'INR',
  flights: [
    {
      id: '1',
      type: 'outbound',
      airline: 'AirAsia',
      flightNumber: 'D7-183',
      from: 'Delhi',
      to: 'Bali',
      departureTime: '23:20',
      arrivalTime: '12:20',
      departureDate: '2025-10-15',
      arrivalDate: '2025-10-16',
      duration: '10h 30m',
      class: 'Economy',
      stops: 1,
      refundable: false,
      price: 22000,
      currency: 'INR'
    },
    {
      id: '2',
      type: 'return',
      airline: 'Air India',
      flightNumber: 'AI-2146',
      from: 'Bali',
      to: 'Delhi',
      departureTime: '10:00',
      arrivalTime: '15:35',
      departureDate: '2025-10-19',
      arrivalDate: '2025-10-19',
      duration: '8h 5m',
      class: 'Economy',
      stops: 0,
      refundable: false,
      price: 22000,
      currency: 'INR'
    }
  ],
  hotels: [
    {
      id: '1',
      name: 'The Kuta Beach Heritage Hotel Bali - Managed By Accor',
      address: 'Jl. Pantai Kuta, Br. Pande Mas',
      rating: 8.4,
      starRating: 5,
      image: '/api/placeholder/300/200',
      checkIn: '2025-10-16T14:00:00',
      checkOut: '2025-10-19T12:00:00',
      roomType: 'Classic Heritage Room',
      boardBasis: 'Room Only',
      bedType: '1 King',
      nights: 3,
      refundable: true,
      pricePerNight: 45000,
      currency: 'INR'
    }
  ],
  days: [
    {
      id: '1',
      dayNumber: 1,
      date: '2025-10-16',
      title: 'Arrival in Bali',
      summary: 'Arrive in Bali and transfer to hotel',
      activities: [],
      arrival: {
        flight: 'D7-183',
        time: '12:20',
        date: '2025-10-16',
        description: 'Upon your arrival at Ngurah Rai Airport in Denpasar, Bali, our representative will meet and welcome you. You will then be taken to the hotel for your refreshment.'
      },
      accommodation: 'The Kuta Beach Heritage Hotel Bali',
      transfers: ['Private Transfer from Airport to Hotel'],
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false
      }
    },
    {
      id: '2',
      dayNumber: 2,
      date: '2025-10-17',
      title: 'Bali - Day at leisure',
      summary: 'Free day to explore Bali',
      activities: [],
      accommodation: 'The Kuta Beach Heritage Hotel Bali',
      transfers: [],
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false
      }
    },
    {
      id: '3',
      dayNumber: 3,
      date: '2025-10-18',
      title: 'Bali - Day at leisure',
      summary: 'Free day to explore Bali',
      activities: [],
      accommodation: 'The Kuta Beach Heritage Hotel Bali',
      transfers: [],
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false
      }
    },
    {
      id: '4',
      dayNumber: 4,
      date: '2025-10-19',
      title: 'Departure from Bali',
      summary: 'Check out and transfer to airport',
      activities: [],
      departure: {
        flight: 'AI-2146',
        time: '10:00',
        date: '2025-10-19',
        description: 'After a hearty breakfast you are transferred in time to the airport to board your flight.'
      },
      accommodation: 'The Kuta Beach Heritage Hotel Bali',
      transfers: ['Private Transfer from Hotel to Airport'],
      meals: {
        breakfast: true,
        lunch: false,
        dinner: false
      }
    }
  ],
  priceBreakdown: {
    pricePerAdult: 47500,
    pricePerChild: 0,
    subtotal: 95000,
    taxes: 15000,
    markup: 5000,
    total: 115000,
    currency: 'INR'
  }
}

export function useProposal(id?: string) {
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProposal(mockProposal)
      setIsLoading(false)
    }, 1000)
  }, [id])

  const updateProposal = (updatedProposal: Proposal) => {
    setProposal(updatedProposal)
  }

  const saveProposal = async (proposalToSave: Proposal | null) => {
    if (!proposalToSave) return
    
    try {
      // Simulate API call
      console.log('Saving proposal:', proposalToSave)
      // In real implementation, this would be an API call
      // await api.saveProposal(proposalToSave)
    } catch (error) {
      console.error('Error saving proposal:', error)
    }
  }

  return {
    proposal,
    updateProposal,
    saveProposal,
    isLoading
  }
}
