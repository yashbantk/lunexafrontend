import { Hotel, Room } from '@/types/hotel'

// GraphQL response types
interface GraphQLHotelResponse {
  id: string
  city: {
    id: string
    name: string
    country: {
      iso2: string
      name: string
    }
    timezone: string
    lat: number
    lon: number
  }
  supplier: {
    id: string
    name: string
    type: string
    contactEmail: string
    contractTerms: string
    commissionRate: number
    isActive: boolean
  }
  name: string
  address: string
  type: string
  description: string
  locationUrl: string
  star: number
  totalRatings: number
  cancellationPolicy: string
  instantBooking: boolean
  cleanilessRating: number
  serviceRating: number
  hotelImages: Array<{
    id: string
    url: string
    caption: string
    priorityOrder: number
  }>
  hotelRooms: Array<{
    id: string
    name: string
    currency: {
      code: string
      name: string
    }
    priceCents: number
    bedType: string
    baseMealPlan: string
    hotelRoomImages: Array<{
      id: string
      url: string
      caption: string
      priorityOrder: number
    }>
    roomAmenities: Array<{
      id: string
      name: string
      description: string
    }>
    rates: Array<{
      id: string
      priceCents: number
      mealPlan: {
        id: string
        name: string
        mealPlanType: string
        mealValue: string
        vegType: string
        description: string
      }
      refundable: boolean
      validFrom: string
      validTo: string
    }>
    maxOccupancy: number
    size: number
    sizeUnit: string
    details: string
    amenities: string[]
    tags: string[]
    inclusions: string[]
    exclusions: string[]
  }>
  comfortRating: number
  conditionRating: number
  amenitesRating: number
  neighborhoodRating: number
  amenities: string[]
  instructions: string
  policy: string
  inclusions: string[]
  exclusions: string[]
  tags: string[]
  commissionRate: number
}

export function transformGraphQLHotelToHotel(graphqlHotel: GraphQLHotelResponse): Hotel {
  // Calculate overall rating from individual ratings
  const ratings = [
    graphqlHotel.cleanilessRating,
    graphqlHotel.serviceRating,
    graphqlHotel.comfortRating,
    graphqlHotel.conditionRating,
    graphqlHotel.amenitesRating,
    graphqlHotel.neighborhoodRating
  ].filter(rating => rating > 0)
  
  const overallRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0

  // Transform hotel images
  const images = [...graphqlHotel.hotelImages]
    .sort((a, b) => a.priorityOrder - b.priorityOrder)
    .map(img => img.url)

  // Transform rooms
  const rooms: Room[] = graphqlHotel.hotelRooms.map(room => {
    // Get the most recent valid rate
    const validRates = room.rates.filter(rate => {
      const now = new Date()
      const validFrom = new Date(rate.validFrom)
      const validTo = new Date(rate.validTo)
      return now >= validFrom && now <= validTo
    })
    
    const currentRate = validRates.length > 0 
      ? [...validRates].sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime())[0]
      : room.rates[0] // Fallback to first rate if no valid rates

    // Transform room images
    const roomImages = [...room.hotelRoomImages]
      .sort((a, b) => a.priorityOrder - b.priorityOrder)
      .map(img => img.url)

    return {
      id: room.id,
      name: room.name,
      group: room.baseMealPlan,
      board: room.baseMealPlan,
      bedType: room.bedType,
      pricePerNight: currentRate ? currentRate.priceCents / 100 : room.priceCents / 100,
      totalPrice: currentRate ? currentRate.priceCents / 100 : room.priceCents / 100,
      cancellationPolicy: currentRate?.refundable ? 'Free cancellation' : 'Non-refundable',
      refundable: currentRate?.refundable || false,
      maxOccupancy: room.maxOccupancy,
      roomSize: `${room.size} ${room.sizeUnit}`,
      amenities: [
        ...room.amenities,
        ...room.roomAmenities.map(amenity => amenity.name)
      ],
      images: roomImages.length > 0 ? roomImages : images.slice(0, 1), // Fallback to hotel images
      currency: room.currency.code
    }
  })

  return {
    id: graphqlHotel.id,
    name: graphqlHotel.name,
    location: `${graphqlHotel.city.name}, ${graphqlHotel.city.country.name}`,
    address: graphqlHotel.address,
    rating: Math.round(overallRating * 10) / 10, // Round to 1 decimal place
    ratingsCount: graphqlHotel.totalRatings,
    starRating: graphqlHotel.star,
    images: images,
    badges: [
      ...(graphqlHotel.instantBooking ? ['Instant Booking'] : []),
      ...(graphqlHotel.cancellationPolicy === 'FREE' ? ['Free Cancellation'] : []),
      ...graphqlHotel.tags
    ],
    rooms: rooms,
    amenities: graphqlHotel.amenities,
    minPrice: Math.min(...rooms.map(room => room.pricePerNight)),
    maxPrice: Math.max(...rooms.map(room => room.pricePerNight)),
    refundable: graphqlHotel.cancellationPolicy === 'FREE',
    preferred: graphqlHotel.commissionRate > 0,
    coordinates: {
      lat: graphqlHotel.city.lat,
      lng: graphqlHotel.city.lon
    },
    shortDescription: graphqlHotel.description,
    longDescription: graphqlHotel.description,
    policies: {
      cancellation: graphqlHotel.cancellationPolicy,
      checkIn: '14:00',
      checkOut: '12:00',
      children: '',
      infants: '',
      pets: '',
      smoking: '',
      ageRestriction: ''
    },
    reviews: [] // Reviews would need a separate query
  }
}
