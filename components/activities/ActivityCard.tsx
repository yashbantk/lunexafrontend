'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Clock, Star, MapPin, Users, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Activity } from '@/types/activity'

interface ActivityCardProps {
  activity: Activity
  onSelect: (activity: Activity) => void
  onViewDetails: (activity: Activity) => void
  isSelected?: boolean
  viewMode: 'list' | 'grid'
  className?: string
}

export default function ActivityCard({
  activity,
  onSelect,
  onViewDetails,
  isSelected = false,
  viewMode,
  className = ''
}: ActivityCardProps) {
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

  const getTimeOfDayBadge = (type: string) => {
    const badges = {
      'morning': { label: 'Morning', color: 'bg-orange-100 text-orange-800', icon: '🌅' },
      'afternoon': { label: 'Afternoon', color: 'bg-yellow-100 text-yellow-800', icon: '☀️' },
      'evening': { label: 'Evening', color: 'bg-purple-100 text-purple-800', icon: '🌆' },
      'full-day': { label: 'Full Day', color: 'bg-blue-100 text-blue-800', icon: '🌞' }
    }
    return badges[type as keyof typeof badges] || badges['full-day']
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'Challenging': 'bg-red-100 text-red-800'
    }
    return colors[difficulty as keyof typeof colors] || colors['Easy']
  }

  const primaryTimeSlot = activity.availability.find(slot => slot.available) || activity.availability[0]
  const timeBadge = getTimeOfDayBadge(primaryTimeSlot?.type || 'full-day')

  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card className={`overflow-hidden h-full transition-all duration-200 ${
          isSelected ? 'ring-2 ring-brand shadow-lg' : 'hover:shadow-xl'
        }`}>
          <div className="relative h-48">
            <Image
              src={activity.images[0]}
              alt={activity.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              <Badge className={`${timeBadge.color} text-xs`}>
                {timeBadge.icon} {timeBadge.label}
              </Badge>
              <Badge className={getDifficultyColor(activity.difficulty)}>
                {activity.difficulty}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-gray-700">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {activity.rating} ({activity.reviewsCount})
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {activity.shortDesc}
                </p>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(activity.durationMins)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {activity.location}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {activity.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-brand">
                    {formatPrice(activity.basePrice)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.pricingType === 'person' ? 'per person' : 'per activity'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(activity)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSelect(activity)}
                    className="text-xs bg-brand hover:bg-brand/90"
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selected
                      </>
                    ) : (
                      'Select'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // List view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className={`transition-all duration-200 ${
        isSelected ? 'ring-2 ring-brand shadow-lg' : 'hover:shadow-lg'
      }`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-32 h-24 flex-shrink-0">
              <Image
                src={activity.images[0]}
                alt={activity.title}
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute top-1 left-1">
                <Badge className={`${timeBadge.color} text-xs`}>
                  {timeBadge.icon}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {activity.shortDesc}
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <Badge className="bg-white/90 text-gray-700">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {activity.rating}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(activity.durationMins)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {activity.location}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {activity.minPax}-{activity.maxPax} pax
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getDifficultyColor(activity.difficulty)}>
                    {activity.difficulty}
                  </Badge>
                  {activity.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand">
                      {formatPrice(activity.basePrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.pricingType === 'person' ? 'per person' : 'per activity'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(activity)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSelect(activity)}
                      className="text-xs bg-brand hover:bg-brand/90"
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}






