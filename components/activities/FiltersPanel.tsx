'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Clock, Star, MapPin, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ActivityFilters } from '@/types/activity'

interface FiltersPanelProps {
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
  onReset: () => void
  availableFilters: {
    categories: string[]
    timeOfDay: string[]
    difficulties: string[]
    locations: string[]
  }
  className?: string
}

const timeOfDayOptions = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌆' },
  { value: 'full-day', label: 'Full Day', icon: '🌞' }
]

const difficultyOptions = [
  { value: 'Easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'Moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Challenging', label: 'Challenging', color: 'bg-red-100 text-red-800' }
]

export default function FiltersPanel({
  filters,
  onFiltersChange,
  onReset,
  availableFilters,
  className = ''
}: FiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<ActivityFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof ActivityFilters, value: any) => {
    // Convert "all" back to empty string for location filter
    const processedValue = key === 'location' && value === 'all' ? '' : value
    const newFilters = { ...localFilters, [key]: processedValue }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleArrayFilterChange = (key: keyof ActivityFilters, value: string, checked: boolean) => {
    const currentArray = localFilters[key] as string[]
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    handleFilterChange(key, newArray)
  }

  const handlePriceRangeChange = (value: number[]) => {
    handleFilterChange('priceRange', value)
  }

  const handleDurationChange = (value: number[]) => {
    handleFilterChange('duration', value)
  }

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

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-brand" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700">
            Search Activities
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name, description, or tags..."
              value={localFilters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Location
          </Label>
          <Select
            value={localFilters.location || 'all'}
            onValueChange={(value) => handleFilterChange('location', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {availableFilters.locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time of Day */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Time of Day
          </Label>
          <div className="space-y-2">
            {timeOfDayOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`time-${option.value}`}
                  checked={localFilters.timeOfDay.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleArrayFilterChange('timeOfDay', option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`time-${option.value}`}
                  className="text-sm text-gray-700 cursor-pointer flex items-center"
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Categories</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
            {availableFilters.categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={localFilters.category.includes(category)}
                  onCheckedChange={(checked) =>
                    handleArrayFilterChange('category', category, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Difficulty Level</Label>
          <div className="space-y-2">
            {difficultyOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${option.value}`}
                  checked={localFilters.difficulty.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleArrayFilterChange('difficulty', option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`difficulty-${option.value}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  <Badge variant="secondary" className={option.color}>
                    {option.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Price Range</Label>
          <div className="px-3">
            <Slider
              value={localFilters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={1000000}
              min={0}
              step={50000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{formatPrice(localFilters.priceRange[0])}</span>
              <span>{formatPrice(localFilters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Duration</Label>
          <div className="px-3">
            <Slider
              value={localFilters.duration}
              onValueChange={handleDurationChange}
              max={600}
              min={60}
              step={30}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{formatDuration(localFilters.duration[0])}</span>
              <span>{formatDuration(localFilters.duration[1])}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Minimum Rating
          </Label>
          <div className="px-3">
            <Slider
              value={[localFilters.rating]}
              onValueChange={(value) => handleFilterChange('rating', value[0])}
              max={5}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Any rating</span>
              <span>{localFilters.rating > 0 ? `${localFilters.rating.toFixed(1)}+ stars` : 'Any rating'}</span>
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Sort By</Label>
          <Select
            value={localFilters.sort}
            onValueChange={(value) => handleFilterChange('sort', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="duration">Shortest Duration</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
