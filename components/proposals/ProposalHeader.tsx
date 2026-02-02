"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, MapPin, Users, Star, Plane, Car } from "lucide-react"
import { Proposal } from "@/types/proposal"

interface ProposalHeaderProps {
  proposal: Proposal | null
  onUpdate: (proposal: Proposal) => void
}

export function ProposalHeader({ proposal, onUpdate }: ProposalHeaderProps) {
  if (!proposal) return null


  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Details</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="bg-gray-100 px-3 py-1 rounded-full">Trip ID: {proposal.id}</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">Status: <span className="capitalize font-medium">{proposal.tripStatus || 'Draft'}</span></span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">Type: <span className="capitalize font-medium">{proposal.tripType || 'Leisure'}</span></span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">Duration: {proposal.durationDays || 1} day{(proposal.durationDays || 1) !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Trip Name */}
        <div className="space-y-2">
          <Label htmlFor="tripName" className="text-sm font-medium text-gray-700">Trip Name</Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.tripName || 'Not specified'}
          </div>
        </div>

        {/* From Date */}
        <div className="space-y-2">
          <Label htmlFor="fromDate" className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            From Date
          </Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.fromDate || 'Not specified'}
          </div>
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <Label htmlFor="toDate" className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            To Date
          </Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.toDate || 'Not specified'}
          </div>
        </div>

        {/* Origin */}
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Origin
          </Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.origin || 'Not specified'}
          </div>
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.nationality || 'Not specified'}
          </div>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <Label htmlFor="starRating" className="text-sm font-medium text-gray-700 flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Star Rating
          </Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.starRating ? `${proposal.starRating} Star${proposal.starRating === 'luxury' ? '' : 's'}` : 'Not specified'}
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-2">
          <Label htmlFor="rooms" className="text-sm font-medium text-gray-700 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Rooms
          </Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.rooms} {proposal.rooms === 1 ? 'room' : 'rooms'}
          </div>
        </div>

        {/* Adults */}
        <div className="space-y-2">
          <Label htmlFor="adults" className="text-sm font-medium text-gray-700">Adults</Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.adults} {proposal.adults === 1 ? 'adult' : 'adults'}
          </div>
        </div>

        {/* Children */}
        <div className="space-y-2">
          <Label htmlFor="children" className="text-sm font-medium text-gray-700">Children</Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.children} {proposal.children === 1 ? 'child' : 'children'}
          </div>
        </div>

        {/* Total Travelers */}
        <div className="space-y-2">
          <Label htmlFor="totalTravelers" className="text-sm font-medium text-gray-700">Total Travelers</Label>
          <div className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg border">
            {proposal.totalTravelers || (proposal.adults + proposal.children)} travelers
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              proposal.landOnly ? 'bg-primary border-primary' : 'bg-white border-gray-300'
            }`}>
              {proposal.landOnly && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <Label htmlFor="landOnly" className="flex items-center text-sm font-medium text-gray-700">
              <Plane className="h-4 w-4 mr-1" />
              Land Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              proposal.addTransfers ? 'bg-primary border-primary' : 'bg-white border-gray-300'
            }`}>
              {proposal.addTransfers && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <Label htmlFor="addTransfers" className="flex items-center text-sm font-medium text-gray-700">
              <Car className="h-4 w-4 mr-1" />
              Add Transfers
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
