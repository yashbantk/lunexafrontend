"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Plane,
  Car,
  Home,
  X,
  GripVertical
} from "lucide-react"
import { CitySearch } from "@/components/cities/CitySearch"
import { CountrySearch } from "@/components/countries/CountrySearch"
import { DestinationSearch } from "@/components/destinations/DestinationSearch"
import { City, Country, Destination } from "@/types/graphql"
import { Textarea } from "@/components/ui/textarea"
import { useCreateItineraryProposal } from "@/hooks/useCreateItineraryProposal"
import { useRouter } from "next/navigation"
import { useToast, ToastContainer } from "@/hooks/useToast"

// Direct form data structure matching CreateItineraryProposalInput
interface DirectFormData {
  // Required fields
  fromCity: string | null
  startDate: string
  nationality: string | null
  currency: string | null
  
  // Optional fields with defaults
  status: string
  tripType: string
  totalTravelers: number
  starRating: number | null
  transferOnly: boolean
  landOnly: boolean
  travelerDetails: {
    adults: number
    children: number
    specialRequests: string | null
  }
  roomsCount: number
  
  // Destinations array
  destinations: {
    destination: string
    numberOfDays: number
    order: number
  }[]
}

interface TripDestination {
  id: string
  city: string
  nights: string
  selectedDestination?: Destination
}

