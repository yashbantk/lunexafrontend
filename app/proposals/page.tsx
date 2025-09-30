'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Plus, Eye, Edit, Calendar, MapPin, Users, DollarSign, Clock, Star } from 'lucide-react'
import { Proposal } from '@/types/proposal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'

// Mock data for proposals
const mockProposals: Proposal[] = [
  {
    id: '1',
    tripName: 'Bali Adventure Trip',
    fromDate: '2025-10-15',
    toDate: '2025-10-19',
    origin: 'Delhi',
    nationality: 'India',
    starRating: '5',
    landOnly: false,
    addTransfers: true,
    rooms: 1,
    adults: 2,
    children: 0,
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '+91 9876543210',
    internalNotes: 'VIP client - high priority',
    salesperson: 'Sarah Johnson',
    validityDays: 7,
    markupPercent: 5,
    currency: 'INR',
    tripStatus: 'Draft',
    tripType: 'Leisure',
    totalTravelers: 2,
    durationDays: 4,
    destinations: [
      { id: '1', name: 'Bali', numberOfDays: 4, order: 1 }
    ],
    flights: [],
    hotels: [],
    days: [],
    priceBreakdown: {
      pricePerAdult: 47500,
      pricePerChild: 0,
      subtotal: 95000,
      taxes: 15000,
      markup: 5000,
      total: 115000,
      currency: 'INR'
    },
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    tripName: 'European Grand Tour',
    fromDate: '2025-12-01',
    toDate: '2025-12-15',
    origin: 'Mumbai',
    nationality: 'India',
    starRating: '4',
    landOnly: false,
    addTransfers: true,
    rooms: 2,
    adults: 4,
    children: 2,
    clientName: 'Rajesh Kumar',
    clientEmail: 'rajesh@example.com',
    clientPhone: '+91 9876543211',
    internalNotes: 'Family trip - need child-friendly activities',
    salesperson: 'Mike Wilson',
    validityDays: 14,
    markupPercent: 8,
    currency: 'EUR',
    tripStatus: 'Sent',
    tripType: 'Family',
    totalTravelers: 6,
    durationDays: 14,
    destinations: [
      { id: '1', name: 'Paris', numberOfDays: 4, order: 1 },
      { id: '2', name: 'Rome', numberOfDays: 4, order: 2 },
      { id: '3', name: 'Barcelona', numberOfDays: 4, order: 3 },
      { id: '4', name: 'Amsterdam', numberOfDays: 2, order: 4 }
    ],
    flights: [],
    hotels: [],
    days: [],
    priceBreakdown: {
      pricePerAdult: 1200,
      pricePerChild: 800,
      subtotal: 6400,
      taxes: 1200,
      markup: 500,
      total: 8100,
      currency: 'EUR'
    },
    createdAt: '2025-01-10T14:20:00Z',
    updatedAt: '2025-01-12T09:15:00Z'
  },
  {
    id: '3',
    tripName: 'Dubai Luxury Experience',
    fromDate: '2025-11-20',
    toDate: '2025-11-25',
    origin: 'Bangalore',
    nationality: 'India',
    starRating: '5',
    landOnly: false,
    addTransfers: true,
    rooms: 1,
    adults: 2,
    children: 0,
    clientName: 'Priya Sharma',
    clientEmail: 'priya@example.com',
    clientPhone: '+91 9876543212',
    internalNotes: 'Anniversary trip - luxury experience required',
    salesperson: 'Sarah Johnson',
    validityDays: 10,
    markupPercent: 12,
    currency: 'AED',
    tripStatus: 'Approved',
    tripType: 'Luxury',
    totalTravelers: 2,
    durationDays: 5,
    destinations: [
      { id: '1', name: 'Dubai', numberOfDays: 5, order: 1 }
    ],
    flights: [],
    hotels: [],
    days: [],
    priceBreakdown: {
      pricePerAdult: 8500,
      pricePerChild: 0,
      subtotal: 17000,
      taxes: 2500,
      markup: 2000,
      total: 21500,
      currency: 'AED'
    },
    createdAt: '2025-01-08T16:45:00Z',
    updatedAt: '2025-01-14T11:30:00Z'
  },
  {
    id: '4',
    tripName: 'Thailand Beach Holiday',
    fromDate: '2025-09-05',
    toDate: '2025-09-12',
    origin: 'Chennai',
    nationality: 'India',
    starRating: '3',
    landOnly: true,
    addTransfers: false,
    rooms: 1,
    adults: 2,
    children: 1,
    clientName: 'Vikram Singh',
    clientEmail: 'vikram@example.com',
    clientPhone: '+91 9876543213',
    internalNotes: 'Budget-friendly family trip',
    salesperson: 'Mike Wilson',
    validityDays: 5,
    markupPercent: 3,
    currency: 'THB',
    tripStatus: 'Draft',
    tripType: 'Family',
    totalTravelers: 3,
    durationDays: 7,
    destinations: [
      { id: '1', name: 'Phuket', numberOfDays: 4, order: 1 },
      { id: '2', name: 'Bangkok', numberOfDays: 3, order: 2 }
    ],
    flights: [],
    hotels: [],
    days: [],
    priceBreakdown: {
      pricePerAdult: 15000,
      pricePerChild: 10000,
      subtotal: 40000,
      taxes: 5000,
      markup: 1200,
      total: 46200,
      currency: 'THB'
    },
    createdAt: '2025-01-05T08:15:00Z',
    updatedAt: '2025-01-05T08:15:00Z'
  }
]

