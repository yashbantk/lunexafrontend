"use client"

import { motion } from "framer-motion"
import { Save, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { convertCentsToINR } from '@/lib/utils/currencyConverter'
import { formatPrice } from '@/lib/utils/formatUtils'
import { useState, useEffect } from 'react'

interface TopBarProps {
  totalPrice: number
  currency?: string
  adults?: number
  childrenCount?: number
  onSaveDraft: () => void
  isSaving?: boolean
}

export function TopBar({ totalPrice, currency = 'INR', adults = 2, childrenCount = 0, onSaveDraft, isSaving = false }: TopBarProps) {
  const [displayPrice, setDisplayPrice] = useState<string>('')

  useEffect(() => {
    const convert = async () => {
        const inrCents = await convertCentsToINR(totalPrice, currency)
        setDisplayPrice(formatPrice(inrCents, 'INR'))
    }
    convert()
  }, [totalPrice, currency])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
        <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Center - Total Price */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {displayPrice}
            </div>
            <div className="text-sm text-gray-500 flex items-center justify-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{adults} {adults === 1 ? 'adult' : 'adults'}, {childrenCount} {childrenCount === 1 ? 'child' : 'children'}</span>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save as Proposal</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
