# Actual Trip Data Usage Implementation

This document describes the implementation of using actual trip data instead of hardcoded values for activity booking.

## Problem Addressed

The previous implementation was sending hardcoded values like `"default-hotel-id"` and `"USD"` instead of using the actual data from the trip query, causing GraphQL validation errors.

## Key Changes Made

### 1. **Updated `handleActivityBookingFromSelection` Function**

**Before:**
```typescript
const bookingData = {
  activityId: activity.id,
  optionId: selection.scheduleSlot.id,
  slot: selection.scheduleSlot.startTime,
  currency: 'INR', // Hardcoded
  pickupHotelId: selection.pickupOption.type === 'hotel' ? selection.pickupOption.id : 'default-hotel-id', // Hardcoded
  confirmationStatus: 'pending',
  // ... other fields
}
```

**After:**
```typescript
// Find the day to get the hotel ID from the stay
const day = trip.days.find(d => d.id === dayId)
if (!day || !day.stay) {
  throw new Error('No stay found for the selected day')
}

const hotelId = day.stay.room.hotel.id

const bookingData = {
  activityId: activity.id,
  optionId: selection.scheduleSlot.id,
  slot: selection.scheduleSlot.startTime,
  currency: trip.currency.code, // Use actual trip currency
  pickupHotelId: selection.pickupOption.type === 'hotel' ? selection.pickupOption.id : hotelId, // Use actual hotel ID
  confirmationStatus: 'pending',
  // ... other fields
}
```

### 2. **Updated `addActivityToDay` Utility Function**

**Before:**
```typescript
const addActivityToDay = async (
  dayIndex: number,
  activityId: string,
  optionId: string,
  slot: string = '09:00',
  currency: string = 'INR', // Hardcoded default
  pickupHotelId: string = 'default-hotel-id', // Hardcoded default
  // ... other parameters
) => {
  // Used hardcoded values
}
```

**After:**
```typescript
const addActivityToDay = async (
  dayIndex: number,
  activityId: string,
  optionId: string,
  slot: string = '09:00',
  currency?: string, // Optional, will use trip currency if not provided
  pickupHotelId?: string, // Optional, will use day's hotel if not provided
  // ... other parameters
) => {
  const day = trip.days[dayIndex]
  const tripCurrency = currency || trip.currency.code // Use trip currency
  const hotelId = pickupHotelId || (day.stay ? day.stay.room.hotel.id : null) // Use actual hotel ID
  
  if (!hotelId) {
    throw new Error(`No hotel found for day at index ${dayIndex}`)
  }
  // ... rest of implementation
}
```

### 3. **Enhanced `addActivityBookingToDay` Function**

**Added validation:**
```typescript
// Validate that pickupHotelId is a valid number (hotel ID)
const hotelId = parseInt(activityData.pickupHotelId)
if (isNaN(hotelId)) {
  throw new Error(`Invalid hotel ID: ${activityData.pickupHotelId}. Hotel ID must be a number.`)
}

const bookingInput: ActivityBookingInput = {
  // ... other fields
  pickupHotel: hotelId.toString(), // Convert to string for GraphQL
  // ... rest of fields
}
```

## Data Sources Used

### ✅ **Hotel ID**
- **Source**: `trip.days[dayIndex].stay.room.hotel.id`
- **Validation**: Ensures it's a valid number
- **Fallback**: Uses pickup option hotel if available

### ✅ **Currency**
- **Source**: `trip.currency.code`
- **Example**: "INR"
- **Fallback**: Can be overridden if needed

### ✅ **Day ID**
- **Source**: `trip.days[dayIndex].id`
- **Validation**: Ensures day exists before proceeding

### ✅ **Trip Day Data**
- **Source**: `trip.days.find(d => d.id === dayId)`
- **Validation**: Ensures day and stay exist

## Error Handling

### **Missing Trip Data**
```typescript
if (!trip) {
  throw new Error('No trip data available')
}
```

### **Missing Day/Stay**
```typescript
const day = trip.days.find(d => d.id === dayId)
if (!day || !day.stay) {
  throw new Error('No stay found for the selected day')
}
```

### **Invalid Hotel ID**
```typescript
const hotelId = parseInt(activityData.pickupHotelId)
if (isNaN(hotelId)) {
  throw new Error(`Invalid hotel ID: ${activityData.pickupHotelId}. Hotel ID must be a number.`)
}
```

### **Missing Hotel for Day**
```typescript
if (!hotelId) {
  throw new Error(`No hotel found for day at index ${dayIndex}`)
}
```

## Benefits

### ✅ **Data Consistency**
- Uses actual trip data instead of hardcoded values
- Ensures hotel IDs are valid numbers
- Uses correct currency from trip

### ✅ **Error Prevention**
- Validates all required data exists
- Provides clear error messages
- Prevents GraphQL validation errors

### ✅ **Real-time Accuracy**
- Always uses current trip data
- Reflects actual hotel and currency information
- No stale or incorrect data

### ✅ **Better User Experience**
- Activity bookings use correct hotel information
- Currency matches trip currency
- Proper error handling with helpful messages

## Example Usage

### **Activity Selection Flow**
1. User selects activity from modal
2. System finds the target day from trip data
3. Extracts hotel ID from day's stay
4. Uses trip currency
5. Creates booking with actual data

### **Utility Function Flow**
1. User calls `addActivityToDay(0, "activity-1", "option-1")`
2. System finds day at index 0
3. Extracts hotel ID from day's stay
4. Uses trip currency as default
5. Creates booking with real data

## GraphQL Mutation

The mutation now receives properly formatted data:

```json
{
  "data": {
    "tripDay": "94",
    "slot": "09:00:00",
    "activity": "1",
    "option": "1",
    "currency": "INR",
    "pickupHotel": "5",  // Actual hotel ID from trip data
    "confirmationStatus": "pending",
    "paxAdults": 10,
    "paxChildren": 0,
    "priceBaseCents": 10000,
    "priceAddonsCents": 0,
    "pickupRequired": true
  }
}
```

This implementation ensures that all activity bookings use actual trip data, preventing GraphQL validation errors and providing a more accurate user experience.
