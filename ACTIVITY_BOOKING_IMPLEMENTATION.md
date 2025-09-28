# Activity Booking Implementation

This document describes the implementation of the activity booking functionality that allows adding activities to specific days within a trip itinerary.

## Overview

The implementation provides a comprehensive solution for:
1. Creating activity bookings via GraphQL mutations
2. Updating the UI immediately upon successful booking creation
3. Handling errors gracefully with user feedback
4. Maintaining data consistency between the API and UI

## Components

### 1. GraphQL Mutation (`CREATE_ACTIVITY_BOOKING`)

Located in `/graphql/mutations/proposal.ts`, this mutation creates a new activity booking with the following structure:

```graphql
mutation CreateActivityBooking($data: ActivityBookingInput!) {
  createActivityBooking(data: $data) {
    ... on ActivityBookingType {
      id
      slot
      paxAdults
      paxChildren
      priceBaseCents
      priceAddonsCents
      pickupRequired
      confirmationStatus
      activity {
        # Full activity details including options, addons, and images
      }
      option {
        # Selected activity option details
      }
      pickupHotel {
        # Hotel details if pickup is required
      }
    }
  }
}
```

### 2. Custom Hook (`useActivityBooking`)

Located in `/hooks/useActivityBooking.ts`, this hook provides:
- `createActivityBooking()` function
- Loading state management
- Error handling with toast notifications
- Success/error callbacks

### 3. Main Implementation Functions

Located in `/app/proposals/create/[id]/page.tsx`:

#### `addActivityBookingToDay(dayId, activityData)`
The core function that:
- Validates required fields
- Calls the GraphQL mutation
- Updates the UI immediately upon success
- Handles errors with user feedback

#### `handleActivityBookingFromSelection(dayId, activity, selection)`
Helper function that converts activity selection data to booking format.

#### `addActivityToDay(dayIndex, activityId, optionId, ...)`
Utility function for easy activity booking with minimal parameters.

## Usage Examples

### Basic Usage (Schema-Compliant)

```typescript
// Add an activity to a specific day with required fields
await addActivityToDay(
  0, // day index
  'activity-123', // activity ID (required)
  'option-456', // option ID (required)
  '09:00', // time slot (required)
  'USD', // currency (required)
  'hotel-789', // pickup hotel ID (required)
  'pending' // confirmation status (required)
)
```

### Advanced Usage with Optional Fields

```typescript
// Using the comprehensive function with all fields
const bookingData = {
  // Required fields
  activityId: 'activity-123',
  optionId: 'option-456',
  slot: '14:00',
  currency: 'USD',
  pickupHotelId: 'hotel-789',
  confirmationStatus: 'pending',
  // Optional fields
  paxAdults: 2,
  paxChildren: 1,
  priceBaseCents: 15000,
  priceAddonsCents: 2000,
  pickupRequired: true
}

await addActivityBookingToDay('day-110', bookingData)
```

### Schema Requirements

**Required Fields (must be provided):**
- `tripDay: ID!` - The day ID where the activity will be added
- `slot: String!` - Time slot for the activity
- `activity: ID!` - Activity ID
- `option: ID!` - Activity option ID
- `currency: ID!` - Currency ID
- `pickupHotel: ID!` - Hotel ID for pickup (required even if no pickup)
- `confirmationStatus: String!` - Booking confirmation status

**Optional Fields (can be omitted):**
- `paxAdults: Int` - Number of adult participants
- `paxChildren: Int` - Number of child participants
- `priceBaseCents: Int` - Base price in cents
- `priceAddonsCents: Int` - Addon price in cents
- `pickupRequired: Boolean` - Whether pickup is required

### From Activity Selection

```typescript
// When user selects an activity from the explorer
const handleActivitySelect = async (activity: ActivityType, selection: ActivitySelection) => {
  const dayId = proposalData.days[0].id // Get the target day ID
  await handleActivityBookingFromSelection(dayId, activity, selection)
}
```

## Data Flow

1. **User Action**: User selects an activity from the activity explorer
2. **Data Conversion**: Activity selection is converted to booking format
3. **GraphQL Call**: `createActivityBooking` mutation is called
4. **Success Handling**: 
   - Response data is processed
   - UI state is updated immediately
   - User sees success notification
5. **Error Handling**: 
   - Error is logged
   - User sees error notification
   - UI remains consistent

## Error Handling

The implementation includes comprehensive error handling:

- **Validation Errors**: Missing required fields are caught and reported
- **API Errors**: GraphQL errors are handled with user-friendly messages
- **Network Errors**: Connection issues are handled gracefully
- **UI Consistency**: Errors don't leave the UI in an inconsistent state

## UI Updates

Upon successful activity booking creation:

1. **Immediate Update**: The proposal data structure is updated with the new activity booking
2. **Price Recalculation**: The proposal prices are recalculated to include the new activity
3. **Visual Feedback**: The user sees the new activity in the itinerary immediately
4. **Data Persistence**: The updated data is stored in the component state

## Type Safety

All functions are fully typed with TypeScript:

- `ActivityBookingInput`: Input type for the GraphQL mutation
- `ActivityBookingResponse`: Response type from the GraphQL mutation
- `ActivitySelection`: Type for activity selection from the UI
- `ActivityType`: Type for activity data

## Testing

To test the implementation:

1. **Load a proposal** with existing days
2. **Add an activity** using the activity explorer
3. **Verify** the activity appears in the day's itinerary
4. **Check** that prices are updated correctly
5. **Confirm** that the activity booking data is properly structured

## Future Enhancements

Potential improvements:
- Batch activity booking for multiple activities
- Activity booking editing and deletion
- Real-time collaboration for multiple users
- Offline support with sync capabilities
- Advanced error recovery mechanisms

## Dependencies

- Apollo Client for GraphQL operations
- React hooks for state management
- Custom toast system for user feedback
- TypeScript for type safety
