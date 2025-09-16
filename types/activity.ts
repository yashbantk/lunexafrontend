export interface Activity {
  id: string
  title: string
  shortDesc: string
  longDesc: string
  durationMins: number
  availability: ScheduleSlot[]
  basePrice: number
  pricingType: 'person' | 'activity'
  category: string[]
  tags: string[]
  images: string[]
  rating: number
  reviewsCount: number
  extras: Extra[]
  location: string
  pickupOptions: PickupOption[]
  cancellationPolicy: string
  minPax: number
  maxPax: number
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  included: string[]
  excluded: string[]
  whatToBring: string[]
  meetingPoint: string
  provider: string
  instantConfirmation: boolean
  mobileTicket: boolean
  freeCancellation: boolean
  cancellationHours: number
}

export interface Extra {
  id: string
  label: string
  price: number
  priceType: 'per_person' | 'flat'
  description: string
  required: boolean
  category: string
}

export interface ScheduleSlot {
  id: string
  startTime: string
  durationMins: number
  type: 'morning' | 'afternoon' | 'evening' | 'full-day'
  available: boolean
  maxPax: number
  currentBookings: number
}

export interface PickupOption {
  id: string
  label: string
  price: number
  description: string
  type: 'hotel' | 'meeting_point' | 'no_pickup'
  locations?: string[]
}

export interface ActivitySearchParams {
  query?: string
  category?: string[]
  timeOfDay?: string[]
  duration?: [number, number]
  priceRange?: [number, number]
  difficulty?: string[]
  rating?: number
  location?: string
  page?: number
  limit?: number
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'duration' | 'popularity'
}

export interface ActivitySearchResult {
  results: Activity[]
  total: number
  page: number
  limit: number
  nextPage?: number
  hasMore: boolean
  filters: {
    categories: string[]
    timeOfDay: string[]
    difficulties: string[]
    locations: string[]
  }
}

export interface ActivityFilters {
  query: string
  category: string[]
  timeOfDay: string[]
  duration: [number, number]
  priceRange: [number, number]
  difficulty: string[]
  rating: number
  location: string
  sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'duration' | 'popularity'
}

export interface ActivityExplorerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectActivity: (activity: Activity, selection: ActivitySelection) => void
  dayId: string
  currentActivity?: Activity
  mode?: 'add' | 'change'
}

export interface ActivityDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  activityId: string
  onAddToPackage: (activity: Activity, selection: ActivitySelection) => void
  dayId: string
  checkIn: string
  checkOut: string
  adults: number
  childrenCount: number
}

export interface ActivitySelection {
  activity: Activity
  scheduleSlot: ScheduleSlot
  adults: number
  childrenCount: number
  extras: Extra[]
  pickupOption: PickupOption
  notes?: string
  totalPrice: number
}

export interface ExtrasListProps {
  extras: Extra[]
  selectedExtras: Extra[]
  onExtrasChange: (extras: Extra[]) => void
  adults: number
  childrenCount: number
  className?: string
}

export interface ActivityCardProps {
  activity: Activity
  onSelect: (activity: Activity) => void
  onViewDetails: (activity: Activity) => void
  isSelected?: boolean
  viewMode: 'list' | 'grid'
  className?: string
}

export interface ActivityListProps {
  activities: Activity[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onSelectActivity: (activity: Activity) => void
  onViewDetails: (activity: Activity) => void
  selectedActivityId?: string
  viewMode: 'list' | 'grid'
  className?: string
}

export interface FiltersPanelProps {
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
  onReset: () => void
  availableFilters: {
    categories: string[]
    timeOfDay: string[]
    difficulties: string[]
    locations: string[]
  }
  className?: string
}
