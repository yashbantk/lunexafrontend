'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
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
  Briefcase,
  Palmtree,
  Plane,
  ChevronDown,
  Filter,
  X,
  Star,
  Activity,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/useToast'
import { useMutation, useQuery } from '@apollo/client/react'
import { UPDATE_CONTACT, CREATE_CONTACT } from '@/graphql/mutations/proposal'
import { GET_USER_ORG } from '@/graphql/queries/users'
import { useProposals, Proposal, ProposalFilters, ProposalOrder } from '@/hooks/useProposals'
import { useUpdateProposal } from '@/hooks/useUpdateProposal'
import { useUpdateTrip } from '@/hooks/useUpdateTrip'
import { useCurrentUser } from '@/hooks/useAuth'
import { Label } from '@/components/ui/label'

interface ClientFormData {
  name: string
  phone: string
  email: string
}

export default function MyProposalsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for filters and sorting
  const [filters, setFilters] = useState<ProposalFilters>({})
  const [order, setOrder] = useState<ProposalOrder>({ updatedAt: 'DESC' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [clientFormData, setClientFormData] = useState<ClientFormData>({ name: '', phone: '', email: '' })
  const [sortField, setSortField] = useState<string>('updatedAt')
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC')

  // Auth & User Org Data
  const currentUser = useCurrentUser()
  const { data: userData } = useQuery(GET_USER_ORG, {
    variables: { id: currentUser?.id },
    skip: !currentUser?.id
  })

  // Mutations
  const [updateContact, { loading: isUpdatingContact }] = useMutation(UPDATE_CONTACT)
  const [createContact, { loading: isCreatingContact }] = useMutation(CREATE_CONTACT)

  // Fetch proposals with filters and sorting
  const { proposals, loading, error, refetch } = useProposals(filters, order)
  const { updateProposal, isLoading: isUpdatingProposal } = useUpdateProposal()
  const { updateTrip, isLoading: isUpdatingTrip } = useUpdateTrip()
  
  // Deduplicate proposals to show only the latest version per trip
  // This prevents the UI from showing multiple rows updating simultaneously when Trip details change
  const uniqueProposals = proposals.reduce((acc, current) => {
    const existingIndex = acc.findIndex(p => p.trip.id === current.trip.id)
    
    if (existingIndex === -1) {
      acc.push(current)
    } else {
      // If current version is higher, replace the existing one
      if ((current.version || 0) > (acc[existingIndex].version || 0)) {
        acc[existingIndex] = current
      }
    }
    return acc
  }, [] as Proposal[])

  // Filter proposals based on search term
  const filteredProposals = uniqueProposals.filter(proposal => {
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

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsDetailsModalOpen(true)
  }

  const handleEditProposal = (proposal: Proposal) => {
    router.push(`/proposals/create/${proposal.trip.id}`)
  }

  const sendWhatsAppMessage = (proposal: Proposal, name: string, phone: string) => {
    // Basic validation
    if (!phone) {
      toast({ title: "Error", description: "Phone number is required", type: "error" })
      return
    }

    const proposalLink = `${window.location.origin}/proposal/${proposal.id}` // Assuming this is the public link structure
    const message = `Hi ${name}, here is your travel proposal for ${proposal.name}. You can view the details here: ${proposalLink}\n\nBest regards,\n${proposal.trip.org?.name || 'DeYor Camps'}`
    
    // Format phone number (remove non-digits, ensure country code if needed - basic assumption here)
    const formattedPhone = phone.replace(/\D/g, '')
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    toast({
      title: 'WhatsApp Opened',
      description: `Opening WhatsApp to send proposal to ${name}`,
      type: 'success'
    })
  }

  const handleSendProposal = (proposal: Proposal) => {
    const customer = proposal.trip.customer
    
    if (customer && customer.name && customer.phone) {
      sendWhatsAppMessage(proposal, customer.name, customer.phone)
    } else {
      // Pre-fill existing data if any
      setClientFormData({
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || ''
      })
      setSelectedProposal(proposal)
      setIsClientModalOpen(true)
    }
  }

  const handleSaveClientAndSend = async () => {
    if (!selectedProposal) return
    if (!clientFormData.name || !clientFormData.phone) {
      toast({ title: "Missing Information", description: "Name and Phone are required", type: "error" })
      return
    }

    try {
      const customer = selectedProposal.trip.customer
      
      if (customer && customer.id) {
        // Update existing contact
        await updateContact({
          variables: {
            data: {
              id: customer.id,
              name: clientFormData.name,
              phone: clientFormData.phone,
              email: clientFormData.email // Optional update
            }
          }
        })
      } else {
        // Create new contact
        // We need org ID. Assuming trip has org, or createdBy has org, or current user has org.
        let orgId = selectedProposal.trip.org?.id || selectedProposal.trip.createdBy.org?.id
        
        // Fallback to current user's org if available
        if (!orgId && userData?.user?.org?.id) {
          orgId = userData.user.org.id
          console.log('Using Current User Org ID:', orgId)
        }
        
        console.log('Sending Proposal - Found Org ID:', orgId)
        
        if (!orgId) {
            console.error('Organization ID missing in proposal data', selectedProposal)
            toast({ title: "Error", description: "Organization ID missing. Cannot create contact.", type: "error" })
            return
        }

        const { data: contactData } = await createContact({
          variables: {
            data: {
              name: clientFormData.name,
              phone: clientFormData.phone,
              email: clientFormData.email || `client_${Date.now()}@placeholder.com`, // Email is required by schema usually
              org: orgId
            }
          }
        })

        const newContactId = contactData?.createContact?.id
        console.log('Created new contact:', newContactId)
        
        if (newContactId) {
          // Link new contact to trip
          console.log('Linking contact to trip:', selectedProposal.trip.id)
          await updateTrip({
             id: selectedProposal.trip.id,
             customer: { set: newContactId } 
          })
        }
      }
      
      // Refresh data to show new client info
      await refetch()
      setIsClientModalOpen(false)
      
      // Send WhatsApp
      console.log('Opening WhatsApp...')
      sendWhatsAppMessage(selectedProposal, clientFormData.name, clientFormData.phone)
      
    } catch (error: any) {
      console.error("Error saving client info:", error)
      toast({ title: "Error", description: "Failed to save client info: " + error.message, type: "error" })
    }
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

  const handleUpdateStatus = async (proposal: Proposal, status: string) => {
    if (!proposal.id) return
    
    await updateProposal({
      id: proposal.id,
      status
    })
  }

  const handleUpdateTripType = async (proposal: Proposal, tripType: string) => {
    if (!proposal.trip.id) return
    
    await updateTrip({
      id: proposal.trip.id,
      tripType
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
      case 'sent':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
      case 'accepted':
        return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
      case 'expired':
        return 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'leisure':
        return 'text-purple-700 bg-purple-50 border-purple-200'
      case 'family':
        return 'text-pink-700 bg-pink-50 border-pink-200'
      case 'luxury':
        return 'text-amber-700 bg-amber-50 border-amber-200'
      case 'business':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'group':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200'
      case 'honeymoon':
        return 'text-rose-700 bg-rose-50 border-rose-200'
      case 'adventure':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business': return <Briefcase className="w-3 h-3 mr-1" />
      case 'leisure': return <Palmtree className="w-3 h-3 mr-1" />
      case 'adventure': return <MapPin className="w-3 h-3 mr-1" />
      default: return <Plane className="w-3 h-3 mr-1" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
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

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading && proposals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 text-red-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <Button onClick={() => refetch()} variant="default">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Proposals</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/proposal')}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Proposal
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by client, destination, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-40">
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select value={filters.tripType || 'all'} onValueChange={(value) => handleFilterChange('tripType', value)}>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Trip Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="leisure">Leisure</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="honeymoon">Honeymoon</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 border-l pl-3 ml-1 border-gray-200">
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-auto bg-gray-50 border-gray-200"
                />
                <span className="text-gray-400 text-sm">-</span>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-auto bg-gray-50 border-gray-200"
                />
              </div>

              {(filters.status || filters.tripType || filters.dateFrom || filters.dateTo || searchTerm) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto lg:ml-0"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <p>Showing <span className="font-medium text-gray-900">{filteredProposals.length}</span> proposal{filteredProposals.length !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button 
              onClick={() => handleSort('updatedAt')}
              className="font-medium text-gray-900 flex items-center hover:underline"
            >
              Last Updated
              <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${sortField === 'updatedAt' && sortDirection === 'ASC' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Proposals Table */}
        <Card className="border shadow-sm overflow-hidden bg-white">
          {filteredProposals.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No proposals found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                We couldn't find any proposals matching your current filters. Try adjusting your search criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">
                      Proposal & Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                      Trip Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[5%]">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProposals.map((proposal) => (
                    <tr 
                      key={proposal.id} 
                      className="group hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => handleViewProposal(proposal)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-base">
                            {proposal.name}
                          </span>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded mr-2 border border-gray-200 font-medium">v{proposal.version}</span>
                            <span>{proposal.trip.customer?.name || 'No Client'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-medium text-gray-700">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {proposal.trip.days.length > 0 ? proposal.trip.days[0].city.name : proposal.trip.fromCity.name}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {formatDate(proposal.trip.startDate)}
                            <span className="mx-1.5">•</span>
                            {proposal.trip.durationDays} days
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {proposal.trip.totalTravelers} travelers
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`font-medium rounded-md px-2.5 py-0.5 border ${getTypeColor(proposal.trip.tripType)}`}>
                          {getTypeIcon(proposal.trip.tripType)}
                          <span className="capitalize">{proposal.trip.tripType}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(proposal.totalPriceCents, proposal.currency.code)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {proposal.currency.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`font-medium rounded-full px-2.5 capitalize shadow-none border ${getStatusColor(proposal.status)}`}>
                          {formatStatus(proposal.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDateTime(proposal.updatedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewProposal(proposal)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Proposal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendProposal(proposal)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send to Client
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadProposal(proposal)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Activity className="w-4 h-4 mr-2" />
                                Update Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(proposal, 'draft')}>Draft</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(proposal, 'sent')}>Sent</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(proposal, 'accepted')}>Accepted</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(proposal, 'rejected')}>Rejected</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(proposal, 'expired')}>Expired</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Update Type
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleUpdateTripType(proposal, 'leisure')}>Leisure</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateTripType(proposal, 'business')}>Business</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateTripType(proposal, 'group')}>Group</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateTripType(proposal, 'honeymoon')}>Honeymoon</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateTripType(proposal, 'adventure')}>Adventure</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProposal(proposal)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
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
          )}
        </Card>
      </main>

      {/* Proposal Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {selectedProposal?.name}
              {selectedProposal && (
                <Badge className={`text-sm font-medium capitalize border shadow-none ${getStatusColor(selectedProposal.status)}`}>
                  {formatStatus(selectedProposal.status)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-4">
              {/* Version History Sidebar */}
              <div className="lg:col-span-1 border-r pr-0 lg:pr-6 border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-primary" />
                  Version History
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {proposals
                    .filter(p => p.trip.id === selectedProposal.trip.id)
                    .sort((a, b) => (b.version || 0) - (a.version || 0))
                    .map((version) => (
                      <div 
                        key={version.id}
                        onClick={() => setSelectedProposal(version)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedProposal.id === version.id 
                            ? 'bg-primary/5 border-primary ring-1 ring-primary/20' 
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">Version {version.version}</span>
                          <Badge className={`text-[10px] h-5 px-1.5 capitalize shadow-none border ${getStatusColor(version.status)}`}>
                            {formatStatus(version.status)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {formatDateTime(version.updatedAt)}
                        </div>
                        <div className="text-xs font-semibold text-gray-900">
                          {formatCurrency(version.totalPriceCents, version.currency.code)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Top Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Value</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(selectedProposal.totalPriceCents, selectedProposal.currency.code)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Duration</div>
                  <div className="text-xl font-bold text-gray-900">{selectedProposal.trip.durationDays} Days</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Travelers</div>
                  <div className="text-xl font-bold text-gray-900">{selectedProposal.trip.totalTravelers}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Type</div>
                  <div className="text-xl font-bold text-gray-900 capitalize">{selectedProposal.trip.tripType}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Client Details
                  </h3>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    {selectedProposal.trip.customer ? (
                      <div className="space-y-3">
                        {selectedProposal.trip.customer.org && (
                          <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                            <span className="text-sm text-gray-500">Organization</span>
                            <span className="text-sm font-medium text-gray-900">{selectedProposal.trip.customer.org.name}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-sm text-gray-500">Name</span>
                          <span className="text-sm font-medium text-gray-900">{selectedProposal.trip.customer.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-sm text-gray-500">Email</span>
                          <span className="text-sm font-medium text-gray-900">{selectedProposal.trip.customer.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-sm text-gray-500">Phone</span>
                          <span className="text-sm font-medium text-gray-900">{selectedProposal.trip.customer.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-sm text-gray-500">Nationality</span>
                          <span className="text-sm font-medium text-gray-900">{selectedProposal.trip.customer.nationality || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No customer information available</p>
                    )}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Itinerary Overview
                  </h3>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-500">Booking Ref</span>
                        <span className="text-sm font-medium text-gray-900">{selectedProposal.trip.bookingReference || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-500">Origin</span>
                        <span className="text-sm font-medium text-gray-900">{selectedProposal.trip.fromCity.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-500">Dates</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedProposal.trip.startDate)} - {formatDate(selectedProposal.trip.endDate)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-500">Destinations</span>
                        <span className="text-sm font-medium text-gray-900 text-right">{selectedProposal.trip.days.map(d => d.city.name).join(', ')}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-500">Rating</span>
                        <div className="flex items-center text-amber-500">
                          <span className="text-sm font-medium text-gray-900 mr-1">{selectedProposal.trip.starRating}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-500">Created By</span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{selectedProposal.trip.createdBy.name}</div>
                          <div className="text-xs text-gray-500">{selectedProposal.trip.createdBy.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                  <div className="flex w-full gap-3 mb-3 md:mb-0 md:w-auto md:mr-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 md:flex-none h-11" disabled={isUpdatingProposal}>
                          {isUpdatingProposal ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          ) : (
                            <Activity className="w-4 h-4 mr-2" />
                          )}
                          {isUpdatingProposal ? 'Updating...' : 'Update Status'}
                          {!isUpdatingProposal && <ChevronDown className="w-4 h-4 ml-2 opacity-50" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedProposal, 'draft')}>Draft</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedProposal, 'sent')}>Sent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedProposal, 'accepted')}>Accepted</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedProposal, 'rejected')}>Rejected</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedProposal, 'expired')}>Expired</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 md:flex-none h-11" disabled={isUpdatingTrip}>
                          {isUpdatingTrip ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          {isUpdatingTrip ? 'Updating...' : 'Update Type'}
                          {!isUpdatingTrip && <ChevronDown className="w-4 h-4 ml-2 opacity-50" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUpdateTripType(selectedProposal, 'leisure')}>Leisure</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateTripType(selectedProposal, 'business')}>Business</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateTripType(selectedProposal, 'group')}>Group</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateTripType(selectedProposal, 'honeymoon')}>Honeymoon</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateTripType(selectedProposal, 'adventure')}>Adventure</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button
                    onClick={() => handleEditProposal(selectedProposal)}
                    className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white shadow-sm h-11"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleSendProposal(selectedProposal)}
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-sm h-11"
                    disabled={isUpdatingContact || isCreatingContact}
                  >
                    {isUpdatingContact || isCreatingContact ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="flex-1 md:flex-none h-11 px-6"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Client Info Modal */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send to Client</DialogTitle>
            <div className="text-sm text-gray-500">
              Please provide the client&apos;s contact details to send the proposal via WhatsApp.
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={clientFormData.name}
                onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                className="col-span-3"
                placeholder="Client Name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={clientFormData.phone}
                onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                className="col-span-3"
                placeholder="+1234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                className="col-span-3"
                placeholder="client@example.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsClientModalOpen(false)} disabled={isUpdatingContact || isCreatingContact}>
              Cancel
            </Button>
            <Button onClick={handleSaveClientAndSend} disabled={isUpdatingContact || isCreatingContact}>
              {isUpdatingContact || isCreatingContact ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving & Sending...
                </>
              ) : (
                'Save & Send WhatsApp'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
