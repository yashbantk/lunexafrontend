'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Info,
  Calendar,
  Hotel,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Hotel as HotelType } from '@/types/hotel'

interface SplitStaySegment {
  id: string
  duration: number
  startDate: string
  endDate: string
  hotel?: HotelType
  segmentIndex: number
}

interface ValidationError {
  type: 'duration' | 'hotel' | 'date' | 'availability' | 'general'
  severity: 'error' | 'warning' | 'info'
  message: string
  segmentIndex?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface SplitStayValidationProps {
  segments: SplitStaySegment[]
  totalNights: number
  startDate: string
  endDate: string
  onFixError: (errorType: string, segmentIndex?: number) => void
  className?: string
}

export function SplitStayValidation({
  segments,
  totalNights,
  startDate,
  endDate,
  onFixError,
  className = ''
}: SplitStayValidationProps) {
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set())

  // Validation logic
  useEffect(() => {
    const validationErrors: ValidationError[] = []
    
    // Check total duration
    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0)
    if (totalDuration !== totalNights) {
      validationErrors.push({
        type: 'duration',
        severity: 'error',
        message: `Total duration (${totalDuration} nights) doesn't match trip duration (${totalNights} nights)`,
        action: {
          label: 'Auto-fix',
          onClick: () => onFixError('duration')
        }
      })
    }

    // Check for missing hotels
    segments.forEach((segment, index) => {
      if (!segment.hotel) {
        validationErrors.push({
          type: 'hotel',
          severity: 'error',
          message: `No hotel selected for segment ${index + 1} (${segment.duration} nights)`,
          segmentIndex: index,
          action: {
            label: 'Select Hotel',
            onClick: () => onFixError('hotel', index)
          }
        })
      }
    })

    // Check for date overlaps
    for (let i = 0; i < segments.length - 1; i++) {
      const currentEnd = new Date(segments[i].endDate)
      const nextStart = new Date(segments[i + 1].startDate)
      
      if (currentEnd > nextStart) {
        validationErrors.push({
          type: 'date',
          severity: 'error',
          message: `Date overlap between segment ${i + 1} and ${i + 2}`,
          action: {
            label: 'Fix Dates',
            onClick: () => onFixError('date', i)
          }
        })
      }
    }

    // Check for minimum segment duration
    segments.forEach((segment, index) => {
      if (segment.duration < 1) {
        validationErrors.push({
          type: 'duration',
          severity: 'error',
          message: `Segment ${index + 1} must be at least 1 night`,
          segmentIndex: index,
          action: {
            label: 'Fix Duration',
            onClick: () => onFixError('duration', index)
          }
        })
      }
    })

    // Check for maximum segments
    if (segments.length > 4) {
      validationErrors.push({
        type: 'general',
        severity: 'error',
        message: 'Maximum 4 segments allowed for split stay',
        action: {
          label: 'Reduce Segments',
          onClick: () => onFixError('segments')
        }
      })
    }

    // Check for minimum segments
    if (segments.length < 2) {
      validationErrors.push({
        type: 'general',
        severity: 'warning',
        message: 'Split stay requires at least 2 segments',
        action: {
          label: 'Add Segment',
          onClick: () => onFixError('add_segment')
        }
      })
    }

    // Check for hotel availability (mock check)
    segments.forEach((segment, index) => {
      if (segment.hotel) {
        // Mock availability check - in real app, this would be an API call
        const isAvailable = Math.random() > 0.1 // 90% availability for demo
        if (!isAvailable) {
          validationErrors.push({
            type: 'availability',
            severity: 'warning',
            message: `${segment.hotel.name} may not be available for the selected dates`,
            segmentIndex: index,
            action: {
              label: 'Check Availability',
              onClick: () => onFixError('availability', index)
            }
          })
        }
      }
    })

    setErrors(validationErrors)
  }, [segments, totalNights, startDate, endDate, onFixError])

  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getErrorColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-amber-200 bg-amber-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getErrorTextColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-amber-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  const dismissError = (errorIndex: number) => {
    const errorKey = `${errors[errorIndex].type}-${errors[errorIndex].segmentIndex || 'global'}`
    setDismissedErrors(prev => {
      const newSet = new Set(prev)
      newSet.add(errorKey)
      return newSet
    })
  }

  const filteredErrors = errors.filter((_, index) => {
    const errorKey = `${errors[index].type}-${errors[index].segmentIndex || 'global'}`
    return !dismissedErrors.has(errorKey)
  })

  const errorCount = filteredErrors.filter(e => e.severity === 'error').length
  const warningCount = filteredErrors.filter(e => e.severity === 'warning').length

  if (filteredErrors.length === 0) {
    return (
      <Card className={`border-green-200 bg-green-50/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">All Validations Passed</h3>
              <p className="text-sm text-green-700">
                Your split stay configuration is ready to book
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Summary */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">Validation Issues</h3>
                <p className="text-sm text-amber-700">
                  {errorCount} error{errorCount !== 1 ? 's' : ''}, {warningCount} warning{warningCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              {filteredErrors.length} issue{filteredErrors.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.map((error, index) => (
          <motion.div
            key={`${error.type}-${error.segmentIndex || 'global'}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`border rounded-lg p-4 ${getErrorColor(error.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getErrorIcon(error.severity)}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${getErrorTextColor(error.severity)}`}>
                    {error.message}
                  </p>
                  {error.segmentIndex !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                      Segment {error.segmentIndex + 1}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {error.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={error.action.onClick}
                    className="text-xs"
                  >
                    {error.action.label}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissError(index)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      {filteredErrors.length > 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Fix all issues to complete your split stay booking
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Auto-fix all fixable errors
                  filteredErrors.forEach(error => {
                    if (error.action) {
                      error.action.onClick()
                    }
                  })
                }}
                className="text-xs"
              >
                Auto-fix All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
