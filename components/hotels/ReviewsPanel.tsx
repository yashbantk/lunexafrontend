'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Review } from '@/types/hotel'

interface ReviewsPanelProps {
  reviews: Review[]
  overallRating: number
  ratingCount: number
  className?: string
}

export default function ReviewsPanel({ 
  reviews, 
  overallRating, 
  ratingCount, 
  className = '' 
}: ReviewsPanelProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  // Filter reviews by selected rating
  const filteredReviews = selectedRating 
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Guest Reviews</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {renderStars(Math.round(overallRating))}
            <span className="text-sm text-gray-600 ml-1">
              {overallRating} ({ratingCount} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Rating Breakdown</h3>
        <div className="space-y-3">
          {ratingBreakdown.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                className={`flex items-center space-x-1 text-sm ${
                  selectedRating === rating 
                    ? 'text-primary font-medium' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <span>{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                {selectedRating === rating && <ChevronUp className="h-3 w-3" />}
                {!selectedRating && <ChevronDown className="h-3 w-3" />}
              </button>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <span className="text-sm text-gray-500 w-8 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {selectedRating ? `${ratingBreakdown.find(r => r.rating === selectedRating)?.count} reviews` : 'Recent Reviews'}
          </h3>
          {selectedRating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRating(null)}
              className="text-primary hover:text-primary/80"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {review.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{review.author}</h4>
                      {review.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {review.helpful > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpful} helpful</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">{review.title}</h5>
                <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {filteredReviews.length > 3 && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-primary border-primary hover:bg-primary hover:text-white"
          >
            {showAllReviews ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less Reviews
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All {filteredReviews.length} Reviews
              </>
            )}
          </Button>
        </div>
      )}

      {/* No Reviews Message */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-500">
            {selectedRating 
              ? `No ${selectedRating}-star reviews available`
              : 'No reviews available for this hotel'
            }
          </p>
        </div>
      )}
    </div>
  )
}






