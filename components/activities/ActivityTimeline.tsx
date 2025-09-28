import React from 'react'
import { ActivityTimeBlock, getSlotDisplayName, getSlotIcon } from '@/lib/utils/activitySlotFilter'
import { formatTime } from '@/lib/utils/formatUtils'

interface ActivityTimelineProps {
  blockedSlots: ActivityTimeBlock[]
  selectedSlot?: string
  className?: string
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  blockedSlots,
  selectedSlot,
  className = ''
}) => {
  if (blockedSlots.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">No activities scheduled</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700">Scheduled Activities</h3>
      <div className="space-y-2">
        {blockedSlots.map((slot) => (
          <div
            key={slot.id}
            className={`
              flex items-center justify-between p-3 rounded-lg border
              ${selectedSlot === slot.slot 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-gray-50 border-gray-200'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getSlotIcon(slot.slot)}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{slot.title}</p>
                <p className="text-xs text-gray-500">{getSlotDisplayName(slot.slot)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityTimeline
