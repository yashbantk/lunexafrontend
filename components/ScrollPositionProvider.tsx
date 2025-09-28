'use client'

import { ReactNode } from 'react'
import { usePersistentScrollPosition } from '@/hooks/usePersistentScrollPosition'

interface ScrollPositionProviderProps {
  children: ReactNode
}

export default function ScrollPositionProvider({ children }: ScrollPositionProviderProps) {
  // This hook automatically handles scroll position preservation
  usePersistentScrollPosition()
  
  return <>{children}</>
}
