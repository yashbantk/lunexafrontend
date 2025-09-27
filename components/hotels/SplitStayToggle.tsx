'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Split, 
  Calendar, 
  Hotel, 
  Info, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react'

interface SplitStayToggleProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  totalNights: number
  totalDays: number
  className?: string
}

export function SplitStayToggle({ 
  isEnabled, 
  onToggle, 
  totalNights, 
  totalDays,
  className = '' 
}: SplitStayToggleProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className={`border-2 transition-all duration-300 ${
      isEnabled 
        ? 'border-primary bg-primary/5 shadow-lg' 
        : 'border-gray-200 hover:border-gray-300'
    } ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isEnabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Split className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Split Stay</h3>
                <p className="text-sm text-gray-600">
                  Divide your {totalNights} nights across multiple hotels
                </p>
              </div>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? 'Active' : 'Available'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="split-stay-toggle"
                checked={isEnabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="split-stay-toggle" className="text-sm font-medium">
                {isEnabled ? 'Enabled' : 'Enable'}
              </Label>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">How Split Stay Works</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Divide your {totalNights} nights across 2-4 different hotels</li>
                      <li>• Each hotel segment can have different durations (e.g., 2+2, 1+3, 1+2+1)</li>
                      <li>• Select different hotels for each segment based on your preferences</li>
                      <li>• Perfect for exploring multiple areas or experiencing different hotel types</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-gray-900">Flexible Duration</div>
                      <div className="text-sm text-gray-600">Choose how many nights at each hotel</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Hotel className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-gray-900">Multiple Hotels</div>
                      <div className="text-sm text-gray-600">Select different hotels for each segment</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Split className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-gray-900">Easy Management</div>
                      <div className="text-sm text-gray-600">Modify any segment independently</div>
                    </div>
                  </div>
                </div>

                {!isEnabled && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Enable Split Stay to start dividing your accommodation across multiple hotels
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
