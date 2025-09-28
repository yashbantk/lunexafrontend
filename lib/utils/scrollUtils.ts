/**
 * Utility functions for managing scroll positions
 */

export interface ScrollPosition {
  x: number
  y: number
}

/**
 * Save scroll position to sessionStorage
 */
export const saveScrollPosition = (key: string, position: ScrollPosition): void => {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(`scroll-${key}`, JSON.stringify(position))
  } catch (error) {
    console.warn('Failed to save scroll position:', error)
  }
}

/**
 * Load scroll position from sessionStorage
 */
export const loadScrollPosition = (key: string): ScrollPosition | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = sessionStorage.getItem(`scroll-${key}`)
    if (!stored) return null
    
    return JSON.parse(stored) as ScrollPosition
  } catch (error) {
    console.warn('Failed to load scroll position:', error)
    return null
  }
}

/**
 * Clear scroll position from sessionStorage
 */
export const clearScrollPosition = (key: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.removeItem(`scroll-${key}`)
  } catch (error) {
    console.warn('Failed to clear scroll position:', error)
  }
}

/**
 * Restore scroll position with smooth animation
 */
export const restoreScrollPosition = (position: ScrollPosition, smooth: boolean = true): void => {
  if (typeof window === 'undefined') return
  
  window.scrollTo({
    left: position.x,
    top: position.y,
    behavior: smooth ? 'smooth' : 'instant'
  })
}

/**
 * Get current scroll position
 */
export const getCurrentScrollPosition = (): ScrollPosition => {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  
  return {
    x: window.scrollX,
    y: window.scrollY
  }
}

/**
 * Scroll to top of page
 */
export const scrollToTop = (smooth: boolean = true): void => {
  if (typeof window === 'undefined') return
  
  window.scrollTo({
    left: 0,
    top: 0,
    behavior: smooth ? 'smooth' : 'instant'
  })
}

/**
 * Scroll to bottom of page
 */
export const scrollToBottom = (smooth: boolean = true): void => {
  if (typeof window === 'undefined') return
  
  window.scrollTo({
    left: 0,
    top: document.documentElement.scrollHeight,
    behavior: smooth ? 'smooth' : 'instant'
  })
}

/**
 * Scroll to specific element
 */
export const scrollToElement = (elementId: string, smooth: boolean = true): void => {
  if (typeof window === 'undefined') return
  
  const element = document.getElementById(elementId)
  if (!element) return
  
  element.scrollIntoView({
    behavior: smooth ? 'smooth' : 'instant',
    block: 'start'
  })
}
