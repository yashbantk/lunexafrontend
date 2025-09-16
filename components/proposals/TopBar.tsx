"use client"

import { motion } from "framer-motion"
import { Save, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  totalPrice: number
  onSaveDraft: () => void
}

export function TopBar({ totalPrice, onSaveDraft }: TopBarProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
        <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Create Customized Proposal
            </h1>
          </div>

          {/* Center - Total Price */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </div>
            <div className="text-sm text-gray-500 flex items-center justify-center space-x-1">
              <Users className="h-4 w-4" />
              <span>2 adults, 0 children</span>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
