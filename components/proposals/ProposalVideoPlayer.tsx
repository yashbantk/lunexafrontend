"use client"

import { motion } from "framer-motion"

interface ProposalVideoPlayerProps {
  title?: string
  duration?: string
  onPlay?: () => void
}

export function ProposalVideoPlayer({ 
  title = "Play Your Itinerary", 
  duration = "00:00 / 00:49",
  onPlay 
}: ProposalVideoPlayerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-xl p-8 w-full"
    >
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-opacity-100 transition-all"
                 onClick={onPlay}>
              <div className="w-0 h-0 border-l-[12px] border-l-blue-600 border-y-[8px] border-y-transparent ml-1"></div>
            </div>
            <p className="text-white font-medium">{title}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
          <div className="flex items-center justify-between text-white text-sm">
            <span>{duration}</span>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent"></div>
              </div>
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded"></div>
              </div>
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <div className="w-4 h-4 border border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Please Note:</strong> We would like to emphasize that the video content produced by our organization is intended for informational purposes only. 
          <a href="#" className="text-blue-600 hover:underline ml-1">read more</a>
        </p>
      </div>
    </motion.div>
  )
}
