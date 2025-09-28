import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { saveScrollPosition, loadScrollPosition, clearScrollPosition, restoreScrollPosition } from '@/lib/utils/scrollUtils'

/**
 * Hook to preserve scroll position on page refresh
 * Uses sessionStorage for temporary persistence
 */
export function usePageScrollPosition() {
  const pathname = usePathname()
  const isRestored = useRef(false)
  const scrollKey = `page-${pathname}`

  useEffect(() => {
    // Save scroll position before page unload
    const saveScroll = () => {
      saveScrollPosition(scrollKey, {
        x: window.scrollX,
        y: window.scrollY
      })
    }

    // Restore scroll position after page load
    const restoreScroll = () => {
      if (isRestored.current) return
      
      const savedPosition = loadScrollPosition(scrollKey)
      if (savedPosition) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          restoreScrollPosition(savedPosition, false) // Instant restore
          isRestored.current = true
        })
      }
    }

    // Save scroll position on page unload
    window.addEventListener('beforeunload', saveScroll)
    
    // Restore scroll position after component mount
    if (typeof window !== 'undefined') {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(restoreScroll, 100)
      
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeunload', saveScroll)
      }
    }
  }, [pathname, scrollKey])

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      saveScrollPosition(scrollKey, {
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
  }, [scrollKey])

  return {
    saveScrollPosition: () => {
      saveScrollPosition(scrollKey, {
        x: window.scrollX,
        y: window.scrollY
      })
    },
    restoreScrollPosition: () => {
      const savedPosition = loadScrollPosition(scrollKey)
      if (savedPosition) {
        restoreScrollPosition(savedPosition, true) // Smooth restore
      }
    },
    clearScrollPosition: () => {
      clearScrollPosition(scrollKey)
    }
  }
}
