# Activity Management System

A comprehensive activity management system for the Deyor travel platform, built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## 🎯 Overview

This system provides a two-step UX for adding and changing activities in travel proposals:

1. **Activity Explorer Modal** - Browse, filter, and search activities
2. **Activity Details Modal** - Full booking flow with time slots, extras, and pricing

## 🏗️ Architecture

### Core Components

- `ActivityExplorerModal` - Main modal with filters and results
- `ActivityDetailsModal` - Detailed booking flow
- `FiltersPanel` - Advanced filtering options
- `ActivityList` - Virtualized results list
- `ActivityCard` - Individual activity display
- `ExtrasList` - Add-on selection component

### Hooks

- `useActivitySearch` - Search, filter, and pagination
- `useActivityDetails` - Activity details and pricing

### Data Layer

- `types/activity.ts` - TypeScript interfaces
- `lib/mocks/activities.ts` - Mock data and GraphQL placeholders
- `hooks/useActivitySearch.ts` - Search logic
- `hooks/useActivityDetails.ts` - Details logic

## 🚀 Quick Start

### 1. Demo Page

Visit `/proposals/create/[id]/activity-demo` to see the full system in action.

### 2. Basic Integration

```tsx
import ActivityExplorerModal from '@/components/activities/ActivityExplorerModal'

function ProposalPage() {
  const [showActivityExplorer, setShowActivityExplorer] = useState(false)

  return (
    <>
      <Button onClick={() => setShowActivityExplorer(true)}>
        Add Activity
      </Button>
      
      <ActivityExplorerModal
        isOpen={showActivityExplorer}
        onClose={() => setShowActivityExplorer(false)}
        onSelectActivity={(activity, selection) => {
          // Update your proposal state
          console.log('Activity selected:', { activity, selection })
        }}
        dayId="day-1"
        mode="add"
      />
    </>
  )
}
```

## 🎨 Design System

### Colors
- **Primary/Brand**: `#E63946` (red)
- **Background**: `bg-gradient-to-br from-gray-50 to-white`
- **Cards**: `bg-white rounded-2xl shadow-xl`

### Typography
- **Titles**: `text-lg` to `text-2xl`
- **Body**: `text-base`
- **Metadata**: `text-sm`

### Components
- **Buttons**: Primary red, secondary outline
- **Badges**: Category and status indicators
- **Cards**: Rounded corners with subtle shadows

## 🔧 Configuration

### Tailwind Config

The brand color is already configured in `tailwind.config.js`:

```js
colors: {
  brand: {
    DEFAULT: "#E63946",
    foreground: "hsl(var(--primary-foreground))",
  }
}
```

### Mock Data

All mock data is in `lib/mocks/activities.ts` with 6 realistic activities including:
- Mount Batur Trekking
- Rice Terraces Tour
- Snorkeling & Island Hopping
- Cooking Class
- Sunset Dinner Cruise
- ATV Adventure

## 🔌 GraphQL Integration

### Replace Mock Data

1. **Update Hooks** - Replace mock calls in `useActivitySearch.ts` and `useActivityDetails.ts`:

```tsx
// Before (mock)
const result = await mockSearch(params)

// After (GraphQL)
const result = await graphQLClient.request(GET_ACTIVITIES, variables)
```

2. **Configure Endpoints** - Update GraphQL client configuration

3. **Update Queries** - Modify query strings in the hooks

### Example GraphQL Queries

```graphql
query GetActivities($params: ActivitySearchParams!) {
  activities(params: $params) {
    results {
      id
      title
      shortDesc
      basePrice
      rating
      # ... other fields
    }
    total
    hasMore
  }
}
```

## 📱 Responsive Design

### Desktop
- **Explorer**: 3-column layout (filters | results | optional preview)
- **Details**: 2-column layout (gallery | booking form)
- **Sticky elements**: Price summary, CTAs

### Mobile
- **Full-screen modals**
- **Collapsible filters**
- **Sticky bottom CTAs**
- **Touch-friendly targets**

## 🎭 Animations

Built with Framer Motion for smooth transitions:

- **Modal entrance/exit**
- **Card hover effects**
- **List item animations**
- **Loading states**

## ♿ Accessibility

