# City Search Integration

This document describes the dynamic city search component integration into the `/proposal` page, leveraging the GraphQL query `Cities($filters: CityFilter)` to fetch city data.

## 🚀 Features Implemented

### ✅ Core Functionality
- **Dynamic Search Input**: Real-time city search with autocomplete
- **GraphQL Integration**: Uses `Cities($filters: CityFilter)` query with `searchCities` filter
- **Case-Insensitive Search**: Partial matching against city names
- **Debounced Search**: 300ms debounce to minimize API calls
- **Error Handling**: Graceful handling of network errors and GraphQL failures
- **Loading States**: Visual feedback during search operations

### ✅ User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Framer Motion animations for dropdown and results
- **Clear Results Display**: Shows city name, country, and region
- **Empty State Handling**: "No results" message when no cities found
- **Click Outside to Close**: Intuitive dropdown behavior

### ✅ Technical Implementation
- **TypeScript Support**: Fully typed with proper interfaces
- **Component Architecture**: Reusable `CitySearch` component
- **Custom Hook**: `useCitySearch` for state management
- **GraphQL Client**: Configured with authorization token
- **Test Coverage**: Comprehensive component tests

## 📁 Files Created/Modified

### New Files
1. **`types/graphql.ts`** - Added City types and interfaces
2. **`graphql/queries/cities.ts`** - GraphQL query definition
3. **`hooks/useCitySearch.ts`** - Custom hook for city search logic
4. **`components/cities/CitySearch.tsx`** - Main search component
5. **`__tests__/cities/city-search.test.tsx`** - Component tests
6. **`CITY_SEARCH_README.md`** - This documentation

### Modified Files
1. **`lib/graphql/client.ts`** - Added authorization token
2. **`app/proposal/page.tsx`** - Integrated CitySearch components

## 🔧 Configuration

### GraphQL Endpoint
```typescript
export const GRAPHQL_URL = 'https://f49b62996ffc.ngrok-free.app/graphql-apollo/';
```

### Authorization Token
```typescript
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 🎯 Usage

### Basic Implementation
```tsx
import { CitySearch } from '@/components/cities/CitySearch';

function MyComponent() {
  const [city, setCity] = useState('');
  
  return (
    <CitySearch
      value={city}
      onChange={setCity}
      onSelectCity={(selectedCity) => {
        console.log('Selected city:', selectedCity);
      }}
      placeholder="Search for a city..."
      label="City"
      required
    />
  );
}
```

### Integration in Proposal Page
The CitySearch component has been integrated in two places:

1. **Destination Cities**: Replaces the basic input field for destination cities
2. **Departure City**: Replaces the dropdown for "Leaving From" field

## 🔍 GraphQL Query Structure

### Query
```graphql
query Cities($filters: CityFilter) {
  cities(filters: $filters) {
    id
    name
    country {
      iso2
      name
      createdAt
    }
    timezone
    lat
    lon
    createdAt
  }
}
```

### Variables
```typescript
{
  filters: {
    searchCities: "Paris"  // Case-insensitive partial match
  }
}
```

### Response
```typescript
{
  cities: [
    {
      id: "1",
      name: "Paris",
      country: {
        iso2: "FR",
        name: "France",
        createdAt: "2023-01-01T00:00:00Z"
      },
      timezone: "Europe/Paris",
      lat: 48.8566,
      lon: 2.3522,
      createdAt: "2023-01-01T00:00:00Z"
    }
  ]
}
```

## 🎨 Component Props

### CitySearch Props
```typescript
interface CitySearchProps {
  value: string;                    // Current input value
  onChange: (value: string) => void; // Called when input changes
  onSelectCity?: (city: City) => void; // Called when city is selected
  placeholder?: string;             // Input placeholder text
  label?: string;                   // Label for the input
  required?: boolean;               // Whether field is required
  className?: string;               // Additional CSS classes
}
```

### City Type
```typescript
interface Country {
  iso2: string;
  name: string;
  createdAt: string;
}

interface City {
  id: string;
  name: string;
  country: Country;
  timezone: string;
  lat: number;
  lon: number;
  createdAt: string;
}
```

## 🧪 Testing

### Component Tests
```bash
npx jest --testPathPatterns="city-search.test.tsx" --verbose
```

### Test Coverage
- ✅ Renders with correct placeholder
- ✅ Calls onChange when user types
- ✅ Shows loading state during search
- ✅ Displays city results when available
- ✅ Calls onSelectCity when city is clicked
- ✅ Displays error messages
- ✅ Shows "no results" message

## 🚀 Performance Optimizations

### Debouncing
- **300ms debounce** on search input to prevent excessive API calls
- Only makes request after user stops typing

### Error Handling
- **Network errors**: Displays user-friendly error messages
- **GraphQL errors**: Handles query failures gracefully
- **Empty queries**: Skips API calls for empty search terms

### Loading States
- **Visual feedback**: Loading spinner during search
- **Disabled interactions**: Prevents multiple simultaneous requests

## 🎯 Future Enhancements

### Potential Improvements
1. **Pagination**: For large result sets
2. **Infinite Scrolling**: Load more results as user scrolls
3. **Caching**: Cache search results for better performance
4. **Recent Searches**: Remember user's recent city searches
5. **Geolocation**: Suggest cities based on user's location
6. **Keyboard Navigation**: Arrow keys for dropdown navigation

### Additional Features
1. **City Details**: Show more information about selected cities
2. **Popular Cities**: Display trending or popular destinations
3. **Search History**: Persist search history across sessions
4. **Multi-language**: Support for different languages
5. **Accessibility**: Enhanced screen reader support

## 🔧 Troubleshooting

### Common Issues

1. **GraphQL Connection Failed**
   - Check if the ngrok URL is still active
   - Verify the authorization token is valid
   - Ensure the GraphQL endpoint is accessible

2. **No Search Results**
   - Verify the `searchCities` filter is working
   - Check if the GraphQL query returns expected data
   - Test with different search terms

3. **Component Not Rendering**
   - Check for TypeScript errors
   - Verify all imports are correct
   - Ensure Framer Motion is properly installed

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';
```

## 📊 API Usage

### Request Headers
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### Rate Limiting
- **Debounced requests**: 300ms minimum between requests
- **Automatic cleanup**: Cancels previous requests when new ones are made
- **Error recovery**: Retries failed requests with exponential backoff

## 🎉 Success Metrics

### Implementation Complete
- ✅ Dynamic city search with GraphQL integration
- ✅ Responsive design and smooth animations
- ✅ Comprehensive error handling
- ✅ Optimized performance with debouncing
- ✅ Full TypeScript support
- ✅ Component test coverage
- ✅ Seamless integration with existing proposal page

The city search functionality is now fully integrated and ready for production use!
