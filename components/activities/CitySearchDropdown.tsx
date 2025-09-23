'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, ChevronDown, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCitySearch } from '@/hooks/useCitySearch'
import { City } from '@/types/graphql'

interface CitySearchDropdownProps {
  value: string
  onChange: (value: string, cityId?: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export default function CitySearchDropdown({
  value,
  onChange,
  placeholder = "Search for a city...",
  label = "Location",
  className = ""
}: CitySearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { cities, loading, error, searchCities, clearResults } = useCitySearch()

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchCities(searchQuery)
    } else {
      clearResults()
    }
  }, [searchQuery, searchCities, clearResults])

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        clearResults()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [clearResults])

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    onChange(city.name, city.id)
    setIsOpen(false)
    setSearchQuery('')
    clearResults()
  }

  // Handle clear selection
  const handleClear = () => {
    setSelectedCity(null)
    onChange('')
    setSearchQuery('')
    clearResults()
  }

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // If user clears the input, clear the selection
    if (!query.trim()) {
      setSelectedCity(null)
      onChange('')
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
        <MapPin className="h-4 w-4 mr-1" />
        {label}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery || (selectedCity ? selectedCity.name : '')}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="pl-10 pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {selectedCity && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Searching cities...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <div className="text-sm text-red-600 mb-2">Error loading cities</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => searchCities(searchQuery)}
                    className="text-xs"
                  >
                    Try Again
                  </Button>
                </div>
              ) : cities.length === 0 && searchQuery.trim() ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No cities found for &quot;{searchQuery}&quot;
                </div>
              ) : cities.length > 0 ? (
                <div className="py-2">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {city.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {city.country.name} ({city.country.iso2})
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  Start typing to search for cities
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
