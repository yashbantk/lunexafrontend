export interface Hotel {
  id: string
  name: string
  location: string
  address: string
  rating: number
  ratingsCount: number
  starRating: number
  images: string[]
  badges: string[]
  rooms: Room[]
  amenities: string[]
  minPrice: number
  maxPrice: number
  refundable: boolean
  preferred?: boolean
  distance?: number
  coordinates?: {
    lat: number
    lng: number
  }
  shortDescription?: string
  longDescription?: string
  reviews?: Review[]
  policies?: HotelPolicies
  nearbyAttractions?: NearbyAttraction[]
}

export interface Room {
  id: string
  name: string
  group: string
  board: string
  bedType: string
  pricePerNight: number
  totalPrice: number
  cancellationPolicy: string
  refundable: boolean
  maxOccupancy: number
  roomSize: string
  amenities: string[]
  images: string[]
  currency?: string
}

export interface HotelSearchParams {
  query?: string
  location?: string
  stars?: number[]
  priceMin?: number
  priceMax?: number
  amenities?: string[]
  propertyTypes?: string[]
  boardTypes?: string[]
  page?: number
  limit?: number
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'distance'
}

export interface HotelSearchResult {
  results: Hotel[]
  total: number
  page: number
  limit: number
  nextPage?: number
  hasMore: boolean
}

export interface HotelFilters {
  query: string
  location: string
  stars: number[]
  priceRange: [number, number]
  amenities: string[]
  propertyTypes: string[]
  boardTypes: string[]
  sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'distance'
}

export interface HotelSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectHotel: (hotel: Hotel, room: Room) => void
  currentHotel?: Hotel
  stayId: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  childrenCount: number
  cityId?: string
  cityName?: string
}

export interface RoomSelectorProps {
  hotel: Hotel
  onSelectRoom: (room: Room) => void
  onClose: () => void
  isOpen: boolean
  selectedRoom?: Room
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  childrenCount: number
}

export interface HotelQuickViewProps {
  hotel: Hotel
  isOpen: boolean
  onClose: () => void
  onSelectHotel: (hotel: Hotel, room: Room) => void
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  childrenCount: number
}

export interface Review {
  id: string
  author: string
  rating: number
  date: string
  title: string
  content: string
  verified: boolean
  helpful: number
}

export interface HotelPolicies {
  cancellation: string
  checkIn: string
  checkOut: string
  children: string
  infants: string
  pets: string
  smoking: string
  ageRestriction: string
}

export interface NearbyAttraction {
  name: string
  distance: string
  type: string
}

export interface HotelDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  hotelId: string
  onSelectRoom: (hotel: Hotel, room: Room) => void
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  childrenCount: number
  mode?: 'modal' | 'page'
}

export interface HotelDetailsPageProps {
  hotelId: string
  onSelectRoom: (hotel: Hotel, room: Room) => void
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  childrenCount: number
}
