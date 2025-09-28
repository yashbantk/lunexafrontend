# Trip Query Implementation

This document describes the implementation of direct GraphQL query for trip data, replacing the session storage approach.

## Changes Made

### 1. **GraphQL Query Created**
- **File**: `/graphql/queries/proposal.ts`
- **Query**: `GET_TRIP` - Comprehensive query for trip data including all related entities
- **Features**: 
  - Full trip details with organization, customer, and creator info
  - Complete day information with stays and activity bookings
  - Detailed hotel and room information
  - Activity booking details with options and addons

### 2. **Custom Hook Created**
- **File**: `/hooks/useTrip.ts`
- **Hook**: `useTrip(tripId)` - Fetches trip data using the GraphQL query
- **Features**:
  - Loading state management
  - Error handling
  - Refetch capability
  - Full TypeScript support

### 3. **Main Page Updated**
- **File**: `/app/proposals/create/[id]/page.tsx`
- **Changes**:
  - Removed session storage dependency
  - Added direct trip query usage
  - Updated data conversion functions
  - Enhanced error handling and loading states

### 4. **Data Conversion Updated**
- **Function**: `convertTripToProposalFormat(tripData: TripData)`
- **Purpose**: Converts GraphQL trip response to internal Proposal format
- **Features**:
  - Handles new response structure
  - Maintains backward compatibility
  - Proper type safety

## Key Improvements

### ✅ **Removed Session Storage Dependency**
- No more hardcoded test data
- Real-time data fetching from GraphQL API
- Automatic data refresh capabilities

### ✅ **Enhanced Error Handling**
- Trip loading errors
- Network error handling
- Retry functionality
- User-friendly error messages

### ✅ **Better Loading States**
- Trip loading indicator
- Proper loading state management
- Smooth user experience

### ✅ **Real-time Data Updates**
- Activity booking updates trigger trip refetch
- Always shows latest data
- No stale data issues

## Usage

### Basic Implementation
```typescript
// The page now automatically fetches trip data
const { trip, loading, error, refetch } = useTrip(tripId)

// Data is automatically converted to proposal format
useEffect(() => {
  if (trip && !loading) {
    const convertedProposal = convertTripToProposalFormat(trip)
    updateProposalWithPrices(convertedProposal)
  }
}, [trip, loading])
```

### Activity Booking Integration
```typescript
// Activity booking now triggers trip refetch
const response = await createActivityBooking(bookingInput, 
  (response) => {
    // Success: refetch trip data to get latest
    refetchTrip()
  },
  (error) => {
    // Error: show error message
    console.error('Booking failed:', error)
  }
)
```

## API Response Structure

The new implementation handles the complete trip response structure:

```typescript
interface TripData {
  id: string
  org: OrganizationType | null
  createdBy: UserType
  customer: ContactType | null
  fromCity: CityType
  startDate: string
  endDate: string
  durationDays: number
  nationality: CountryType
  status: string
  tripType: string
  totalTravelers: number
  starRating: string
  transferOnly: boolean
  landOnly: boolean
  travelerDetails: any
  currency: CurrencyType
  markupFlightPercent: string
  markupLandPercent: string
  bookingReference: string | null
  createdAt: string
  updatedAt: string
  days: Array<{
    id: string
    dayNumber: number
    date: string
    city: CityType
    stay: TripStayType
    activityBookings: Array<ActivityBookingType>
  }>
}
```

## Benefits

1. **Real-time Data**: Always shows the latest trip information
2. **No Hardcoded Data**: Removes dependency on session storage
3. **Better Performance**: Efficient GraphQL queries
4. **Enhanced UX**: Proper loading states and error handling
5. **Maintainability**: Clean separation of concerns
6. **Type Safety**: Full TypeScript support throughout

## Migration Notes

- **Breaking Change**: Session storage approach removed
- **Backward Compatible**: All existing UI components work unchanged
- **Data Format**: Internal proposal format remains the same
- **Activity Booking**: Enhanced with real-time updates

The implementation ensures that the proposal creation page now uses live data from the GraphQL API while maintaining all existing functionality and improving the overall user experience.
