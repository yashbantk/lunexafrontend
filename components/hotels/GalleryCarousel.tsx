'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GalleryCarouselProps {
  images: string[]
  hotelName: string
  className?: string
}

export default function GalleryCarousel({ images, hotelName, className = '' }: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageError, setImageError] = useState<Set<number>>(new Set())

  const handleImageError = useCallback((index: number) => {
    setImageError(prev => new Set(prev).add(index))
  }, [])

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true)
  }, [])

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false)
  }, [])

  const validImages = images.filter((_, index) => !imageError.has(index))

  if (validImages.length === 0) {
    return (
      <div className={`relative w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Gallery */}
      <div className={`relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden group ${className}`}>
        {/* Main Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={validImages[currentIndex]}
              alt={`${hotelName} - Image ${currentIndex + 1}`}
              fill
              className="object-cover"
              onError={() => handleImageError(currentIndex)}
              loading="lazy"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openFullscreen}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            {/* Image Counter */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded">
                {currentIndex + 1} / {validImages.length}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Thumbnail Navigation */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto scrollbar-hide">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                  index === currentIndex 
                    ? 'ring-2 ring-white scale-105' 
                    : 'opacity-70 hover:opacity-100'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeFullscreen}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white z-10"
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Fullscreen Image */}
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
              <Image
                src={validImages[currentIndex]}
                alt={`${hotelName} - Fullscreen view`}
                width={1200}
                height={800}
                className="object-contain max-w-full max-h-full rounded-lg"
                priority
              />
              
              {/* Navigation in Fullscreen */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Thumbnail Strip in Fullscreen */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/50 p-2 rounded-lg">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      goToImage(index)
                    }}
                    className={`relative w-16 h-12 rounded overflow-hidden flex-shrink-0 transition-all ${
                      index === currentIndex 
                        ? 'ring-2 ring-white scale-105' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}







