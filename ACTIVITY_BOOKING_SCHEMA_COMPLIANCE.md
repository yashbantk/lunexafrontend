# Activity Booking Schema Compliance

This document demonstrates the schema-compliant implementation of activity booking functionality based on the GraphQL schema requirements.

## Schema Analysis

Based on the GraphQL schema, the `ActivityBookingInput` has the following structure:

```graphql
input ActivityBookingInput {
  tripDay: ID!                    # Required
  slot: String!                  # Required
  activity: ID!                  # Required
  option: ID!                    # Required
  currency: ID!                  # Required
  pickupHotel: ID!               # Required
  confirmationStatus: String!     # Required
  paxAdults: Int                 # Optional
  paxChildren: Int               # Optional
  priceBaseCents: Int            # Optional
  priceAddonsCents: Int          # Optional
  pickupRequired: Boolean        # Optional
}
```

## Implementation Updates

### 1. TypeScript Interface (Schema-Compliant)

```typescript
export interface ActivityBookingInput {
  tripDay: string // Required
  slot: string // Required
  activity: string // Required
  option: string // Required
  currency: string // Required
  pickupHotel: string // Required
  confirmationStatus: string // Required
  paxAdults?: number // Optional
  paxChildren?: number // Optional
  priceBaseCents?: number // Optional
  priceAddonsCents?: number // Optional
  pickupRequired?: boolean // Optional
}
```

### 2. Validation Logic

The implementation now validates all required fields according to the schema:

```typescript
// Validate required fields according to schema
if (!dayId || !activityData.activityId || !activityData.optionId || 
    !activityData.slot || !activityData.currency || 
    !activityData.pickupHotelId || !activityData.confirmationStatus) {
  throw new Error('Missing required fields: dayId, activityId, optionId, slot, currency, pickupHotelId, or confirmationStatus')
}
```

### 3. Function Signatures

All function signatures have been updated to reflect schema requirements:

```typescript
// Main function with schema-compliant parameters
const addActivityBookingToDay = async (
  dayId: string,
  activityData: {
    activityId: string      // Required
    optionId: string        // Required
    slot: string            // Required
    currency: string        // Required
    pickupHotelId: string   // Required
    confirmationStatus: string // Required
    paxAdults?: number      // Optional
    paxChildren?: number    // Optional
    priceBaseCents?: number // Optional
    priceAddonsCents?: number // Optional
    pickupRequired?: boolean // Optional
  }
)

// Utility function with required parameters first
const addActivityToDay = async (
  dayIndex: number,
  activityId: string,        // Required
  optionId: string,         // Required
  slot: string = '09:00',   // Required with default
  currency: string = 'INR', // Required with default
  pickupHotelId: string = 'default-hotel-id', // Required with default
  confirmationStatus: string = 'pending', // Required with default
  adults?: number,          // Optional
  children?: number,        // Optional
  priceBaseCents?: number,  // Optional
  priceAddonsCents?: number, // Optional
  pickupRequired?: boolean  // Optional
)
```

## Usage Examples

### Minimal Required Fields

```typescript
// Only provide required fields
await addActivityToDay(
  0,                    // day index
  'activity-123',      // activity ID (required)
  'option-456',        // option ID (required)
  '09:00',             // slot (required)
  'INR',               // currency (required)
  'hotel-789',         // pickup hotel (required)
  'pending'            // confirmation status (required)
)
```

### With Optional Fields

```typescript
// Include optional fields for complete booking
await addActivityToDay(
  0,                    // day index
  'activity-123',      // activity ID (required)
  'option-456',        // option ID (required)
  '14:00',             // slot (required)
  'INR',               // currency (required)
  'hotel-789',         // pickup hotel (required)
  'confirmed',         // confirmation status (required)
  2,                   // adults (optional)
  1,                   // children (optional)
  15000,               // price base cents (optional)
  2000,                // price addons cents (optional)
  true                 // pickup required (optional)
)
```

### Comprehensive Usage

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

## Key Improvements

1. **Schema Compliance**: All required fields are properly marked and validated
2. **Type Safety**: Optional fields are correctly typed as optional
3. **Validation**: Comprehensive validation ensures all required fields are provided
4. **Default Values**: Sensible defaults for required fields in utility functions
5. **Error Handling**: Clear error messages for missing required fields

## Benefits

- **GraphQL Compatibility**: Direct mapping to GraphQL schema requirements
- **Type Safety**: Full TypeScript support with proper optional/required field handling
- **Developer Experience**: Clear function signatures and error messages
- **Flexibility**: Support for both minimal and comprehensive usage patterns
- **Maintainability**: Schema changes can be easily reflected in the implementation

This implementation ensures that the activity booking functionality is fully compliant with the GraphQL schema while providing a developer-friendly API.
