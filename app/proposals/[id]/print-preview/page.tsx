'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CoverPage from '@/components/pdf/CoverPage'
import { mockProposalCoverData } from '@/lib/mocks/proposal'

export default function PrintPreviewPage() {
  const params = useParams()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Simulate loading fonts and images
    const timer = setTimeout(() => {
      setIsReady(true)
      // Set global flag for PDF generation
      if (typeof window !== 'undefined') {
        window.__pdfReady = true
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing PDF...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 12mm;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
      <CoverPage data={mockProposalCoverData} />
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __pdfReady?: boolean
  }
}






