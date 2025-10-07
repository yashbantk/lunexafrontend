'use client'

import { useState } from 'react'
import { ActivityTimeBlock, DaySlot } from '@/lib/utils/activitySlotFilter'
import TimelineBlockedSlots from './TimelineBlockedSlots'
import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react'

interface DayTimelineProps {
  blockedSlots: ActivityTimeBlock[]
  dayNumber: number
  date: string
  className?: string
}

export default function DayTimeline({ 
  blockedSlots, 
  dayNumber, 
  date, 
  className = '' 
}: DayTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const daySlots: DaySlot[] = ['morning', 'afternoon', 'evening']
  
  // Count total blocked slots
  const totalBlockedSlots = blockedSlots.length
  
  // Count blocked slots per day slot
  const getBlockedCountForSlot = (slot: DaySlot) => {
    return blockedSlots.filter(blockedSlot => blockedSlot.slot === slot).length
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Timeline Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-gray-900">Day {dayNumber}</span>
            <span className="text-sm text-gray-500">{date}</span>
          </div>
          {totalBlockedSlots > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              <Clock className="h-3 w-3" />
              <span>{totalBlockedSlots} blocked</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {totalBlockedSlots > 0 ? 'Time slots occupied' : 'All time slots available'}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Timeline Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {daySlots.map((slot) => {
            const blockedCount = getBlockedCountForSlot(slot)
            return (
              <TimelineBlockedSlots
                key={slot}
                blockedSlots={blockedSlots}
                daySlot={slot}
                className={blockedCount > 0 ? 'opacity-100' : 'opacity-60'}
              />
            )
          })}
          
          {totalBlockedSlots === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No activities scheduled</p>
              <p className="text-xs text-gray-400">All time slots are available</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

