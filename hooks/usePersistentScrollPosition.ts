import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface ScrollPosition {
  x: number
  y: number
  timestamp: number
}

const STORAGE_KEY = 'scroll-positions'
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Module-level cache for scroll positions (avoids repeated localStorage reads)
let scrollPositionsCache: Record<string, ScrollPosition> | null = null
let lastCleanupTime = 0

// Get scroll positions with caching
function getScrollPositions(): Record<string, ScrollPosition> {
  if (typeof window === 'undefined') return {}
  
  // Return cached if available and recent (cleaned within last minute)
  const now = Date.now()
  if (scrollPositionsCache !== null && now - lastCleanupTime < 60000) {
    return scrollPositionsCache
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      scrollPositionsCache = {}
      lastCleanupTime = now
      return scrollPositionsCache
    }
    
    const positions = JSON.parse(stored)
    
    // Clean up old positions
    const cleanedPositions: Record<string, ScrollPosition> = {}
    let hasExpired = false
    
    for (const [key, position] of Object.entries(positions)) {
      if (now - (position as ScrollPosition).timestamp < MAX_AGE) {
        cleanedPositions[key] = position as ScrollPosition
      } else {
        hasExpired = true
      }
    }
    
    // Save cleaned positions back to localStorage only if something was removed
    if (hasExpired) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedPositions))
    }
    
    scrollPositionsCache = cleanedPositions
    lastCleanupTime = now
    return scrollPositionsCache
  } catch {
    scrollPositionsCache = {}
    lastCleanupTime = now
    return scrollPositionsCache
  }
}

// Save scroll positions with cache update
function saveScrollPositions(positions: Record<string, ScrollPosition>): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
    scrollPositionsCache = positions // Update cache
  } catch {
    // Silently fail - localStorage might be full or unavailable
  }
}

// Clear cache (useful when localStorage is modified externally)
function invalidateCache(): void {
  scrollPositionsCache = null
}

export function usePersistentScrollPosition() {
  const pathname = usePathname()
  const isRestored = useRef(false)

  useEffect(() => {
    // Save scroll position before page unload
    const saveScrollPosition = () => {
      const positions = getScrollPositions()
      positions[pathname] = {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now()
      }
      saveScrollPositions(positions)
    }

    // Restore scroll position after page load
    const restoreScrollPosition = () => {
      if (isRestored.current) return
      
      const positions = getScrollPositions()
      const savedPosition = positions[pathname]
      
      if (savedPosition) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'instant'
          })
          isRestored.current = true
        })
      }
    }

    // Save scroll position on page unload
    window.addEventListener('beforeunload', saveScrollPosition)
    
    // Restore scroll position after component mount
    if (typeof window !== 'undefined') {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(restoreScrollPosition, 100)
      
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeunload', saveScrollPosition)
      }
    }
  }, [pathname])

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      const positions = getScrollPositions()
      positions[pathname] = {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now()
      }
      saveScrollPositions(positions)
    }

    // Throttle scroll events for better performance
    let timeoutId: NodeJS.Timeout
    const throttledScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [pathname])

  return {
    saveScrollPosition: () => {
      const positions = getScrollPositions()
      positions[pathname] = {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now()
      }
      saveScrollPositions(positions)
    },
    restoreScrollPosition: () => {
      const positions = getScrollPositions()
      const savedPosition = positions[pathname]
      if (savedPosition) {
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior: 'smooth'
        })
      }
    },
    clearScrollPosition: () => {
      const positions = getScrollPositions()
      delete positions[pathname]
      saveScrollPositions(positions)
    },
    clearAllScrollPositions: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
        invalidateCache()
      }
    }
  }
}
