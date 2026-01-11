'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Grid, List, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransferExplorerModalProps, TransferFilters, TransferSelection, TransferProduct } from '@/types/transfer'
import { useTransferSearch } from '@/hooks/useTransferSearch'
import TransferList from './TransferList'
import TransferDetailsModal from './TransferDetailsModal'
import CitySearchDropdown from '@/components/activities/CitySearchDropdown'

export default function TransferExplorerModal({
  isOpen,
  onClose,
  onSelectTransfer,
  dayId,
  currentTransfer,
  mode = 'add'
}: TransferExplorerModalProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedTransferId, setSelectedTransferId] = useState<string | undefined>(
    currentTransfer?.id
  )
  const [showFilters, setShowFilters] = useState(false)
  const [showTransferDetails, setShowTransferDetails] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<TransferProduct | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(undefined)
  const [selectedCityName, setSelectedCityName] = useState('')

  const [filters, setFilters] = useState<TransferFilters>({
    query: '',
    cityId: undefined,
    vehicleType: [],
    priceRange: [0, 1000000],
    sort: 'recommended'
  })

  // Memoize params to prevent infinite loops
  const vehicleTypeKey = useMemo(() => filters.vehicleType?.join(',') || '', [filters.vehicleType])
  const priceRangeKey = useMemo(() => filters.priceRange?.join(',') || '', [filters.priceRange])
  
  const searchParams = useMemo(() => ({
    query: filters.query,
    cityId: filters.cityId,
    vehicleType: filters.vehicleType,
    priceRange: filters.priceRange,
    sort: filters.sort
  }), [filters.query, filters.cityId, vehicleTypeKey, priceRangeKey, filters.sort])

  const {
    results,
    loading,
    error,
    hasMore,
    total,
    filters: availableFilters,
    fetchNextPage,
    setFilters: updateFilters,
    resetFilters
  } = useTransferSearch({ 
    params: searchParams,
    enabled: isOpen // Only run the query when modal is open
  })

  const handleSelectTransfer = (transfer: TransferProduct) => {
    setSelectedTransferId(transfer.id)
    // For quick selection, use default values
    const selection: TransferSelection = {
      transferProduct: transfer,
      pickupTime: '09:00:00',
      pickupLocation: '',
      dropoffLocation: '',
      vehiclesCount: 1,
      paxAdults: 2,
      paxChildren: 0,
      currency: transfer.currency.code,
      priceTotalCents: transfer.priceCents,
      confirmationStatus: 'pending',
      totalPrice: transfer.priceCents / 100
    }
    
    onSelectTransfer(transfer, selection)
  }

  const handleViewDetails = (transfer: TransferProduct) => {
    setSelectedTransfer(transfer)
    setShowTransferDetails(true)
  }

  const handleFiltersChange = (newFilters: TransferFilters) => {
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const handleResetFilters = () => {
    const defaultFilters: TransferFilters = {
      query: '',
      cityId: undefined,
      vehicleType: [],
      priceRange: [0, 1000000],
      sort: 'recommended'
    }
    setFilters(defaultFilters)
    setSelectedCityId(undefined)
    setSelectedCityName('')
    resetFilters()
  }

  const handleCityChange = (name: string, cityId?: string) => {
    setSelectedCityName(name)
    setSelectedCityId(cityId)
    const newFilters = { ...filters, cityId }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length
    }
    if (typeof value === 'string' && value !== '') {
      return count + 1
    }
    if (typeof value === 'number' && value > 0) {
      return count + 1
    }
    return count
  }, 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full h-[95vh] max-w-[95vw] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'add' ? 'Add Transfer' : 'Change Transfer'}
                </h2>
                <p className="text-sm text-gray-600">
                  {total > 0 ? `${total} transfers found` : 'Search for transfers to add to your itinerary'}
                </p>
              </div>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-brand/10 text-brand">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full bg-brand text-white text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 min-h-0">
            {/* Desktop: Left Panel - Filters */}
            <div className="hidden md:block w-80 border-r bg-gray-50 overflow-y-auto flex-shrink-0 scrollbar-hide">
              <div className="p-4 space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search</label>
                  <Input
                    placeholder="Search transfers..."
                    value={filters.query}
                    onChange={(e) => {
                      const newFilters = { ...filters, query: e.target.value }
                      handleFiltersChange(newFilters)
                    }}
                    className="w-full"
                  />
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <CitySearchDropdown
                    value={selectedCityName}
                    onChange={handleCityChange}
                    placeholder="Select city..."
                  />
                </div>

                {/* Vehicle Type Filter */}
                {availableFilters.vehicleTypes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                    <div className="space-y-2">
                      {availableFilters.vehicleTypes.map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.vehicleType.includes(type)}
                            onChange={(e) => {
                              const newVehicleTypes = e.target.checked
                                ? [...filters.vehicleType, type]
                                : filters.vehicleType.filter(t => t !== type)
                              handleFiltersChange({ ...filters, vehicleType: newVehicleTypes })
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <Select
                    value={filters.sort}
                    onValueChange={(value: any) => {
                      handleFiltersChange({ ...filters, sort: value })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile: Filters Overlay */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  className="md:hidden absolute inset-0 z-10 bg-white"
                >
                  <div className="p-4 h-full overflow-y-auto scrollbar-hide">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Same filter content as desktop */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Panel - Results */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 flex-1 flex flex-col min-h-0">
                <TransferList
                  transfers={results}
                  loading={loading}
                  error={error}
                  hasMore={hasMore}
                  onLoadMore={fetchNextPage}
                  onSelectTransfer={handleSelectTransfer}
                  onViewDetails={handleViewDetails}
                  selectedTransferId={selectedTransferId}
                  viewMode={viewMode}
                  className="flex-1 min-h-0"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <TransferDetailsModal
          isOpen={showTransferDetails}
          onClose={() => {
            setShowTransferDetails(false)
            setSelectedTransfer(null)
          }}
          transferProductId={selectedTransfer.id}
          onAddToPackage={(transferProduct, selection) => {
            onSelectTransfer(transferProduct, selection)
            setShowTransferDetails(false)
            setSelectedTransfer(null)
          }}
          dayId={dayId}
          adults={2}
          childrenCount={0}
        />
      )}
    </AnimatePresence>
  )
}

