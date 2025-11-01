"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building, 
  Car, 
  MapPin, 
  Utensils, 
  FileText, 
  Shield, 
  CheckCircle, 
  XCircle,
  Eye
} from "lucide-react"

interface InclusionItem {
  id: string
  title: string
  description: string
  included: boolean
  details?: string[]
  badge?: string
}

interface InclusionsData {
  accommodation: InclusionItem[]
  transfers: InclusionItem[]
  tours: InclusionItem[]
  meals: InclusionItem[]
  visa: InclusionItem[]
  travelInsurance: InclusionItem[]
}

interface InclusionsSectionProps {
  inclusions: InclusionsData
  onViewItem?: (item: InclusionItem, type: string) => void
}

export function InclusionsSection({ inclusions, onViewItem }: InclusionsSectionProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'accommodation':
        return <Building className="h-5 w-5 text-blue-600" />
      case 'transfers':
        return <Car className="h-5 w-5 text-green-600" />
      case 'tours':
        return <MapPin className="h-5 w-5 text-purple-600" />
      case 'meals':
        return <Utensils className="h-5 w-5 text-orange-600" />
      case 'visa':
        return <FileText className="h-5 w-5 text-indigo-600" />
      case 'travelInsurance':
        return <Shield className="h-5 w-5 text-red-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const renderInclusionCard = (item: InclusionItem, type: string) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-6 mb-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {getIcon(type)}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            
            {item.details && item.details.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {item.details.map((detail, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {detail}
                  </Badge>
                ))}
              </div>
            )}
            
            {item.badge && (
              <Badge variant="outline" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            {item.included ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Included</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Not Included</span>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-1"
            onClick={() => onViewItem?.(item, type)}
          >
            <Eye className="h-4 w-4" />
            <span>VIEW</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Accommodation */}
      {inclusions.accommodation && inclusions.accommodation.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Accommodation</h2>
          <div className="space-y-4">
            {inclusions.accommodation.map((item) => renderInclusionCard(item, 'accommodation'))}
          </div>
        </div>
      )}

      {/* Transfers */}
      {inclusions.transfers && inclusions.transfers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transfers</h2>
          <div className="space-y-4">
            {inclusions.transfers.map((item) => renderInclusionCard(item, 'transfers'))}
          </div>
        </div>
      )}

      {/* Tours */}
      {inclusions.tours && inclusions.tours.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tours</h2>
          <div className="space-y-4">
            {inclusions.tours.map((item) => renderInclusionCard(item, 'tours'))}
          </div>
        </div>
      )}

      {/* Meals */}
      {inclusions.meals && inclusions.meals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Meals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inclusions.meals.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  {getIcon('meals')}
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  {item.included ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Included {item.details && item.details.length > 0 && `on ${item.details[0]}`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Not Included</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Visa */}
      {inclusions.visa && inclusions.visa.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Visa</h2>
          <div className="space-y-4">
            {inclusions.visa.map((item) => renderInclusionCard(item, 'visa'))}
          </div>
        </div>
      )}

      {/* Travel Insurance */}
      {inclusions.travelInsurance && inclusions.travelInsurance.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Insurance</h2>
          <div className="space-y-4">
            {inclusions.travelInsurance.map((item) => renderInclusionCard(item, 'travelInsurance'))}
          </div>
        </div>
      )}
    </div>
  )
}
