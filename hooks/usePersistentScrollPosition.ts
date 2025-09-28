import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface ScrollPosition {
  x: number
  y: number
  timestamp: number
}

const STORAGE_KEY = 'scroll-positions'
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function usePersistentScrollPosition() {
  const pathname = usePathname()
  const isRestored = useRef(false)

  // Get scroll positions from localStorage
  const getScrollPositions = (): Record<string, ScrollPosition> => {
    if (typeof window === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return {}
      
      const positions = JSON.parse(stored)
      
      // Clean up old positions
      const now = Date.now()
      const cleanedPositions: Record<string, ScrollPosition> = {}
      
      Object.entries(positions).forEach(([key, position]) => {
        if (now - (position as ScrollPosition).timestamp < MAX_AGE) {
          cleanedPositions[key] = position as ScrollPosition
        }
      })
      
      // Save cleaned positions back to localStorage
      if (Object.keys(cleanedPositions).length !== Object.keys(positions).length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedPositions))
      }
      
      return cleanedPositions
    } catch (error) {
      console.warn('Failed to load scroll positions from localStorage:', error)
      return {}
    }
  }

  // Save scroll positions to localStorage
  const saveScrollPositions = (positions: Record<string, ScrollPosition>) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
    } catch (error) {
      console.warn('Failed to save scroll positions to localStorage:', error)
    }
  }

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
      }
    }
  }
}
