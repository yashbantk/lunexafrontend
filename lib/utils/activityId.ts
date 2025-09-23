/**
 * Extracts the numeric ID from a string activity ID
 * @param activityId - The activity ID (e.g., "1", "2", "1758648734341")
 * @returns The numeric ID as a number, or null if extraction fails
 */
export function extractNumericActivityId(activityId: string): number | null {
  // Handle numeric IDs directly
  if (/^\d+$/.test(activityId)) {
    return parseInt(activityId, 10)
  }
  
  // If not a numeric string, return null
  return null
}

/**
 * Validates if an activity ID can be converted to a numeric ID
 * @param activityId - The activity ID to validate
 * @returns True if the ID can be converted to a number
 */
export function isValidActivityId(activityId: string): boolean {
  return extractNumericActivityId(activityId) !== null
}
