import { Activity, Extra, ScheduleSlot, PickupOption } from '@/types/activity'

export const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Bali Sunrise Trekking at Mount Batur',
    shortDesc: 'Experience the magical sunrise from Mount Batur with a guided trekking adventure',
    longDesc: 'Start your day with an unforgettable sunrise trekking experience at Mount Batur, an active volcano in Bali. This moderate difficulty trek takes you through beautiful landscapes and offers breathtaking panoramic views of the sunrise over the island. Our experienced guides will ensure your safety while providing interesting insights about the local geology and culture. The trek includes a light breakfast at the summit and plenty of photo opportunities.',
    durationMins: 480, // 8 hours
    availability: [
      {
        id: 'slot-1-1',
        startTime: '02:00',
        durationMins: 480,
        type: 'full-day',
        available: true,
        maxPax: 20,
        currentBookings: 8
      },
      {
        id: 'slot-1-2',
        startTime: '02:30',
        durationMins: 480,
        type: 'full-day',
        available: true,
        maxPax: 20,
        currentBookings: 5
      }
    ],
    basePrice: 450000,
    pricingType: 'person',
    category: ['Adventure', 'Nature', 'Trekking'],
    tags: ['Sunrise', 'Volcano', 'Hiking', 'Photography', 'Guided Tour'],
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 1247,
    extras: [
      {
        id: 'extra-1-1',
        label: 'Professional Photography',
        price: 150000,
        priceType: 'per_person',
        description: 'Professional photos of your sunrise experience',
        required: false,
        category: 'Photography'
      },
      {
        id: 'extra-1-2',
        label: 'Private Guide',
        price: 200000,
        priceType: 'flat',
        description: 'Dedicated private guide for your group',
        required: false,
        category: 'Service'
      },
      {
        id: 'extra-1-3',
        label: 'Premium Breakfast',
        price: 75000,
        priceType: 'per_person',
        description: 'Enhanced breakfast with local delicacies',
        required: false,
        category: 'Food'
      }
    ],
    location: 'Mount Batur, Kintamani, Bali',
    pickupOptions: [
      {
        id: 'pickup-1-1',
        label: 'Hotel Pickup',
        price: 50000,
        description: 'Pickup from your hotel in Ubud, Sanur, or Seminyak',
        type: 'hotel',
        locations: ['Ubud', 'Sanur', 'Seminyak', 'Kuta']
      },
      {
        id: 'pickup-1-2',
        label: 'Meeting Point',
        price: 0,
        description: 'Meet at designated meeting point in Ubud',
        type: 'meeting_point',
        locations: ['Ubud Center']
      }
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before activity',
    minPax: 2,
    maxPax: 20,
    difficulty: 'Moderate',
    included: [
      'Professional English-speaking guide',
      'Trekking equipment (headlamp, walking stick)',
      'Light breakfast at summit',
      'Transportation to/from meeting point',
      'Insurance coverage'
    ],
    excluded: [
      'Personal expenses',
      'Tips for guide',
      'Additional food and drinks'
    ],
    whatToBring: [
      'Comfortable hiking shoes',
      'Warm clothing for early morning',
      'Camera or smartphone',
      'Water bottle',
      'Small backpack'
    ],
    meetingPoint: 'Ubud Center - Starbucks Ubud',
    provider: 'Bali Adventure Tours',
    instantConfirmation: true,
    mobileTicket: true,
    freeCancellation: true,
    cancellationHours: 24
  },
  {
    id: '2',
    title: 'Ubud Rice Terraces & Waterfall Tour',
    shortDesc: 'Explore the famous Tegalalang Rice Terraces and hidden waterfalls',
    longDesc: 'Discover the beauty of Bali\'s iconic rice terraces and stunning waterfalls on this half-day tour. Visit the famous Tegalalang Rice Terraces, learn about traditional farming methods, and capture amazing photos. Then explore hidden waterfalls including Tegenungan and Kanto Lampo, where you can swim in crystal-clear waters. This tour combines cultural insights with natural beauty, perfect for families and photography enthusiasts.',
    durationMins: 360, // 6 hours
    availability: [
      {
        id: 'slot-2-1',
        startTime: '08:00',
        durationMins: 360,
        type: 'morning',
        available: true,
        maxPax: 15,
        currentBookings: 7
      },
      {
        id: 'slot-2-2',
        startTime: '13:00',
        durationMins: 360,
        type: 'afternoon',
        available: true,
        maxPax: 15,
        currentBookings: 3
      }
    ],
    basePrice: 350000,
    pricingType: 'person',
    category: ['Culture', 'Nature', 'Photography'],
    tags: ['Rice Terraces', 'Waterfalls', 'Swimming', 'Cultural', 'Family Friendly'],
    images: [
      'https://images.unsplash.com/photo-1551524164-6cf2ac531f5e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 892,
    extras: [
      {
        id: 'extra-2-1',
        label: 'Traditional Lunch',
        price: 100000,
        priceType: 'per_person',
        description: 'Authentic Balinese lunch at local restaurant',
        required: false,
        category: 'Food'
      },
      {
        id: 'extra-2-2',
        label: 'Photography Guide',
        price: 125000,
        priceType: 'per_person',
        description: 'Professional photography tips and guidance',
        required: false,
        category: 'Photography'
      }
    ],
    location: 'Ubud, Bali',
    pickupOptions: [
      {
        id: 'pickup-2-1',
        label: 'Hotel Pickup',
        price: 30000,
        description: 'Pickup from your hotel in Ubud area',
        type: 'hotel',
        locations: ['Ubud', 'Tegallalang']
      },
      {
        id: 'pickup-2-2',
        label: 'Meeting Point',
        price: 0,
        description: 'Meet at Ubud Palace',
        type: 'meeting_point',
        locations: ['Ubud Palace']
      }
    ],
    cancellationPolicy: 'Free cancellation up to 12 hours before activity',
    minPax: 1,
    maxPax: 15,
    difficulty: 'Easy',
    included: [
      'Professional guide',
      'Transportation',
      'Entrance fees',
      'Water and snacks'
    ],
    excluded: [
      'Lunch',
      'Personal expenses',
      'Tips'
    ],
    whatToBring: [
      'Swimwear',
      'Towel',
      'Camera',
      'Sunscreen',
      'Comfortable walking shoes'
    ],
    meetingPoint: 'Ubud Palace, Ubud',
    provider: 'Ubud Cultural Tours',
    instantConfirmation: true,
    mobileTicket: true,
    freeCancellation: true,
    cancellationHours: 12
  },
  {
    id: '3',
    title: 'Bali Snorkeling & Island Hopping',
    shortDesc: 'Explore crystal-clear waters and vibrant marine life around Nusa Penida',
    longDesc: 'Embark on an unforgettable snorkeling adventure around the pristine waters of Nusa Penida and nearby islands. Discover vibrant coral reefs, swim with tropical fish, and visit stunning beaches including Kelingking Beach and Angel\'s Billabong. This full-day adventure includes multiple snorkeling spots, lunch on the beach, and plenty of time to relax and enjoy the natural beauty of Bali\'s surrounding islands.',
    durationMins: 600, // 10 hours
    availability: [
      {
        id: 'slot-3-1',
        startTime: '07:00',
        durationMins: 600,
        type: 'full-day',
        available: true,
        maxPax: 25,
        currentBookings: 12
      }
    ],
    basePrice: 650000,
    pricingType: 'person',
    category: ['Water Sports', 'Adventure', 'Nature'],
    tags: ['Snorkeling', 'Island Hopping', 'Marine Life', 'Beach', 'Swimming'],
    images: [
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 2156,
    extras: [
      {
        id: 'extra-3-1',
        label: 'Underwater Photography',
        price: 200000,
        priceType: 'per_person',
        description: 'Professional underwater photos and videos',
        required: false,
        category: 'Photography'
      },
      {
        id: 'extra-3-2',
        label: 'Private Boat',
        price: 500000,
        priceType: 'flat',
        description: 'Exclusive private boat for your group',
        required: false,
        category: 'Service'
      },
      {
        id: 'extra-3-3',
        label: 'Premium Lunch',
        price: 150000,
        priceType: 'per_person',
        description: 'Gourmet lunch with fresh seafood',
        required: false,
        category: 'Food'
      }
    ],
    location: 'Nusa Penida, Bali',
    pickupOptions: [
      {
        id: 'pickup-3-1',
        label: 'Hotel Pickup',
        price: 75000,
        description: 'Pickup from your hotel in Sanur or Nusa Dua',
        type: 'hotel',
        locations: ['Sanur', 'Nusa Dua', 'Jimbaran']
      },
      {
        id: 'pickup-3-2',
        label: 'Port Pickup',
        price: 25000,
        description: 'Meet at Sanur Port',
        type: 'meeting_point',
        locations: ['Sanur Port']
      }
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours before activity',
    minPax: 4,
    maxPax: 25,
    difficulty: 'Easy',
    included: [
      'Boat transportation',
      'Snorkeling equipment',
      'Professional guide',
      'Lunch and refreshments',
      'Life jackets',
      'Insurance'
    ],
    excluded: [
      'Personal expenses',
      'Tips',
      'Additional drinks'
    ],
    whatToBring: [
      'Swimwear',
      'Towel',
      'Sunscreen',
      'Waterproof camera',
      'Change of clothes'
    ],
    meetingPoint: 'Sanur Port, Sanur',
    provider: 'Bali Ocean Adventures',
    instantConfirmation: true,
    mobileTicket: true,
    freeCancellation: true,
    cancellationHours: 48
  },
  {
    id: '4',
    title: 'Bali Cooking Class & Market Tour',
    shortDesc: 'Learn authentic Balinese cooking with a local chef and visit traditional markets',
    longDesc: 'Immerse yourself in Balinese culture through food! Start with a visit to a traditional market where you\'ll learn about local ingredients and spices. Then join a hands-on cooking class with a local chef to prepare authentic Balinese dishes including Nasi Goreng, Gado-Gado, and traditional sambal. This cultural experience includes recipe cards to take home and a delicious meal of your own creation.',
    durationMins: 240, // 4 hours
    availability: [
      {
        id: 'slot-4-1',
        startTime: '09:00',
        durationMins: 240,
        type: 'morning',
        available: true,
        maxPax: 12,
        currentBookings: 6
      },
      {
        id: 'slot-4-2',
        startTime: '14:00',
        durationMins: 240,
        type: 'afternoon',
        available: true,
        maxPax: 12,
        currentBookings: 4
      }
    ],
    basePrice: 280000,
    pricingType: 'person',
    category: ['Culture', 'Food', 'Educational'],
    tags: ['Cooking', 'Market Tour', 'Cultural', 'Family Friendly', 'Educational'],
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 634,
    extras: [
      {
        id: 'extra-4-1',
        label: 'Recipe Book',
        price: 50000,
        priceType: 'per_person',
        description: 'Beautiful printed recipe book to take home',
        required: false,
        category: 'Souvenir'
      },
      {
        id: 'extra-4-2',
        label: 'Private Class',
        price: 300000,
        priceType: 'flat',
        description: 'Exclusive private cooking class for your group',
        required: false,
        category: 'Service'
      }
    ],
    location: 'Ubud, Bali',
    pickupOptions: [
      {
        id: 'pickup-4-1',
        label: 'Hotel Pickup',
        price: 25000,
        description: 'Pickup from your hotel in Ubud',
        type: 'hotel',
        locations: ['Ubud']
      },
      {
        id: 'pickup-4-2',
        label: 'Meeting Point',
        price: 0,
        description: 'Meet at Ubud Traditional Market',
        type: 'meeting_point',
        locations: ['Ubud Market']
      }
    ],
    cancellationPolicy: 'Free cancellation up to 6 hours before activity',
    minPax: 2,
    maxPax: 12,
    difficulty: 'Easy',
    included: [
      'Market tour with guide',
      'Cooking class with chef',
      'All ingredients',
      'Recipe cards',
      'Lunch or dinner',
      'Apron and cooking equipment'
    ],
    excluded: [
      'Personal expenses',
      'Tips',
      'Additional drinks'
    ],
    whatToBring: [
      'Comfortable clothes',
      'Camera',
      'Appetite!'
    ],
    meetingPoint: 'Ubud Traditional Market, Ubud',
    provider: 'Bali Culinary School',
    instantConfirmation: true,
    mobileTicket: true,
    freeCancellation: true,
    cancellationHours: 6
  },
  {
    id: '5',
    title: 'Bali Sunset Dinner Cruise',
    shortDesc: 'Romantic sunset dinner cruise with live music and stunning views',
    longDesc: 'Experience a magical evening on the water with our sunset dinner cruise. Sail along Bali\'s coastline as the sun sets over the horizon, creating a romantic and unforgettable atmosphere. Enjoy a delicious dinner with live music, traditional dance performances, and breathtaking views. Perfect for couples, anniversaries, or special celebrations. The cruise includes welcome drinks, multi-course dinner, and entertainment.',
    durationMins: 180, // 3 hours
    availability: [
      {
        id: 'slot-5-1',
        startTime: '17:30',
        durationMins: 180,
        type: 'evening',
        available: true,
        maxPax: 50,
        currentBookings: 28
      }
    ],
    basePrice: 420000,
    pricingType: 'person',
    category: ['Dining', 'Romantic', 'Entertainment'],
    tags: ['Sunset', 'Dinner', 'Cruise', 'Romantic', 'Live Music', 'Dancing'],
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'
    ],
    rating: 4.5,
    reviewsCount: 456,
    extras: [
      {
        id: 'extra-5-1',
        label: 'Premium Seating',
        price: 100000,
        priceType: 'per_person',
        description: 'Upgraded seating with better views',
        required: false,
        category: 'Service'
      },
      {
        id: 'extra-5-2',
        label: 'Champagne Package',
        price: 200000,
        priceType: 'per_person',
        description: 'Premium champagne and wine selection',
        required: false,
        category: 'Beverage'
      },
      {
        id: 'extra-5-3',
        label: 'Private Table',
        price: 300000,
        priceType: 'flat',
        description: 'Exclusive private table for your group',
        required: false,
        category: 'Service'
      }
    ],
    location: 'Benoa Harbor, Bali',
    pickupOptions: [
      {
        id: 'pickup-5-1',
        label: 'Hotel Pickup',
        price: 50000,
        description: 'Pickup from your hotel in Nusa Dua, Jimbaran, or Sanur',
        type: 'hotel',
        locations: ['Nusa Dua', 'Jimbaran', 'Sanur', 'Kuta']
      },
      {
        id: 'pickup-5-2',
        label: 'Harbor Pickup',
        price: 0,
        description: 'Meet at Benoa Harbor',
        type: 'meeting_point',
        locations: ['Benoa Harbor']
      }
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before activity',
    minPax: 2,
    maxPax: 50,
    difficulty: 'Easy',
    included: [
      'Welcome drinks',
      'Multi-course dinner',
      'Live music entertainment',
      'Traditional dance performance',
      'Sunset viewing',
      'Transportation to/from harbor'
    ],
    excluded: [
      'Additional drinks',
      'Personal expenses',
      'Tips'
    ],
    whatToBring: [
      'Smart casual attire',
      'Camera',
      'Light jacket for evening'
    ],
    meetingPoint: 'Benoa Harbor, Nusa Dua',
    provider: 'Bali Sunset Cruises',
    instantConfirmation: true,
    mobileTicket: true,
    freeCancellation: true,
    cancellationHours: 24
  },
  {
    id: '6',
    title: 'Bali ATV Adventure & Waterfall',
    shortDesc: 'Exciting ATV ride through rice fields and jungle to hidden waterfalls',
    longDesc: 'Get your adrenaline pumping with an exciting ATV adventure through Bali\'s countryside! Ride through lush rice fields, traditional villages, and dense jungle trails to reach hidden waterfalls. This adventure combines off-road excitement with natural beauty, perfect for thrill-seekers and nature lovers. Includes safety equipment, professional guide, and time to swim in the refreshing waterfall pools.',
    durationMins: 300, // 5 hours
    availability: [
      {
        id: 'slot-6-1',
        startTime: '08:00',
        durationMins: 300,
        type: 'morning',
        available: true,
        maxPax: 8,
        currentBookings: 3
      },
      {
        id: 'slot-6-2',
        startTime: '13:00',
        durationMins: 300,
        type: 'afternoon',
        available: true,
        maxPax: 8,
        currentBookings: 5
      }
    ],
    basePrice: 380000,
    pricingType: 'person',
    category: ['Adventure', 'Water Sports', 'Nature'],
    tags: ['ATV', 'Adventure', 'Waterfall', 'Off-road', 'Swimming', 'Thrilling'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
    ],
    rating: 4.4,
    reviewsCount: 723,
    extras: [
      {
        id: 'extra-6-1',
        label: 'Action Camera Rental',
        price: 75000,
        priceType: 'per_person',
        description: 'GoPro camera to record your adventure',
        required: false,
        category: 'Equipment'
      },
      {
        id: 'extra-6-2',
        label: 'Private Guide',
        price: 150000,
        priceType: 'flat',
        description: 'Dedicated private guide for your group',
        required: false,
        category: 'Service'
      }
    ],
    location: 'Ubud, Bali',
    pickupOptions: [
      {
        id: 'pickup-6-1',
        label: 'Hotel Pickup',
        price: 40000,
        description: 'Pickup from your hotel in Ubud area',
        type: 'hotel',
        locations: ['Ubud', 'Tegallalang']
      },
      {
        id: 'pickup-6-2',
        label: 'Meeting Point',
        price: 0,
        description: 'Meet at ATV Adventure Base',
        type: 'meeting_point',
        locations: ['ATV Base Ubud']
      }
    ],
    cancellationPolicy: 'Free cancellation up to 12 hours before activity',
    minPax: 1,
    maxPax: 8,
    difficulty: 'Moderate',
    included: [
      'ATV rental and safety equipment',
      'Professional guide',
      'Safety briefing',
      'Waterfall visit and swimming',
      'Refreshments',
      'Insurance'
    ],
    excluded: [
      'Personal expenses',
      'Tips',
      'Additional drinks'
    ],
    whatToBring: [
      'Swimwear',
      'Towel',
      'Change of clothes',
      'Closed-toe shoes',
      'Sunscreen'
    ],
    meetingPoint: 'ATV Adventure Base, Ubud',
    provider: 'Bali Adventure Tours',
    instantConfirmation: true,
    mobileTicket: true,
    freeCancellation: true,
    cancellationHours: 12
  }
]

// GraphQL Query Placeholders
export const GET_ACTIVITIES = `
  query GetActivities($params: ActivitySearchParams!) {
    activities(params: $params) {
      results {
        id
        title
        shortDesc
        durationMins
        basePrice
        pricingType
        category
        tags
        images
        rating
        reviewsCount
        location
        difficulty
        availability {
          id
          startTime
          durationMins
          type
          available
          maxPax
          currentBookings
        }
      }
      total
      page
      limit
      hasMore
      filters {
        categories
        timeOfDay
        difficulties
        locations
      }
    }
  }
`

export const GET_ACTIVITY_DETAILS = `
  query GetActivityDetails($id: ID!, $checkIn: String!, $checkOut: String!, $adults: Int!, $children: Int!) {
    activity(id: $id) {
      id
      title
      longDesc
      durationMins
      basePrice
      pricingType
      category
      tags
      images
      rating
      reviewsCount
      location
      difficulty
      minPax
      maxPax
      included
      excluded
      whatToBring
      meetingPoint
      provider
      instantConfirmation
      mobileTicket
      freeCancellation
      cancellationHours
      cancellationPolicy
      availability {
        id
        startTime
        durationMins
        type
        available
        maxPax
        currentBookings
      }
      extras {
        id
        label
        price
        priceType
        description
        required
        category
      }
      pickupOptions {
        id
        label
        price
        description
        type
        locations
      }
    }
  }
`