export default function MyProposalsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals)
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>(mockProposals)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Filter proposals based on search and filters
  useEffect(() => {
    let filtered = proposals

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(proposal =>
        proposal.tripName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.destinations?.some(dest => 
          dest.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.tripStatus === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.tripType === typeFilter)
    }

    setFilteredProposals(filtered)
  }, [proposals, searchTerm, statusFilter, typeFilter])

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsDetailsModalOpen(true)
  }

  const handleEditProposal = (proposal: Proposal) => {
    // Navigate to edit page or open edit modal
    router.push(`/proposals/create/${proposal.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Sent':
        return 'bg-blue-100 text-blue-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Leisure':
        return 'bg-purple-100 text-purple-800'
      case 'Family':
        return 'bg-pink-100 text-pink-800'
      case 'Luxury':
        return 'bg-yellow-100 text-yellow-800'
      case 'Business':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'AED': 'د.إ',
      'THB': '฿'
    }
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
              <p className="text-sm text-gray-600">Manage and track all your travel proposals</p>
            </div>
            <Button 
              onClick={() => router.push('/proposal')}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Leisure">Leisure</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600">
              <span>{filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>
        </div>

        {/* Proposals Grid */}
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
            <Button 
              onClick={() => router.push('/proposal')}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Proposal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="card-hover bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {proposal.tripName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`text-xs font-medium ${getStatusColor(proposal.tripStatus || 'Draft')}`}>
                          {proposal.tripStatus || 'Draft'}
                        </Badge>
                        <Badge className={`text-xs font-medium ${getTypeColor(proposal.tripType || 'Leisure')}`}>
                          {proposal.tripType || 'Leisure'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Client Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{proposal.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{proposal.origin} → {proposal.destinations?.map(d => d.name).join(', ')}</span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{proposal.durationDays} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Travelers:</span>
                      <span className="font-medium">{proposal.totalTravelers} people</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Dates:</span>
                      <span className="font-medium">{formatDate(proposal.fromDate)} - {formatDate(proposal.toDate)}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Price:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(proposal.priceBreakdown.total, proposal.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProposal(proposal)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProposal(proposal)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Updated {formatDate(proposal.updatedAt || proposal.createdAt || '')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedProposal?.tripName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-6">
              {/* Status and Type */}
              <div className="flex gap-3">
                <Badge className={`text-sm font-medium ${getStatusColor(selectedProposal.tripStatus || 'Draft')}`}>
                  {selectedProposal.tripStatus || 'Draft'}
                </Badge>
                <Badge className={`text-sm font-medium ${getTypeColor(selectedProposal.tripType || 'Leisure')}`}>
                  {selectedProposal.tripType || 'Leisure'}
                </Badge>
              </div>

              {/* Client Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <p className="font-medium">{selectedProposal.clientName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{selectedProposal.clientEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedProposal.clientPhone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Salesperson:</span>
                    <p className="font-medium">{selectedProposal.salesperson}</p>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Duration:</span>
                    <p className="font-medium">{selectedProposal.durationDays} days</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Travelers:</span>
                    <p className="font-medium">{selectedProposal.totalTravelers} people</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Origin:</span>
                    <p className="font-medium">{selectedProposal.origin}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Destinations:</span>
                    <p className="font-medium">{selectedProposal.destinations?.map(d => d.name).join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Dates:</span>
                    <p className="font-medium">{formatDate(selectedProposal.fromDate)} - {formatDate(selectedProposal.toDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Star Rating:</span>
                    <p className="font-medium">{selectedProposal.starRating} stars</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price per Adult:</span>
                    <span className="font-medium">{formatCurrency(selectedProposal.priceBreakdown.pricePerAdult, selectedProposal.currency)}</span>
                  </div>
                  {selectedProposal.priceBreakdown.pricePerChild > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price per Child:</span>
                      <span className="font-medium">{formatCurrency(selectedProposal.priceBreakdown.pricePerChild, selectedProposal.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(selectedProposal.priceBreakdown.subtotal, selectedProposal.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taxes:</span>
                    <span className="font-medium">{formatCurrency(selectedProposal.priceBreakdown.taxes, selectedProposal.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Markup:</span>
                    <span className="font-medium">{formatCurrency(selectedProposal.priceBreakdown.markup, selectedProposal.currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-sm font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(selectedProposal.priceBreakdown.total, selectedProposal.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              {selectedProposal.internalNotes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Internal Notes</h3>
                  <p className="text-sm text-gray-700">{selectedProposal.internalNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleEditProposal(selectedProposal)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Proposal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

