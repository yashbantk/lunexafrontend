'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, X, Maximize2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Hotel, NearbyAttraction } from '@/types/hotel'

interface HotelMapPlaceholderProps {
  hotel: Hotel
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function HotelMapPlaceholder({ 
  hotel, 
  isOpen, 
  onClose, 
  className = '' 
}: HotelMapPlaceholderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const openFullscreen = () => {
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Map Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Hotel Location</h2>
                  <p className="text-sm text-gray-600">{hotel.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openFullscreen}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Map Content */}
              <div className="flex-1 flex">
                {/* Map Area */}
                <div className="flex-1 relative">
                  {/* Placeholder Map Image */}
                  <div className="relative w-full h-full bg-gray-100">
                    <Image
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
                      alt="Map placeholder"
                      fill
                      className="object-cover"
                    />
                    
                    {/* Hotel Pin */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar with Nearby Attractions */}
                {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 && (
                  <div className="w-80 border-l bg-gray-50 overflow-y-auto scrollbar-hide">
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Nearby Attractions</h3>
                      <div className="space-y-3">
                        {hotel.nearbyAttractions.map((attraction, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm">{attraction.name}</h4>
                              <p className="text-xs text-gray-500">{attraction.distance}</p>
                              <p className="text-xs text-gray-400 capitalize">{attraction.type}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Navigation className="h-4 w-4" />
                    <span>Get directions to this location</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // In a real app, this would open Google Maps or similar
                      window.open(`https://maps.google.com/?q=${hotel.coordinates?.lat},${hotel.coordinates?.lng}`, '_blank')
                    }}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in Maps
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Map */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black flex items-center justify-center"
            onClick={closeFullscreen}
          >
            <div className="relative w-full h-full">
              {/* Fullscreen Map Image */}
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop"
                alt="Fullscreen map"
                fill
                className="object-cover"
              />
              
              {/* Hotel Pin */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-primary"></div>
                </div>
              </div>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeFullscreen}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="h-6 w-6" />
              </Button>
              
              {/* Hotel Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                <p className="text-sm text-gray-600">{hotel.address}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>Hotel Location</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`https://maps.google.com/?q=${hotel.coordinates?.lat},${hotel.coordinates?.lng}`, '_blank')
                    }}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}