// Sortable Destination Item Component
function SortableDestinationItem({
  destination,
  index,
  totalDestinations,
  onUpdateDestination,
  onSelectDestination,
  onDaysChange,
  onRemove,
}: {
  destination: TripDestination
  index: number
  totalDestinations: number
  onUpdateDestination: (field: keyof TripDestination, value: string) => void
  onSelectDestination: (destination: Destination) => void
  onDaysChange: (value: string) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: destination.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex gap-4 items-end"
    >
      {totalDestinations > 1 && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex items-center pt-8 pb-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <DestinationSearch
          value={destination.city}
          onChange={(value) => onUpdateDestination("city", value)}
          onSelectDestination={onSelectDestination}
          placeholder="Search for a destination (e.g., Paris, Tokyo)"
          label="Destination"
          required
        />
      </div>
      <div className="w-32">
        <Label htmlFor={`days-${destination.id}`}>Nights</Label>
        <Select
          value={destination.nights}
          onValueChange={onDaysChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 14 }, (_, i) => i + 1).map(days => (
              <SelectItem key={days} value={days.toString()}>
                {days} {days === 1 ? 'night' : 'nights'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {totalDestinations > 1 && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  )
}

// Initial form data with proper defaults
const getInitialFormData = (): DirectFormData => ({
  fromCity: null,
  startDate: "",
  nationality: null,
  currency: "INR",
  status: "draft",
  tripType: "leisure",
  totalTravelers: 2,
  starRating: 3,
  transferOnly: false,
  landOnly: false,
  travelerDetails: {
    adults: 2,
    children: 0,
    specialRequests: null
  },
  roomsCount: 1,
  destinations: []
})

export default function ProposalPage() {
  const router = useRouter()
  const { createItineraryProposal, isLoading: isCreating, error: createError } = useCreateItineraryProposal()
  const { toast, toasts, dismiss } = useToast()
  
  const [destinations, setDestinations] = useState<TripDestination[]>([
    { id: "1", city: "", nights: "1" }
  ])
  const [formData, setFormData] = useState<DirectFormData>(() => {
    const initialData = getInitialFormData()
    // Initialize with one empty destination
    initialData.destinations = [{
      destination: "",
      numberOfDays: 1,
      order: 1
    }]
    return initialData
  })
  const [selectedFromCity, setSelectedFromCity] = useState<City | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Helper functions for form updates
  const updateTravelerDetails = (updates: Partial<DirectFormData['travelerDetails']>) => {
    const newTravelerDetails = { ...formData.travelerDetails, ...updates }
    const totalTravelers = newTravelerDetails.adults + newTravelerDetails.children
    
    setFormData(prev => ({
      ...prev,
      travelerDetails: newTravelerDetails,
      totalTravelers
    }))
  }

  const handleFromCitySelect = (city: City) => {
    setSelectedFromCity(city)
    setFormData(prev => ({ ...prev, fromCity: city.id }))
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setFormData(prev => ({ ...prev, nationality: country.iso2 }))
  }

  const addDestination = () => {
    const newId = (destinations.length + 1).toString()
    setDestinations([...destinations, { id: newId, city: "", nights: "1" }])
    
    // Also add to formData destinations
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, {
        destination: "",
        numberOfDays: 1,
        order: prev.destinations.length + 1
      }]
    }))
  }

  const removeDestination = (id: string) => {
    if (destinations.length > 1) {
      const index = destinations.findIndex(dest => dest.id === id)
      setDestinations(destinations.filter(dest => dest.id !== id))
      
      // Also remove from formData destinations
      setFormData(prev => ({
        ...prev,
        destinations: prev.destinations
          .filter((_, i) => i !== index)
          .map((dest, i) => ({ ...dest, order: i + 1 }))
      }))
    }
  }

  const updateDestination = (id: string, field: keyof TripDestination, value: string) => {
    setDestinations(destinations.map(dest => 
      dest.id === id ? { ...dest, [field]: value } : dest
    ))
  }

  const handleDestinationSelect = (id: string, destination: Destination) => {
    setDestinations(destinations.map(dest => 
      dest.id === id ? { ...dest, selectedDestination: destination } : dest
    ))
    
    // Also update formData destinations
    const index = destinations.findIndex(dest => dest.id === id)
    if (index !== -1) {
      setFormData(prev => {
        const newDestinations = [...prev.destinations]
        if (newDestinations[index]) {
          newDestinations[index] = { 
            ...newDestinations[index], 
            destination: destination.id 
          }
        } else {
          // If destination doesn't exist in formData, create it
          newDestinations[index] = {
            destination: destination.id,
            numberOfDays: parseInt(destinations[index].nights) || 1,
            order: index + 1
          }
        }
        return {
          ...prev,
          destinations: newDestinations
        }
      })
    }
  }

  const handleDestinationDaysChange = (id: string, numberOfDays: number) => {
    const index = destinations.findIndex(dest => dest.id === id)
    if (index !== -1) {
      setFormData(prev => ({
        ...prev,
        destinations: prev.destinations.map((dest, i) => 
          i === index ? { ...dest, numberOfDays } : dest
        )
      }))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = destinations.findIndex((dest) => dest.id === active.id)
      const newIndex = destinations.findIndex((dest) => dest.id === over.id)

      const newDestinations = arrayMove(destinations, oldIndex, newIndex)
      setDestinations(newDestinations)

      // Update formData destinations order
      setFormData((prev) => {
        const newFormDestinations = arrayMove(prev.destinations, oldIndex, newIndex).map(
          (dest, index) => ({
            ...dest,
            order: index + 1,
          })
        )
        return {
          ...prev,
          destinations: newFormDestinations,
        }
      })
    }
  }

  // Validation function
  const validateFormData = (data: DirectFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Required field validations
    if (!data.fromCity) errors.push("Departure city is required")
    if (!data.startDate) errors.push("Start date is required")
    if (!data.nationality) errors.push("Nationality is required")
    if (!data.currency) errors.push("Currency is required")
    if (data.destinations.length === 0) errors.push("At least one destination is required")

    // Date validation
    try {
      const date = new Date(data.startDate)
      if (isNaN(date.getTime())) {
        errors.push("Invalid start date format")
      }
    } catch {
      errors.push("Invalid start date format")
    }

    // Traveler validation
    if (data.totalTravelers <= 0) {
      errors.push("Total travelers must be greater than 0")
    }

    if (data.travelerDetails.adults <= 0) {
      errors.push("At least one adult is required")
    }

    // Destination validation
    data.destinations.forEach((dest, index) => {
      if (!dest.destination) {
        errors.push(`Destination ${index + 1} is missing destination ID`)
      }
      if (dest.numberOfDays <= 0) {
        errors.push(`Destination ${index + 1} must have at least 1 day`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const validation = validateFormData(formData)
    
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors)
      toast({
        type: 'error',
        title: 'Validation Error',
        description: `Please fix the following errors:\n${validation.errors.join('\n')}`,
        duration: 8000
      })
      return
    }

    try {
      // Convert to API format
      const apiInput = {
        fromCity: formData.fromCity!,
        startDate: formData.startDate,
        nationality: formData.nationality!,
        status: formData.status,
        tripType: formData.tripType,
        totalTravelers: formData.totalTravelers,
        starRating: formData.starRating || undefined,
        transferOnly: formData.transferOnly,
        landOnly: formData.landOnly,
        travelerDetails: formData.travelerDetails,
        currency: formData.currency!,
        roomsCount: formData.roomsCount,
        destinations: formData.destinations
      }
      
      console.log('Submitting proposal:', apiInput)
      
      // Execute the GraphQL mutation
      const response = await createItineraryProposal(apiInput)
      
      if (response?.createItineraryProposal) {
        const { trip } = response.createItineraryProposal
        
        // Store the complete response data in sessionStorage for the destination page
        sessionStorage.setItem('proposalData', JSON.stringify(response.createItineraryProposal))
        
        // Redirect to the proposal detail page
        router.push(`/proposals/create/${trip.id}`)
      } else {
        throw new Error(createError || 'Failed to create proposal')
      }
      
    } catch (error) {
      console.error('Error creating proposal:', error)
      toast({
        type: 'error',
        title: 'Failed to Create Proposal',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 6000
      })
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Create Customized Proposal
            </h1>
            <p className="text-xl text-gray-600">
              Build professional travel proposals that win clients
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Destinations Section */}
            <Card className="form-card">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Destinations
                </CardTitle>
                <CardDescription>
                  Add the cities and duration for your travel proposal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={destinations.map((dest) => dest.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {destinations.map((destination, index) => (
                      <SortableDestinationItem
                        key={destination.id}
                        destination={destination}
                        index={index}
                        totalDestinations={destinations.length}
                        onUpdateDestination={(field, value) => updateDestination(destination.id, field, value)}
                        onSelectDestination={(destinationData) => handleDestinationSelect(destination.id, destinationData)}
                        onDaysChange={(value) => {
                          updateDestination(destination.id, "nights", value)
                          handleDestinationDaysChange(destination.id, parseInt(value))
                        }}
                        onRemove={() => removeDestination(destination.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDestination}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another City
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Required Information Section */}
            <Card className="form-card">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Required Information
                </CardTitle>
                <CardDescription>
                  Essential details for your travel proposal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From City */}
                  <div className="space-y-2">
                    <Label>Departure City *</Label>
                    <CitySearch
                      value={selectedFromCity?.name || ""}
                      onChange={() => {}} // Handled by onSelectCity
                      onSelectCity={handleFromCitySelect}
                      placeholder="Search departure city"
                      label=""
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Nationality */}
                  <div className="space-y-2">
                    <Label>Nationality *</Label>
                    <CountrySearch
                      value={selectedCountry?.name || ""}
                      onChange={() => {}} // Handled by onSelectCountry
                      onSelectCountry={handleCountrySelect}
                      placeholder="Search for nationality"
                      label=""
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select
                      value={formData.currency || ""}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-2">
                    <Label>Star Rating</Label>
                    <Select
                      value={formData.starRating?.toString() || ""}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        starRating: value === "" ? null : parseFloat(value) 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hotel rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Star</SelectItem>
                        <SelectItem value="4">4 Star</SelectItem>
                        <SelectItem value="5">5 Star</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Number of Travelers */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Number of Travelers</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rooms">Rooms</Label>
                      <Select
                        value={formData.roomsCount.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, roomsCount: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => i + 1).map(rooms => (
                            <SelectItem key={rooms} value={rooms.toString()}>
                              {rooms} {rooms === 1 ? 'room' : 'rooms'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adults">Adults</Label>
                      <Select
                        value={formData.travelerDetails.adults.toString()}
                        onValueChange={(value) => updateTravelerDetails({ adults: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(adults => (
                            <SelectItem key={adults} value={adults.toString()}>
                              {adults} {adults === 1 ? 'adult' : 'adults'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="children">Children</Label>
                      <Select
                        value={formData.travelerDetails.children.toString()}
                        onValueChange={(value) => updateTravelerDetails({ children: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 9 }, (_, i) => i).map(children => (
                            <SelectItem key={children} value={children.toString()}>
                              {children} {children === 1 ? 'child' : 'children'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.travelerDetails.specialRequests || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        travelerDetails: {
                          ...prev.travelerDetails,
                          specialRequests: e.target.value || null
                        }
                      }))}
                      placeholder="Any special dietary requirements, accessibility needs, etc."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Additional Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="transferOnly"
                        checked={formData.transferOnly}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, transferOnly: checked as boolean }))
                        }
                      />
                      <Label htmlFor="transferOnly" className="flex items-center">
                        <Car className="h-4 w-4 mr-2" />
                        Transfer Only (No Accommodation)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="landOnly"
                        checked={formData.landOnly}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, landOnly: checked as boolean }))
                        }
                      />
                      <Label htmlFor="landOnly" className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        Land Only (No Flights)
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-12 py-6"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Proposal...
                  </>
                ) : (
                  <>
                    <Plane className="h-5 w-5 mr-2" />
                    Create Proposal
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
