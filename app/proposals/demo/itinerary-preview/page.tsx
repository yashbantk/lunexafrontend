'use client'

import { useEffect, useState } from 'react'

// Debug overlay component
const DebugOverlay = () => {
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setShowDebug(urlParams.get('debug') === 'true')
  }, [])

  if (!showDebug) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-xs rounded">
        DEBUG MODE
      </div>
      <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs rounded px-2 py-1">
        A4: 210×297mm
      </div>
    </div>
  )
}

// SVG Icons
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
  </svg>
)

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" fill="currentColor"/>
  </svg>
)

const CutleryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" fill="currentColor"/>
  </svg>
)

const ActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
  </svg>
)

const BoatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l.95-9H3l.95 9z" fill="currentColor"/>
  </svg>
)

const SunsetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
  </svg>
)

const PlaneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
  </svg>
)

const DeyorVerticalBadge = () => (
  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-primary text-white px-2 py-4 rounded-r-lg text-xs font-bold writing-mode-vertical">
    DEYOR
  </div>
)

export default function ItineraryPreviewPage() {
  useEffect(() => {
    // Set PDF ready flag for Puppeteer
    window.__pdfReady = true
  }, [])

  const itineraryData = [
    {
      day: 'Sat, Feb 7',
      dayNumber: 'Day 1',
      items: [
        { icon: <BuildingIcon />, text: 'Check in to Taj Coral Reef Resort With Water Villa Stay', time: '12:00 PM' },
        { icon: <CutleryIcon />, text: 'Day Meals: Lunch : Included', time: '1:00 PM' },
        { icon: <BoatIcon />, text: 'Speedboat transfer to resort', time: '2:00 PM' },
        { icon: <CutleryIcon />, text: 'Dinner : Included', time: '7:00 PM' }
      ]
    },
    {
      day: 'Sun, Feb 8',
      dayNumber: 'Day 2',
      items: [
        { icon: <CutleryIcon />, text: 'Breakfast : Included', time: '8:00 AM' },
        { icon: <CutleryIcon />, text: 'Lunch : Included', time: '1:00 PM' },
        { icon: <ActivityIcon />, text: 'Complimentary Snorkelling', time: '3:00 PM' },
        { icon: <CutleryIcon />, text: 'Dinner : Included', time: '7:00 PM' }
      ]
    },
    {
      day: 'Mon, Feb 9',
      dayNumber: 'Day 3',
      items: [
        { icon: <CutleryIcon />, text: 'Breakfast : Included', time: '8:00 AM' },
        { icon: <CutleryIcon />, text: 'Lunch : Included', time: '1:00 PM' },
        { icon: <SunsetIcon />, text: 'Sunset Cruise', time: '5:00 PM' },
        { icon: <CutleryIcon />, text: 'Dinner : Included', time: '7:00 PM' },
        { icon: <BuildingIcon />, text: 'Checkout/Checkin', time: '11:00 PM' }
      ]
    },
    {
      day: 'Tue, Feb 10',
      dayNumber: 'Day 4',
      items: [
        { icon: <CutleryIcon />, text: 'Breakfast : Included', time: '8:00 AM' },
        { icon: <CutleryIcon />, text: 'Lunch : Included', time: '1:00 PM' },
        { icon: <CutleryIcon />, text: 'Dinner : Included', time: '7:00 PM' }
      ]
    },
    {
      day: 'Wed, Feb 11',
      dayNumber: 'Day 5',
      items: [
        { icon: <CutleryIcon />, text: 'Breakfast : Included', time: '8:00 AM' },
        { icon: <BoatIcon />, text: 'Speedboat to airport', time: '10:00 AM' },
        { icon: <BuildingIcon />, text: 'Checkout', time: '11:00 AM' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <DebugOverlay />
      
      {/* Main Container */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Header */}
        <header className="mb-6 print:mb-4">
          <div className="text-center">
            <p className="text-title-blue text-sm font-medium mb-2">Your Itinerary</p>
            <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Taj Coral Reef Resort With Water Villa Stay
            </h1>
          </div>
        </header>

        {/* Subheader Ribbon */}
        <div className="mb-6 print:mb-4">
          <div className="bg-orange-200 rounded-full px-4 py-2 inline-flex items-center space-x-2">
            <LocationIcon />
            <span className="text-gray-800 font-medium text-sm">Maldives - 4 Nights Stay</span>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative">
          {/* Deyor Vertical Badge */}
          <DeyorVerticalBadge />
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-12 gap-0 border border-gray-300 rounded-lg overflow-hidden">
            {/* Left Column - Dates */}
            <div className="col-span-3 bg-gray-50">
              {itineraryData.map((day, index) => (
                <div key={index} className="avoid-break border-b border-gray-200 last:border-b-0">
                  <div className="p-4 text-center h-24 flex flex-col justify-center">
                    <div className="text-sm font-semibold text-gray-800">{day.day}</div>
                    <div className="text-xs text-gray-600 mt-1">{day.dayNumber}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Events */}
            <div className="col-span-9 bg-white">
              {/* Header */}
              <div className="bg-orange-200 px-4 py-3 border-b border-gray-200">
                <div className="text-sm font-semibold text-gray-800">Daily Activities & Meals</div>
              </div>
              
              {/* Events */}
              {itineraryData.map((day, dayIndex) => (
                <div key={dayIndex} className="avoid-break border-b border-gray-200 last:border-b-0">
                  <div className="p-4 min-h-24">
                    <div className="space-y-3">
                      {day.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-800">
                              <span className="font-semibold">{item.text.split(':')[0]}:</span>
                              {item.text.split(':').slice(1).join(':')}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer Artwork */}
        <footer className="mt-8 print:mt-6">
          <div className="flex justify-end">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </footer>
      </div>

      {/* Print Styles */}
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
          
          .page-break {
            page-break-after: always;
          }
          
          .print\\:bg-white {
            background: white !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
        }
        
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  )
}

