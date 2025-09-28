import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface ScrollPosition {
  x: number
  y: number
}

// Store scroll positions in memory
const scrollPositions = new Map<string, ScrollPosition>()

export function useScrollPosition() {
  const pathname = usePathname()
  const isRestored = useRef(false)

  useEffect(() => {
    // Save scroll position before page unload
    const saveScrollPosition = () => {
      scrollPositions.set(pathname, {
        x: window.scrollX,
        y: window.scrollY
      })
    }

    // Restore scroll position after page load
    const restoreScrollPosition = () => {
      if (isRestored.current) return
      
      const savedPosition = scrollPositions.get(pathname)
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
    
    // Save scroll position when navigating away
    const handleRouteChange = () => {
      saveScrollPosition()
    }

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
      scrollPositions.set(pathname, {
        x: window.scrollX,
        y: window.scrollY
      })
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
      scrollPositions.set(pathname, {
        x: window.scrollX,
        y: window.scrollY
      })
    },
    restoreScrollPosition: () => {
      const savedPosition = scrollPositions.get(pathname)
      if (savedPosition) {
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior: 'smooth'
        })
      }
    },
    clearScrollPosition: () => {
      scrollPositions.delete(pathname)
    }
  }
}
