import { Activity } from '@/types/activity'

export type DaySlot = 'morning' | 'afternoon' | 'evening' | 'full_day'

export interface TimeSlot {
  start: string // HH:MM format
  end: string // HH:MM format
  slot: DaySlot
}

export interface ActivityTimeBlock {
  id: string
  startTime: string
  endTime: string
  title: string
  slot: DaySlot
  dayId?: string // Optional day ID to filter by specific day
}

/**
 * Get time slots for each day period
 */
export const getDayTimeSlots = (): Record<DaySlot, TimeSlot> => ({
  morning: {
    start: '06:00',
    end: '12:00',
    slot: 'morning'
  },
  afternoon: {
    start: '12:00',
    end: '18:00',
    slot: 'afternoon'
  },
  evening: {
    start: '18:00',
    end: '23:59',
    slot: 'evening'
  },
  full_day: {
    start: '06:00',
    end: '23:59',
    slot: 'full_day'
  }
})

/**
 * Filter activities by slot (morning, afternoon, evening, full_day)
 */
export const filterActivitiesBySlot = (activities: Activity[], slot: DaySlot): Activity[] => {
  return activities.filter(activity => activity.slot === slot)
}

/**
 * Filter activities by start time within a slot
 */
export const filterActivitiesByStartTime = (activities: Activity[], slot: DaySlot): Activity[] => {
  const timeSlots = getDayTimeSlots()
  const slotTime = timeSlots[slot]
  
  return activities.filter(activity => {
    const activityStartTime = activity.startTime
    return isTimeInRange(activityStartTime, slotTime.start, slotTime.end)
  })
}

/**
 * Check if a time is within a range
 */
export const isTimeInRange = (time: string, start: string, end: string): boolean => {
  const timeMinutes = timeToMinutes(time)
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (time: string | undefined | null): number => {
  if (!time) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Calculate end time based on start time and duration
 */
export const calculateEndTime = (startTime: string | undefined | null, durationMinutes: number): string => {
  if (!startTime) return '00:00'
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + durationMinutes
  return minutesToTime(endMinutes)
}

/**
 * Check if two time ranges overlap
 */
export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const start1Minutes = timeToMinutes(start1)
  const end1Minutes = timeToMinutes(end1)
  const start2Minutes = timeToMinutes(start2)
  const end2Minutes = timeToMinutes(end2)
  
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes
}

/**
 * Get blocked time slots for a day
 */
export const getBlockedTimeSlots = (existingActivities: ActivityTimeBlock[]): TimeSlot[] => {
  const blockedSlots: TimeSlot[] = []
  
  existingActivities.forEach(activity => {
    blockedSlots.push({
      start: activity.startTime,
      end: activity.endTime,
      slot: activity.slot
    })
  })
  
  return blockedSlots
}

/**
 * Check if an activity conflicts with existing activities
 */
export const hasTimeConflict = (
  newActivity: Activity,
  existingActivities: ActivityTimeBlock[]
): boolean => {
  const newStartTime = newActivity.startTime
  if (!newStartTime) return false // If no start time, no conflict
  
  const newEndTime = calculateEndTime(newStartTime, newActivity.durationMins)
  
  return existingActivities.some(existing => {
    return isTimeOverlap(
      newStartTime,
      newEndTime,
      existing.startTime,
      existing.endTime
    )
  })
}

/**
 * Get available time slots for a specific day slot
 */
export const getAvailableTimeSlots = (
  slot: DaySlot,
  existingActivities: ActivityTimeBlock[] = []
): string[] => {
  const timeSlots = getDayTimeSlots()
  const slotTime = timeSlots[slot]
  const availableSlots: string[] = []
  
  // Generate 30-minute intervals within the slot
  const startMinutes = timeToMinutes(slotTime.start)
  const endMinutes = timeToMinutes(slotTime.end)
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const timeSlot = minutesToTime(minutes)
    const timeSlotEnd = minutesToTime(minutes + 30)
    
    // Check if this time slot conflicts with existing activities
    const hasConflict = existingActivities.some(activity => {
      return isTimeOverlap(
        timeSlot,
        timeSlotEnd,
        activity.startTime,
        activity.endTime
      )
    })
    
    if (!hasConflict) {
      availableSlots.push(timeSlot)
    }
  }
  
  return availableSlots
}

/**
 * Format time for display
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Get slot display name
 */
export const getSlotDisplayName = (slot: DaySlot): string => {
  const slotNames: Record<DaySlot, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    full_day: 'Full Day'
  }
  return slotNames[slot]
}

/**
 * Get slot icon
 */
export const getSlotIcon = (slot: DaySlot): string => {
  const slotIcons: Record<DaySlot, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    full_day: '🌞'
  }
  return slotIcons[slot]
}
