'use client'

import { useState } from 'react'
import CoverPage from '@/components/pdf/CoverPage'
import { mockProposalCoverData } from '@/lib/mocks/proposal'
import { Button } from '@/components/ui/button'
import { Download, Eye, Printer } from 'lucide-react'

export default function CoverDemoPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      // Try the API first
      const response = await fetch('/api/proposals/generate-pdf?id=demo')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'deyor-proposal-demo.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // Fallback to print dialog
        console.warn('PDF API failed, using print dialog as fallback')
        window.print()
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to print dialog
      console.warn('PDF generation failed, using print dialog as fallback')
      window.print()
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deyor Proposal Cover Page</h1>
              <p className="text-gray-600">Preview and generate PDF of the proposal cover page</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Preview
              </Button>
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-brand hover:bg-brand/90"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Cover Page Preview</span>
            </div>
          </div>
          
          {/* Cover Page Component */}
          <div className="bg-white print-container">
            <CoverPage data={mockProposalCoverData} />
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            width: 100%;
            height: 100vh;
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: A4;
            margin: 12mm;
          }
          
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
