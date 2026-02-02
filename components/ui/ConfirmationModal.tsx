'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
        >
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              <AlertTriangle className={`h-8 w-8 ${
                variant === 'danger' ? 'text-red-600' : 'text-amber-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-6 whitespace-pre-line">
              {message}
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button
                className={`flex-1 ${
                  variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-brand hover:bg-brand/90 text-white'
                }`}
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

