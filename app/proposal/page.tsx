"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Plane,
  Car,
  Home,
  X
} from "lucide-react"
import { CitySearch } from "@/components/cities/CitySearch"
import { CountrySearch } from "@/components/countries/CountrySearch"
import { DestinationSearch } from "@/components/destinations/DestinationSearch"
import { City, Country, Destination } from "@/types/graphql"

interface TripDestination {
  id: string
  city: string
  nights: string
  selectedDestination?: Destination
}

export default function ProposalPage() {
  const [destinations, setDestinations] = useState<TripDestination[]>([
    { id: "1", city: "", nights: "1" }
  ])
  const [formData, setFormData] = useState({
    leavingFrom: "",
    nationality: "",
    leavingOn: "",
    travelers: {
      rooms: "1",
      adults: "2",
      children: "0"
    },
    starRating: "",
    addTransfers: false,
    landOnly: false
  })
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  const addDestination = () => {
    const newId = (destinations.length + 1).toString()
    setDestinations([...destinations, { id: newId, city: "", nights: "1" }])
  }

  const removeDestination = (id: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(dest => dest.id !== id))
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
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Proposal data:", { 
      destinations: destinations.map(dest => ({
        ...dest,
        selectedDestination: dest.selectedDestination ? {
          id: dest.selectedDestination.id,
          title: dest.selectedDestination.title,
          description: dest.selectedDestination.description,
          heroImageUrl: dest.selectedDestination.heroImageUrl,
          highlights: dest.selectedDestination.highlights,
          isFeatured: dest.selectedDestination.isFeatured,
          createdAt: dest.selectedDestination.createdAt,
          updatedAt: dest.selectedDestination.updatedAt
        } : null
      })),
      ...formData, 
      selectedCountry: selectedCountry ? {
        name: selectedCountry.name,
        iso2: selectedCountry.iso2,
        createdAt: selectedCountry.createdAt,
        updatedAt: selectedCountry.updatedAt
      } : null
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleTravelerChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      travelers: {
        ...formData.travelers,
        [field]: value
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Deyor</span>
            </div>
          </div>
        </div>
      </div>

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
            <Card className="form-card shadow-xl">
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
                {destinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex gap-4 items-end"
                  >
                    <div className="flex-1">
                      <DestinationSearch
                        value={destination.city}
                        onChange={(value) => updateDestination(destination.id, "city", value)}
                        onSelectDestination={(destinationData) => handleDestinationSelect(destination.id, destinationData)}
                        placeholder="Search for a destination (e.g., Paris, Tokyo)"
                        label="Destination"
                        required
                      />
                    </div>
                    <div className="w-32">
                      <Label htmlFor={`nights-${destination.id}`}>Nights</Label>
                      <Select
                        value={destination.nights}
                        onValueChange={(value) => updateDestination(destination.id, "nights", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 14 }, (_, i) => i + 1).map(nights => (
                            <SelectItem key={nights} value={nights.toString()}>
                              {nights} {nights === 1 ? 'night' : 'nights'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {destinations.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeDestination(destination.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}

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
                  <Button
                    type="button"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Suggest Itinerary
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trip Details Section */}
            <Card className="form-card shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Trip Details
                </CardTitle>
                <CardDescription>
                  Specify the travel requirements and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <CitySearch
                      value={formData.leavingFrom}
                      onChange={(value) => setFormData({ ...formData, leavingFrom: value })}
                      placeholder="Search departure city"
                      label="Leaving From"
                    />
                  </div>

                  <div className="space-y-2">
                    <CountrySearch
                      value={formData.nationality}
                      onChange={(value) => setFormData({ ...formData, nationality: value })}
                      onSelectCountry={handleCountrySelect}
                      placeholder="Search for your nationality"
                      label="Nationality"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leavingOn">Leaving On</Label>
                    <Input
                      id="leavingOn"
                      name="leavingOn"
                      type="date"
                      value={formData.leavingOn}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Star Rating</Label>
                    <Select
                      value={formData.starRating}
                      onValueChange={(value) => setFormData({ ...formData, starRating: value })}
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
                        value={formData.travelers.rooms}
                        onValueChange={(value) => handleTravelerChange("rooms", value)}
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
                        value={formData.travelers.adults}
                        onValueChange={(value) => handleTravelerChange("adults", value)}
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
                        value={formData.travelers.children}
                        onValueChange={(value) => handleTravelerChange("children", value)}
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
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Additional Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="addTransfers"
                        checked={formData.addTransfers}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, addTransfers: checked as boolean })
                        }
                      />
                      <Label htmlFor="addTransfers" className="flex items-center">
                        <Car className="h-4 w-4 mr-2" />
                        Add Airport Transfers
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="landOnly"
                        checked={formData.landOnly}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, landOnly: checked as boolean })
                        }
                      />
                      <Label htmlFor="landOnly" className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        Land Only (No Accommodation)
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
              >
                <Plane className="h-5 w-5 mr-2" />
                Create Proposal
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
