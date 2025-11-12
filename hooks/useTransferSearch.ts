import { useState, useEffect, useCallback } from 'react'
import { TransferProduct, TransferSearchParams, TransferFilters } from '@/types/transfer'
import { apolloClient } from '@/lib/graphql/client'
import { TRANSFER_PRODUCTS_QUERY, TransferProductFilter, TransferProductOrder } from '@/graphql/queries/transfers'

interface UseTransferSearchProps {
  params: TransferSearchParams
  enabled?: boolean // Only run queries when enabled is true
}

interface UseTransferSearchReturn {
  results: TransferProduct[]
  loading: boolean
  error: string | null
  hasMore: boolean
  total: number
  page: number
  filters: {
    vehicleTypes: string[]
    cities: string[]
  }
  fetchNextPage: () => void
  setFilters: (filters: TransferFilters) => void
  resetFilters: () => void
}

export function useTransferSearch({ params, enabled = true }: UseTransferSearchProps): UseTransferSearchReturn {
  const [results, setResults] = useState<TransferProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFiltersState] = useState<TransferFilters>({
    query: '',
    cityId: undefined,
    vehicleType: [],
    priceRange: [0, 1000000],
    sort: 'recommended'
  })

  // Extract available filters from current results
  const availableFilters = {
    vehicleTypes: results.length > 0 
      ? Array.from(new Set(results.map(transfer => transfer.vehicle.type)))
      : [],
    cities: results.length > 0
      ? Array.from(new Set(results.map(transfer => transfer.city.name)))
      : [],
  }

  // GraphQL implementation for transfer product search
  const searchTransfers = useCallback(async (searchParams: TransferSearchParams, pageNum: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Convert search parameters to GraphQL filter format
      const filters: TransferProductFilter = {
        searchTransferProducts: searchParams.query || null,
        ...(searchParams.cityId ? {
          AND: {
            city: {
              id: {
                exact: searchParams.cityId
              }
            }
          }
        } : {})
      }

      // Convert sort parameter to GraphQL order format
      const order: TransferProductOrder = {}
      if (searchParams.sort === 'price_asc') {
        order.priceCents = 'ASC'
      } else if (searchParams.sort === 'price_desc') {
        order.priceCents = 'DESC'
      } else if (searchParams.sort === 'name') {
        order.name = 'ASC'
      } else {
        // Default to name for 'recommended'
        order.name = 'ASC'
      }

      // Make GraphQL request
      const result = await apolloClient.query({
        query: TRANSFER_PRODUCTS_QUERY,
        variables: { filters, order },
        fetchPolicy: 'no-cache'
      })

      // Check if response is null or empty
      const transferProductsData = result.data?.transferProducts
      if (!transferProductsData || !Array.isArray(transferProductsData)) {
        console.warn('Transfer products query returned null or empty:', result.data)
        setResults([])
        setTotal(0)
        setHasMore(false)
        setLoading(false)
        return
      }

      // Transform GraphQL response to TransferProduct format
      const transferProducts = transferProductsData.map((tp: any) => ({
        id: tp.id,
        name: tp.name || 'Transfer',
        description: tp.description || '',
        city: {
          id: tp.city.id,
          name: tp.city.name,
          country: {
            iso2: tp.city.country.iso2,
            name: tp.city.country.name
          }
        },
        vehicle: {
          id: tp.vehicle.id,
          type: tp.vehicle.type || '',
          name: tp.vehicle.name || '',
          capacityAdults: tp.vehicle.capacityAdults || 0,
          capacityChildren: tp.vehicle.capacityChildren || 0,
          amenities: tp.vehicle.amenities || {}
        },
        supplier: {
          id: tp.supplier.id,
          name: tp.supplier.name || ''
        },
        currency: {
          code: tp.currency.code,
          name: tp.currency.name
        },
        priceCents: tp.priceCents || 0,
        cancellationPolicy: tp.cancellationPolicy,
        commissionRate: tp.commissionRate || 0
      }))
      
      // Apply additional client-side filtering
      let filteredTransfers = [...transferProducts]
      
      // Filter by vehicle type
      if (searchParams.vehicleType && searchParams.vehicleType.length > 0) {
        filteredTransfers = filteredTransfers.filter(transfer =>
          searchParams.vehicleType!.includes(transfer.vehicle.type)
        )
      }
      
      // Filter by price range
      if (searchParams.priceRange) {
        const [minPrice, maxPrice] = searchParams.priceRange
        filteredTransfers = filteredTransfers.filter(transfer =>
          transfer.priceCents >= minPrice && transfer.priceCents <= maxPrice
        )
      }
      
      // Apply sorting
      switch (searchParams.sort) {
        case 'price_asc':
          filteredTransfers.sort((a, b) => a.priceCents - b.priceCents)
          break
        case 'price_desc':
          filteredTransfers.sort((a, b) => b.priceCents - a.priceCents)
          break
        case 'name':
          filteredTransfers.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'recommended':
        default:
          // Keep original order
          break
      }
      
      // Apply pagination
      const limit = searchParams.limit || 10
      const startIndex = (pageNum - 1) * limit
      const endIndex = startIndex + limit
      const paginatedResults = filteredTransfers.slice(startIndex, endIndex)
      
      const hasMoreResults = endIndex < filteredTransfers.length
      
      if (pageNum === 1) {
        setResults(paginatedResults)
      } else {
        setResults(prev => [...prev, ...paginatedResults])
      }
      
      setTotal(filteredTransfers.length)
      setPage(pageNum)
      setHasMore(hasMoreResults)
      
    } catch (err) {
      console.error('GraphQL transfer search failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to search transfers')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchNextPage = useCallback(() => {
    if (!loading && hasMore) {
      searchTransfers(params, page + 1)
    }
  }, [searchTransfers, params, page, loading, hasMore])

  const setFilters = useCallback((newFilters: TransferFilters) => {
    setFiltersState(newFilters)
    setPage(1)
    
    const searchParams: TransferSearchParams = {
      query: newFilters.query,
      cityId: newFilters.cityId,
      vehicleType: newFilters.vehicleType,
      priceRange: newFilters.priceRange,
      sort: newFilters.sort
    }
    
    searchTransfers(searchParams, 1)
  }, [searchTransfers])

  const resetFilters = useCallback(() => {
    const defaultFilters: TransferFilters = {
      query: '',
      cityId: undefined,
      vehicleType: [],
      priceRange: [0, 1000000],
      sort: 'recommended'
    }
    
    setFilters(defaultFilters)
  }, [setFilters])

  // Only search when params actually change and when enabled
  // Compute stable keys for array dependencies
  const vehicleTypeKey = params.vehicleType?.join(',') || ''
  const priceRangeKey = params.priceRange?.join(',') || ''
  
  useEffect(() => {
    if (enabled) {
      searchTransfers(params, 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, params.query, params.cityId, vehicleTypeKey, priceRangeKey, params.sort])

  return {
    results,
    loading,
    error,
    hasMore,
    total,
    page,
    filters: availableFilters,
    fetchNextPage,
    setFilters,
    resetFilters
  }
}

