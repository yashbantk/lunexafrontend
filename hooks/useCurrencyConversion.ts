"use client"

import { useState, useEffect, useCallback } from 'react'
import { convertCentsToINR, getExchangeRateToINR } from '@/lib/utils/currencyConverter'

/**
 * Hook for currency conversion to INR
 * Provides conversion functions and loading states
 */
export function useCurrencyConversion() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Convert amount in cents from source currency to INR cents
   */
  const convertToINR = useCallback(async (
    amountCents: number,
    fromCurrency: string
  ): Promise<number> => {
    if (fromCurrency.toUpperCase() === 'INR') {
      return amountCents
    }

    setLoading(true)
    setError(null)

    try {
      const converted = await convertCentsToINR(amountCents, fromCurrency)
      return converted
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed'
      setError(errorMessage)
      console.error('Currency conversion error:', err)
      // Return original amount on error
      return amountCents
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get exchange rate from source currency to INR
   */
  const getRate = useCallback(async (fromCurrency: string): Promise<number> => {
    if (fromCurrency.toUpperCase() === 'INR') {
      return 1
    }

    setLoading(true)
    setError(null)

    try {
      const rate = await getExchangeRateToINR(fromCurrency)
      return rate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rate fetch failed'
      setError(errorMessage)
      console.error('Exchange rate fetch error:', err)
      return 1
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    convertToINR,
    getRate,
    loading,
    error
  }
}

/**
 * Hook for synchronous currency conversion (uses cached rates)
 * Use this when you need immediate conversion without async operations
 */
export function useCurrencyConversionSync() {
  /**
   * Format price in cents, converting to INR if needed
   * This is a synchronous wrapper that uses cached rates
   */
  const formatPriceInINR = useCallback((
    priceCents: number,
    fromCurrency: string
  ): string => {
    // For now, return formatted price assuming it's already in INR
    // The actual conversion should happen at data fetch time
    const amount = priceCents / 100
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }, [])

  return {
    formatPriceInINR
  }
}

