import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface UseToastReturn {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastWithId: Toast = {
      ...newToast,
      id,
      duration: newToast.duration || 5000,
    };

    setToasts(prev => [...prev, toastWithId]);

    // Auto-dismiss after duration
    if (toastWithId.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, toastWithId.duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, toast, dismiss };
};

// Enhanced toast component with better UI and animations
export const ToastContainer = ({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className={`
            relative bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden
            backdrop-blur-sm bg-white/95
            ${toast.type === 'success' ? 'border-l-4 border-l-green-500' : ''}
            ${toast.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
            ${toast.type === 'warning' ? 'border-l-4 border-l-yellow-500' : ''}
            ${toast.type === 'info' ? 'border-l-4 border-l-blue-500' : ''}
          `}
        >
          {/* Background gradient overlay */}
          <div className={`
            absolute inset-0 opacity-5
            ${toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : ''}
            ${toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : ''}
            ${toast.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : ''}
            ${toast.type === 'info' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}
          `} />
          
          <div className="relative p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {toast.type === 'warning' && (
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                {toast.title && (
                  <p className="text-sm font-semibold text-gray-900 mb-1">{toast.title}</p>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">{toast.description}</p>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <button
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => dismiss(toast.id)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <motion.div
              className={`
                h-full
                ${toast.type === 'success' ? 'bg-green-500' : ''}
                ${toast.type === 'error' ? 'bg-red-500' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500' : ''}
              `}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: toast.duration ? toast.duration / 1000 : 5, ease: "linear" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
