'use client'

import { ActivityTimeBlock, DaySlot } from '@/lib/utils/activitySlotFilter'
import { formatTime, getSlotDisplayName, getSlotIcon } from '@/lib/utils/activitySlotFilter'
import { Clock, AlertTriangle } from 'lucide-react'

interface TimelineBlockedSlotsProps {
  blockedSlots: ActivityTimeBlock[]
  daySlot: DaySlot
  className?: string
}

export default function TimelineBlockedSlots({ 
  blockedSlots, 
  daySlot, 
  className = '' 
}: TimelineBlockedSlotsProps) {
  // Filter blocked slots for this specific day slot
  const dayBlockedSlots = blockedSlots.filter(slot => slot.slot === daySlot)
  
  if (dayBlockedSlots.length === 0) {
    return null
  }

  // Calculate the position and width of each blocked slot
  const getSlotPosition = (startTime: string, endTime: string) => {
    const dayStart = daySlot === 'morning' ? 6 : daySlot === 'afternoon' ? 12 : 18
    const dayEnd = daySlot === 'morning' ? 12 : daySlot === 'afternoon' ? 18 : 24
    
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
    const dayStartMinutes = dayStart * 60
    const dayEndMinutes = dayEnd * 60
    
    const startPosition = ((startMinutes - dayStartMinutes) / (dayEndMinutes - dayStartMinutes)) * 100
    const width = ((endMinutes - startMinutes) / (dayEndMinutes - dayStartMinutes)) * 100
    
    return {
      left: `${Math.max(0, startPosition)}%`,
      width: `${Math.min(100 - startPosition, width)}%`
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getSlotIcon(daySlot)}</span>
          <span className="font-medium text-gray-700">{getSlotDisplayName(daySlot)}</span>
        </div>
        <div className="text-sm text-gray-500">
          {dayBlockedSlots.length} blocked slot{dayBlockedSlots.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative bg-gray-100 rounded-lg h-8 overflow-hidden">
        {/* Time markers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 6 }, (_, i) => {
            const hour = daySlot === 'morning' ? 6 + i : daySlot === 'afternoon' ? 12 + i : 18 + i
            const position = (i / 5) * 100
            return (
              <div 
                key={i}
                className="absolute top-0 h-full border-l border-gray-300"
                style={{ left: `${position}%` }}
              >
                <div className="absolute -top-5 left-0 transform -translate-x-1/2 text-xs text-gray-500">
                  {hour}:00
                </div>
              </div>
            )
          })}
        </div>

        {/* Blocked Time Slots */}
        {dayBlockedSlots.map((slot, index) => {
          const position = getSlotPosition(slot.startTime, slot.endTime)
          return (
            <div
              key={slot.id}
              className="absolute top-0 h-full bg-red-500 border border-red-600 rounded-sm flex items-center justify-center"
              style={{
                left: position.left,
                width: position.width,
                zIndex: 10
              }}
            >
              <div className="flex items-center space-x-1 text-white text-xs font-medium px-2">
                <Clock className="h-3 w-3" />
                <span className="truncate">{slot.title}</span>
              </div>
            </div>
          )
        })}

        {/* Blocked indicator overlay */}
        {dayBlockedSlots.length > 0 && (
          <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2 text-red-600 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              <span>Time slots blocked</span>
            </div>
          </div>
        )}
      </div>

      {/* Blocked Slots Details */}
      <div className="mt-3 space-y-2">
        {dayBlockedSlots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">{slot.title}</span>
            </div>
            <div className="text-sm text-gray-600">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

