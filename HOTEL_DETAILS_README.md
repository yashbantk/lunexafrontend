# Hotel Details Implementation

This document describes the hotel details functionality implemented for the Deyor travel platform.

## Overview

The hotel details system provides a comprehensive view of hotel information, including image galleries, room selection, facilities, policies, and reviews. It supports both modal and page-based display modes.

## Components

### Core Components

- **`HotelDetailsModal.tsx`** - Full-screen modal for hotel details
- **`HotelDetailsPage.tsx`** - Standalone page for hotel details
- **`GalleryCarousel.tsx`** - Image gallery with thumbnails and full-screen preview
- **`HotelHeader.tsx`** - Hotel name, rating, address, and metadata
- **`RoomList.tsx`** - Room selection with filtering and grouping
- **`RoomRow.tsx`** - Individual room display with selection
- **`FacilitiesPanel.tsx`** - Amenities and facilities display
- **`PoliciesPanel.tsx`** - Hotel policies and rules
- **`ReviewsPanel.tsx`** - Guest reviews and ratings
- **`HotelMapPlaceholder.tsx`** - Map view with nearby attractions

### Supporting Files

- **`useHotelDetails.ts`** - Hook for fetching hotel data with GraphQL placeholders
- **`lib/mocks/hotels.ts`** - Mock data and GraphQL query templates
- **`types/hotel.ts`** - TypeScript interfaces

## Features

### Image Gallery
- Thumbnail navigation
- Full-screen image preview
- Lazy loading with error handling
- Smooth transitions with Framer Motion

### Room Selection
- Grouped room display (by room type)
- Advanced filtering (search, board type, refundable)
- Price comparison and selection
- Expandable/collapsible groups
- Price change confirmation for significant changes (>5%)

### Hotel Information
- Star rating and overall rating
- Address and location details
- Trip metadata (dates, guests, duration)
- Quick amenities overview
- Badge system for special features

### Facilities & Amenities
- Categorized amenity display
- Expandable/collapsible sections
- Icon-based visual representation
- Search and filter capabilities

### Policies
- Check-in/check-out times
- Cancellation policies
- Children and pet policies
- Age restrictions
- Payment information

### Reviews
- Rating breakdown with visual bars
- Filterable reviews by rating
- Verified reviewer indicators
- Helpful vote counts
- Expandable review sections

### Map Integration
- Placeholder map with hotel pin
- Nearby attractions list
- Full-screen map view
- External map integration (Google Maps)

## Usage

### Modal Mode
```tsx
import HotelDetailsModal from '@/components/hotels/HotelDetailsModal'

<HotelDetailsModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  hotelId="hotel-kuta-heritage"
  onSelectRoom={handleSelectRoom}
  checkIn="2025-10-16"
  checkOut="2025-10-19"
  nights={3}
  adults={2}
  childrenCount={0}
/>
```

### Page Mode
```tsx
import HotelDetailsPage from '@/components/hotels/HotelDetailsPage'

<HotelDetailsPage
  hotelId="hotel-kuta-heritage"
  onSelectRoom={handleSelectRoom}
  checkIn="2025-10-16"
  checkOut="2025-10-19"
  nights={3}
  adults={2}
  childrenCount={0}
/>
```

### Integration with Hotel Selection
```tsx
// Add View Details button to hotel cards
<HotelCard
  hotel={hotel}
  onSelect={() => onSelectHotel(hotel)}
  onQuickView={() => onQuickView(hotel)}
  onViewDetails={() => onViewDetails(hotel)} // New prop
  onCompareToggle={() => onCompareToggle(hotel.id)}
  isComparing={compareList.includes(hotel.id)}
  viewMode={viewMode}
/>
```

## GraphQL Integration

### Query Templates
The system includes GraphQL query templates in `lib/mocks/hotels.ts`:

```graphql
query GetHotelDetails($hotelId: ID!, $checkIn: String!, $checkOut: String!, $adults: Int!, $children: Int!) {
  hotel(id: $hotelId) {
    id
    name
    address
    coordinates { lat, lng }
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
```

### Integration Steps
1. Replace mock data in `useHotelDetails.ts`
2. Implement GraphQL client
3. Update query variables based on your schema
4. Handle loading and error states
5. Implement real-time price updates

## Styling

### Theme Colors
- Primary: `#E63946` (red accent)
- Background: `bg-gradient-to-br from-gray-50 to-white`
- Cards: `bg-white rounded-2xl shadow-xl p-6`

### Responsive Design
- Mobile-first approach
- Sticky bottom CTA on mobile
- Collapsible sections for better mobile UX
- Touch-friendly interactions

### Animations
- Framer Motion for smooth transitions
- Hover effects and micro-interactions
- Loading states and skeleton screens
- Modal enter/exit animations

## Accessibility

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Focus management in modals
- Tab order optimization
- Escape key handling

### Screen Reader Support
- ARIA labels and descriptions
- Semantic HTML structure
- Alt text for all images
- Role attributes for custom components

### Visual Accessibility
- High contrast ratios
- Focus indicators
- Scalable text and icons
- Color-blind friendly design

## Performance

### Optimization Strategies
- Lazy loading for images
- Virtualization for long lists
- Debounced search and filters
- Memoized components
- Code splitting for modals

### Loading States
- Skeleton screens during data fetch
- Progressive image loading
- Optimistic UI updates
- Error boundary handling

## Demo

Visit `/proposals/create/[id]/hotel-details-demo` to see the implementation in action.

### Demo Features
- Toggle between modal and page modes
- Interactive room selection
- Price confirmation dialogs
- All component variations
- Integration examples

## Future Enhancements

### Planned Features
- Real-time availability updates
- Advanced room comparison
- Virtual tours integration
- Multi-language support
- Advanced filtering options
- Social sharing capabilities

### Technical Improvements
- GraphQL subscriptions for real-time updates
- Advanced caching strategies
- Performance monitoring
- A/B testing framework
- Analytics integration

## Troubleshooting

### Common Issues
1. **Images not loading**: Check Next.js image configuration
2. **Modal not closing**: Ensure proper event handling
3. **Price calculations**: Verify currency formatting
4. **Responsive issues**: Check Tailwind breakpoints

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and check console for detailed logs.

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.
