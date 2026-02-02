"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Plane, 
  Car,
  CheckCircle,
  X
} from "lucide-react"
import { Day, Activity } from "@/types/proposal"
import { ActivityTimeBlock } from "@/lib/utils/activitySlotFilter"

interface DayAccordionProps {
  day: Day
  dayIndex: number
  onEdit: () => void
  onRemove: () => void
  onAddActivity: () => void
  onEditActivity?: (activity: Activity, dayIndex: number) => void
  onRemoveActivity?: (activityId: string, dayIndex: number) => void
  onAddTransfer?: () => void
  onEditTransfer?: (transfer: any, dayIndex: number) => void
  onRemoveTransfer?: (transferId: string, dayIndex: number) => void
  blockedTimeSlots?: ActivityTimeBlock[]
  hideTimeline?: boolean
}

export function DayAccordion({ day, dayIndex, onEdit, onRemove, onAddActivity, onEditActivity, onRemoveActivity, onAddTransfer, onEditTransfer, onRemoveTransfer, blockedTimeSlots = [], hideTimeline = false }: DayAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(day.dayNumber <= 2) // Open first 2 days by default

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatCurrency = (amountInCents: number, currencyCode: string = 'INR') => {
    const amount = amountInCents / 100
    return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'INR' ? 0 : 2,
    }).format(amount)
  }

  const getTimeSlotColor = (timeSlot: string) => {
    const colors = {
      morning: 'bg-yellow-100 text-yellow-800',
      afternoon: 'bg-orange-100 text-orange-800',
      evening: 'bg-purple-100 text-purple-800'
    }
    return colors[timeSlot as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-gray-900">
                Day {day.dayNumber}: {day.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                {new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{day.summary}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                {/* Arrival/Departure */}
                {(day.arrival || day.departure) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    {day.arrival && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Plane className="h-4 w-4 text-primary" />
                          <span className="font-medium text-gray-900">Arrival at {day.title.split(' ')[0]}</span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          {day.arrival.flight} - Flight arriving on {day.arrival.date} at {day.arrival.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          {day.arrival.description}
                        </div>
                      </div>
                    )}
                    {day.departure && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Plane className="h-4 w-4 text-primary" />
                          <span className="font-medium text-gray-900">Departure from {day.title.split(' ')[0]}</span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          {day.departure.flight} - Flight departing on {day.departure.date} at {day.departure.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          {day.departure.description}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline - Hide when split stay is enabled */}
                {!hideTimeline && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Timeline</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddActivity}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Activity
                      </Button>
                      {onAddTransfer && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onAddTransfer}
                          className="text-xs"
                        >
                          <Car className="h-3 w-3 mr-1" />
                          Add Transfer
                        </Button>
                      )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {['morning', 'afternoon', 'evening'].map((timeSlot) => {
                      // Also get activities for this day and slot to display in timeline
                      const dayActivities = day.activities.filter(activity => activity.type === timeSlot)
                      
                      // Filter blocked slots by day ID if available, otherwise filter by slot type
                      // Exclude slots that match IDs of activities already being displayed to avoid duplication
                      const slotBlockedSlots = blockedTimeSlots.filter(slot => {
                        const slotMatches = slot.slot === timeSlot
                        const dayMatches = !slot.dayId || slot.dayId === day.id
                        const isAlreadyDisplayed = dayActivities.some(activity => activity.id === slot.id)
                        return slotMatches && dayMatches && !isAlreadyDisplayed
                      })
                      
                      const isBlocked = slotBlockedSlots.length > 0 || dayActivities.length > 0
                      
                      return (
                        <div key={timeSlot} className="text-center">
                          <div className={`px-3 py-2 rounded-lg text-xs font-medium mb-2 ${getTimeSlotColor(timeSlot)}`}>
                            {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}
                            {slotBlockedSlots.length > 0 && (
                              <span className="ml-2 text-red-600">({slotBlockedSlots.length} blocked)</span>
                            )}
                          </div>
                          
                          {/* Timeline visualization within each slot */}
                          {(isBlocked || dayActivities.length > 0) && (
                            <div className="mb-2">
                              <div className="relative bg-gray-100 rounded-lg h-6 overflow-hidden">
                                {/* Time markers */}
                                <div className="absolute inset-0 flex">
                                  {Array.from({ length: 3 }, (_, i) => {
                                    const hour = timeSlot === 'morning' ? 6 + i * 2 : 
                                                timeSlot === 'afternoon' ? 12 + i * 2 : 18 + i * 2
                                    const position = (i / 2) * 100
                                    return (
                                      <div 
                                        key={i}
                                        className="absolute top-0 h-full border-l border-gray-300"
                                        style={{ left: `${position}%` }}
                                      >
                                        <div className="absolute -top-4 left-0 transform -translate-x-1/2 text-xs text-gray-500">
                                          {hour}:00
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* Blocked time slots and activities */}
                                {slotBlockedSlots.map((slot, index) => {
                                  const startHour = parseInt(slot.startTime.split(':')[0])
                                  const startMinute = parseInt(slot.startTime.split(':')[1] || '0')
                                  const endHour = parseInt(slot.endTime.split(':')[0])
                                  const endMinute = parseInt(slot.endTime.split(':')[1] || '0')
                                  const slotStart = timeSlot === 'morning' ? 6 : timeSlot === 'afternoon' ? 12 : 18
                                  const slotEnd = timeSlot === 'morning' ? 12 : timeSlot === 'afternoon' ? 18 : 24
                                  
                                  const startPosition = (((startHour + startMinute / 60) - slotStart) / (slotEnd - slotStart)) * 100
                                  const width = (((endHour + endMinute / 60) - (startHour + startMinute / 60)) / (slotEnd - slotStart)) * 100
                                  
                                  return (
                                    <div
                                      key={slot.id}
                                      className="absolute top-0 h-full bg-red-500 border border-red-600 rounded-sm flex items-center justify-center"
                                      style={{
                                        left: `${Math.max(0, startPosition)}%`,
                                        width: `${Math.min(100 - startPosition, width)}%`,
                                        zIndex: 10
                                      }}
                                    >
                                      <div className="text-white text-xs font-medium px-1 truncate">
                                        {slot.title}
                                      </div>
                                    </div>
                                  )
                                })}
                                
                                {/* Display activities in timeline */}
                                {dayActivities.map((activity) => {
                                  // Parse activity time (format: "HH:MM" or "TBD")
                                  let startHour = 9
                                  let startMinute = 0
                                  let endHour = 10
                                  let endMinute = 0
                                  
                                  if (activity.time && activity.time !== 'TBD') {
                                    const timeMatch = activity.time.match(/(\d{1,2}):(\d{2})/)
                                    if (timeMatch) {
                                      startHour = parseInt(timeMatch[1])
                                      startMinute = parseInt(timeMatch[2])
                                      // Calculate end time from duration
                                      const durationMatch = activity.duration.match(/(\d+)/)
                                      if (durationMatch) {
                                        const durationMinutes = parseInt(durationMatch[1])
                                        const totalMinutes = startHour * 60 + startMinute + durationMinutes
                                        endHour = Math.floor(totalMinutes / 60)
                                        endMinute = totalMinutes % 60
                                      }
                                    }
                                  }
                                  
                                  const slotStart = timeSlot === 'morning' ? 6 : timeSlot === 'afternoon' ? 12 : 18
                                  const slotEnd = timeSlot === 'morning' ? 12 : timeSlot === 'afternoon' ? 18 : 24
                                  
                                  // Only show if activity time falls within this slot
                                  if (startHour < slotStart || startHour >= slotEnd) {
                                    return null
                                  }
                                  
                                  const startPosition = (((startHour + startMinute / 60) - slotStart) / (slotEnd - slotStart)) * 100
                                  const width = (((endHour + endMinute / 60) - (startHour + startMinute / 60)) / (slotEnd - slotStart)) * 100
                                  
                                  return (
                                    <div
                                      key={activity.id}
                                      className="absolute top-0 h-full bg-blue-500 border border-blue-600 rounded-sm flex items-center justify-center"
                                      style={{
                                        left: `${Math.max(0, startPosition)}%`,
                                        width: `${Math.min(100 - startPosition, width)}%`,
                                        zIndex: 5
                                      }}
                                    >
                                      <div className="text-white text-xs font-medium px-1 truncate">
                                        {activity.title}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              
                              {/* Blocked slots and activities details */}
                              <div className="mt-1 space-y-1">
                                {slotBlockedSlots.map((slot) => (
                                  <div key={slot.id} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                    {slot.title} ({slot.startTime} - {slot.endTime})
                                  </div>
                                ))}
                                {dayActivities.map((activity) => (
                                  <div key={activity.id} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {activity.title} ({activity.time} • {activity.duration})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddActivity}
                            className={`w-full text-xs h-8 ${isBlocked ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}`}
                            disabled={isBlocked}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {isBlocked ? 'Slot Blocked' : 'Add Activity'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
                )}

                {/* Activities */}
                {day.activities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Activities</h4>
                    <div className="space-y-2">
                      {day.activities.map((activity, index) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {activity.title}
                              </div>
                              <div className="text-xs text-gray-600">
                                {activity.time} • {activity.duration}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {activity.price > 0 && (
                              <span className="text-sm font-medium text-primary">
                                ₹{activity.price}
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onEditActivity?.(activity, dayIndex)}
                              title="Edit activity"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                
                                // Add confirmation dialog
                                if (window.confirm(`Are you sure you want to remove "${activity.title}"?`)) {
                                  onRemoveActivity?.(activity.id, dayIndex)
                                }
                              }}
                              title="Remove activity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transfers */}
                {day.transfers && day.transfers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Transfers</h4>
                    <div className="space-y-2">
                      {day.transfers.map((transfer: any, index: number) => (
                        <div key={transfer.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Car className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {transfer.transferProduct?.name || transfer.name || 'Transfer'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {transfer.pickupTime ? new Date(`2000-01-01T${transfer.pickupTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'} • {transfer.pickupLocation || 'Pickup'} → {transfer.dropoffLocation || 'Dropoff'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {transfer.priceTotalCents && transfer.priceTotalCents > 0 && (
                              <span className="text-sm font-medium text-primary">
                                {formatCurrency(
                                  transfer.priceTotalCents,
                                  transfer.currency?.code || transfer.currencyCode || 'INR'
                                )}
                              </span>
                            )}
                            {onEditTransfer && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => onEditTransfer(transfer, dayIndex)}
                                title="Edit transfer"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            {onRemoveTransfer && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (window.confirm(`Are you sure you want to remove this transfer?`)) {
                                    onRemoveTransfer(transfer.id, dayIndex)
                                  }
                                }}
                                title="Remove transfer"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stay Details */}
                {day.accommodation && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Accommodation Details</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Hotel & Room</div>
                          <div className="font-medium text-gray-900">{day.accommodation}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Nights</div>
                            <div className="font-medium text-gray-900">{day.summary?.match(/(\d+) nights/)?.[1] || '1'} night{(day.summary?.match(/(\d+) nights/)?.[1] || '1') !== '1' ? 's' : ''}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Rooms</div>
                            <div className="font-medium text-gray-900">{day.accommodation?.match(/(\d+) room/)?.[1] || '1'} room{(day.accommodation?.match(/(\d+) room/)?.[1] || '1') !== '1' ? 's' : ''}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transfers */}
                {day.transfers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Transfers</h4>
                    <div className="space-y-2">
                      {day.transfers.map((transfer, index) => {
                        const summary =
                          typeof transfer === 'string'
                            ? transfer
                            : [
                                transfer.transferProduct?.name || 'Transfer',
                                transfer.pickupTime ? `Pickup at ${formatTime(transfer.pickupTime)}` : null,
                                transfer.pickupLocation || transfer.dropoffLocation
                                  ? `${transfer.pickupLocation || 'Pickup'} → ${transfer.dropoffLocation || 'Dropoff'}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(' • ')

                        return (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700">{summary}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Meals */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Meals</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(day.meals).map(([meal, included]) => (
                      <div key={meal} className="flex items-center space-x-2">
                        {included ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-700 capitalize">
                          {meal}: {included ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEdit}
                      className="text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Change Day
                    </Button>
                    {day.arrival && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="text-xs"
                      >
                        Change Arrival
                      </Button>
                    )}
                    {day.departure && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="text-xs"
                      >
                        Change Departure
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove Day
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
