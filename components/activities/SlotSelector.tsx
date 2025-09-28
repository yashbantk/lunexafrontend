import React from 'react'
import { DaySlot, getSlotDisplayName, getSlotIcon } from '@/lib/utils/activitySlotFilter'

interface SlotSelectorProps {
  selectedSlot: DaySlot | null
  onSlotChange: (slot: DaySlot | null) => void
  blockedSlots: DaySlot[]
  className?: string
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({
  selectedSlot,
  onSlotChange,
  blockedSlots,
  className = ''
}) => {
  const slots: DaySlot[] = ['morning', 'afternoon', 'evening', 'full_day']

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700">Time of Day</h3>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot
          const isBlocked = blockedSlots.includes(slot)
          const isDisabled = isBlocked

          return (
            <button
              key={slot}
              onClick={() => onSlotChange(isSelected ? null : slot)}
              disabled={isDisabled}
              className={`
                flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                ${isSelected 
                  ? 'bg-primary text-white border-primary' 
                  : isBlocked
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg">{getSlotIcon(slot)}</span>
              <span>{getSlotDisplayName(slot)}</span>
              {isBlocked && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  Blocked
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selectedSlot && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            Showing activities for {getSlotDisplayName(selectedSlot)} slot
          </p>
        </div>
      )}
    </div>
  )
}

export default SlotSelector
