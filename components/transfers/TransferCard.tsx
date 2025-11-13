'use client'

import { motion } from 'framer-motion'
import { Car, MapPin, Users, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TransferProduct } from '@/types/transfer'
import { formatPrice } from '@/lib/utils/formatUtils'

interface TransferCardProps {
  transferProduct: TransferProduct
  onSelect: (transferProduct: TransferProduct) => void
  onViewDetails: (transferProduct: TransferProduct) => void
  isSelected?: boolean
  viewMode: 'list' | 'grid'
  className?: string
}

export default function TransferCard({
  transferProduct,
  onSelect,
  onViewDetails,
  isSelected = false,
  viewMode,
  className = ''
}: TransferCardProps) {

  const getVehicleTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string; icon: string }> = {
      'sedan': { label: 'Sedan', color: 'bg-blue-100 text-blue-800', icon: '🚗' },
      'suv': { label: 'SUV', color: 'bg-green-100 text-green-800', icon: '🚙' },
      'van': { label: 'Van', color: 'bg-purple-100 text-purple-800', icon: '🚐' },
      'bus': { label: 'Bus', color: 'bg-orange-100 text-orange-800', icon: '🚌' },
      'luxury': { label: 'Luxury', color: 'bg-yellow-100 text-yellow-800', icon: '✨' }
    }
    return badges[type.toLowerCase()] || { label: type, color: 'bg-gray-100 text-gray-800', icon: '🚗' }
  }

  const vehicleBadge = getVehicleTypeBadge(transferProduct.vehicle.type || 'sedan')
  const totalCapacity = transferProduct.vehicle.capacityAdults + transferProduct.vehicle.capacityChildren

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
          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Car className="h-16 w-16 text-blue-400" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              <Badge className={`${vehicleBadge.color} text-xs`}>
                {vehicleBadge.icon} {vehicleBadge.label}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                  {transferProduct.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {transferProduct.description || 'Transportation service'}
                </p>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {transferProduct.city.name}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Up to {totalCapacity} pax
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-brand">
                    {formatPrice(transferProduct.priceCents, transferProduct.currency.code)}
                  </div>
                  <div className="text-xs text-gray-500">
                    per vehicle
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(transferProduct)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
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
            <div className="relative w-32 h-24 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
              <Car className="h-8 w-8 text-blue-400" />
              <div className="absolute top-1 left-1">
                <Badge className={`${vehicleBadge.color} text-xs`}>
                  {vehicleBadge.icon}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                    {transferProduct.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {transferProduct.description || 'Transportation service'}
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <Badge className={vehicleBadge.color}>
                    {vehicleBadge.label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {transferProduct.city.name}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {transferProduct.vehicle.capacityAdults} adults, {transferProduct.vehicle.capacityChildren} children
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {transferProduct.supplier.name}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand">
                      {formatPrice(transferProduct.priceCents, transferProduct.currency.code)}
                    </div>
                    <div className="text-xs text-gray-500">
                      per vehicle
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(transferProduct)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
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









