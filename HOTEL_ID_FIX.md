# Hotel ID Fix for Activity Booking

## Problem
The activity booking was failing with the error:
```
Error: Invalid hotel ID: pickup-1. Hotel ID must be a number.
```

## Root Cause
The `handleActivityBookingFromSelection` function was using the pickup option ID (`selection.pickupOption.id`) instead of the actual hotel ID from the trip data. The pickup option ID was `"pickup-1"` which is not a valid hotel ID number.

## Solution

### 1. **Fixed Hotel ID Source**
**Before:**
```typescript
pickupHotelId: selection.pickupOption.type === 'hotel' ? selection.pickupOption.id : hotelId
```

**After:**
```typescript
pickupHotelId: hotelId // Always use actual hotel ID from trip data
```

**Why:** The pickup option ID is not a valid hotel ID. We should always use the actual hotel ID from the trip's stay data.

### 2. **Added Hotel ID Validation**
```typescript
// Ensure hotel ID is a valid number
if (!hotelId || isNaN(parseInt(hotelId.toString()))) {
  throw new Error(`Invalid hotel ID from trip data: ${hotelId}. Hotel ID must be a valid number.`)
}
```

**Why:** Validates that the hotel ID from trip data is actually a valid number before using it.

### 3. **Added Debug Logging**
```typescript
console.log('Activity booking data:', {
  dayId,
  hotelId,
  hotelIdType: typeof hotelId,
  activityId: activity.id,
  optionId: selection.scheduleSlot.id,
  slot: selection.scheduleSlot.startTime,
  currency: trip.currency.code,
  pickupOption: selection.pickupOption
})
```

**Why:** Helps debug what data is being used for the activity booking.

## Data Flow Now

1. **User selects activity** → ActivityExplorerModal
2. **User confirms selection** → ActivityDetailsModal
3. **System finds target day** → `trip.days.find(d => d.id === dayId)`
4. **Extracts hotel ID** → `day.stay.room.hotel.id`
5. **Validates hotel ID** → Ensures it's a valid number
6. **Creates booking** → Uses actual hotel ID from trip data

## Key Changes Made

### ✅ **Always Use Trip Hotel ID**
- Removed conditional logic that used pickup option ID
- Always use the actual hotel ID from the trip's stay data
- Ensures consistency with the trip's accommodation

### ✅ **Enhanced Validation**
- Validates hotel ID is a valid number before use
- Provides clear error messages for debugging
- Prevents GraphQL validation errors

### ✅ **Better Debugging**
- Added comprehensive logging of booking data
- Shows hotel ID type and value
- Helps identify data source issues

## Expected Behavior Now

1. **Activity Selection**: User selects activity from modal
2. **Day Lookup**: System finds the target day from trip data
3. **Hotel Extraction**: Gets hotel ID from `day.stay.room.hotel.id`
4. **Validation**: Ensures hotel ID is a valid number
5. **Booking Creation**: Uses actual hotel ID for GraphQL mutation

## Error Prevention

The fix prevents these common issues:
- ❌ **Invalid Hotel ID**: No more `"pickup-1"` or similar string IDs
- ❌ **GraphQL Validation Errors**: Hotel ID is always a valid number
- ❌ **Data Inconsistency**: Always uses trip's actual hotel data
- ❌ **Missing Hotel Data**: Validates hotel exists before proceeding

## Testing Scenarios

✅ **Valid Trip with Hotel**: Uses actual hotel ID from stay
✅ **Invalid Hotel ID**: Shows clear error message
✅ **Missing Stay**: Handles case where day has no stay
✅ **Missing Trip**: Handles case where trip data is not available

The implementation now ensures that all activity bookings use the actual hotel ID from the trip data, preventing the GraphQL validation error and providing a more reliable booking experience.
