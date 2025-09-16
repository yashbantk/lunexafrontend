'use client'

import { ProposalCoverData } from '@/lib/mocks/proposal'
import { Building, User, ChefHat, ShoppingBag, Leaf } from 'lucide-react'

interface CoverPageProps {
  data: ProposalCoverData
}

export default function CoverPage({ data }: CoverPageProps) {
  return (
    <div className="w-full min-h-screen bg-white p-12 avoid-break">
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">
            {data.clientName}&apos;s trip to
          </div>
          <h1 className="text-5xl font-bold text-title-blue mb-4 font-serif">
            {data.destination}
          </h1>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {data.duration}
            </div>
            {data.isCustomizable && (
              <>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">×</span>
                </div>
                <span className="text-black font-medium">Customizable</span>
              </>
            )}
            <span className="font-semibold text-lg">
              {data.hotelName}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {data.duration} {data.destination}
          </div>
        </div>
        
        {/* Deyor Logo */}
        <div className="flex items-center">
          <div className="w-20 h-20 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center">
            <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">D</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Quote Section */}
      <div className="mb-12 avoid-break">
        <div className="flex items-start gap-4">
          <div className="text-6xl text-gray-300 font-serif leading-none mt-2">
            &ldquo;
          </div>
          <div className="flex-1">
            <p className="text-lg italic text-gray-700 leading-relaxed">
              {data.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12 avoid-break">
        {/* Left Column - Contents */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">Contents</h2>
          <div className="space-y-4">
            {data.contents.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-title-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-title-blue font-medium text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Curator Card */}
        <div className="bg-muted-card rounded-2xl p-6 avoid-break">
          <div className="text-sm text-gray-600 mb-2">Curated by</div>
          <h3 className="text-2xl font-bold text-black mb-2">{data.curator.name}</h3>
          <div className="text-black mb-4">{data.curator.experience}</div>
          <div className="space-y-2 text-sm">
            <div>Call: {data.curator.phone}</div>
            <div>Email: {data.curator.email}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="text-sm text-gray-600">Quotation Created on {data.quotationDate}</div>
            <div className="text-sm text-gray-600">{data.quotationTime}</div>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="mb-12 avoid-break">
        <h2 className="text-2xl font-bold text-black mb-6">Highlights</h2>
        <div className="flex gap-4">
          <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-600" />
            <span className="text-black font-medium">{data.highlights.hotels} Hotels</span>
          </div>
          <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-black font-medium">{data.highlights.activities} Activities</span>
          </div>
          <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 flex items-center gap-3">
            <ChefHat className="w-5 h-5 text-gray-600" />
            <span className="text-black font-medium">{data.highlights.meals}</span>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-6 mb-12 avoid-break">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Now, Plan Your Trips with Deyor
              </h3>
              <div className="text-white text-sm space-y-1">
                <div>• Track quotations</div>
                <div>• Customize your quotes</div>
                <div>• Communicate in real-time</div>
              </div>
            </div>
          </div>
          <button className="bg-white text-title-blue border-2 border-title-blue rounded-2xl px-6 py-3 font-bold text-sm hover:bg-gray-50 transition-colors">
            VIEW YOUR QUOTES
          </button>
        </div>
      </div>

      {/* Total Cost Section */}
      <div className="mb-8 avoid-break">
        <h2 className="text-2xl font-bold text-black mb-4">Total cost Excluding TCS</h2>
        <p className="text-sm text-gray-700 mb-6 max-w-4xl">
          {data.disclaimer}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-brand mb-1">
              {data.totalCost.currency} {data.totalCost.amount}
            </div>
            <div className="text-sm text-gray-600">
              For {data.totalCost.forAdults} Adults
            </div>
          </div>
          <button className="bg-gradient-to-r from-title-blue to-blue-600 text-white rounded-2xl px-8 py-4 font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all">
            Pay Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-gray-400 italic">
        <Leaf className="w-4 h-4" />
        <span>{data.footerText}</span>
      </div>
    </div>
  )
}
