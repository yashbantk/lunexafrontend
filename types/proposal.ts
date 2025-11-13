export interface Proposal {
  id?: string
  tripName: string
  fromDate: string
  toDate: string
  origin: string
  nationality: string
  starRating: string
  landOnly: boolean
  addTransfers: boolean
  rooms: number
  adults: number
  children: number
  clientName: string
  clientEmail: string
  clientPhone: string
  internalNotes: string
  salesperson: string
  validityDays: number
  markupFlightPercent: number | null
  markupLandPercent: number | null
  currency: string
  flights: Flight[]
  hotels: Hotel[]
  days: Day[]
  priceBreakdown: PriceBreakdown
  createdAt?: string
  updatedAt?: string
  // Additional fields for better data display
  tripStatus?: string
  tripType?: string
  totalTravelers?: number
  durationDays?: number
  destinations?: Array<{
    id: string
    name: string
    numberOfDays: number
    order: number
  }>
}

export interface Flight {
  id: string
  type: 'outbound' | 'return'
  airline: string
  flightNumber: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  departureDate: string
  arrivalDate: string
  duration: string
  class: string
  stops: number
  refundable: boolean
  price: number
  currency: string
}

export interface Hotel {
  id: string
  name: string
  address: string
  rating: number
  starRating: number
  image: string
  checkIn: string
  checkOut: string
  roomType: string
  boardBasis: string
  bedType: string
  nights: number
  refundable: boolean
  pricePerNight: number
  currency: string
  confirmationStatus?: string
}

export interface Activity {
  id: string
  title: string
  description: string
  time: string
  duration: string
  price: number
  currency: string
  type: 'morning' | 'afternoon' | 'evening'
  included: boolean
}

export interface Day {
  id: string
  dayNumber: number
  date: string
  title: string
  summary: string
  activities: Activity[]
  arrival?: {
    flight: string
    time: string
    date: string
    description: string
  }
  departure?: {
    flight: string
    time: string
    date: string
    description: string
  }
  accommodation?: string
  transfers: TransferDetail[]
  meals: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
}

export interface TransferDetail {
  id?: string
  name?: string
  pickupTime?: string | null
  pickupLocation?: string | null
  dropoffLocation?: string | null
  vehiclesCount?: number | null
  price?: number | null
  currency?: string | null
  currencyCode?: string | null
  confirmationStatus?: string | null
  transferProduct?: {
    name?: string | null
  } | null
  [key: string]: any
}

export interface PriceBreakdown {
  pricePerAdult: number
  pricePerChild: number
  subtotal: number
  taxes: number
  markup: number
  total: number
  currency: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'flight' | 'hotel' | 'activity' | 'day'
  item?: any
  onSave: (item: any) => void
  proposal?: Proposal | null
}
