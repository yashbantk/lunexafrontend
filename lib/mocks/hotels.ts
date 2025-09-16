import { Hotel, Room, Review } from '@/types/hotel'

export const mockHotelDetails: Hotel = {
  id: 'hotel-kuta-heritage',
  name: 'The Kuta Beach Heritage Hotel Bali - Managed By Accor',
  location: 'Kuta, Bali',
  address: 'Jl. Pantai Kuta, Br. Pande Mas, Bali 80361',
  coordinates: {
    lat: -8.7223,
    lng: 115.1686
  },
  starRating: 5,
  rating: 8.4,
  ratingsCount: 975,
  images: [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
  ],
  badges: ['Preferred', 'Refundable', 'Best Value'],
  shortDescription: 'Luxury beachfront resort with traditional Balinese architecture',
  longDescription: 'Experience the perfect blend of modern luxury and traditional Balinese culture at The Kuta Beach Heritage Hotel. Located just 0.1 miles from the famous Kuta Beach, our resort offers stunning ocean views, world-class amenities, and exceptional service. The hotel features contemporary rooms with traditional Balinese design elements, a full-service spa, outdoor pool, and multiple dining options. Perfect for both leisure and business travelers, we provide complimentary WiFi, concierge services, and a business center with conference facilities spanning 6,071 sq ft.',
  amenities: [
    'Free WiFi',
    'Outdoor Pool',
    'Spa & Wellness Center',
    'Fitness Center',
    'Business Center',
    'Concierge Service',
    'Airport Shuttle',
    'Dry Cleaning',
    'Room Service',
    'Restaurant',
    'Bar/Lounge',
    'Conference Facilities',
    'Meeting Rooms',
    'Laundry Service',
    '24-Hour Front Desk',
    'Valet Parking',
    'Garden',
    'Terrace',
    'Beach Access',
    'Tennis Court'
  ],
  rooms: [
    {
      id: 'classic-heritage-king-1',
      name: 'Classic Heritage King',
      group: 'Classic Heritage King',
      bedType: '1 King Bed',
      board: 'Room Only',
      pricePerNight: 12500,
      totalPrice: 37500,
      refundable: true,
      cancellationPolicy: 'Fully refundable before 12 Oct',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop'],
      maxOccupancy: 2,
      roomSize: '32 sq m',
      amenities: ['Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Sea View']
    },
    {
      id: 'classic-heritage-king-2',
      name: 'Classic Heritage King with Breakfast',
      group: 'Classic Heritage King',
      bedType: '1 King Bed',
      board: 'Breakfast',
      pricePerNight: 12891,
      totalPrice: 38673,
      refundable: false,
      cancellationPolicy: 'Non-refundable',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop'],
      maxOccupancy: 2,
      roomSize: '32 sq m',
      amenities: ['Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Sea View', 'Breakfast Included']
    },
    {
      id: 'classic-heritage-king-3',
      name: 'Classic Heritage King Refundable',
      group: 'Classic Heritage King',
      bedType: '1 King Bed',
      board: 'Breakfast',
      pricePerNight: 13421,
      totalPrice: 40263,
      refundable: true,
      cancellationPolicy: 'Fully refundable before 12 Oct',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop'],
      maxOccupancy: 2,
      roomSize: '32 sq m',
      amenities: ['Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Sea View', 'Breakfast Included']
    },
    {
      id: 'classic-heritage-twin-1',
      name: 'Classic Heritage Twin',
      group: 'Classic Heritage Twin',
      bedType: '2 Twin Beds',
      board: 'Room Only',
      pricePerNight: 12500,
      totalPrice: 37500,
      refundable: true,
      cancellationPolicy: 'Fully refundable before 12 Oct',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'],
      maxOccupancy: 2,
      roomSize: '32 sq m',
      amenities: ['Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Sea View']
    },
    {
      id: 'classic-heritage-twin-2',
      name: 'Classic Heritage Twin with Breakfast',
      group: 'Classic Heritage Twin',
      bedType: '2 Twin Beds',
      board: 'Breakfast',
      pricePerNight: 13421,
      totalPrice: 40263,
      refundable: true,
      cancellationPolicy: 'Fully refundable before 12 Oct',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'],
      maxOccupancy: 2,
      roomSize: '32 sq m',
      amenities: ['Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Sea View', 'Breakfast Included']
    },
    {
      id: 'run-of-house-1',
      name: 'Run Of House',
      group: 'Run Of House',
      bedType: '1 King or 2 Twin Beds',
      board: 'Room Only',
      pricePerNight: 12260,
      totalPrice: 36780,
      refundable: true,
      cancellationPolicy: 'Fully refundable before 13 Oct',
      images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop'],
      maxOccupancy: 2,
      roomSize: '28 sq m',
      amenities: ['Air Conditioning', 'Mini Bar', 'Safe', 'Garden View']
    }
  ],
  reviews: [
    {
      id: 'review-1',
      author: 'Sarah Johnson',
      rating: 5,
      date: '2024-01-15',
      title: 'Perfect beachfront location',
      content: 'Amazing hotel with incredible views of Kuta Beach. The staff was extremely helpful and the rooms were spotless. The breakfast buffet had great variety and the pool area was perfect for relaxation.',
      verified: true,
      helpful: 12
    },
    {
      id: 'review-2',
      author: 'Michael Chen',
      rating: 4,
      date: '2024-01-08',
      title: 'Great value for money',
      content: 'Good location near the beach and shopping areas. Room was clean and comfortable. The only downside was the WiFi was a bit slow in our room. Overall, would recommend for the price.',
      verified: true,
      helpful: 8
    },
    {
      id: 'review-3',
      author: 'Emma Williams',
      rating: 5,
      date: '2024-01-03',
      title: 'Excellent service and facilities',
      content: 'The spa services were outstanding and the staff went above and beyond to make our stay memorable. The traditional Balinese architecture throughout the hotel was beautiful. Highly recommend!',
      verified: true,
      helpful: 15
    }
  ],
  policies: {
    cancellation: 'Free cancellation up to 24 hours before check-in',
    checkIn: '15:00',
    checkOut: '12:00',
    children: 'Children under 12 stay free when using existing bedding',
    infants: 'Infants under 2 stay free in a crib',
    pets: 'Pets not allowed',
    smoking: 'Non-smoking property',
    ageRestriction: 'No age restriction for check-in'
  },
  nearbyAttractions: [
    { name: 'Kuta Beach', distance: '0.1 mi', type: 'Beach' },
    { name: 'Seminyak Beach', distance: '2.7 mi', type: 'Beach' },
    { name: 'Tanah Lot Temple', distance: '13.1 mi', type: 'Temple' },
    { name: 'Bingin Beach', distance: '14.6 mi', type: 'Beach' },
    { name: 'Ubud Monkey Forest', distance: '18.2 mi', type: 'Nature' }
  ],
  minPrice: 12260,
  maxPrice: 13421,
  refundable: true
}

