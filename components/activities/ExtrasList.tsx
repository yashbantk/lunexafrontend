'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Info, Plus, Minus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Extra, ExtrasListProps } from '@/types/activity'

export default function ExtrasList({
  extras,
  selectedExtras,
  onExtrasChange,
  adults,
  childrenCount,
  className = ''
}: ExtrasListProps) {
  const [expandedExtras, setExpandedExtras] = useState<Set<string>>(new Set())

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const calculateExtraPrice = (extra: Extra) => {
    if (extra.priceType === 'per_person') {
      return extra.price * (adults + childrenCount)
    }
    return extra.price
  }

  const handleExtraToggle = (extra: Extra, checked: boolean) => {
    if (checked) {
      onExtrasChange([...selectedExtras, extra])
    } else {
      onExtrasChange(selectedExtras.filter(e => e.id !== extra.id))
    }
  }

  const toggleExpanded = (extraId: string) => {
    setExpandedExtras(prev => {
      const newSet = new Set(prev)
      if (newSet.has(extraId)) {
        newSet.delete(extraId)
      } else {
        newSet.add(extraId)
      }
      return newSet
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Photography': 'bg-purple-100 text-purple-800',
      'Service': 'bg-blue-100 text-blue-800',
      'Food': 'bg-orange-100 text-orange-800',
      'Equipment': 'bg-green-100 text-green-800',
      'Beverage': 'bg-pink-100 text-pink-800',
      'Souvenir': 'bg-yellow-100 text-yellow-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (extras.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No additional extras available for this activity.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Add Extras</h3>
        <Badge variant="secondary" className="text-xs">
          Optional
        </Badge>
      </div>

      <div className="space-y-3">
        {extras.map((extra) => {
          const isSelected = selectedExtras.some(e => e.id === extra.id)
          const isExpanded = expandedExtras.has(extra.id)
          const extraPrice = calculateExtraPrice(extra)
          const isRequired = extra.required

          return (
            <motion.div
              key={extra.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isSelected ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`extra-${extra.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleExtraToggle(extra, checked as boolean)}
                  disabled={isRequired}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Label
                          htmlFor={`extra-${extra.id}`}
                          className="font-medium text-gray-900 cursor-pointer"
                        >
                          {extra.label}
                        </Label>
                        {isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getCategoryColor(extra.category)}`}>
                          {extra.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {extra.description}
                      </p>
                      
                      {extra.description.length > 100 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(extra.id)}
                          className="h-6 px-2 text-xs text-brand hover:text-brand/80"
                        >
                          {isExpanded ? (
                            <>
                              <Minus className="h-3 w-3 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Show More
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-brand">
                        {formatPrice(extraPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {extra.priceType === 'per_person' ? 'per person' : 'flat rate'}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-gray-200"
                    >
                      <div className="flex items-center text-sm text-gray-600">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        <span>
                          {extra.priceType === 'per_person' 
                            ? `This extra costs ${formatPrice(extra.price)} per person (${adults + childrenCount} people = ${formatPrice(extraPrice)} total)`
                            : `This extra costs ${formatPrice(extra.price)} for the entire group`
                          }
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {selectedExtras.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <h4 className="font-medium text-gray-900 mb-2">Selected Extras</h4>
          <div className="space-y-1">
            {selectedExtras.map((extra) => {
              const extraPrice = calculateExtraPrice(extra)
              return (
                <div key={extra.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{extra.label}</span>
                  <span className="font-medium text-brand">{formatPrice(extraPrice)}</span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Extras</span>
              <span className="text-brand">
                {formatPrice(selectedExtras.reduce((total, extra) => total + calculateExtraPrice(extra), 0))}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
