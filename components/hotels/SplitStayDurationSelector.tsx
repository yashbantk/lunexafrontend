'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  X
} from 'lucide-react'

interface SplitStayDurationSelectorProps {
  totalNights: number
  totalDays: number
  onDurationChange: (durations: number[]) => void
  initialDurations?: number[]
  className?: string
}

const PRESET_COMBINATIONS = [
  { label: '2+2', value: [2, 2], description: 'Equal split' },
  { label: '1+3', value: [1, 3], description: 'Short + Long' },
  { label: '3+1', value: [3, 1], description: 'Long + Short' },
  { label: '1+2+1', value: [1, 2, 1], description: 'Three segments' },
  { label: '2+1+1', value: [2, 1, 1], description: 'Three segments' },
  { label: '1+1+2', value: [1, 1, 2], description: 'Three segments' },
]

export function SplitStayDurationSelector({
  totalNights,
  totalDays,
  onDurationChange,
  initialDurations = [],
  className = ''
}: SplitStayDurationSelectorProps) {
  const [durations, setDurations] = useState<number[]>(initialDurations.length > 0 ? initialDurations : [totalNights])
  const [customMode, setCustomMode] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Initialize with default single segment if no initial durations
  useEffect(() => {
    if (initialDurations.length === 0) {
      setDurations([totalNights])
    }
  }, [totalNights, initialDurations])

  const validateDurations = (newDurations: number[]): string[] => {
    const errors: string[] = []
    const sum = newDurations.reduce((acc, duration) => acc + duration, 0)
    
    if (sum !== totalNights) {
      errors.push(`Total must equal ${totalNights} nights`)
    }
    
    if (newDurations.some(duration => duration < 1)) {
      errors.push('Each segment must be at least 1 night')
    }
    
    if (newDurations.length > 4) {
      errors.push('Maximum 4 segments allowed')
    }
    
    if (newDurations.length < 2) {
      errors.push('Split stay requires at least 2 segments')
    }
    
    return errors
  }

  const handleDurationChange = (index: number, value: number) => {
    const newDurations = [...durations]
    newDurations[index] = Math.max(1, Math.min(value, totalNights))
    setDurations(newDurations)
    
    const validationErrors = validateDurations(newDurations)
    setErrors(validationErrors)
    
    if (validationErrors.length === 0) {
      onDurationChange(newDurations)
    }
  }

  const addSegment = () => {
    if (durations.length < 4) {
      const newDurations = [...durations, 1]
      setDurations(newDurations)
      setErrors(validateDurations(newDurations))
    }
  }

  const removeSegment = (index: number) => {
    if (durations.length > 2) {
      const newDurations = durations.filter((_, i) => i !== index)
      setDurations(newDurations)
      setErrors(validateDurations(newDurations))
    }
  }

  const applyPreset = (preset: number[]) => {
    setDurations(preset)
    setErrors([])
    onDurationChange(preset)
    setCustomMode(false)
  }

  const getRemainingNights = () => {
    const used = durations.reduce((acc, duration) => acc + duration, 0)
    return totalNights - used
  }

  const getSegmentDates = (segmentIndex: number) => {
    const startNight = durations.slice(0, segmentIndex).reduce((acc, duration) => acc + duration, 0)
    const endNight = startNight + durations[segmentIndex]
    return {
      start: startNight + 1,
      end: endNight
    }
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Duration Split</h3>
              <p className="text-sm text-gray-600">
                Divide your {totalNights} nights across {durations.length} hotel segment{durations.length > 1 ? 's' : ''}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {getRemainingNights() === 0 ? 'Complete' : `${getRemainingNights()} nights remaining`}
            </Badge>
          </div>

          {/* Preset Combinations */}
          {!customMode && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Quick Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRESET_COMBINATIONS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    onClick={() => applyPreset(preset.value)}
                    className="flex flex-col items-center p-4 h-auto hover:bg-primary/5 hover:border-primary"
                  >
                    <span className="font-semibold text-lg">{preset.label}</span>
                    <span className="text-xs text-gray-600">{preset.description}</span>
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={() => setCustomMode(true)}
                className="w-full text-sm"
              >
                Custom Split
              </Button>
            </div>
          )}

          {/* Custom Duration Input */}
          {customMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Custom Duration Split</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomMode(false)}
                  className="text-sm"
                >
                  Use Presets
                </Button>
              </div>

              <div className="space-y-3">
                {durations.map((duration, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        Segment {index + 1}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {getSegmentDates(index).start}-{getSegmentDates(index).end}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDurationChange(index, duration - 1)}
                        disabled={duration <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => handleDurationChange(index, parseInt(e.target.value) || 1)}
                          min="1"
                          max={totalNights}
                          className="w-16 text-center"
                        />
                        <span className="text-sm text-gray-600">
                          {duration === 1 ? 'night' : 'nights'}
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDurationChange(index, duration + 1)}
                        disabled={duration >= totalNights || getRemainingNights() <= 0}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {durations.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSegment(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={addSegment}
                  disabled={durations.length >= 4}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Segment
                </Button>
                
                <div className="text-sm text-gray-600">
                  {getRemainingNights() === 0 ? (
                    <span className="text-green-600 font-medium">✓ All nights allocated</span>
                  ) : (
                    <span className="text-amber-600">
                      {getRemainingNights()} nights remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          {errors.length === 0 && durations.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Perfect! Your {totalNights} nights are split across {durations.length} segments
              </span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