export const mockRoomPrices = {
  'classic-heritage-king-1': { pricePerNight: 12500, totalPrice: 37500, refundable: true },
  'classic-heritage-king-2': { pricePerNight: 12891, totalPrice: 38673, refundable: false },
  'classic-heritage-king-3': { pricePerNight: 13421, totalPrice: 40263, refundable: true },
  'classic-heritage-twin-1': { pricePerNight: 12500, totalPrice: 37500, refundable: true },
  'classic-heritage-twin-2': { pricePerNight: 13421, totalPrice: 40263, refundable: true },
  'run-of-house-1': { pricePerNight: 12260, totalPrice: 36780, refundable: true }
}

// GraphQL Query Placeholders
export const GET_HOTEL_DETAILS = `
  query GetHotelDetails($hotelId: ID!, $checkIn: String!, $checkOut: String!, $adults: Int!, $children: Int!) {
    hotel(id: $hotelId) {
      id
      name
      address
      coordinates {
        lat
        lng
      }
      starRating
      rating
      ratingCount
      images
      badges
      shortDescription
      longDescription
      amenities
      rooms(checkIn: $checkIn, checkOut: $checkOut, adults: $adults, children: $children) {
        id
        name
        group
        bedType
        board
        pricePerNight
        totalPrice
        refundable
        cancellationPolicy
        images
        maxOccupancy
        roomSize
        amenities
      }
      reviews {
        id
        author
        rating
        date
        title
        content
        verified
        helpful
      }
      policies {
        cancellation
        checkIn
        checkOut
        children
        infants
        pets
        smoking
        ageRestriction
      }
      nearbyAttractions {
        name
        distance
        type
      }
    }
  }
`

export const GET_HOTEL_ROOM_PRICES = `
  query GetHotelRoomPrices($hotelId: ID!, $checkIn: String!, $checkOut: String!, $adults: Int!, $children: Int!) {
    roomPrices(hotelId: $hotelId, checkIn: $checkIn, checkOut: $checkOut, adults: $adults, children: $children) {
      roomId
      pricePerNight
      totalPrice
      refundable
      cancellationPolicy
    }
  }
`
