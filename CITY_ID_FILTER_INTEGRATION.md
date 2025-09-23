# City ID Filter Integration

## Overview
I've successfully updated the activity search system to send the selected city ID in the GraphQL filter instead of just the city name. This ensures more accurate filtering by using the unique city identifier.

## Changes Made

### 1. Updated CitySearchDropdown Component (`components/activities/CitySearchDropdown.tsx`)

**Interface Changes:**
```tsx
interface CitySearchDropdownProps {
  value: string
  onChange: (value: string, cityId?: string) => void  // Added cityId parameter
  placeholder?: string
  label?: string
  className?: string
}
```

**Selection Handler:**
```tsx
const handleCitySelect = (city: City) => {
  setSelectedCity(city)
  onChange(city.name, city.id)  // Now passes both name and ID
  setIsOpen(false)
  setSearchQuery('')
  clearResults()
}
```

### 2. Updated Type Definitions (`types/activity.ts`)

**ActivityFilters Interface:**
```tsx
export interface ActivityFilters {
  query: string
  category: string[]
  timeOfDay: string[]
  duration: [number, number]
  priceRange: [number, number]
  difficulty: string[]
  rating: number
  location: string
  cityId?: string  // Added cityId field
  sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'duration' | 'popularity'
}
```

**ActivitySearchParams Interface:**
```tsx
export interface ActivitySearchParams {
  query?: string
  category?: string[]
  timeOfDay?: string[]
  duration?: [number, number]
  priceRange?: [number, number]
  difficulty?: string[]
  rating?: number
  location?: string
  cityId?: string  // Added cityId field
  page?: number
  limit?: number
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'duration' | 'popularity'
}
```

### 3. Updated FiltersPanel Component (`components/activities/FiltersPanel.tsx`)

**City Selection Handler:**
```tsx
<CitySearchDropdown
  value={localFilters.location}
  onChange={(value, cityId) => {
    handleFilterChange('location', value)      // Update location name
    handleFilterChange('cityId', cityId || '') // Update city ID
  }}
  placeholder="Search for a city..."
  label="Location"
/>
```

### 4. Updated useActivitySearch Hook (`hooks/useActivitySearch.ts`)

**GraphQL Filter Implementation:**
```tsx
const filters: ActivityFilter = {
  searchActivities: searchParams.query || null,
  AND: {
    city: searchParams.cityId ? {
      id: searchParams.cityId  // Now uses city ID instead of name
    } : undefined,
    durationMinutes: searchParams.duration ? {
      range: {
        start: searchParams.duration[0] || null,
        end: searchParams.duration[1] || null
      }
    } : undefined
  }
}
```

**Search Parameters Mapping:**
```tsx
const searchParams: ActivitySearchParams = {
  ...params,
  query: newFilters.query,
  category: newFilters.category,
  timeOfDay: newFilters.timeOfDay,
  duration: newFilters.duration,
  priceRange: newFilters.priceRange,
  difficulty: newFilters.difficulty,
  rating: newFilters.rating,
  location: newFilters.location,
  cityId: newFilters.cityId,  // Added cityId mapping
  sort: newFilters.sort
}
```

## How It Works Now

### User Experience Flow
1. **User searches for city** → Types in city search dropdown
2. **User selects city** → Both city name and ID are captured
3. **Filter is applied** → City ID is sent to GraphQL query
4. **Activities are filtered** → Results are filtered by city ID

### Technical Flow
1. **City Selection** → `CitySearchDropdown` passes both `city.name` and `city.id`
2. **Filter Update** → `FiltersPanel` updates both `location` and `cityId` fields
3. **Search Parameters** → `useActivitySearch` includes `cityId` in search parameters
4. **GraphQL Query** → Filter uses `city: { id: searchParams.cityId }`
5. **Results** → Activities are filtered by the specific city ID

## Benefits

### 🎯 **Accurate Filtering**
- Uses unique city ID instead of city name
- Prevents issues with city name variations
- More reliable filtering results

### 🔍 **Better Search Precision**
- Eliminates ambiguity between cities with similar names
- Handles international city names correctly
- Ensures exact city matching

### 🚀 **Improved Performance**
- GraphQL can use indexed city ID for faster queries
- More efficient database lookups
- Better query optimization

### 🛡️ **Data Integrity**
- Prevents issues with city name changes
- Maintains consistency across different languages
- Reliable city identification

## GraphQL Query Structure

The filter now sends:
```graphql
{
  searchActivities: "search query",
  AND: {
    city: {
      id: "city-id-123"  // Specific city ID
    },
    durationMinutes: {
      range: {
        start: 60,
        end: 600
      }
    }
  }
}
```

Instead of the previous approach that would have used city name matching.

## Integration Details

### Backward Compatibility
- Maintains `location` field for display purposes
- Adds `cityId` field for filtering
- No breaking changes to existing functionality

### Error Handling
- Graceful fallback if cityId is not available
- Maintains existing error handling patterns
- Proper validation of city selection

### State Management
- Both city name and ID are stored in filter state
- Proper cleanup when city selection is cleared
- Consistent state updates across components

The city filter now uses the precise city ID for GraphQL filtering, ensuring more accurate and reliable activity search results!
