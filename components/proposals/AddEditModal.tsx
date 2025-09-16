"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Plane, Home, Clock, MapPin, Star } from "lucide-react"
import { ModalProps, Flight, Hotel, Activity, Day } from "@/types/proposal"

export function AddEditModal({ isOpen, onClose, type, item, onSave, proposal }: ModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      // Initialize with default values based on type
      switch (type) {
        case 'flight':
          setFormData({
            type: 'outbound',
            airline: '',
            flightNumber: '',
            from: '',
            to: '',
            departureTime: '',
            arrivalTime: '',
            departureDate: '',
            arrivalDate: '',
            duration: '',
            class: 'Economy',
            stops: 0,
            refundable: false,
            price: 0,
            currency: 'INR'
          })
          break
        case 'hotel':
          setFormData({
            name: '',
            address: '',
            rating: 0,
            starRating: 5,
            image: '',
            checkIn: '',
            checkOut: '',
            roomType: '',
            boardBasis: 'Room Only',
            bedType: '',
            nights: 1,
            refundable: true,
            pricePerNight: 0,
            currency: 'INR'
          })
          break
        case 'activity':
          setFormData({
            title: '',
            description: '',
            time: '',
            duration: '',
            price: 0,
            currency: 'INR',
            type: 'morning',
            included: false
          })
          break
        case 'day':
          setFormData({
            dayNumber: proposal?.days?.length ? proposal.days.length + 1 : 1,
            date: '',
            title: '',
            summary: '',
            activities: [],
            transfers: [],
            meals: {
              breakfast: false,
              lunch: false,
              dinner: false
            }
          })
          break
      }
    }
  }, [type, item, proposal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const renderFlightForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleFieldChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="return">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="airline">Airline</Label>
          <Input
            id="airline"
            value={formData.airline}
            onChange={(e) => handleFieldChange('airline', e.target.value)}
            placeholder="e.g., Air India"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flightNumber">Flight Number</Label>
          <Input
            id="flightNumber"
            value={formData.flightNumber}
            onChange={(e) => handleFieldChange('flightNumber', e.target.value)}
            placeholder="e.g., AI-2146"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select
            value={formData.class}
            onValueChange={(value) => handleFieldChange('class', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Economy">Economy</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="First">First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            value={formData.from}
            onChange={(e) => handleFieldChange('from', e.target.value)}
            placeholder="e.g., Delhi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            value={formData.to}
            onChange={(e) => handleFieldChange('to', e.target.value)}
            placeholder="e.g., Bali"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureTime">Departure Time</Label>
          <Input
            id="departureTime"
            type="time"
            value={formData.departureTime}
            onChange={(e) => handleFieldChange('departureTime', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalTime">Arrival Time</Label>
          <Input
            id="arrivalTime"
            type="time"
            value={formData.arrivalTime}
            onChange={(e) => handleFieldChange('arrivalTime', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Departure Date</Label>
          <Input
            id="departureDate"
            type="date"
            value={formData.departureDate}
            onChange={(e) => handleFieldChange('departureDate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalDate">Arrival Date</Label>
          <Input
            id="arrivalDate"
            type="date"
            value={formData.arrivalDate}
            onChange={(e) => handleFieldChange('arrivalDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
            placeholder="e.g., 8h 5m"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stops">Stops</Label>
          <Select
            value={formData.stops.toString()}
            onValueChange={(value) => handleFieldChange('stops', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Non-Stop</SelectItem>
              <SelectItem value="1">1 Stop</SelectItem>
              <SelectItem value="2">2 Stops</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="refundable"
          checked={formData.refundable}
          onCheckedChange={(checked) => handleFieldChange('refundable', checked)}
        />
        <Label htmlFor="refundable">Refundable</Label>
      </div>
    </div>
  )

  const renderHotelForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Hotel Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="e.g., The Kuta Beach Heritage Hotel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleFieldChange('address', e.target.value)}
          placeholder="e.g., Jl. Pantai Kuta, Br. Pande Mas"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="starRating">Star Rating</Label>
          <Select
            value={formData.starRating.toString()}
            onValueChange={(value) => handleFieldChange('starRating', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Star</SelectItem>
              <SelectItem value="4">4 Star</SelectItem>
              <SelectItem value="5">5 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            value={formData.rating}
            onChange={(e) => handleFieldChange('rating', parseFloat(e.target.value))}
            placeholder="e.g., 8.4"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="datetime-local"
            value={formData.checkIn}
            onChange={(e) => handleFieldChange('checkIn', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="datetime-local"
            value={formData.checkOut}
            onChange={(e) => handleFieldChange('checkOut', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roomType">Room Type</Label>
          <Input
            id="roomType"
            value={formData.roomType}
            onChange={(e) => handleFieldChange('roomType', e.target.value)}
            placeholder="e.g., Classic Heritage Room"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="boardBasis">Board Basis</Label>
          <Select
            value={formData.boardBasis}
            onValueChange={(value) => handleFieldChange('boardBasis', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Room Only">Room Only</SelectItem>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Half Board">Half Board</SelectItem>
              <SelectItem value="Full Board">Full Board</SelectItem>
              <SelectItem value="All Inclusive">All Inclusive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedType">Bed Type</Label>
          <Input
            id="bedType"
            value={formData.bedType}
            onChange={(e) => handleFieldChange('bedType', e.target.value)}
            placeholder="e.g., 1 King"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerNight">Price per Night</Label>
          <Input
            id="pricePerNight"
            type="number"
            value={formData.pricePerNight}
            onChange={(e) => handleFieldChange('pricePerNight', parseFloat(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="refundable"
          checked={formData.refundable}
          onCheckedChange={(checked) => handleFieldChange('refundable', checked)}
        />
        <Label htmlFor="refundable">Refundable</Label>
      </div>
    </div>
  )

  const renderActivityForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Activity Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="e.g., City Tour"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe the activity..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => handleFieldChange('time', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
            placeholder="e.g., 2 hours"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Time Slot</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleFieldChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="included"
          checked={formData.included}
          onCheckedChange={(checked) => handleFieldChange('included', checked)}
        />
        <Label htmlFor="included">Included in package</Label>
      </div>
    </div>
  )

  const renderDayForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dayNumber">Day Number</Label>
          <Input
            id="dayNumber"
            type="number"
            value={formData.dayNumber}
            onChange={(e) => handleFieldChange('dayNumber', parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Day Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="e.g., Arrival in Bali"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Input
          id="summary"
          value={formData.summary}
          onChange={(e) => handleFieldChange('summary', e.target.value)}
          placeholder="e.g., Arrive in Bali and transfer to hotel"
        />
      </div>

      <div className="space-y-2">
        <Label>Meals Included</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="breakfast"
              checked={formData.meals?.breakfast || false}
              onCheckedChange={(checked) => handleFieldChange('meals', { ...formData.meals, breakfast: checked })}
            />
            <Label htmlFor="breakfast">Breakfast</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lunch"
              checked={formData.meals?.lunch || false}
              onCheckedChange={(checked) => handleFieldChange('meals', { ...formData.meals, lunch: checked })}
            />
            <Label htmlFor="lunch">Lunch</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dinner"
              checked={formData.meals?.dinner || false}
              onCheckedChange={(checked) => handleFieldChange('meals', { ...formData.meals, dinner: checked })}
            />
            <Label htmlFor="dinner">Dinner</Label>
          </div>
        </div>
      </div>
    </div>
  )

  const getModalTitle = () => {
    const action = item ? 'Edit' : 'Add'
    const typeName = type.charAt(0).toUpperCase() + type.slice(1)
    return `${action} ${typeName}`
  }

  const getModalIcon = () => {
    switch (type) {
      case 'flight':
        return <Plane className="h-5 w-5" />
      case 'hotel':
        return <Home className="h-5 w-5" />
      case 'activity':
        return <Clock className="h-5 w-5" />
      case 'day':
        return <MapPin className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getModalIcon()}
                <span>{getModalTitle()}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {type === 'flight' && renderFlightForm()}
              {type === 'hotel' && renderHotelForm()}
              {type === 'activity' && renderActivityForm()}
              {type === 'day' && renderDayForm()}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? 'Saving...' : (item ? 'Update' : 'Add')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}


