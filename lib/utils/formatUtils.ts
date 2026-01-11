/**
 * Format duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "2h 30m", "45 minutes", "1 hour")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`
    } else {
      return `${hours}h ${remainingMinutes}m`
    }
  }
}

/**
 * Format time string to human-readable format (12-hour format with AM/PM)
 * @param timeString - Time string in various formats (HH:MM, ISO, etc.)
 * @returns Formatted time string (e.g., "9:00 AM", "2:30 PM")
 */
export const formatTime = (timeString: string): string => {
  try {
    // Handle different time formats
    let time: Date
    
    if (timeString.includes('T')) {
      // ISO format
      time = new Date(timeString)
    } else if (timeString.includes(':')) {
      // HH:MM format
      const [hours, minutes] = timeString.split(':').map(Number)
      time = new Date()
      time.setHours(hours, minutes, 0, 0)
    } else {
      // Fallback
      time = new Date(timeString)
    }
    
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    // Fallback to original string if parsing fails
    return timeString
  }
}

/**
 * Format price in cents to currency format
 * Always formats in INR (conversion should be done before calling this)
 * @param priceCents - Price in cents (should already be converted to INR)
 * @param currency - Currency code (ignored, always uses INR)
 * @returns Formatted price string in INR
 */
export const formatPrice = (priceCents: number, currency: string = 'INR'): string => {
  // Always format in INR - conversion should happen before calling this function
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(priceCents / 100)
}

/**
 * Format price in cents to INR currency format (async version with conversion)
 * @param priceCents - Price in cents (source currency)
 * @param fromCurrency - Source currency code
 * @returns Promise of formatted price string in INR
 */
export const formatPriceWithConversion = async (
  priceCents: number,
  fromCurrency: string = 'INR'
): Promise<string> => {
  const { convertCentsToINR } = await import('./currencyConverter')
  const inrCents = await convertCentsToINR(priceCents, fromCurrency)
  return formatPrice(inrCents, 'INR')
}
