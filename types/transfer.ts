export interface TransferProduct {
  id: string
  name: string
  description: string
  city: {
    id: string
    name: string
    country: {
      iso2: string
      name: string
    }
  }
  vehicle: {
    id: string
    type: string
    name: string
    capacityAdults: number
    capacityChildren: number
    amenities: any
  }
  supplier: {
    id: string
    name: string
  }
  currency: {
    code: string
    name: string
  }
  priceCents: number
  cancellationPolicy: string | null
  commissionRate: number
}

export interface Transfer {
  id: string
  tripDay: {
    id: string
    dayNumber: number
    date: string
  }
  transferProduct: TransferProduct
  pickupTime: string
  pickupLocation: string | null
  dropoffLocation: string | null
  vehiclesCount: number | null
  paxAdults: number
  paxChildren: number
  currency: {
    code: string
    name: string
  }
  priceTotalCents: number | null
  confirmationStatus: string
}

export interface TransferSelection {
  transferProduct: TransferProduct
  pickupTime: string
  pickupLocation: string
  dropoffLocation: string
  vehiclesCount: number
  paxAdults: number
  paxChildren: number
  currency: string
  priceTotalCents: number
  confirmationStatus: string
  totalPrice: number
}

export interface TransferSearchParams {
  query?: string
  cityId?: string
  vehicleType?: string[]
  priceRange?: [number, number]
  page?: number
  limit?: number
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'name'
}

export interface TransferFilters {
  query: string
  cityId?: string
  vehicleType: string[]
  priceRange: [number, number]
  sort: 'recommended' | 'price_asc' | 'price_desc' | 'name'
}

export interface TransferExplorerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTransfer: (transferProduct: TransferProduct, selection: TransferSelection) => void
  dayId: string
  currentTransfer?: TransferProduct
  mode?: 'add' | 'change'
}

export interface TransferDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transferProductId: string
  onAddToPackage: (transferProduct: TransferProduct, selection: TransferSelection, bookingIdToDelete?: string) => void
  dayId: string
  adults: number
  childrenCount: number
  isEditMode?: boolean
  currentBookingId?: string
  currentSelection?: Partial<TransferSelection>
}

export interface TransferCardProps {
  transferProduct: TransferProduct
  onSelect: (transferProduct: TransferProduct) => void
  onViewDetails: (transferProduct: TransferProduct) => void
  isSelected?: boolean
  viewMode: 'list' | 'grid'
  className?: string
}

export interface TransferListProps {
  transfers: TransferProduct[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onSelectTransfer: (transferProduct: TransferProduct) => void
  onViewDetails: (transferProduct: TransferProduct) => void
  selectedTransferId?: string
  viewMode: 'list' | 'grid'
  className?: string
}

