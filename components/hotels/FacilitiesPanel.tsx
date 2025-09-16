'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Wifi, Car, Dumbbell, Utensils, Waves, Briefcase, Shield, Coffee, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FacilitiesPanelProps {
  amenities: string[]
  className?: string
}

const amenityIcons: { [key: string]: any } = {
  'Free WiFi': Wifi,
  'Valet Parking': Car,
  'Fitness Center': Dumbbell,
  'Restaurant': Utensils,
  'Outdoor Pool': Waves,
  'Spa & Wellness Center': Shield,
  'Business Center': Briefcase,
  '24-Hour Front Desk': Shield,
  'Room Service': Coffee,
  'Garden': Sun,
  'Conference Facilities': Briefcase,
  'Meeting Rooms': Briefcase,
  'Laundry Service': Shield,
  'Dry Cleaning': Shield,
  'Concierge Service': Shield,
  'Airport Shuttle': Car,
  'Tennis Court': Dumbbell,
  'Beach Access': Waves,
  'Terrace': Sun
}

const amenityCategories = {
  'Internet & Business': ['Free WiFi', 'Business Center', 'Conference Facilities', 'Meeting Rooms'],
  'Wellness & Recreation': ['Outdoor Pool', 'Spa & Wellness Center', 'Fitness Center', 'Tennis Court', 'Beach Access'],
  'Dining & Services': ['Restaurant', 'Room Service', 'Concierge Service', 'Laundry Service', 'Dry Cleaning'],
  'Transportation & Parking': ['Valet Parking', 'Airport Shuttle'],
  'General': ['24-Hour Front Desk', 'Garden', 'Terrace']
}

export default function FacilitiesPanel({ amenities, className = '' }: FacilitiesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categorizedAmenities = Object.entries(amenityCategories).map(([category, categoryAmenities]) => ({
    category,
    amenities: categoryAmenities.filter(amenity => amenities.includes(amenity))
  })).filter(cat => cat.amenities.length > 0)

  const uncategorizedAmenities = amenities.filter(amenity => 
    !Object.values(amenityCategories).flat().includes(amenity)
  )

  const getIcon = (amenity: string) => {
    const IconComponent = amenityIcons[amenity] || Shield
    return <IconComponent className="h-4 w-4" />
  }

  const visibleAmenities = isExpanded ? amenities : amenities.slice(0, 12)
  const hasMore = amenities.length > 12

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Facilities & Amenities</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{amenities.length} amenities</span>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show All
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Categorized View */}
      {isExpanded && categorizedAmenities.length > 0 && (
        <div className="space-y-6">
          {categorizedAmenities.map(({ category, amenities: categoryAmenities }) => (
            <div key={category}>
              <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryAmenities.map((amenity) => (
                  <motion.div
                    key={amenity}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-primary">
                      {getIcon(amenity)}
                    </div>
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          {uncategorizedAmenities.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Other Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uncategorizedAmenities.map((amenity) => (
                  <motion.div
                    key={amenity}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-primary">
                      {getIcon(amenity)}
                    </div>
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compact View */}
      {!isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleAmenities.map((amenity) => (
            <motion.div
              key={amenity}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-primary">
                {getIcon(amenity)}
              </div>
              <span className="text-sm text-gray-700">{amenity}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Show More Button for Compact View */}
      {!isExpanded && hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="text-primary border-primary hover:bg-primary hover:text-white"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            Show {amenities.length - 12} More Amenities
          </Button>
        </div>
      )}
    </div>
  )
}
