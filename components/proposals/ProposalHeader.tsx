"use client"

import { useState } from "react"
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
  const [isEditing, setIsEditing] = useState(false)

  if (!proposal) return null

  const handleFieldChange = (field: string, value: any) => {
    onUpdate({
      ...proposal,
      [field]: value
    })
  }

  const handleTravelerChange = (field: string, value: string) => {
    onUpdate({
      ...proposal,
      [field]: parseInt(value)
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Trip Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Trip Name */}
        <div className="space-y-2">
          <Label htmlFor="tripName">Trip Name</Label>
          <Input
            id="tripName"
            value={proposal.tripName}
            onChange={(e) => handleFieldChange('tripName', e.target.value)}
            disabled={!isEditing}
            className="text-sm"
          />
        </div>

        {/* From Date */}
        <div className="space-y-2">
          <Label htmlFor="fromDate" className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            From Date
          </Label>
          <Input
            id="fromDate"
            type="date"
            value={proposal.fromDate}
            onChange={(e) => handleFieldChange('fromDate', e.target.value)}
            disabled={!isEditing}
            className="text-sm"
          />
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <Label htmlFor="toDate" className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            To Date
          </Label>
          <Input
            id="toDate"
            type="date"
            value={proposal.toDate}
            onChange={(e) => handleFieldChange('toDate', e.target.value)}
            disabled={!isEditing}
            className="text-sm"
          />
        </div>

        {/* Origin */}
        <div className="space-y-2">
          <Label htmlFor="origin" className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Origin
          </Label>
          <Select
            value={proposal.origin}
            onValueChange={(value) => handleFieldChange('origin', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Chennai">Chennai</SelectItem>
              <SelectItem value="Kolkata">Kolkata</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Select
            value={proposal.nationality}
            onValueChange={(value) => handleFieldChange('nationality', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
              <SelectItem value="UK">UK</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <Label htmlFor="starRating" className="flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Star Rating
          </Label>
          <Select
            value={proposal.starRating}
            onValueChange={(value) => handleFieldChange('starRating', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Star</SelectItem>
              <SelectItem value="4">4 Star</SelectItem>
              <SelectItem value="5">5 Star</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rooms */}
        <div className="space-y-2">
          <Label htmlFor="rooms" className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Rooms
          </Label>
          <Select
            value={proposal.rooms.toString()}
            onValueChange={(value) => handleTravelerChange('rooms', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => i + 1).map(rooms => (
                <SelectItem key={rooms} value={rooms.toString()}>
                  {rooms} {rooms === 1 ? 'room' : 'rooms'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Adults */}
        <div className="space-y-2">
          <Label htmlFor="adults">Adults</Label>
          <Select
            value={proposal.adults.toString()}
            onValueChange={(value) => handleTravelerChange('adults', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(adults => (
                <SelectItem key={adults} value={adults.toString()}>
                  {adults} {adults === 1 ? 'adult' : 'adults'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="landOnly"
              checked={proposal.landOnly}
              onCheckedChange={(checked) => handleFieldChange('landOnly', checked)}
              disabled={!isEditing}
            />
            <Label htmlFor="landOnly" className="flex items-center text-sm">
              <Plane className="h-4 w-4 mr-1" />
              Land Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="addTransfers"
              checked={proposal.addTransfers}
              onCheckedChange={(checked) => handleFieldChange('addTransfers', checked)}
              disabled={!isEditing}
            />
            <Label htmlFor="addTransfers" className="flex items-center text-sm">
              <Car className="h-4 w-4 mr-1" />
              Add Transfers
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
