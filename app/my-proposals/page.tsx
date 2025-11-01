'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  MoreHorizontal, 
  Download, 
  Send, 
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Star,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/useToast'
import { useProposals, Proposal, ProposalFilters, ProposalOrder } from '@/hooks/useProposals'

export default function MyProposalsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for filters and sorting
  const [filters, setFilters] = useState<ProposalFilters>({})
  const [order, setOrder] = useState<ProposalOrder>({ updatedAt: 'DESC' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [sortField, setSortField] = useState<string>('updatedAt')
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC')

  // Fetch proposals with filters and sorting
  const { proposals, loading, error, refetch } = useProposals(filters, order)

  // Filter proposals based on search term
  const filteredProposals = proposals.filter(proposal => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      proposal.name.toLowerCase().includes(searchLower) ||
      proposal.trip.customer?.name?.toLowerCase().includes(searchLower) ||
      proposal.trip.customer?.email?.toLowerCase().includes(searchLower) ||
      proposal.trip.fromCity.name.toLowerCase().includes(searchLower) ||
      proposal.trip.days.some(day => 
        day.city.name.toLowerCase().includes(searchLower)
      )
    )
  })

  // Handle sorting
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'DESC' ? 'ASC' : 'DESC'
    setSortField(field)
    setSortDirection(newDirection)
    
    // Create order object with the correct field
    const newOrder: ProposalOrder = {}
    if (field === 'updatedAt') {
      newOrder.updatedAt = newDirection
    } else if (field === 'createdAt') {
      newOrder.createdAt = newDirection
    } else if (field === 'name') {
      newOrder.name = newDirection
    } else if (field === 'totalPriceCents') {
      newOrder.totalPriceCents = newDirection
    }
    
    setOrder(newOrder)
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof ProposalFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsDetailsModalOpen(true)
  }

  const handleEditProposal = (proposal: Proposal) => {
    router.push(`/proposals/create/${proposal.trip.id}`)
  }

  const handleSendProposal = (proposal: Proposal) => {
    toast({
      title: 'Proposal Sent',
      description: `Proposal "${proposal.name}" has been sent to ${proposal.trip.customer?.name || 'the client'}`,
      type: 'success'
    })
  }

  const handleDownloadProposal = (proposal: Proposal) => {
    toast({
      title: 'Download Started',
      description: `Downloading proposal "${proposal.name}"...`,
      type: 'info'
    })
  }

  const handleDeleteProposal = (proposal: Proposal) => {
    toast({
      title: 'Proposal Deleted',
      description: `Proposal "${proposal.name}" has been deleted`,
      type: 'error'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'leisure':
        return 'bg-purple-100 text-purple-800'
      case 'family':
        return 'bg-pink-100 text-pink-800'
      case 'luxury':
        return 'bg-yellow-100 text-yellow-800'
      case 'business':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'INR': '₹',
      'THB': '฿'
    }
    return `${symbols[currency] || currency} ${(amount / 100).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Proposals</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Button 
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    )
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={filters.tripType || 'all'} onValueChange={(value) => handleFilterChange('tripType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="leisure">Leisure</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex space-x-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              {/* Results Count */}
              <div className="flex items-center text-sm text-gray-600">
                <span>{filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''} found</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Table */}
        {filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
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
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Proposal</span>
                          {sortField === 'name' && (
                            sortDirection === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('trip.customer.name')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Client</span>
                          {sortField === 'trip.customer.name' && (
                            sortDirection === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trip Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('totalPriceCents')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Price</span>
                          {sortField === 'totalPriceCents' && (
                            sortDirection === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('updatedAt')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Updated</span>
                          {sortField === 'updatedAt' && (
                            sortDirection === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProposals.map((proposal) => (
                      <tr key={proposal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{proposal.name}</div>
                            <div className="text-sm text-gray-500">v{proposal.version}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{proposal.trip.customer?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{proposal.trip.customer?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{proposal.trip.fromCity.name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{proposal.trip.totalTravelers}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{proposal.trip.durationDays}d</span>
                            </div>
                          </div>
                          <div className="mt-1">
                            <Badge className={`text-xs font-medium ${getTypeColor(proposal.trip.tripType)}`}>
                              {proposal.trip.tripType}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(proposal.totalPriceCents, proposal.currency.code)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {proposal.currency.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`text-xs font-medium ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(proposal.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProposal(proposal)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendProposal(proposal)}>
                                <Send className="w-4 h-4 mr-2" />
                                Send to Client
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadProposal(proposal)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProposal(proposal)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Proposal Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedProposal?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-6">
              {/* Status and Type */}
              <div className="flex gap-3">
                <Badge className={`text-sm font-medium ${getStatusColor(selectedProposal.status)}`}>
                  {selectedProposal.status}
                </Badge>
                <Badge className={`text-sm font-medium ${getTypeColor(selectedProposal.trip.tripType)}`}>
                  {selectedProposal.trip.tripType}
                </Badge>
              </div>

              {/* Client Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Client Information</h3>
                {selectedProposal.trip.customer ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">{selectedProposal.trip.customer.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedProposal.trip.customer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedProposal.trip.customer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Nationality:</span>
                      <p className="font-medium">{selectedProposal.trip.customer.nationality || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No customer information available</p>
                )}
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Duration:</span>
                    <p className="font-medium">{selectedProposal.trip.durationDays} days</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Travelers:</span>
                    <p className="font-medium">{selectedProposal.trip.totalTravelers} people</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Origin:</span>
                    <p className="font-medium">{selectedProposal.trip.fromCity.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Destinations:</span>
                    <p className="font-medium">{selectedProposal.trip.days.map(d => d.city.name).join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Dates:</span>
                    <p className="font-medium">{formatDate(selectedProposal.trip.startDate)} - {formatDate(selectedProposal.trip.endDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Star Rating:</span>
                    <p className="font-medium">{selectedProposal.trip.starRating} stars</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Price:</span>
                    <span className="font-medium">{formatCurrency(selectedProposal.totalPriceCents, selectedProposal.currency.code)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Currency:</span>
                    <span className="font-medium">{selectedProposal.currency.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Flights Booked:</span>
                    <span className="font-medium">{selectedProposal.areFlightsBooked ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Flight Markup:</span>
                    <span className="font-medium">{selectedProposal.flightsMarkup}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Land Markup:</span>
                    <span className="font-medium">{selectedProposal.landMarkup}%</span>
                  </div>
                </div>
              </div>

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
                  onClick={() => handleSendProposal(selectedProposal)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Client
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
