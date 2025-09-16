import { Hotel, Room, HotelSearchParams, HotelSearchResult } from '@/types/hotel'

// Mock hotel data
const mockHotels: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'Risata Bali Resort and Spa',
    location: 'Kuta Selatan',
    address: 'Jl. Pantai Kuta, Kuta Selatan, Bali',
    rating: 8.2,
    ratingsCount: 315,
    starRating: 4,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'
    ],
    badges: ['PREFERRED', 'Refundable'],
    rooms: [
      {
        id: 'room-1-1',
        name: 'Superior Room',
        group: 'Superior',
        board: 'Breakfast',
        bedType: '1 King',
        pricePerNight: 2583,
        totalPrice: 7749,
        cancellationPolicy: 'Fully refundable before 13 Oct',
        refundable: true,
        maxOccupancy: 2,
        roomSize: '32 sq m',
        amenities: ['WiFi', 'Air Conditioning', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300']
      },
      {
        id: 'room-1-2',
        name: 'Deluxe Garden View',
        group: 'Deluxe',
        board: 'Room Only',
        bedType: '1 King',
        pricePerNight: 3200,
        totalPrice: 9600,
        cancellationPolicy: 'Non-refundable',
        refundable: false,
        maxOccupancy: 2,
        roomSize: '35 sq m',
        amenities: ['WiFi', 'Air Conditioning', 'Garden View', 'Minibar'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300']
      }
    ],
    amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Parking', 'Beach Access'],
    minPrice: 2583,
    maxPrice: 3200,
    refundable: true,
    preferred: true,
    distance: 0.5,
    coordinates: { lat: -8.7228, lng: 115.1687 }
  },
  {
    id: 'hotel-2',
    name: 'Hotel NEO+ Kuta, Legian by ASTON',
    location: 'Kuta',
    address: 'Jl. Legian No. 88, Kuta, Bali',
    rating: 8.8,
    ratingsCount: 888,
    starRating: 4,
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'
    ],
    badges: ['PREFERRED', 'Refundable'],
    rooms: [
      {
        id: 'room-2-1',
        name: 'Deluxe Garden View',
        group: 'Deluxe',
        board: 'Breakfast',
        bedType: '1 King',
        pricePerNight: 3899,
        totalPrice: 11697,
        cancellationPolicy: 'Fully refundable before 13 Oct',
        refundable: true,
        maxOccupancy: 2,
        roomSize: '35 sq m',
        amenities: ['WiFi', 'Air Conditioning', 'Garden View', 'Minibar'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300']
      }
    ],
    amenities: ['Pool', 'Restaurant', 'WiFi', 'Parking', 'Fitness Center'],
    minPrice: 3899,
    maxPrice: 3899,
    refundable: true,
    preferred: true,
    distance: 0.8,
    coordinates: { lat: -8.7183, lng: 115.1686 }
  },
  {
    id: 'hotel-3',
    name: 'Discovery Kartika Plaza Hotel',
    location: 'Kuta',
    address: 'Jl. Kartika Plaza, Kuta, Bali',
    rating: 7.8,
    ratingsCount: 456,
    starRating: 5,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400'
    ],
    badges: ['Refundable'],
    rooms: [
      {
        id: 'room-3-1',
        name: 'Deluxe Ocean View',
        group: 'Deluxe',
        board: 'Breakfast',
        bedType: '1 King',
        pricePerNight: 4500,
        totalPrice: 13500,
        cancellationPolicy: 'Fully refundable before 13 Oct',
        refundable: true,
        maxOccupancy: 2,
        roomSize: '40 sq m',
        amenities: ['WiFi', 'Air Conditioning', 'Ocean View', 'Minibar', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300']
      }
    ],
    amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Parking', 'Beach Access', 'Fitness Center'],
    minPrice: 4500,
    maxPrice: 4500,
    refundable: true,
    distance: 1.2,
    coordinates: { lat: -8.7156, lng: 115.1681 }
  },
  {
    id: 'hotel-4',
    name: 'Rama Beach Resort and Villas',
    location: 'Kuta',
    address: 'Jl. Pantai Kuta, Kuta, Bali',
    rating: 8.5,
    ratingsCount: 234,
    starRating: 4,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
    ],
    badges: ['PREFERRED'],
    rooms: [
      {
        id: 'room-4-1',
        name: 'Beachfront Villa',
        group: 'Villa',
        board: 'Room Only',
        bedType: '1 King',
        pricePerNight: 5200,
        totalPrice: 15600,
        cancellationPolicy: 'Non-refundable',
        refundable: false,
        maxOccupancy: 2,
        roomSize: '60 sq m',
        amenities: ['WiFi', 'Air Conditioning', 'Beach View', 'Private Pool', 'Kitchenette'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300']
      }
    ],
    amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Parking', 'Beach Access', 'Private Villas'],
    minPrice: 5200,
    maxPrice: 5200,
    refundable: false,
    preferred: true,
    distance: 0.3,
    coordinates: { lat: -8.7201, lng: 115.1689 }
  },
  {
    id: 'hotel-5',
    name: 'Best Western Kuta Villa',
    location: 'Kuta',
    address: 'Jl. Raya Kuta, Kuta, Bali',
    rating: 8.0,
    ratingsCount: 567,
    starRating: 3,
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'
    ],
    badges: ['Refundable'],
    rooms: [
      {
        id: 'room-5-1',
        name: 'Standard Room',
        group: 'Standard',
        board: 'Breakfast',
        bedType: '1 King',
        pricePerNight: 2100,
        totalPrice: 6300,
        cancellationPolicy: 'Fully refundable before 13 Oct',
        refundable: true,
        maxOccupancy: 2,
        roomSize: '28 sq m',
        amenities: ['WiFi', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300']
      }
    ],
    amenities: ['Pool', 'Restaurant', 'WiFi', 'Parking'],
    minPrice: 2100,
    maxPrice: 2100,
    refundable: true,
    distance: 1.5,
    coordinates: { lat: -8.7100, lng: 115.1650 }
  }
]

