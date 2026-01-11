import { useState, useEffect } from 'react'
import { apolloClient } from '@/lib/graphql/client'
import { TRANSFER_PRODUCT_QUERY } from '@/graphql/queries/transfers'
import { TransferProduct, TransferSelection } from '@/types/transfer'

interface UseTransferDetailsProps {
  transferProductId: string
  adults: number
  childrenCount: number
}

interface UseTransferDetailsReturn {
  transferProduct: TransferProduct | null
  loading: boolean
  error: string | null
  calculatePrice: (selection: Partial<TransferSelection>) => number
  validateSelection: (selection: TransferSelection) => string[]
}

export function useTransferDetails({ transferProductId, adults, childrenCount }: UseTransferDetailsProps): UseTransferDetailsReturn {
  const [transferProduct, setTransferProduct] = useState<TransferProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransferProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await apolloClient.query({
          query: TRANSFER_PRODUCT_QUERY,
          variables: { transferProductId },
          fetchPolicy: 'no-cache'
        })

        const tp = (result.data as any).transferProduct
        if (!tp) {
          throw new Error('Transfer product not found')
        }

        const transformed: TransferProduct = {
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
        }

        setTransferProduct(transformed)
      } catch (err) {
        console.error('Error fetching transfer product:', err)
        setError(err instanceof Error ? err.message : 'Failed to load transfer product')
      } finally {
        setLoading(false)
      }
    }

    if (transferProductId) {
      fetchTransferProduct()
    }
  }, [transferProductId])

  const calculatePrice = (selection: Partial<TransferSelection>): number => {
    if (!transferProduct) return 0

    const basePrice = transferProduct.priceCents / 100
    const totalPax = (selection.paxAdults || adults) + (selection.paxChildren || childrenCount)
    
    // Calculate number of vehicles needed
    const vehicleCapacity = transferProduct.vehicle.capacityAdults + transferProduct.vehicle.capacityChildren
    const vehiclesNeeded = Math.ceil(totalPax / vehicleCapacity)
    const vehiclesCount = selection.vehiclesCount || vehiclesNeeded

    // Total price = base price per vehicle * number of vehicles
    return basePrice * vehiclesCount
  }

  const validateSelection = (selection: TransferSelection): string[] => {
    const errors: string[] = []

    if (!selection.pickupTime) {
      errors.push('Pickup time is required')
    }

    if (!selection.pickupLocation || selection.pickupLocation.trim() === '') {
      errors.push('Pickup location is required')
    }

    if (!selection.dropoffLocation || selection.dropoffLocation.trim() === '') {
      errors.push('Dropoff location is required')
    }

    if (!selection.paxAdults || selection.paxAdults < 1) {
      errors.push('At least 1 adult is required')
    }

    const vehicleCapacity = (transferProduct?.vehicle.capacityAdults || 0) + (transferProduct?.vehicle.capacityChildren || 0)
    if (selection.paxAdults + (selection.paxChildren || 0) > vehicleCapacity) {
      const totalCapacity = vehicleCapacity
      errors.push(`Total passengers (${selection.paxAdults + (selection.paxChildren || 0)}) exceeds vehicle capacity (${totalCapacity}). You may need multiple vehicles.`)
    }

    if (!selection.currency) {
      errors.push('Currency is required')
    }

    return errors
  }

  return {
    transferProduct,
    loading,
    error,
    calculatePrice,
    validateSelection
  }
}

