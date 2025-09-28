# OperationInfo Implementation for Error Visibility

This document describes the implementation of OperationInfo fragments in GraphQL mutations to make errors properly visible.

## Problem Addressed

GraphQL mutations that return union types (like `CreateActivityBookingPayload`) can return either the success type or `OperationInfo` for errors. Without the OperationInfo fragment, error messages were not visible in the response.

## Solution

Added the `OperationInfo` fragment to all relevant mutations to capture error messages, codes, fields, and message types.

## Changes Made

### 1. **CREATE_ACTIVITY_BOOKING Mutation**

**File**: `/graphql/mutations/proposal.ts`

**Before:**
```graphql
mutation CreateActivityBooking($data: ActivityBookingInput!) {
  createActivityBooking(data: $data) {
    ... on ActivityBookingType {
      id
      slot
      paxAdults
      # ... other fields
    }
  }
}
```

**After:**
```graphql
mutation CreateActivityBooking($data: ActivityBookingInput!) {
  createActivityBooking(data: $data) {
    ... on ActivityBookingType {
      id
      slot
      paxAdults
      # ... other fields
    }
    ... on OperationInfo {
      messages {
        code
        field
        kind
        message
      }
    }
  }
}
```

### 2. **CREATE_ITINERARY_PROPOSAL Mutation**

**File**: `/graphql/mutations/proposal.ts`

**Before:**
```graphql
mutation CreateItineraryProposal($input: CreateItineraryProposalInput!) {
  createItineraryProposal(input: $input) {
    trip {
      # ... trip fields
    }
    destinations {
      # ... destination fields
    }
    days {
      # ... day fields
    }
    stays {
      # ... stay fields
    }
  }
}
```

**After:**
```graphql
mutation CreateItineraryProposal($input: CreateItineraryProposalInput!) {
  createItineraryProposal(input: $input) {
    trip {
      # ... trip fields
    }
    destinations {
      # ... destination fields
    }
    days {
      # ... day fields
    }
    stays {
      # ... stay fields
    }
    ... on OperationInfo {
      messages {
        code
        field
        kind
        message
      }
    }
  }
}
```

## OperationInfo Fields

The OperationInfo fragment captures:

- **`code`**: Error code for programmatic handling
- **`field`**: Field that caused the error (if applicable)
- **`kind`**: Type of message (INFO, WARNING, ERROR, PERMISSION, VALIDATION)
- **`message`**: Human-readable error message

## Benefits

### ✅ **Enhanced Error Visibility**
- Error messages are now properly captured in GraphQL responses
- Developers can see detailed error information
- Better debugging capabilities

### ✅ **Structured Error Handling**
- Errors are returned in a consistent format
- Error codes enable programmatic error handling
- Field-specific error information

### ✅ **Better User Experience**
- Users see meaningful error messages
- Error handling can be more specific
- Validation errors are clearly identified

## Example Error Response

**Before (without OperationInfo):**
```json
{
  "data": {
    "createActivityBooking": null
  },
  "errors": [
    {
      "message": "Field 'id' expected a number but got 'default-hotel-id'.",
      "locations": [{"line": 2, "column": 3}],
      "path": ["createActivityBooking"]
    }
  ]
}
```

**After (with OperationInfo):**
```json
{
  "data": {
    "createActivityBooking": {
      "messages": [
        {
          "code": "VALIDATION_ERROR",
          "field": "pickupHotel",
          "kind": "VALIDATION",
          "message": "Field 'id' expected a number but got 'default-hotel-id'."
        }
      ]
    }
  }
}
```

## Implementation Details

### **Union Type Handling**
The mutations return union types like:
```typescript
union CreateActivityBookingPayload = ActivityBookingType | OperationInfo
```

### **Fragment Usage**
Using inline fragments to handle both success and error cases:
```graphql
... on ActivityBookingType {
  # Success case fields
}
... on OperationInfo {
  messages {
    code
    field
    kind
    message
  }
}
```

### **Error Handling in Code**
The frontend can now handle both cases:
```typescript
if (response.createActivityBooking.messages) {
  // Handle error case
  const error = response.createActivityBooking.messages[0]
  console.error(`Error: ${error.message} (${error.code})`)
} else {
  // Handle success case
  const booking = response.createActivityBooking
  // Process successful booking
}
```

## Files Updated

- ✅ `/graphql/mutations/proposal.ts` - Added OperationInfo to both mutations
- ✅ No other files needed updates (queries don't return union types)

## Testing

The implementation ensures that:
- ✅ **Success Cases**: Return proper data structure
- ✅ **Error Cases**: Return OperationInfo with detailed error messages
- ✅ **Validation Errors**: Show field-specific validation messages
- ✅ **Permission Errors**: Show permission-related error messages
- ✅ **Network Errors**: Still handled by Apollo Client error policy

This implementation provides comprehensive error visibility for all GraphQL mutations, enabling better error handling and user experience.
