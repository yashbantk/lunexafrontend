# Activity Card GraphQL Integration

This document describes the integration of the provided GraphQL Activity query with the existing Activity card UI components.

## Overview

The integration maintains the existing Activity card UI structure and styling while replacing mock data with real GraphQL queries. The system includes comprehensive error handling and fallback mechanisms to ensure reliability.

## Files Created/Modified

### 1. GraphQL Query (`graphql/queries/activities.ts`)
- **Added**: `ACTIVITY_QUERY` - Single activity query matching the provided structure
- **Added**: `ActivityResponse` interface for type safety
- **Purpose**: Fetches detailed activity information using activityId

### 2. Activity Card Hook (`hooks/useActivityCard.ts`)
- **Purpose**: Dedicated hook for fetching single activity data for card display
- **Key Features**:
  - GraphQL integration with fallback to mock data
  - Loading and error state management
  - Automatic refetch capability

### 3. Updated Activity Details Hook (`hooks/useActivityDetails.ts`)
- **Modified**: Updated to use GraphQL instead of mock data
- **Key Features**:
  - Maintains existing functionality for activity details modal
  - GraphQL integration with fallback mechanism
  - Preserves all existing pricing and validation logic

### 4. Activity Card with GraphQL (`components/activities/ActivityCardWithGraphQL.tsx`)
- **Purpose**: Wrapper component that uses GraphQL data
- **Key Features**:
  - Loading states with spinner
  - Error handling with retry functionality
  - Seamless integration with existing ActivityCard component
  - No UI changes to the original card design

### 5. Demo Component (`components/activities/ActivityCardDemo.tsx`)
- **Purpose**: Comprehensive demo showing the integration
- **Key Features**:
  - Displays expected data from GraphQL response
  - Shows both grid and list view modes
  - Includes integration documentation
  - Test page at `/activity-card-demo`

### 6. Demo Page (`app/activity-card-demo/page.tsx`)
- **Purpose**: Accessible demo page for testing the integration

## Integration Details

### Query Usage
The integration uses the provided GraphQL query with the specified input:

```typescript
// Input variables
{
  "activityId": "2"  // Default test value
}

// GraphQL Query
query Activity($activityId: ID!) {
  activity(id: $activityId) {
    id
    title
    summary
    description
    rating
    durationMinutes
    highlights
    tags
    instantBooking
    // ... all nested objects as specified
  }
}
```

### Data Transformation
The GraphQL response is transformed using the existing `transformGraphQLActivityToActivity` function:

- **activityOptions** → **availability** (ScheduleSlot[])
- **activityAddons** → **extras** (Extra[])
- **activityImages** → **images** (string[])
- **activityCategoryMaps** → **category** (string[])
- **Complex nested data** → **Simplified flat structure**

### Expected Data Display
Based on the provided response, the activity card will display:

- **Title**: "Mumbai City Tour"
- **Summary**: "Explore the best of Mumbai city"
- **Rating**: 4.50 stars
- **Duration**: 8 hours (480 minutes)
- **Location**: "Mumbai, IN"
- **Highlights**: Gateway of India, Marine Drive, Dhobi Ghat
- **Tags**: sightseeing, city tour, cultural
- **Category**: City Tours
- **Base Price**: $50.00 (5000 cents)
- **Child Price**: $25.00 (2500 cents)
- **Max Participants**: 15
- **Meal Plan**: Lunch Included (vegetarian)
- **Add-ons**: Private Car Upgrade ($20.00)
- **Images**: 1 image with caption "Mumbai City Tour"
- **Supplier**: Sample Tour Operator
- **Refundable**: true
- **Instant Booking**: true

## Usage Examples

### 1. Using the GraphQL Activity Card
```tsx
import ActivityCardWithGraphQL from '@/components/activities/ActivityCardWithGraphQL'

<ActivityCardWithGraphQL
  activityId="2"
  onSelect={(activity) => console.log('Selected:', activity)}
  onViewDetails={(activity) => console.log('View details:', activity)}
  isSelected={false}
  viewMode="grid"
/>
```

### 2. Using the Activity Details Hook
```tsx
import { useActivityDetails } from '@/hooks/useActivityDetails'

const { activity, loading, error, calculatePrice, validateSelection } = useActivityDetails({
  activityId: "2",
  checkIn: "2025-01-20",
  checkOut: "2025-01-21",
  adults: 2,
  childrenCount: 0
})
```

### 3. Using the Activity Card Hook
```tsx
import { useActivityCard } from '@/hooks/useActivityCard'

const { activity, loading, error, refetch } = useActivityCard({
  activityId: "2"
})
```

## Error Handling

The integration includes comprehensive error handling:

1. **GraphQL Failures**: Automatically falls back to mock data
2. **Network Errors**: Displays retry button with user-friendly messages
3. **Missing Data**: Shows appropriate "not found" messages
4. **Loading States**: Displays loading spinners during data fetching

## Testing

### Demo Page
Visit `/activity-card-demo` to see the integration in action with:
- Real GraphQL data fetching
- Both grid and list view modes
- Error handling demonstration
- Expected data display

### Manual Testing
1. **With GraphQL Server**: Activity data will be fetched from the real API
2. **Without GraphQL Server**: System falls back to mock data automatically
3. **Error Scenarios**: Network errors are handled gracefully

## Benefits

1. **Zero UI Changes**: Existing Activity card design remains unchanged
2. **Real Data**: Activities now display actual GraphQL data
3. **Reliability**: Fallback mechanism ensures system always works
4. **Performance**: Efficient GraphQL data fetching
5. **Maintainability**: Clean separation between data layer and UI
6. **Type Safety**: Full TypeScript support with proper interfaces

## Configuration

The integration uses the existing GraphQL client configuration:
- **Endpoint**: `process.env.NEXT_PUBLIC_GRAPHQL_URL`
- **Authentication**: Uses existing auth token system
- **Caching**: Disabled for real-time data (`fetchPolicy: 'no-cache'`)

## Future Enhancements

1. **Caching**: Add intelligent caching for better performance
2. **Real-time Updates**: Implement subscription support for live data
3. **Image Optimization**: Add image loading optimization
4. **Error Recovery**: Implement retry mechanisms with exponential backoff
5. **Analytics**: Add tracking for activity card interactions
