import { GraphQLActivity } from '@/graphql/queries/activities'
import { Activity, Extra, ScheduleSlot, PickupOption } from '@/types/activity'

/**
 * Transform GraphQL activity response to the existing Activity type format
 * This ensures compatibility with the existing UI components
 */
export function transformGraphQLActivityToActivity(graphqlActivity: GraphQLActivity): Activity {
  // Transform activity options to schedule slots
  const availability: ScheduleSlot[] = graphqlActivity.activityOptions.map((option, index) => ({
    id: option.id,
    startTime: option.startTime,
    durationMins: option.durationMinutes,
    type: getTimeSlotType(option.startTime, option.endTime),
    available: option.isAvailable,
    maxPax: option.maxParticipants,
    currentBookings: 0 // Not available in GraphQL response, default to 0
  }))

  // Transform activity addons to extras
  const extras: Extra[] = graphqlActivity.activityAddons.map((addon) => ({
    id: addon.id,
    label: addon.name,
    price: addon.priceCents / 100, // Convert cents to currency units
    priceType: 'per_person' as const, // Default assumption
    description: addon.description,
    required: false, // Default assumption
    category: 'General' // Default category
  }))

  // Create pickup options from activity data
  const pickupOptions: PickupOption[] = [
    {
      id: 'pickup-1',
      label: 'Hotel Pickup',
      price: 0, // Default, could be enhanced with actual pickup pricing
      description: 'Pickup from your hotel',
      type: 'hotel',
      locations: [graphqlActivity.city.name]
    },
    {
      id: 'pickup-2',
      label: 'Meeting Point',
      price: 0,
      description: 'Meet at designated meeting point',
      type: 'meeting_point',
      locations: [graphqlActivity.city.name]
    }
  ]

  // Get the first activity option for base pricing
  const firstOption = graphqlActivity.activityOptions[0]
  const basePrice = firstOption ? firstOption.priceCents / 100 : 0

  // Transform activity images
  const images = graphqlActivity.activityImages
    .sort((a, b) => a.priorityOrder - b.priorityOrder)
    .map(img => img.url)

  // Get categories from activity category maps
  const category = graphqlActivity.activityCategoryMaps.map(map => map.category.name)

  // Create tags from highlights and existing tags
  const tags = [
    ...graphqlActivity.tags,
    ...graphqlActivity.highlights
  ].filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates

  return {
    id: graphqlActivity.id,
    title: graphqlActivity.title,
    shortDesc: graphqlActivity.summary || graphqlActivity.description.substring(0, 150) + '...',
    longDesc: graphqlActivity.description,
    durationMins: graphqlActivity.durationMinutes,
    availability,
    basePrice,
    pricingType: 'person' as const, // Default assumption
    category,
    tags,
    images,
    rating: parseFloat(graphqlActivity.rating),
    reviewsCount: 0, // Not available in GraphQL response, default to 0
    extras,
    location: `${graphqlActivity.city.name}, ${graphqlActivity.city.country.name}`,
    pickupOptions,
    cancellationPolicy: graphqlActivity.cancellationPolicy || 'Standard cancellation policy applies',
    minPax: firstOption?.maxParticipants || 1,
    maxPax: firstOption?.maxParticipants || 20,
    difficulty: 'Moderate' as const, // Default assumption, could be enhanced
    included: firstOption?.inclusions ? firstOption.inclusions.split(',').map(item => item.trim()) : [],
    excluded: firstOption?.exclusions ? firstOption.exclusions.split(',').map(item => item.trim()) : [],
    whatToBring: [], // Not available in GraphQL response
    meetingPoint: `${graphqlActivity.city.name} City Center`, // Default assumption
    provider: graphqlActivity.supplier.name,
    instantConfirmation: graphqlActivity.instantBooking,
    mobileTicket: true, // Default assumption
    freeCancellation: true, // Default assumption
    cancellationHours: 24 // Default assumption
  }
}

/**
 * Determine time slot type based on start and end times
 */
function getTimeSlotType(startTime: string, endTime: string): 'morning' | 'afternoon' | 'evening' | 'full-day' {
  const startHour = parseInt(startTime.split(':')[0])
  const endHour = parseInt(endTime.split(':')[0])
  const duration = endHour - startHour

  if (duration >= 8) {
    return 'full-day'
  } else if (startHour < 12) {
    return 'morning'
  } else if (startHour < 17) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}

/**
 * Transform multiple GraphQL activities to Activity array
 */
export function transformGraphQLActivitiesToActivities(graphqlActivities: GraphQLActivity[]): Activity[] {
  return graphqlActivities.map(transformGraphQLActivityToActivity)
}
