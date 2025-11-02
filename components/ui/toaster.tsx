"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast-primitive"
import { useToast } from "@/hooks/useToast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Map custom toast type to Radix UI variant
  const getVariant = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return 'success'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'warning'
      case 'info':
      default:
        return 'default'
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, type, ...props }) {
        return (
          <Toast 
            key={id} 
            variant={getVariant(type)}
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(id)
              }
            }}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