- **Keyboard navigation** - All controls accessible via keyboard
- **Focus management** - Proper focus trapping in modals
- **ARIA labels** - Screen reader support
- **High contrast** - Clear visual hierarchy

## 🧪 Testing

### Unit Tests

Example test for `useActivitySearch`:

```tsx
import { renderHook } from '@testing-library/react'
import { useActivitySearch } from '@/hooks/useActivitySearch'

test('should filter activities by category', () => {
  const { result } = renderHook(() => 
    useActivitySearch({ 
      params: { category: ['Adventure'] } 
    })
  )
  
  expect(result.current.results).toHaveLength(2) // Adventure activities
})
```

### Integration Tests

Test the full flow:

```tsx
test('should add activity to proposal', async () => {
  // Render component
  // Click "Add Activity"
  // Select activity
  // Verify proposal update
})
```

## 🔄 State Management

### Activity Selection Flow

1. **Explorer** → User browses and selects activity
2. **Quick Select** → Uses default time slot and settings
3. **Details** → Full customization with time slots, extras, pickup
4. **Confirmation** → Adds to proposal with validation

### Price Calculation

```tsx
const calculatePrice = (selection) => {
  let total = activity.basePrice
  
  // Per-person pricing
  if (activity.pricingType === 'person') {
    total *= (adults + children)
  }
  
  // Add extras
  selection.extras.forEach(extra => {
    total += extra.priceType === 'per_person' 
      ? extra.price * (adults + children)
      : extra.price
  })
  
  // Add pickup
  total += selection.pickupOption.price
  
  return total
}
```

## 🚨 Error Handling

### Validation

- **Required fields** - Time slot, participants
- **Capacity limits** - Max participants per slot
- **Availability** - Real-time slot availability
- **Price changes** - Confirmation for >5% increases

### Error States

- **Loading** - Skeleton loaders and spinners
- **Empty** - No results found
- **Network** - Retry mechanisms
- **Validation** - Clear error messages

## 📊 Performance

### Optimization

- **Virtualization** - Large lists with react-window
- **Lazy loading** - Images and heavy components
- **Debouncing** - Search and filter inputs
- **Memoization** - Expensive calculations

### Bundle Size

- **Code splitting** - Modals loaded on demand
- **Tree shaking** - Unused code elimination
- **Image optimization** - Next.js Image component

## 🔧 Customization

### Adding New Filter Types

1. **Update Types** - Add to `ActivityFilters` interface
2. **Update Component** - Add UI in `FiltersPanel`
3. **Update Hook** - Add logic in `useActivitySearch`

### Adding New Activity Fields

1. **Update Types** - Add to `Activity` interface
2. **Update Mock Data** - Add sample data
3. **Update Components** - Display in cards/details

## 📝 API Reference

### ActivityExplorerModal Props

```tsx
interface ActivityExplorerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectActivity: (activity: Activity, selection: ActivitySelection) => void
  dayId: string
  currentActivity?: Activity
  mode?: 'add' | 'change'
}
```

### ActivityDetailsModal Props

```tsx
interface ActivityDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  activityId: string
  onAddToPackage: (activity: Activity, selection: ActivitySelection) => void
  dayId: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Modal not opening** - Check `isOpen` prop
2. **Search not working** - Verify filter state updates
3. **Price calculation wrong** - Check pricing type logic
4. **Images not loading** - Verify Next.js image config

### Debug Mode

Enable debug logging:

```tsx
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Activity selection:', selection)
}
```

## 🚀 Deployment

### Build

```bash
npm run build
```

### Environment Variables

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.deyor.com/graphql
NEXT_PUBLIC_IMAGE_CDN=https://images.deyor.com
```

## 📈 Future Enhancements

### Planned Features

- **Real-time availability** - Live slot updates
- **Group bookings** - Multi-activity packages
- **Reviews integration** - User reviews and ratings
- **Recommendations** - AI-powered suggestions
- **Offline support** - PWA capabilities

### Performance Improvements

- **Infinite scroll** - Replace pagination
- **Search suggestions** - Autocomplete
- **Caching** - Redis for search results
- **CDN** - Global image delivery

## 📄 License

This component system is part of the Deyor travel platform and follows the project's licensing terms.

---

**Built with ❤️ for the Deyor travel platform**
