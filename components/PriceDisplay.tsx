'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils/formatUtils'
import { convertCentsToINR } from '@/lib/utils/currencyConverter'

interface PriceDisplayProps {
  priceCents: number
  currency?: string
  sourceCurrency?: string // For when input is already in cents but of a specific currency
  className?: string
}

export function PriceDisplay({ 
  priceCents, 
  currency = 'INR', 
  sourceCurrency,
  className = '' 
}: PriceDisplayProps) {
  const [displayPrice, setDisplayPrice] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      // If sourceCurrency is provided, use it. Otherwise use currency prop.
      // The currency prop in formatPrice usually defaults to INR, but here we want source currency.
      const fromCurrency = sourceCurrency || currency
      
      try {
        if (fromCurrency === 'INR') {
           if (isMounted) {
             setDisplayPrice(formatPrice(priceCents, 'INR'))
             setIsLoading(false)
           }
           return
        }

        const converted = await convertCentsToINR(priceCents, fromCurrency)
        if (isMounted) {
          setDisplayPrice(formatPrice(converted, 'INR'))
          setIsLoading(false)
        }
      } catch (e) {
        if (isMounted) {
           // Fallback
           setDisplayPrice(formatPrice(priceCents, 'INR')) 
           setIsLoading(false)
        }
      }
    }
    load()
    return () => { isMounted = false }
  }, [priceCents, currency, sourceCurrency])

  if (isLoading) return <span className={`opacity-50 ${className}`}>...</span>
  
  return <span className={className}>{displayPrice}</span>
}

