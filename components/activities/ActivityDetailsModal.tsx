'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Star, MapPin, Users, CheckCircle, AlertCircle, Info } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ActivityDetailsModalProps, ActivitySelection, ScheduleSlot, PickupOption } from '@/types/activity'
import { useActivityDetails } from '@/hooks/useActivityDetails'
import ExtrasList from './ExtrasList'

export default function ActivityDetailsModal({
  isOpen,
  onClose,
  activityId,
  onAddToPackage,
  dayId,
  checkIn,
  checkOut,
  adults,
  childrenCount
}: ActivityDetailsModalProps) {
  const { activity, loading, error, calculatePrice, validateSelection } = useActivityDetails({
    activityId,
    checkIn,
    checkOut,
    adults,
    childrenCount
  })

  const [selection, setSelection] = useState<Partial<ActivitySelection>>({
    adults,
    childrenCount,
    extras: [],
    notes: ''
  })

  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (activity) {
      setSelection(prev => ({
        ...prev,
        activity,
        scheduleSlot: activity.availability.find(slot => slot.available) || activity.availability[0],
        pickupOption: activity.pickupOptions[0]
      }))
    }
  }, [activity])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const handleScheduleSlotChange = (slotId: string) => {
    if (!activity) return
    const slot = activity.availability.find(s => s.id === slotId)
    if (slot) {
      setSelection(prev => ({ ...prev, scheduleSlot: slot }))
    }
  }

  const handlePickupOptionChange = (optionId: string) => {
    if (!activity) return
    const option = activity.pickupOptions.find(o => o.id === optionId)
    if (option) {
      setSelection(prev => ({ ...prev, pickupOption: option }))
    }
  }

  const handleExtrasChange = (extras: any[]) => {
    setSelection(prev => ({ ...prev, extras }))
  }

  const handleAdultsChange = (value: string) => {
    const newAdults = parseInt(value) || 0
    setSelection(prev => ({ ...prev, adults: newAdults }))
  }

  const handleChildrenChange = (value: string) => {
    const newChildren = parseInt(value) || 0
    setSelection(prev => ({ ...prev, children: newChildren }))
  }

  const handleNotesChange = (value: string) => {
    setSelection(prev => ({ ...prev, notes: value }))
  }

  const handleAddToPackage = async () => {
    if (!activity || !selection.scheduleSlot || !selection.pickupOption) return

    const fullSelection: ActivitySelection = {
      activity,
      scheduleSlot: selection.scheduleSlot,
      adults: selection.adults || 0,
      childrenCount: selection.childrenCount || 0,
      extras: selection.extras || [],
      pickupOption: selection.pickupOption,
      notes: selection.notes || '',
      totalPrice: calculatePrice(selection)
    }

    const validationErrors = validateSelection(fullSelection)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onAddToPackage(activity, fullSelection)
      onClose()
    } catch (err) {
      setErrors(['Failed to add activity to package. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = activity ? calculatePrice(selection) : 0
  const basePrice = activity ? (activity.pricingType === 'person' ? activity.basePrice * ((selection.adults || 0) + (selection.childrenCount || 0)) : activity.basePrice) : 0
  const extrasPrice = selection.extras?.reduce((total, extra) => {
    return total + (extra.priceType === 'per_person' ? extra.price * ((selection.adults || 0) + (selection.childrenCount || 0)) : extra.price)
  }, 0) || 0
  const pickupPrice = selection.pickupOption?.price || 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full h-[95vh] max-w-[95vw] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Activity Details
                </h2>
                <p className="text-sm text-gray-600">
                  {activity?.title || 'Loading...'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading activity details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : activity ? (
              <div className="p-6 space-y-6">
                {/* Activity Header */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    <div className="relative h-64 rounded-lg overflow-hidden">
                      <Image
                        src={activity.images[0]}
                        alt={activity.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {activity.images.slice(1, 4).map((image, index) => (
                        <div key={index} className="relative h-16 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${activity.title} ${index + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Info */}
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {activity.title}
                      </h1>
                      <p className="text-gray-600 mb-4">
                        {activity.longDesc}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{activity.rating}</span>
                        <span className="text-gray-500 ml-1">({activity.reviewsCount} reviews)</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {activity.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{formatDuration(activity.durationMins)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{activity.minPax}-{activity.maxPax} people</span>
                      </div>
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{activity.provider}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activity.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Book This Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Schedule Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Select Time Slot</Label>
                      <RadioGroup
                        value={selection.scheduleSlot?.id}
                        onValueChange={handleScheduleSlotChange}
                      >
                        {activity.availability.map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={slot.id} id={slot.id} />
                            <Label htmlFor={slot.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{slot.startTime}</span>
                                  <span className="text-gray-500 ml-2">
                                    ({formatDuration(slot.durationMins)})
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {slot.maxPax - slot.currentBookings} spots left
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Participants */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adults">Adults</Label>
                        <Input
                          id="adults"
                          type="number"
                          min={0}
                          value={selection.adults || 0}
                          onChange={(e) => handleAdultsChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="children">Children</Label>
                        <Input
                          id="children"
                          type="number"
                          min={0}
                          value={selection.childrenCount || 0}
                          onChange={(e) => handleChildrenChange(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Pickup Options */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Pickup Option</Label>
                      <RadioGroup
                        value={selection.pickupOption?.id}
                        onValueChange={handlePickupOptionChange}
                      >
                        {activity.pickupOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{option.label}</span>
                                  <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                                <div className="text-sm font-medium text-brand">
                                  {formatPrice(option.price)}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Extras */}
                    <ExtrasList
                      extras={activity.extras}
                      selectedExtras={selection.extras || []}
                      onExtrasChange={handleExtrasChange}
                      adults={selection.adults || 0}
                      childrenCount={selection.childrenCount || 0}
                    />

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Special Requests or Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requests or notes for this activity..."
                        value={selection.notes || ''}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Errors */}
                    {errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="font-medium text-red-800">Please fix the following errors:</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {activity && (
            <div className="border-t bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Price</div>
                  <div className="text-2xl font-bold text-brand">
                    {formatPrice(totalPrice)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Base: {formatPrice(basePrice)} + Extras: {formatPrice(extrasPrice)} + Pickup: {formatPrice(pickupPrice)}
                  </div>
                </div>
                <Button
                  onClick={handleAddToPackage}
                  disabled={isSubmitting || !selection.scheduleSlot}
                  className="bg-brand hover:bg-brand/90 text-white px-8 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Add To Package
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
