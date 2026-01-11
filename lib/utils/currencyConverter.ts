/**
 * Currency conversion utility using ExchangeRate-API
 * Converts any currency to INR (Indian Rupees)
 */

// Cache for exchange rates (valid for 1 hour)
const exchangeRateCache = new Map<string, { rate: number; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

// ExchangeRate-API configuration
// Using open access endpoint (no API key required for free tier)
const EXCHANGE_RATE_API_BASE = 'https://v6.exchangerate-api.com/v6'

/**
 * Get exchange rate from source currency to INR
 * @param fromCurrency - Source currency code (e.g., 'USD', 'EUR')
 * @param apiKey - Optional API key (if not provided, uses open access)
 * @returns Exchange rate (amount in fromCurrency * rate = amount in INR)
 */
export async function getExchangeRateToINR(
  fromCurrency: string,
  apiKey?: string
): Promise<number> {
  // If already INR, return 1
  if (fromCurrency.toUpperCase() === 'INR') {
    return 1
  }

  const cacheKey = `${fromCurrency.toUpperCase()}_INR`
  const cached = exchangeRateCache.get(cacheKey)

  // Check if cached rate is still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rate
  }

  try {
    let rate: number

    if (apiKey) {
      // Use ExchangeRate-API with API key
      const endpoint = `${EXCHANGE_RATE_API_BASE}/${apiKey}/pair/${fromCurrency.toUpperCase()}/INR`
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.statusText}`)
      }
      const data = await response.json()
      if (data.result === 'error') {
        throw new Error(`Exchange rate API error: ${data['error-type']}`)
      }
      rate = data.conversion_rate
    } else {
      // Use free API: exchangerate.host (no API key required)
      const freeApiEndpoint = `https://api.exchangerate.host/latest?base=${fromCurrency.toUpperCase()}&symbols=INR`
      const response = await fetch(freeApiEndpoint)
      
      if (!response.ok) {
        // Fallback to ExchangeRate-API open access (if available)
        const fallbackEndpoint = `https://open.er-api.com/v6/latest/${fromCurrency.toUpperCase()}`
        const fallbackResponse = await fetch(fallbackEndpoint)
        if (!fallbackResponse.ok) {
          throw new Error(`Exchange rate API error: ${response.statusText}`)
        }
        const fallbackData = await fallbackResponse.json()
        rate = fallbackData.rates?.INR || 1
      } else {
        const data = await response.json()
        rate = data.rates?.INR || 1
        
        // If rate is not available, try fallback
        if (!rate || rate === 1) {
          const fallbackEndpoint = `https://open.er-api.com/v6/latest/${fromCurrency.toUpperCase()}`
          const fallbackResponse = await fetch(fallbackEndpoint)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            rate = fallbackData.rates?.INR || 1
          }
        }
      }
    }

    // Cache the rate
    exchangeRateCache.set(cacheKey, {
      rate,
      timestamp: Date.now()
    })

    return rate
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    // Return cached rate if available, otherwise return 1 (no conversion)
    if (cached) {
      return cached.rate
    }
    // Fallback: return 1 to avoid breaking the app
    return 1
  }
}

/**
 * Convert amount from source currency to INR
 * @param amount - Amount in source currency
 * @param fromCurrency - Source currency code
 * @param apiKey - Optional API key
 * @returns Amount in INR
 */
export async function convertToINR(
  amount: number,
  fromCurrency: string,
  apiKey?: string
): Promise<number> {
  if (fromCurrency.toUpperCase() === 'INR') {
    return amount
  }

  const rate = await getExchangeRateToINR(fromCurrency, apiKey)
  return amount * rate
}

/**
 * Convert amount in cents from source currency to INR cents
 * @param amountCents - Amount in cents (source currency)
 * @param fromCurrency - Source currency code
 * @param apiKey - Optional API key
 * @returns Amount in INR cents
 */
export async function convertCentsToINR(
  amountCents: number,
  fromCurrency: string,
  apiKey?: string
): Promise<number> {
  if (fromCurrency.toUpperCase() === 'INR') {
    return amountCents
  }

  const rate = await getExchangeRateToINR(fromCurrency, apiKey)
  return Math.round(amountCents * rate)
}

/**
 * Batch convert multiple amounts to INR
 * @param amounts - Array of { amountCents, currency } objects
 * @param apiKey - Optional API key
 * @returns Array of amounts in INR cents
 */
export async function batchConvertToINR(
  amounts: Array<{ amountCents: number; currency: string }>,
  apiKey?: string
): Promise<number[]> {
  // Get unique currencies
  const uniqueCurrencies = [...new Set(amounts.map(a => a.currency.toUpperCase()))]
  
  // Fetch all exchange rates in parallel
  const ratePromises = uniqueCurrencies.map(currency =>
    getExchangeRateToINR(currency, apiKey)
  )
  const rates = await Promise.all(ratePromises)
  
  // Create rate map
  const rateMap = new Map<string, number>()
  uniqueCurrencies.forEach((currency, index) => {
    rateMap.set(currency, rates[index])
  })

  // Convert all amounts
  return amounts.map(({ amountCents, currency }) => {
    if (currency.toUpperCase() === 'INR') {
      return amountCents
    }
    const rate = rateMap.get(currency.toUpperCase()) || 1
    return Math.round(amountCents * rate)
  })
}

/**
 * Clear the exchange rate cache
 */
export function clearCurrencyCache(): void {
  exchangeRateCache.clear()
}