// Mock API functions
export const searchHotels = async (params: HotelSearchParams): Promise<HotelSearchResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  let filteredHotels = [...mockHotels]

  // Apply filters
  if (params.query) {
    const query = params.query.toLowerCase()
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.name.toLowerCase().includes(query) ||
      hotel.location.toLowerCase().includes(query) ||
      hotel.address.toLowerCase().includes(query)
    )
  }

  if (params.location) {
    const location = params.location.toLowerCase()
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.location.toLowerCase().includes(location) ||
      hotel.address.toLowerCase().includes(location)
    )
  }

  if (params.stars && params.stars.length > 0) {
    filteredHotels = filteredHotels.filter(hotel => 
      params.stars!.includes(hotel.starRating)
    )
  }

  if (params.priceMin !== undefined) {
    filteredHotels = filteredHotels.filter(hotel => hotel.minPrice >= params.priceMin!)
  }

  if (params.priceMax !== undefined) {
    filteredHotels = filteredHotels.filter(hotel => hotel.minPrice <= params.priceMax!)
  }

  if (params.amenities && params.amenities.length > 0) {
    filteredHotels = filteredHotels.filter(hotel => 
      params.amenities!.some(amenity => hotel.amenities.includes(amenity))
    )
  }

  if (params.propertyTypes && params.propertyTypes.length > 0) {
    // For simplicity, we'll assume all hotels are "Hotel" type
    filteredHotels = filteredHotels.filter(hotel => 
      params.propertyTypes!.includes('Hotel')
    )
  }

  // Apply sorting
  switch (params.sort) {
    case 'price_asc':
      filteredHotels.sort((a, b) => a.minPrice - b.minPrice)
      break
    case 'price_desc':
      filteredHotels.sort((a, b) => b.minPrice - a.minPrice)
      break
    case 'rating':
      filteredHotels.sort((a, b) => b.rating - a.rating)
      break
    case 'distance':
      filteredHotels.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      break
    case 'recommended':
    default:
      // Sort by preferred first, then by rating
      filteredHotels.sort((a, b) => {
        if (a.preferred && !b.preferred) return -1
        if (!a.preferred && b.preferred) return 1
        return b.rating - a.rating
      })
      break
  }

  // Apply pagination
  const page = params.page || 1
  const limit = params.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedHotels = filteredHotels.slice(startIndex, endIndex)

  return {
    results: paginatedHotels,
    total: filteredHotels.length,
    page,
    limit,
    nextPage: endIndex < filteredHotels.length ? page + 1 : undefined,
    hasMore: endIndex < filteredHotels.length
  }
}

export const getHotelDetails = async (hotelId: string): Promise<Hotel | null> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockHotels.find(hotel => hotel.id === hotelId) || null
}

export const getRoomPrices = async (
  hotelId: string, 
  checkIn: string, 
  checkOut: string, 
  adults: number, 
  children: number
): Promise<Room[]> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const hotel = mockHotels.find(h => h.id === hotelId)
  if (!hotel) return []

  // Calculate nights
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  // Update room prices based on dates and occupancy
  return hotel.rooms.map(room => ({
    ...room,
    totalPrice: room.pricePerNight * nights
  }))
}

export const getPopularDestinations = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return ['Kuta', 'Seminyak', 'Ubud', 'Sanur', 'Nusa Dua', 'Jimbaran']
}

export const getAmenities = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return [
    'WiFi',
    'Pool',
    'Spa',
    'Restaurant',
    'Parking',
    'Beach Access',
    'Fitness Center',
    'Air Conditioning',
    'Minibar',
    'Balcony',
    'Ocean View',
    'Garden View'
  ]
}

export const getPropertyTypes = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return [
    'Hotel',
    'Resort',
    'Villa',
    'Apartment',
    'Bed and Breakfast',
    'Hostel',
    'Guesthouse'
  ]
}
