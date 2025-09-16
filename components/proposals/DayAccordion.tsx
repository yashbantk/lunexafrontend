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

interface DayAccordionProps {
  day: Day
  onEdit: () => void
  onRemove: () => void
  onAddActivity: () => void
}

export function DayAccordion({ day, onEdit, onRemove, onAddActivity }: DayAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(day.dayNumber <= 2) // Open first 2 days by default

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
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

                {/* Timeline */}
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
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {['morning', 'afternoon', 'evening'].map((timeSlot) => (
                      <div key={timeSlot} className="text-center">
                        <div className={`px-3 py-2 rounded-lg text-xs font-medium mb-2 ${getTimeSlotColor(timeSlot)}`}>
                          {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onAddActivity}
                          className="w-full text-xs h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Activity
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

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
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
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
                {day.transfers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Transfers</h4>
                    <div className="space-y-2">
                      {day.transfers.map((transfer, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{transfer}</span>
                        </div>
                      ))}
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
