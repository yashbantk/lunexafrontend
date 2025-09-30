"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Info, CheckCircle } from "lucide-react"

interface ImportantNotesProps {
  notes?: Array<{
    id: string
    type: 'warning' | 'info' | 'success'
    title: string
    description: string
  }>
}

export function ImportantNotes({ notes }: ImportantNotesProps) {
  const defaultNotes = [
    {
      id: 'baggage-warning',
      type: 'warning' as const,
      title: 'Baggage Information',
      description: 'One or more included flights has NO Baggage included. Pre-buying baggage may be cheaper than buying baggage on the airline counter.'
    },
    {
      id: 'check-in-info',
      type: 'info' as const,
      title: 'Check-in Information',
      description: 'Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights.'
    },
    {
      id: 'cancellation-policy',
      type: 'info' as const,
      title: 'Cancellation Policy',
      description: 'Cancellation policies vary by airline and fare type. Please review the specific terms for your booking.'
    }
  ]

  const displayNotes = notes || defaultNotes

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      case 'success':
        return 'text-green-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
    >
      <h3 className="text-lg font-semibold text-gray-900">Important Notes</h3>
      
      <div className="space-y-4">
        {displayNotes.map((note) => (
          <div
            key={note.id}
            className={`p-6 rounded-xl border ${getBgColor(note.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getIcon(note.type)}
              <div className="flex-1">
                <div className={`font-medium ${getTextColor(note.type)}`}>
                  {note.title}
                </div>
                <div className={`text-sm mt-1 ${getTextColor(note.type)} opacity-90`}>
                  {note.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
