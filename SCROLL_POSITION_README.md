# Scroll Position Preservation

This implementation provides multiple ways to preserve scroll positions across page refreshes and navigation.

## Features

- ✅ **Automatic scroll position preservation** across all pages
- ✅ **Persistent storage** using localStorage (survives browser restarts)
- ✅ **Session storage** for temporary persistence
- ✅ **Performance optimized** with throttled scroll events
- ✅ **TypeScript support** with proper type definitions
- ✅ **Memory cleanup** to prevent memory leaks

## Implementation

### 1. Global Implementation (Applied to All Pages)

The scroll position preservation is automatically applied to all pages through the root layout:

```tsx
// app/layout.tsx
import ScrollPositionProvider from '@/components/ScrollPositionProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ScrollPositionProvider>
          {children}
        </ScrollPositionProvider>
      </body>
    </html>
  )
}
```

### 2. Available Hooks

#### `usePersistentScrollPosition()`
- **Purpose**: Preserves scroll positions across browser sessions
- **Storage**: localStorage with 24-hour expiration
- **Usage**: Automatically applied globally

#### `usePageScrollPosition()`
- **Purpose**: Preserves scroll positions for current session only
- **Storage**: sessionStorage
- **Usage**: For specific pages that need session-only persistence

#### `useScrollPosition()`
- **Purpose**: In-memory scroll position preservation
- **Storage**: Memory only (lost on page refresh)
- **Usage**: For temporary scroll position management

### 3. Utility Functions

```typescript
import { 
  saveScrollPosition, 
  loadScrollPosition, 
  clearScrollPosition,
  restoreScrollPosition,
  scrollToTop,
  scrollToBottom,
  scrollToElement
} from '@/lib/utils/scrollUtils'

// Save current scroll position
saveScrollPosition('my-page', { x: 0, y: 500 })

// Load saved scroll position
const position = loadScrollPosition('my-page')

// Restore scroll position
restoreScrollPosition(position, true) // smooth scroll

// Scroll to top
scrollToTop(true) // smooth scroll

// Scroll to specific element
scrollToElement('my-section', true)
```

## How It Works

### 1. Automatic Preservation
- **On Scroll**: Position is saved to localStorage every 100ms (throttled)
- **On Page Unload**: Final position is saved before navigation
- **On Page Load**: Position is restored after DOM is ready
- **Cleanup**: Old positions are automatically cleaned up after 24 hours

### 2. Performance Optimizations
- **Throttled Events**: Scroll events are throttled to 100ms intervals
- **Passive Listeners**: Scroll listeners use passive mode for better performance
- **RequestAnimationFrame**: DOM updates are batched for smooth restoration
- **Memory Management**: Old positions are cleaned up automatically

### 3. Storage Strategy
- **localStorage**: For persistent cross-session storage
- **sessionStorage**: For temporary session-only storage
- **Memory**: For immediate use without persistence

## Usage Examples

### Basic Usage (Automatic)
No additional code needed - scroll positions are automatically preserved.

### Custom Page Implementation
```tsx
import { usePageScrollPosition } from '@/hooks/usePageScrollPosition'

export default function MyPage() {
  const { saveScrollPosition, restoreScrollPosition, clearScrollPosition } = usePageScrollPosition()
  
  // Manual control if needed
  const handleSavePosition = () => {
    saveScrollPosition()
  }
  
  const handleRestorePosition = () => {
    restoreScrollPosition()
  }
  
  return <div>My Page Content</div>
}
```

### Manual Scroll Control
```tsx
import { scrollToTop, scrollToElement } from '@/lib/utils/scrollUtils'

export default function MyComponent() {
  const handleScrollToTop = () => {
    scrollToTop(true) // smooth scroll
  }
  
  const handleScrollToSection = () => {
    scrollToElement('my-section', true) // smooth scroll
  }
  
  return (
    <div>
      <button onClick={handleScrollToTop}>Scroll to Top</button>
      <button onClick={handleScrollToSection}>Scroll to Section</button>
    </div>
  )
}
```

## Configuration

### Custom Storage Key
```typescript
// Custom scroll position with specific key
const scrollKey = `custom-${pageId}`
saveScrollPosition(scrollKey, { x: 0, y: 500 })
```

### Clear All Positions
```typescript
import { usePersistentScrollPosition } from '@/hooks/usePersistentScrollPosition'

const { clearAllScrollPositions } = usePersistentScrollPosition()
clearAllScrollPositions() // Clears all stored positions
```

## Browser Support

- ✅ **Modern Browsers**: Full support
- ✅ **Mobile Browsers**: Full support
- ✅ **Safari**: Full support
- ✅ **Chrome**: Full support
- ✅ **Firefox**: Full support
- ✅ **Edge**: Full support

## Performance Impact

- **Minimal**: Throttled scroll events (100ms intervals)
- **Memory Efficient**: Automatic cleanup of old positions
- **Storage Efficient**: Only stores essential position data
- **Network Friendly**: No network requests required

## Troubleshooting

### Scroll Position Not Restored
1. Check if localStorage is available
2. Verify the page has loaded completely
3. Check browser console for errors

### Performance Issues
1. Ensure scroll events are throttled
2. Check for memory leaks in custom implementations
3. Verify cleanup functions are called

### Storage Issues
1. Check localStorage quota
2. Verify browser storage permissions
3. Check for storage errors in console

## Best Practices

1. **Use Global Implementation**: The ScrollPositionProvider handles most use cases
2. **Avoid Manual Implementation**: Unless you need specific control
3. **Clean Up**: Always clean up event listeners
4. **Test Thoroughly**: Test across different browsers and devices
5. **Monitor Performance**: Watch for memory leaks in long-running applications
