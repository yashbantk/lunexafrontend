'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// Extend Window interface for PDF ready flag
declare global {
  interface Window {
    __pdfReady?: boolean
  }
}

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
      <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 text-xs rounded">
        A4: 210×297mm
      </div>
    </div>
  )
}

// SVG Icons
const QuoteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" fill="currentColor"/>
  </svg>
)

const LeafIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-500">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.91.66.95-2.3c.48.17.98.3 1.5.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75S7 14 17 8z" fill="currentColor"/>
  </svg>
)

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" fill="currentColor"/>
  </svg>
)

const BeachIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
  </svg>
)

const PoolIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
  </svg>
)

const IslandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
  </svg>
)

const SuitcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-700">
    <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7 7h10v10H7V7z" fill="currentColor"/>
  </svg>
)

const InfoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
  </svg>
)

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
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

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-500">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
  </svg>
)

const BulletIcon = () => (
  <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="text-gray-700">
    <circle cx="3" cy="3" r="3" fill="currentColor"/>
  </svg>
)

export default function PrintPreviewPage() {
  useEffect(() => {
    // Set PDF ready flag for Puppeteer
    window.__pdfReady = true
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <DebugOverlay />
      
      {/* Download Button - Moved to Top */}
      <div className="max-w-4xl mx-auto p-8 print:hidden">
        <div className="text-center mb-8">
          <button 
            onClick={() => {
              // Open the print-ready page in a new tab
              window.open('/api/proposals/generate-pdf?id=demo', '_blank')
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            📄 Download PDF (All Pages)
          </button>
          <p className="text-sm text-gray-500 mt-2">Downloads both cover page and itinerary</p>
        </div>
      </div>
      
      {/* Page 1 - Cover Page */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Header */}
        <header className="mb-8 print:mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-2">Adi Adi's trip to</p>
              <h1 className="text-4xl font-bold text-title-blue mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Maldives
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <div className="text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Main Card */}
        <main className="bg-white rounded-2xl shadow-md p-8 print:shadow-none print:rounded-none">
          {/* Trip Summary */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                4N/5D
              </span>
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <BuildingIcon />
                <span className="ml-1">Cannimale</span>
              </span>
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Taj Coral Reef Resort With Water Villa Stay
              </span>
            </div>
            
            <div className="flex items-start space-x-3 mb-6">
              <QuoteIcon />
              <p className="text-gray-700 italic text-base leading-relaxed">
                Unwind into this heavenly vacation on the Taj Coral Reef Resort inside Maldives. Enjoy your stay as you go snorkeling, scuba diving and more. Relax on the picturesque beaches and dive into the calming aqua blue waters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contents */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Contents</h2>
                <div className="space-y-3">
                  {[
                    'Your Itinerary',
                    'Day Wise Details', 
                    'How To Book',
                    'Cancellation & Date Change Policies'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-title-blue rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 hover:text-primary cursor-pointer">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Highlights</h2>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: <BeachIcon />, text: 'Beach' },
                    { icon: <PoolIcon />, text: 'Pool' },
                    { icon: <IslandIcon />, text: 'Island Hopping' },
                    { icon: <CheckIcon />, text: 'Island Club Included' }
                  ].map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                      {highlight.icon}
                      <span className="text-gray-700 text-sm">{highlight.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Curator Card */}
            <aside className="lg:col-span-1">
              <div className="bg-muted-card rounded-2xl p-6 shadow-sm avoid-break">
                <div className="text-right">
                  <p className="text-gray-500 text-sm mb-1">Generated by</p>
                  <p className="text-gray-800 font-semibold text-lg mb-1">Jaishika Manjhi</p>
                  <p className="text-gray-500 text-sm mb-4">4+ Years Experience</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Call: 7428090055</p>
                    <p>Email: jaishika.manjhi@deyor.in</p>
                    <p className="text-gray-500">Quotation Created on 23 Jul 2025</p>
                    <p className="text-gray-500">08:15 PM</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Promo Banner */}
          <div className="mt-8 bg-gradient-to-r from-teal-400 to-green-500 rounded-2xl p-6 avoid-break">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SuitcaseIcon />
                <div>
                  <h3 className="text-gray-800 font-semibold text-lg">Plan Your Trip with Deyor</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>A travel quotation</span>
                    <span className="text-gray-400">|</span>
                    <span>A Customize your service</span>
                    <span className="text-gray-400">|</span>
                    <span>A Customize to suit you</span>
                  </div>
                </div>
              </div>
              <button className="bg-white text-teal-600 px-6 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors">
                VIEW YOUR QUOTES
              </button>
            </div>
          </div>

          {/* Total Cost Box */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 avoid-break">
            <div className="bg-primary text-white px-4 py-2 rounded-t-2xl -mt-6 -mx-6 mb-4">
              <p className="text-sm font-medium">Total cost Excluding TCS</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">₹ 2,33,516</div>
              <p className="text-gray-600 mb-6">for 2 adults</p>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                Pay Now
              </button>
              <div className="flex items-center justify-center mt-4 space-x-2 text-xs text-gray-500">
                <InfoIcon />
                <span>Please read cancellation policy before proceeding with mail. Your payment is good for 10 minutes on payment.</span>
              </div>
            </div>
          </div>
        </main>


        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 italic">
            <LeafIcon />
            <span>Please think twice before printing this mail. Save paper, it's good for the environment.</span>
          </div>
        </footer>
      </div>

      {/* Page Break */}
      <div className="page-break"></div>

      {/* Page 2 - Itinerary Page */}
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
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-primary text-white px-2 py-4 rounded-r-lg text-xs font-bold" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            DEYOR
          </div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-12 gap-0 border border-gray-300 rounded-lg overflow-hidden">
            {/* Left Column - Dates */}
            <div className="col-span-3 bg-gray-50">
              {[
                { day: 'Sat, Feb 7', dayNumber: 'Day 1' },
                { day: 'Sun, Feb 8', dayNumber: 'Day 2' },
                { day: 'Mon, Feb 9', dayNumber: 'Day 3' },
                { day: 'Tue, Feb 10', dayNumber: 'Day 4' },
                { day: 'Wed, Feb 11', dayNumber: 'Day 5' }
              ].map((date, index) => (
                <div key={index} className="avoid-break border-b border-gray-200 last:border-b-0">
                  <div className="p-4 text-center h-24 flex flex-col justify-center">
                    <div className="text-sm font-semibold text-gray-800">{date.day}</div>
                    <div className="text-xs text-gray-600 mt-1">{date.dayNumber}</div>
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
              
              {/* Day 1 */}
              <div className="avoid-break border-b border-gray-200">
                <div className="p-4 min-h-24">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <BuildingIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Check in to:</span> Taj Coral Reef Resort With Water Villa Stay
                        </div>
                        <div className="text-xs text-gray-500 mt-1">12:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Day Meals:</span> Lunch : Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">1:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <BoatIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Speedboat transfer to resort</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">2:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Dinner :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">7:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Day 2 */}
              <div className="avoid-break border-b border-gray-200">
                <div className="p-4 min-h-24">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Breakfast :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">8:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Lunch :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">1:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <ActivityIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Complimentary Snorkelling</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">3:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Dinner :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">7:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Day 3 */}
              <div className="avoid-break border-b border-gray-200">
                <div className="p-4 min-h-24">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Breakfast :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">8:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Lunch :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">1:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <SunsetIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Sunset Cruise</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">5:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Dinner :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">7:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <BuildingIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Checkout/Checkin</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">11:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Day 4 */}
              <div className="avoid-break border-b border-gray-200">
                <div className="p-4 min-h-24">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Breakfast :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">8:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Lunch :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">1:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Dinner :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">7:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Day 5 */}
              <div className="avoid-break">
                <div className="p-4 min-h-24">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CutleryIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Breakfast :</span> Included
                        </div>
                        <div className="text-xs text-gray-500 mt-1">8:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <BoatIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Speedboat to airport</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">10:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <BuildingIcon />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold">Checkout</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">11:00 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Page Break */}
      <div className="page-break"></div>

      {/* Page 3 - Day-Wise Details */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Header */}
        <header className="mb-6 print:mb-4">
          <div className="flex items-start justify-between mb-4">
            <p className="text-title-blue text-sm font-medium">Day Wise Details</p>
            <div className="text-sm text-gray-600 font-medium">Sat, 7 Feb 2026</div>
          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
              Day 1
            </h1>
          </div>
        </header>

        {/* Subsection Title */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Hotel at Maldives</h2>
        </div>

        {/* Hotel Card Section */}
        <section className="bg-white rounded-xl shadow-md overflow-hidden mb-6 avoid-break print:shadow-none print:rounded-none">
          <div className="flex flex-col md:flex-row">
            {/* Hotel Image */}
            <figure className="md:w-64 flex-shrink-0">
              <div className="w-full h-48 md:h-full bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden rounded-l-xl print:rounded-none">
                {/* Placeholder for hotel image - replace with actual Image component when available */}
                <div className="absolute inset-0 bg-gray-300 opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-blue-400">
                    <BuildingIcon />
                  </div>
                </div>
                {/* This will be replaced with: <Image src="/images/hotel-placeholder.jpg" alt="Taj Coral Reef Resort & Spa Maldives" className="object-cover w-full h-full" width={256} height={200} /> */}
              </div>
            </figure>

            {/* Hotel Details */}
            <div className="flex-1 p-6">
              <div className="mb-3">
                <span className="inline-block bg-title-blue text-white px-3 py-1 rounded-full text-xs font-medium mb-2">
                  Hotel
                </span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">
                  Taj Coral Reef Resort & Spa Maldives - Holidays Selections
                </h3>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                <LocationIcon />
                <span>North Male Atoll</span>
              </div>

              {/* Check-in/Check-out Times */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Check-in</div>
                    <div className="text-gray-800 font-medium">02 PM Thu, 16 Oct</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Check-out</div>
                    <div className="text-gray-800 font-medium">12 PM Sun, 19 Oct</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Room Details Section */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6 avoid-break print:shadow-none print:rounded-none">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Superior Beach Villa With Transfers x 1
            </h3>
            <div className="flex space-x-2">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                Breakfast
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                624 sq ft
              </span>
            </div>
          </div>

          {/* Room Inclusions */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Room Inclusions</h4>
            <div className="space-y-2 pl-2">
              {[
                'Complimentary Wi-Fi services across the property.',
                'Daily meals: Breakfast, Lunch, Dinner as per inclusion.',
                'Complimentary Snorkeling Equipment at Taj Coral Reef.',
                'Speedboat transfers to and from Velana International Airport.',
                'Taxes included.'
              ].map((inclusion, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1.5">
                    <BulletIcon />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{inclusion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="mt-8 print:mt-6">
          <div className="mb-4">
            <div className="bg-orange-200 rounded-full px-4 py-2 inline-flex items-center space-x-2">
              <LocationIcon />
              <span className="text-gray-800 font-medium text-sm">Maldives - 4 Nights Stay</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-sm text-gray-700">
              Stay at <span className="font-semibold">Taj Coral Reef Resort & Spa Maldives – Holidays Selections, Maldives</span>
            </p>
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
            break-after: page;
          }
          
          .print\\:bg-white {
            background: white !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}
