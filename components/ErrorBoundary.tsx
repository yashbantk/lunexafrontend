"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Check if it's a chunk loading error
    if (error.message.includes('Loading chunk') || error.message.includes('Loading CSS chunk')) {
      console.log('Chunk loading error detected, attempting retry...')
      this.handleRetry()
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(`Retrying chunk load (attempt ${this.state.retryCount + 1}/${this.maxRetries})`)
      
      // Clear the error state and retry
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }))
      
      // Force a page reload if retries are exhausted
      if (this.state.retryCount + 1 >= this.maxRetries) {
        console.log('Max retries reached, reloading page...')
        window.location.reload()
      }
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isChunkError = this.state.error?.message.includes('Loading chunk') || 
                          this.state.error?.message.includes('Loading CSS chunk')

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isChunkError ? 'Loading Error' : 'Something went wrong'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {isChunkError 
                ? 'Failed to load application resources. This usually resolves automatically.'
                : 'An unexpected error occurred. Please try refreshing the page.'
              }
            </p>

            <div className="space-y-3">
              {isChunkError && this.state.retryCount < this.maxRetries && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({this.state.retryCount + 1}/{this.maxRetries})
                </Button>
              )}
              
              <Button 
                onClick={this.handleReload}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling chunk loading errors
export function useChunkErrorHandler() {
  const handleChunkError = React.useCallback((error: Error) => {
    if (error.message.includes('Loading chunk') || error.message.includes('Loading CSS chunk')) {
      console.log('Chunk loading error detected, reloading page...')
      window.location.reload()
    }
  }, [])

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && (
        event.error.message.includes('Loading chunk') || 
        event.error.message.includes('Loading CSS chunk')
      )) {
        handleChunkError(event.error)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && (
        event.reason.message?.includes('Loading chunk') || 
        event.reason.message?.includes('Loading CSS chunk')
      )) {
        handleChunkError(event.reason)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [handleChunkError])

  return { handleChunkError }
}
