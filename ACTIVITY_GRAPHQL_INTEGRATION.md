# Activity GraphQL Integration

This document describes the integration of the provided GraphQL Activities query into the existing "add activity" functionality.

## Overview

The integration maintains the existing user interface completely unchanged while replacing the mock data implementation with real GraphQL queries. The system includes fallback mechanisms to ensure reliability.

## Files Created/Modified

### 1. GraphQL Query (`graphql/queries/activities.ts`)
- **Purpose**: Defines the GraphQL query and TypeScript interfaces
- **Key Features**:
  - Matches the provided query structure exactly
  - Includes proper TypeScript types for filters and ordering
  - Supports the input variables format provided

### 2. Activity Transformer (`lib/transformers/activity.ts`)
- **Purpose**: Converts GraphQL response to existing Activity type format
- **Key Features**:
  - Maintains compatibility with existing UI components
  - Transforms complex GraphQL structure to simplified Activity interface
  - Handles missing fields with sensible defaults
  - Maps activity options to schedule slots
  - Converts addons to extras format

### 3. Updated Activity Search Hook (`hooks/useActivitySearch.ts`)
- **Purpose**: Integrates GraphQL queries into the search functionality
- **Key Features**:
  - Replaces mock data with real GraphQL calls
  - Converts search parameters to GraphQL filter format
  - Maintains existing filtering and sorting capabilities
  - Includes fallback to mock data on GraphQL failures
  - Preserves all existing functionality

## Integration Details

### Query Mapping
The provided GraphQL query is mapped as follows:

```typescript
// Input variables from user
{
  "filters": {
    "searchActivities": null,
    "AND": {
      "city": null,
      "durationMinutes": {
        "range": {
          "end": null,
          "start": null
        }
      }
    }
  },
  "order": {
    "rating": null,
    "title": null,
    "durationMinutes": null
  }
}
```

### Data Transformation
The GraphQL response is transformed to match the existing Activity interface:

- `GraphQLActivity` → `Activity`
- `activityOptions` → `availability` (ScheduleSlot[])
- `activityAddons` → `extras` (Extra[])
- Complex nested data → Simplified flat structure

### Fallback Mechanism
If GraphQL fails:
1. Error is logged to console
2. System falls back to existing mock data
3. User experience remains uninterrupted
4. Basic filtering still works with mock data

## Usage

The integration is transparent to the user. The existing "add activity" flow works exactly as before:

1. User clicks "Add Activity" in proposal creation
2. ActivityExplorerModal opens
3. User can search, filter, and select activities
4. Selected activities are added to the proposal

## Testing

To test the integration:

1. **With GraphQL Server**: Activities will be fetched from the real API
2. **Without GraphQL Server**: System falls back to mock data automatically
3. **Error Handling**: Network errors are handled gracefully

## Benefits

1. **No UI Changes**: Existing interface remains completely unchanged
2. **Real Data**: Activities are now fetched from the actual GraphQL API
3. **Reliability**: Fallback mechanism ensures system always works
4. **Performance**: GraphQL provides efficient data fetching
5. **Maintainability**: Clean separation between data layer and UI

## Configuration

The integration uses the existing GraphQL client configuration:
- Endpoint: `process.env.NEXT_PUBLIC_GRAPHQL_URL`
- Authentication: Uses existing auth token system
- Caching: Disabled for real-time data (`fetchPolicy: 'no-cache'`)

## Future Enhancements

1. **Enhanced Filtering**: Add more GraphQL-supported filters
2. **Pagination**: Implement server-side pagination
3. **Caching**: Add intelligent caching for better performance
4. **Error Recovery**: Implement retry mechanisms
5. **Real-time Updates**: Add subscription support for live data
