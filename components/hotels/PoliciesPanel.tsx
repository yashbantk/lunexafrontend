'use client'

import { motion } from 'framer-motion'
import { Clock, Users, Baby, PawPrint, Calendar, Shield, CreditCard } from 'lucide-react'
import { HotelPolicies } from '@/types/hotel'

interface PoliciesPanelProps {
  policies: HotelPolicies
  className?: string
}

export default function PoliciesPanel({ policies, className = '' }: PoliciesPanelProps) {
  const policyItems = [
    {
      icon: Clock,
      title: 'Check-in/Check-out',
      content: `${policies.checkIn} / ${policies.checkOut}`,
      description: 'Check-in and check-out times'
    },
    {
      icon: Shield,
      title: 'Cancellation Policy',
      content: policies.cancellation,
      description: 'Cancellation terms and conditions'
    },
    {
      icon: Users,
      title: 'Children Policy',
      content: policies.children,
      description: 'Children accommodation rules'
    },
    {
      icon: Baby,
      title: 'Infant Policy',
      content: policies.infants,
      description: 'Infant accommodation rules'
    },
    {
      icon: PawPrint,
      title: 'Pet Policy',
      content: policies.pets,
      description: 'Pet accommodation rules'
    },
    {
      icon: Shield,
      title: 'Smoking Policy',
      content: policies.smoking,
      description: 'Smoking restrictions'
    },
    {
      icon: Calendar,
      title: 'Age Restrictions',
      content: policies.ageRestriction,
      description: 'Age requirements for check-in'
    }
  ]

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Hotel Policies</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policyItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-700 mb-1">{item.content}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Payment Information</h4>
            <p className="text-sm text-blue-800">
              Payment is required at the time of booking. We accept all major credit cards and digital payment methods.
            </p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 mb-1">Important Notes</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Valid photo ID required at check-in</li>
              <li>• Early check-in and late check-out subject to availability</li>
              <li>• Additional charges may apply for extra services</li>
              <li>• Hotel reserves the right to refuse service</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
