'use client'

import { useState, useEffect } from 'react'
import { Star, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { HotelFilters } from '@/graphql/queries/hotels'

interface GraphQLFiltersPanelProps {
  filters: HotelFilters
  onFiltersChange: (filters: Partial<HotelFilters>) => void
  onReset: () => void
}

const STAR_RATINGS = [1, 2, 3, 4, 5]
const COMMON_AMENITIES = [
  'WiFi',
  'Pool',
  'Gym',
  'Spa',
  'Restaurant',
  'Bar',
  'Parking',
  'Air Conditioning',
  'Room Service',
  'Concierge',
  'Business Center',
  'Laundry Service',
  'Pet Friendly',
  'Beach Access',
  'Airport Shuttle'
]

export default function GraphQLFiltersPanel({ filters, onFiltersChange, onReset }: GraphQLFiltersPanelProps) {
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  // Update local state when filters change
  useEffect(() => {
    if (filters.star?.exact) {
      setSelectedStars([filters.star.exact])
    } else if (filters.star?.range) {
      setSelectedStars([])
      setPriceRange([filters.star.range.start, filters.star.range.end])
    } else {
      setSelectedStars([])
    }
  }, [filters])

  const handleStarRatingChange = (star: number, checked: boolean) => {
    let newStars: number[]
    if (checked) {
      newStars = [...selectedStars, star]
    } else {
      newStars = selectedStars.filter(s => s !== star)
    }
    setSelectedStars(newStars)

    // Update GraphQL filters
    if (newStars.length === 1) {
      onFiltersChange({
        star: { exact: newStars[0] }
      })
    } else if (newStars.length > 1) {
      // For multiple stars, use range
      const minStar = Math.min(...newStars)
      const maxStar = Math.max(...newStars)
      onFiltersChange({
        star: { range: { start: minStar, end: maxStar } }
      })
    } else {
      onFiltersChange({
        star: { exact: null }
      })
    }
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    let newAmenities: string[]
    if (checked) {
      newAmenities = [...selectedAmenities, amenity]
    } else {
      newAmenities = selectedAmenities.filter(a => a !== amenity)
    }
    setSelectedAmenities(newAmenities)

    // Update GraphQL filters
    if (newAmenities.length > 0) {
      onFiltersChange({
        amenities: { contains: newAmenities }
      })
    } else {
      onFiltersChange({
        amenities: undefined
      })
    }
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
    // Note: Price filtering would need to be implemented based on room rates
    // This is a placeholder for future implementation
  }

  const handleReset = () => {
    setSelectedStars([])
    setSelectedAmenities([])
    setPriceRange([0, 1000])
    onReset()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedStars.length > 0) count++
    if (selectedAmenities.length > 0) count++
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++
    return count
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Star Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Star Rating</Label>
        <div className="space-y-2">
          {STAR_RATINGS.map((star) => (
            <div key={star} className="flex items-center space-x-2">
              <Checkbox
                id={`star-${star}`}
                checked={selectedStars.includes(star)}
                onCheckedChange={(checked) => handleStarRatingChange(star, checked as boolean)}
              />
              <Label htmlFor={`star-${star}`} className="flex items-center space-x-1 cursor-pointer">
                <span className="text-sm">{star} Star{star > 1 ? 's' : ''}</span>
                <div className="flex">
                  {Array.from({ length: star }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Amenities</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {COMMON_AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
              />
              <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Price Range (per night)</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Property Type Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Property Type</Label>
        <Select onValueChange={(value) => {
          onFiltersChange({
            type: value === "all" ? undefined : { exact: value }
          })
        }}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="resort">Resort</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="hostel">Hostel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Instant Booking Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Booking Options</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="instant-booking"
              onCheckedChange={(checked) => {
                onFiltersChange({
                  instantBooking: checked ? { exact: true } : undefined
                })
              }}
            />
            <Label htmlFor="instant-booking" className="text-sm cursor-pointer">
              Instant Booking Available
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
