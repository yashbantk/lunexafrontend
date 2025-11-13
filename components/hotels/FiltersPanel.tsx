'use client'

import { useState, useEffect } from 'react'
import { Search, Star, MapPin, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { HotelFilters } from '@/types/hotel'
import { getPopularDestinations, getPropertyTypes } from '@/lib/api/hotels'

interface FiltersPanelProps {
  filters: HotelFilters
  onFiltersChange: (filters: Partial<HotelFilters>) => void
  onReset: () => void
}

export default function FiltersPanel({ filters, onFiltersChange, onReset }: FiltersPanelProps) {
  const [destinations, setDestinations] = useState<string[]>([])
  // const [amenities, setAmenities] = useState<string[]>([])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])

  useEffect(() => {
    // Load filter options
    const loadFilterOptions = async () => {
      const [dest, prop] = await Promise.all([
        getPopularDestinations(),
        getPropertyTypes()
      ])
      setDestinations(dest)
      setPropertyTypes(prop)
    }
    loadFilterOptions()
  }, [])

  const handleStarRatingChange = (star: number, checked: boolean) => {
    if (checked) {
      onFiltersChange({
        stars: [...filters.stars, star]
      })
    } else {
      onFiltersChange({
        stars: filters.stars.filter(s => s !== star)
      })
    }
  }

  // const handleAmenityChange = (amenity: string, checked: boolean) => {
  //   if (checked) {
  //     onFiltersChange({
  //       amenities: [...filters.amenities, amenity]
  //     })
  //   } else {
  //     onFiltersChange({
  //       amenities: filters.amenities.filter(a => a !== amenity)
  //     })
  //   }
  // }

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      onFiltersChange({
        propertyTypes: [...filters.propertyTypes, type]
      })
    } else {
      onFiltersChange({
        propertyTypes: filters.propertyTypes.filter(t => t !== type)
      })
    }
  }

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({
      priceRange: value as [number, number]
    })
  }

  const clearFilter = (filterType: keyof HotelFilters) => {
    switch (filterType) {
      case 'query':
        onFiltersChange({ query: '' })
        break
      case 'location':
        onFiltersChange({ location: '' })
        break
      case 'stars':
        onFiltersChange({ stars: [] })
        break
      case 'amenities':
        onFiltersChange({ amenities: [] })
        break
      case 'propertyTypes':
        onFiltersChange({ propertyTypes: [] })
        break
      case 'priceRange':
        onFiltersChange({ priceRange: [0, 10000] })
        break
    }
  }

  const hasActiveFilters = 
    filters.query || 
    filters.location || 
    filters.stars.length > 0 || 
    filters.amenities.length > 0 || 
    filters.propertyTypes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search by Property */}
      <div className="space-y-2">
        <Label htmlFor="property-search" className="text-sm font-medium">
          Search by property
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="property-search"
            placeholder="Search by property name"
            value={filters.query}
            onChange={(e) => onFiltersChange({ query: e.target.value })}
            className="pl-10"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilter('query')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Near Location */}
      <div className="space-y-2">
        <Label htmlFor="location-search" className="text-sm font-medium">
          Near location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="location-search"
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) => onFiltersChange({ location: e.target.value })}
            className="pl-10"
          />
          {filters.location && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilter('location')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Popular Destinations */}
        {destinations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {destinations.slice(0, 6).map((dest) => (
              <Badge
                key={dest}
                variant={filters.location === dest ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => onFiltersChange({ location: dest })}
              >
                {dest}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Star Rating</Label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center space-x-2">
              <Checkbox
                id={`stars-${stars}`}
                checked={filters.stars.includes(stars)}
                onCheckedChange={(checked) => handleStarRatingChange(stars, checked as boolean)}
              />
              <Label htmlFor={`stars-${stars}`} className="flex items-center space-x-1 cursor-pointer">
                <div className="flex">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {stars} star{stars > 1 ? 's' : ''}
                </span>
              </Label>
            </div>
          ))}
        </div>
        {filters.stars.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter('stars')}
            className="text-red-600 hover:text-red-700 p-0 h-auto"
          >
            Clear star rating
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="px-3">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹{filters.priceRange[0].toLocaleString()}</span>
            <span>₹{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter('priceRange')}
            className="text-red-600 hover:text-red-700 p-0 h-auto"
          >
            Clear price range
          </Button>
        )}
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Property Type</Label>
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.propertyTypes.includes(type)}
                onCheckedChange={(checked) => handlePropertyTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
        {filters.propertyTypes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter('propertyTypes')}
            className="text-red-600 hover:text-red-700 p-0 h-auto"
          >
            Clear property types
          </Button>
        )}
      </div>

      {/* Amenities filter temporarily disabled */}
      {/* <div className="space-y-3">
        <Label className="text-sm font-medium">Amenities</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {amenities.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
              />
              <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
        {filters.amenities.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter('amenities')}
            className="text-red-600 hover:text-red-700 p-0 h-auto"
          >
            Clear amenities
          </Button>
        )}
      </div> */}

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sort by</Label>
        <Select
          value={filters.sort}
          onValueChange={(value: any) => onFiltersChange({ sort: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
