'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Car, MapPin, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TransferDetailsModalProps, TransferSelection } from '@/types/transfer'
import { useTransferDetails } from '@/hooks/useTransferDetails'
import { formatPrice, formatTime } from '@/lib/utils/formatUtils'

export default function TransferDetailsModal({
  isOpen,
  onClose,
  transferProductId,
  onAddToPackage,
  dayId,
  adults,
  childrenCount,
  isEditMode = false,
  currentBookingId,
  currentSelection
}: TransferDetailsModalProps) {
  const { transferProduct, loading, error, calculatePrice, validateSelection } = useTransferDetails({
    transferProductId,
    adults,
    childrenCount
  })

  const [selection, setSelection] = useState<Partial<TransferSelection>>({
    paxAdults: adults,
    paxChildren: childrenCount,
    vehiclesCount: 1,
    pickupTime: '09:00:00',
    pickupLocation: '',
    dropoffLocation: '',
    confirmationStatus: 'pending'
  })

  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (transferProduct) {
      if (isEditMode && currentSelection) {
        // Pre-populate with current selection data
        setSelection(prev => ({
          ...prev,
          transferProduct,
          pickupTime: currentSelection.pickupTime || '09:00:00',
          pickupLocation: currentSelection.pickupLocation || '',
          dropoffLocation: currentSelection.dropoffLocation || '',
          vehiclesCount: currentSelection.vehiclesCount || 1,
          paxAdults: currentSelection.paxAdults || adults,
          paxChildren: currentSelection.paxChildren || childrenCount,
          currency: currentSelection.currency || transferProduct.currency.code,
          confirmationStatus: currentSelection.confirmationStatus || 'pending'
        }))
      } else {
        // Default behavior for new transfers
        const totalPax = adults + childrenCount
        const vehicleCapacity = transferProduct.vehicle.capacityAdults + transferProduct.vehicle.capacityChildren
        const vehiclesNeeded = Math.ceil(totalPax / vehicleCapacity)

        setSelection(prev => ({
          ...prev,
          transferProduct,
          vehiclesCount: vehiclesNeeded,
          currency: transferProduct.currency.code,
          confirmationStatus: 'pending'
        }))
      }
    }
  }, [transferProduct, isEditMode, currentSelection, adults, childrenCount])

  const handlePickupTimeChange = (value: string) => {
    // Convert HH:MM to HH:MM:SS format
    const timeParts = value.split(':')
    const formattedTime = timeParts.length === 2 ? `${value}:00` : value
    setSelection(prev => ({ ...prev, pickupTime: formattedTime }))
  }

  const handleAdultsChange = (value: string) => {
    const newAdults = parseInt(value) || 0
    const totalPax = newAdults + (selection.paxChildren || 0)
    if (transferProduct) {
      const vehicleCapacity = transferProduct.vehicle.capacityAdults + transferProduct.vehicle.capacityChildren
      const vehiclesNeeded = Math.ceil(totalPax / vehicleCapacity)
      setSelection(prev => ({ ...prev, paxAdults: newAdults, vehiclesCount: vehiclesNeeded }))
    } else {
      setSelection(prev => ({ ...prev, paxAdults: newAdults }))
    }
  }

  const handleChildrenChange = (value: string) => {
    const newChildren = parseInt(value) || 0
    const totalPax = (selection.paxAdults || 0) + newChildren
    if (transferProduct) {
      const vehicleCapacity = transferProduct.vehicle.capacityAdults + transferProduct.vehicle.capacityChildren
      const vehiclesNeeded = Math.ceil(totalPax / vehicleCapacity)
      setSelection(prev => ({ ...prev, paxChildren: newChildren, vehiclesCount: vehiclesNeeded }))
    } else {
      setSelection(prev => ({ ...prev, paxChildren: newChildren }))
    }
  }

  const handleVehiclesCountChange = (value: string) => {
    // Allow empty value while typing
    if (value === '') {
      setSelection(prev => ({ ...prev, vehiclesCount: undefined }))
      return
    }
    const newCount = parseInt(value)
    // Only update if it's a valid number and greater than 0
    if (!isNaN(newCount) && newCount > 0) {
      setSelection(prev => ({ ...prev, vehiclesCount: newCount }))
    }
  }

  const handleAddToPackage = async () => {
    if (!transferProduct) return

    const fullSelection: TransferSelection = {
      transferProduct,
      pickupTime: selection.pickupTime || '09:00:00',
      pickupLocation: selection.pickupLocation || '',
      dropoffLocation: selection.dropoffLocation || '',
      vehiclesCount: selection.vehiclesCount || 1,
      paxAdults: selection.paxAdults || 0,
      paxChildren: selection.paxChildren || 0,
      currency: selection.currency || transferProduct.currency.code,
      priceTotalCents: calculatePrice(selection),
      confirmationStatus: selection.confirmationStatus || 'pending',
      totalPrice: calculatePrice(selection)
    }

    const validationErrors = validateSelection(fullSelection)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && currentBookingId) {
        await onAddToPackage(transferProduct, fullSelection, currentBookingId)
      } else {
        await onAddToPackage(transferProduct, fullSelection)
      }
      onClose()
    } catch (err) {
      console.error('Error in handleAddToPackage:', err)
      setErrors(['Failed to add transfer to package. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = transferProduct ? calculatePrice(selection) : 0
  const basePrice = transferProduct ? (transferProduct.priceCents / 100) * (selection.vehiclesCount || 1) : 0

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
                  Transfer Details
                </h2>
                <p className="text-sm text-gray-600">
                  {transferProduct?.name || 'Loading...'}
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
                  <p className="text-gray-600">Loading transfer details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : transferProduct ? (
              <div className="p-6 space-y-6">
                {/* Transfer Header */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vehicle Icon */}
                  <div className="space-y-4">
                    <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <Car className="h-32 w-32 text-blue-400" />
                    </div>
                  </div>

                  {/* Transfer Info */}
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {transferProduct.name}
                      </h1>
                      <p className="text-gray-600 mb-4">
                        {transferProduct.description || 'Transportation service'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge className="bg-blue-100 text-blue-800">
                        {transferProduct.vehicle.type}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {transferProduct.vehicle.name}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{transferProduct.city.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{transferProduct.vehicle.capacityAdults} adults + {transferProduct.vehicle.capacityChildren} children</span>
                      </div>
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{transferProduct.supplier.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Flexible timing</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Book This Transfer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pickup Time */}
                    <div className="space-y-2">
                      <Label htmlFor="pickupTime">Pickup Time</Label>
                      <Input
                        id="pickupTime"
                        type="time"
                        value={selection.pickupTime?.substring(0, 5) || '09:00'}
                        onChange={(e) => handlePickupTimeChange(e.target.value)}
                      />
                    </div>

                    {/* Pickup Location */}
                    <div className="space-y-2">
                      <Label htmlFor="pickupLocation">Pickup Location</Label>
                      <Input
                        id="pickupLocation"
                        placeholder="e.g., Airport, Hotel, Address"
                        value={selection.pickupLocation || ''}
                        onChange={(e) => setSelection(prev => ({ ...prev, pickupLocation: e.target.value }))}
                      />
                    </div>

                    {/* Dropoff Location */}
                    <div className="space-y-2">
                      <Label htmlFor="dropoffLocation">Dropoff Location</Label>
                      <Input
                        id="dropoffLocation"
                        placeholder="e.g., Hotel, Address"
                        value={selection.dropoffLocation || ''}
                        onChange={(e) => setSelection(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                      />
                    </div>

                    {/* Participants */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adults">Adults</Label>
                        <Input
                          id="adults"
                          type="number"
                          min={1}
                          value={selection.paxAdults || 0}
                          onChange={(e) => handleAdultsChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="children">Children</Label>
                        <Input
                          id="children"
                          type="number"
                          min={0}
                          value={selection.paxChildren || 0}
                          onChange={(e) => handleChildrenChange(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Vehicles Count */}
                    <div className="space-y-2">
                      <Label htmlFor="vehiclesCount">Number of Vehicles</Label>
                      <Input
                        id="vehiclesCount"
                        type="number"
                        min={1}
                        value={selection.vehiclesCount ?? ''}
                        onChange={(e) => handleVehiclesCountChange(e.target.value)}
                        onBlur={(e) => {
                          // If empty on blur, set to 1
                          if (e.target.value === '' || parseInt(e.target.value) < 1) {
                            setSelection(prev => ({ ...prev, vehiclesCount: 1 }))
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Vehicle capacity: {transferProduct.vehicle.capacityAdults} adults + {transferProduct.vehicle.capacityChildren} children
                      </p>
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
          {transferProduct && (
            <div className="border-t bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Price</div>
                  <div className="text-2xl font-bold text-brand">
                    {formatPrice(totalPrice * 100, transferProduct.currency.code)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selection.vehiclesCount || 1} vehicle{(selection.vehiclesCount || 1) > 1 ? 's' : ''} × {formatPrice(transferProduct.priceCents, transferProduct.currency.code)}
                  </div>
                </div>
                <Button
                  onClick={handleAddToPackage}
                  disabled={isSubmitting || !selection.pickupLocation || !selection.dropoffLocation}
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

