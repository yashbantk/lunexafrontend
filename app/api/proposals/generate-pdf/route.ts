import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { print } from 'graphql'
import { gql } from '@apollo/client'
import { ServerCookieStorage } from '@/lib/auth/cookie-storage'

// GraphQL query for proposal details (same as GET_PROPOSAL_DETAILS)
const GET_PROPOSAL_DETAILS_QUERY = gql`
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      id
      version
      name
      totalPriceCents
      estimatedDateOfBooking
      areFlightsBooked
      flightsMarkup
      landMarkup
      landMarkupType
      createdAt
      updatedAt
      status
      currency {
        code
        name
      }
      trip {
        id
        status
        tripType
        totalTravelers
        starRating
        transferOnly
        landOnly
        travelerDetails
        markupFlightPercent
        markupLandPercent
        bookingReference
        startDate
        endDate
        durationDays
        org {
          id
          name
          billingEmail
          logoUrl
          address
          phone
          email
          website
          taxNumber
          taxRate
        }
        createdBy {
          id
          email
          firstName
          lastName
          name
          countryCode
          phone
          profileImageUrl
        }
        customer {
          id
          name
          email
          phone
          nationality
        }
        fromCity {
          id
          name
          country {
            iso2
            name
          }
        }  
        nationality {
          iso2
          name
        }
        days {
          id
          dayNumber
          date
          city {
            id
            name
          }
          stay {
            id
            room {
              id
              hotel {
                id
                name
                address
                type
                description
                locationUrl
                star
                totalRatings
                cancellationPolicy
                instantBooking
                cleanilessRating
                serviceRating
                comfortRating
                conditionRating
                amenitesRating
                neighborhoodRating
                amenities
                instructions
                policy
                inclusions
                exclusions
                tags
                commissionRate
              }
              name
              priceCents
              bedType
              baseMealPlan
              hotelRoomImages {
                id
                url
                caption
                priorityOrder
              }
              roomAmenities {
                id
                name
                description
              }
              maxOccupancy
              size
              sizeUnit
              details
              amenities
              tags
              inclusions
              exclusions
            }
            checkIn
            checkOut
            nights
            roomsCount
            mealPlan
            priceTotalCents
            confirmationStatus
          }
          activityBookings {
            id
            slot
            option {
              id
              activity {
                id
                title
                summary
                description
                rating
                durationMinutes
                startTime
                highlights
                cancellationPolicy
                slot
                tags
                instantBooking
                commissionRate
                activityImages {
                  id
                  url
                  caption
                  priorityOrder
                  createdAt
                  updatedAt
                }
                activityAddons {
                  id
                  name
                  description
                  priceCents
                }
                activityCategoryMaps {
                  id
                  category {
                    id
                    name
                  }
                }
              }
              name
              mealPlan {
                id
                name
                mealPlanType
                mealValue
                vegType
                description
              }
              priceCents
              priceCentsChild
              durationMinutes
              maxParticipants
              maxParticipantsChild
              isRefundable
              isRecommended
              isAvailable
              refundPolicy
              cancellationPolicy
              notes
              startTime
              endTime
              inclusions
              exclusions
              season {
                id
                name
                startDate
                endDate
              }
            }
            paxAdults
            paxChildren
            priceBaseCents
            priceAddonsCents
            pickupRequired
            pickupHotel {
              id
              name
              address
            }
            confirmationStatus
          }
        }
      }
    }
  }
`

// GraphQL endpoint
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://f49b62996ffc.ngrok-free.app/graphql-apollo/'

// Helper to escape HTML
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Format currency
function formatCurrency(cents: number, currencyCode: string = 'INR'): string {
  const amount = cents / 100
  if (currencyCode === 'INR') {
    return `₹ ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  return `${currencyCode} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

// Fetch proposal data
async function fetchProposalData(proposalId: string, authToken?: string) {
  try {
    console.log('Fetching proposal data:', { proposalId, hasToken: !!authToken, graphqlUrl: GRAPHQL_URL })
    
    const client = new GraphQLClient(GRAPHQL_URL, {
      headers: authToken ? {
        authorization: `Bearer ${authToken}`,
        'ngrok-skip-browser-warning': 'true'
      } : {
        'ngrok-skip-browser-warning': 'true'
      }
    })

    const query = print(GET_PROPOSAL_DETAILS_QUERY)
    console.log('Executing GraphQL query for proposal:', proposalId)
    
    const data = await client.request<{ proposal: any }>(query, { proposalId })
    
    if (!data || !data.proposal) {
      console.error('❌ GraphQL returned null or no proposal')
      return null
    }
    
    console.log('✅ Proposal fetched successfully:', {
      id: data.proposal.id,
      name: data.proposal.name,
      hasTrip: !!data.proposal.trip,
      daysCount: data.proposal.trip?.days?.length || 0
    })
    
    return data.proposal
  } catch (error: any) {
    console.error('❌ Error fetching proposal:', error)
    console.error('Error details:', {
      message: error?.message,
      response: error?.response,
      stack: error?.stack
    })
    return null
  }
}

// Get activity icon based on slot
function getActivitySlotIconForDetails(slot: string): string {
  if (slot === 'morning') {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-orange-500">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
    </svg>`
  } else if (slot === 'afternoon') {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-yellow-500">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
    </svg>`
  } else {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-purple-500">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
    </svg>`
  }
}

// Generate Day-Wise Details page HTML
function generateDayWiseDetailsPage(day: any, proposal: any): string {
  if (!day.stay || !day.stay.room) {
    return ''
  }

  const stay = day.stay
  const room = stay.room
  const hotel = room.hotel
  
  const checkInDate = new Date(stay.checkIn)
  const checkOutDate = new Date(stay.checkOut)
  
  const dayDate = new Date(day.date)
  const formattedDate = formatDate(day.date)

  const checkInFormatted = `${formatTime(stay.checkIn)} ${formatDateShort(stay.checkIn)}`
  const checkOutFormatted = `${formatTime(stay.checkOut)} ${formatDateShort(stay.checkOut)}`

  const hotelImageUrl = room.hotelRoomImages?.[0]?.url || ''
  
  // Handle room inclusions - ensure it's always an array
  let roomInclusions: string[] = []
  if (room.inclusions) {
    if (Array.isArray(room.inclusions)) {
      roomInclusions = room.inclusions
    } else if (typeof room.inclusions === 'string') {
      // If it's a string, try to split by newlines or commas
      roomInclusions = room.inclusions.split(/\n|,/).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
    }
  }
  
  const sizeText = room.size && room.sizeUnit ? `${room.size} ${room.sizeUnit}` : ''
  const mealPlanText = stay.mealPlan || 'Breakfast'

  const destinationName = day.city?.name || proposal.trip?.days?.[0]?.city?.name || 'Destination'
  const totalNights = proposal.trip?.days?.reduce((acc: number, d: any) => acc + (d.stay?.nights || 0), 0) || stay.nights || 1

  return `
    <!-- Day-Wise Details Page -->
        <div class="max-w-4xl mx-auto p-4 print:p-0 mb-6">
        <!-- Header -->
        <header class="mb-4 print:mb-3">
            <div class="flex items-start justify-between mb-3">
                <p class="text-blue-600 text-sm font-medium">Day Wise Details</p>
                <div class="text-sm text-gray-600 font-medium">${formattedDate}</div>
                </div>
            <div class="flex items-start justify-between">
                <h1 class="text-3xl font-bold text-gray-800" style="font-family: 'Playfair Display', serif;">
                    Day ${day.dayNumber}
                </h1>
            </div>
        </header>

        <!-- Subsection Title -->
        <div class="mb-3">
            <h2 class="text-lg font-semibold text-gray-800">Hotel at ${destinationName}</h2>
                </div>
                
        <!-- Hotel Card Section -->
        <section class="bg-white rounded-xl shadow-md overflow-hidden mb-4 print:shadow-none print:rounded-none allow-break">
            <div class="flex flex-col md:flex-row">
                <!-- Hotel Image -->
                <figure class="md:w-64 flex-shrink-0">
                    <div class="w-full h-48 md:h-full bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden rounded-l-xl print:rounded-none">
                        ${hotelImageUrl ? 
                          `<img src="${hotelImageUrl}" alt="${escapeHtml(hotel?.name || 'Hotel')}" class="w-full h-full object-cover" />` :
                          `<div class="absolute inset-0 bg-gray-300 opacity-30"></div>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-blue-400">
                              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" fill="currentColor"/>
                    </svg>
                          </div>`
                        }
                </div>
                </figure>

                <!-- Hotel Details -->
                <div class="flex-1 p-4">
                    <div class="mb-2">
                        <span class="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium mb-2">
                            Hotel
                        </span>
                        <h3 class="text-lg font-bold text-gray-800 mt-2">
                            ${escapeHtml(hotel?.name || 'Hotel Name')}
                        </h3>
            </div>

                    <!-- Location -->
                    ${hotel?.address ? `
                    <div class="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        <span>${escapeHtml(hotel.address)}</span>
                                </div>
                    ` : ''}

                    <!-- Check-in/Check-out Times -->
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="flex items-start space-x-2">
                            <div class="flex-shrink-0 mt-0.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-gray-500">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div>
                                <div class="text-gray-500 text-xs mb-1">Check-in</div>
                                <div class="text-gray-800 font-medium">${checkInFormatted}</div>
                                </div>
                            </div>
                        <div class="flex items-start space-x-2">
                            <div class="flex-shrink-0 mt-0.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-gray-500">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                                </svg>
                                </div>
                            <div>
                                <div class="text-gray-500 text-xs mb-1">Check-out</div>
                                <div class="text-gray-800 font-medium">${checkOutFormatted}</div>
                            </div>
                                </div>
                            </div>
                        </div>
                    </div>
        </section>

        <!-- Room Details Section -->
        <section class="bg-white rounded-xl shadow-md p-4 mb-4 print:shadow-none print:rounded-none allow-break">
            <div class="flex items-start justify-between mb-3">
                <h3 class="text-base font-semibold text-gray-800">
                    ${escapeHtml(room.name)}${stay.roomsCount > 1 ? ` x ${stay.roomsCount}` : ''}
                </h3>
                <div class="flex space-x-2">
                    ${mealPlanText ? `
                    <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        ${escapeHtml(mealPlanText)}
                    </span>
                    ` : ''}
                    ${sizeText ? `
                    <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        ${sizeText}
                    </span>
                    ` : ''}
                    </div>
                </div>

            <!-- Room Inclusions -->
            ${roomInclusions.length > 0 ? `
            <div class="mt-3">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Room Inclusions</h4>
                <div class="space-y-1.5 pl-2">
                    ${roomInclusions.map((inclusion: string) => `
                    <div class="flex items-start space-x-2">
                        <div class="flex-shrink-0 mt-1.5">
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" class="text-gray-700">
                                <circle cx="3" cy="3" r="3" fill="currentColor"/>
                            </svg>
                            </div>
                        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(inclusion)}</p>
                        </div>
                    `).join('')}
                    </div>
            </div>
            ` : ''}
        </section>

        <!-- Activities Section -->
        ${day.activityBookings && day.activityBookings.length > 0 ? `
        <section class="bg-white rounded-xl shadow-md p-4 mb-4 print:shadow-none print:rounded-none allow-break">
            ${day.activityBookings.map((activity: any, actIndex: number) => {
              const activityTitle = activity.option?.activity?.title || activity.option?.name || 'Activity'
              const activityDescription = activity.option?.activity?.description || activity.option?.activity?.summary || ''
              const startTime = activity.option?.startTime || activity.option?.activity?.startTime || ''
              const durationMinutes = activity.option?.durationMinutes || activity.option?.activity?.durationMinutes || 60
              const durationHours = Math.round(durationMinutes / 60 * 10) / 10 || 1 // Convert to hours, round to 1 decimal
              const slot = activity.slot || activity.option?.slot || 'morning'
              const activityCity = day.city?.name || ''
              
              // Get activity image
              const activityImages = activity.option?.activity?.activityImages || []
              const primaryImage = activityImages.length > 0 ? activityImages[0] : null
              
              // Handle inclusions/exclusions
              let inclusions: string[] = []
              if (activity.option?.inclusions) {
                if (Array.isArray(activity.option.inclusions)) {
                  inclusions = activity.option.inclusions
                } else if (typeof activity.option.inclusions === 'string') {
                  inclusions = activity.option.inclusions.split(/\n|,/).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
                }
              }
              
              let exclusions: string[] = []
              if (activity.option?.exclusions) {
                if (Array.isArray(activity.option.exclusions)) {
                  exclusions = activity.option.exclusions
                } else if (typeof activity.option.exclusions === 'string') {
                  exclusions = activity.option.exclusions.split(/\n|,/).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
                }
              }
              
              return `
                <div class="${actIndex > 0 ? 'mt-4' : ''}">
                    <!-- Activity Header -->
                    <div class="flex items-start space-x-3 mb-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-gray-600 mt-0.5">
                            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill="currentColor"/>
                        </svg>
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-1">
                                <span class="text-xs font-semibold text-gray-800">ACTIVITY</span>
                                ${durationHours ? `<span class="text-xs text-gray-500">• ${durationHours} Hour${durationHours !== 1 ? 's' : ''}</span>` : ''}
                                ${activityCity ? `<span class="text-xs text-gray-500">• In ${escapeHtml(activityCity)}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Activity Content -->
                    <div class="flex items-start space-x-3">
                        ${primaryImage?.url ? `
                        <div class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                            <img src="${primaryImage.url}" alt="${escapeHtml(activityTitle)}" class="w-full h-full object-cover" />
                        </div>
                        ` : ''}
                        <div class="flex-1">
                            <h4 class="text-sm font-semibold text-gray-800 mb-1">
                                ${escapeHtml(activityTitle)}
                            </h4>
                            ${activityDescription ? `
                            <p class="text-xs text-gray-600 mb-2 leading-relaxed">
                                ${escapeHtml(activityDescription)}
                            </p>
                            ` : ''}
                            ${startTime || durationHours ? `
                            <div class="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                                <div class="flex items-center space-x-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="text-gray-500">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                                    </svg>
                                    <span>Duration ${durationHours} Hour${durationHours !== 1 ? 's' : ''} • ${startTime || 'Anytime'}</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Inclusions/Exclusions -->
                    ${(inclusions.length > 0 || exclusions.length > 0) ? `
                    <div class="mt-3 bg-gray-100 rounded-lg p-3">
                        <div class="text-xs font-semibold text-gray-800 mb-2">Inclusions/Exclusions</div>
                        <div class="space-y-1.5">
                            ${inclusions.map((inclusion: string) => `
                            <div class="flex items-start space-x-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-green-600 mt-0.5 flex-shrink-0">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                                </svg>
                                <span class="text-xs text-gray-700">${escapeHtml(inclusion)}</span>
                            </div>
                            `).join('')}
                            ${exclusions.map((exclusion: string) => `
                            <div class="flex items-start space-x-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-red-600 mt-0.5 flex-shrink-0">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                                </svg>
                                <span class="text-xs text-gray-700">${escapeHtml(exclusion)}</span>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
              `
            }).join('')}
        </section>
        ` : ''}

        <!-- Footer Section -->
        <footer class="mt-6 print:mt-4">
            <div class="mb-3">
                <div class="bg-orange-200 rounded-full px-4 py-2 inline-flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                    <span class="text-gray-800 font-medium text-sm">${destinationName} - ${totalNights} Night${totalNights > 1 ? 's' : ''} Stay</span>
                </div>
            </div>

            <div class="border-t border-gray-200 pt-3 mt-3">
                <p class="text-sm text-gray-700">
                    Stay at <span class="font-semibold">${escapeHtml(hotel?.name || 'Hotel')}${hotel?.address ? `, ${escapeHtml(hotel.address)}` : ''}</span>
                </p>
                </div>
        </footer>
                </div>
  `
}

// Generate Dynamic Itinerary Page
function generateDynamicItineraryPage(proposal: any): string {
  const days = proposal.trip?.days || []
  const destination = days[0]?.city?.name || proposal.trip?.days?.[0]?.city?.name || 'Destination'
  const totalNights = days.reduce((acc: number, day: any) => acc + (day.stay?.nights || 0), 0) || proposal.trip?.durationDays || 0

  // Get activity icon
  function getActivityIcon(slot: string) {
    if (slot === 'morning') {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
      </svg>`
    } else if (slot === 'evening') {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
      </svg>`
    }
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
    </svg>`
  }

  return `
    <!-- Page 2 - Itinerary Page -->
        <div class="max-w-4xl mx-auto p-4 print:p-0 mb-6">
        <!-- Header -->
        <header class="mb-4 print:mb-3">
            <div class="text-center">
                <p class="text-blue-600 text-sm font-medium mb-2">Your Itinerary</p>
                <h1 class="text-2xl font-bold text-gray-800 mb-2" style="font-family: 'Playfair Display', serif;">
                    ${escapeHtml(proposal.name || 'Travel Proposal')}
                </h1>
            </div>
        </header>

        <!-- Subheader Ribbon -->
        <div class="mb-6 print:mb-4">
            <div class="bg-orange-200 rounded-full px-4 py-2 inline-flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <span class="text-gray-800 font-medium text-sm">${destination} - ${totalNights} Night${totalNights > 1 ? 's' : ''} Stay</span>
            </div>
        </div>

        <!-- Main Content -->
        <main class="relative">
            <!-- Itinerary Container -->
            <div class="bg-white border border-gray-300 rounded-lg overflow-hidden">
                ${days.map((day: any, index: number) => {
                  const activities = day.activityBookings || []
                  const stay = day.stay
                  const formattedDayDate = formatDateShort(day.date)
                  
                  // Group activities by type
                  const meals = activities.filter((a: any) => {
                    const title = a.option?.activity?.title?.toLowerCase() || ''
                    return title.includes('breakfast') || title.includes('lunch') || title.includes('dinner') || title.includes('meal')
                  })
                  
                  const otherActivities = activities.filter((a: any) => {
                    const title = a.option?.activity?.title?.toLowerCase() || ''
                    return !title.includes('breakfast') && !title.includes('lunch') && !title.includes('dinner') && !title.includes('meal')
                  })

                  // Add meal plan info from stay if mealPlan exists and no meal activities
                  const stayMealPlan = stay?.mealPlan
                  const showStayMeals = stayMealPlan && meals.length === 0

                  const isLastDay = index === days.length - 1
                  
                  return `
                    <!-- Day ${day.dayNumber} -->
                    <div class="allow-break ${isLastDay ? '' : 'border-b border-gray-200'}">
                        <div class="p-4">
                            <!-- Day Header - Date and Day Number aligned with content -->
                            <div class="mb-3">
                                <div class="flex items-baseline space-x-2">
                                    <div class="text-base font-semibold text-gray-800">${formattedDayDate}</div>
                                    <div class="text-sm font-medium text-gray-600">Day ${day.dayNumber}</div>
                                </div>
                            </div>
                            
                            <!-- Activities List -->
                            <div class="space-y-1.5 pl-0">
                                ${stay && stay.checkIn ? `
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0 mt-0.5">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                                            <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-xs text-gray-800">
                                            <span class="font-semibold">Check in to:</span> ${escapeHtml(stay.room?.hotel?.name || 'Hotel')}
                                        </div>
                                        <div class="text-xs text-gray-500 mt-0.5">${formatTime(stay.checkIn)}</div>
                                    </div>
                                </div>
                                ` : ''}

                                ${meals.map((meal: any) => {
                                  const time = meal.option?.startTime || meal.option?.activity?.startTime || ''
                                  const title = meal.option?.activity?.title || meal.option?.name || 'Meal'
                                  return `
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0 mt-0.5">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                                            <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-xs text-gray-800">
                                            <span class="font-semibold">${escapeHtml(title)}</span>
                                        </div>
                                        ${time ? `<div class="text-xs text-gray-500 mt-0.5">${time}</div>` : ''}
                                    </div>
                                </div>
                                  `
                                }).join('')}

                                ${showStayMeals ? `
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0 mt-0.5">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                                            <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-xs text-gray-800">
                                            <span class="font-semibold">Meals:</span> ${escapeHtml(stayMealPlan)} Included
                                        </div>
                                    </div>
                                </div>
                                ` : ''}

                                ${otherActivities.map((activity: any) => {
                                  const time = activity.option?.startTime || activity.option?.activity?.startTime || ''
                                  const title = activity.option?.activity?.title || activity.option?.name || 'Activity'
                                  const slot = activity.slot || activity.option?.slot || 'morning'
                                  return `
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0 mt-0.5">
                                        ${getActivityIcon(slot)}
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-xs text-gray-800">
                                            <span class="font-semibold">${escapeHtml(title)}</span>
                                        </div>
                                        ${time ? `<div class="text-xs text-gray-500 mt-0.5">${time}</div>` : ''}
                                    </div>
                                </div>
                                  `
                                }).join('')}

                                ${day.stay?.checkOut && index === days.length - 1 ? `
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0 mt-0.5">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-600">
                                            <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-xs text-gray-800">
                                            <span class="font-semibold">Checkout</span>
                                        </div>
                                        <div class="text-xs text-gray-500 mt-0.5">${formatTime(day.stay.checkOut)}</div>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                  `
                }).join('')}
            </div>
        </main>

        <!-- Footer Artwork -->
        <footer class="mt-8 print:mt-6">
            <div class="flex justify-end">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-blue-600">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                        </div>
        </footer>
                                    </div>
  `
}

// Generate Dynamic Cover Page
function generateDynamicCoverPage(proposal: any): string {
  const trip = proposal.trip
  const days = trip?.days || []
  const customer = trip?.customer
  const createdBy = trip?.createdBy
  const destination = days[0]?.city?.name || 'Destination'
  const fromCity = trip?.fromCity?.name || 'Origin'
  const customerName = customer?.name || 'Traveler'
  const startDate = trip?.startDate ? new Date(trip.startDate) : new Date()
  const formattedStartDate = formatDate(trip?.startDate || startDate.toISOString())
  
  const duration = trip?.durationDays || days.length
  const nights = days.reduce((acc: number, day: any) => acc + (day.stay?.nights || 0), 0) || duration - 1
  
  // Get first hotel name
  const firstHotel = days.find((d: any) => d.stay?.room?.hotel?.name)?.stay?.room?.hotel?.name || ''
  
  // Get highlights (hotels, activities count)
  const hotelsCount = new Set(days.filter((d: any) => d.stay?.room?.hotel?.id).map((d: any) => d.stay.room.hotel.id)).size
  const activitiesCount = days.reduce((acc: number, day: any) => acc + (day.activityBookings?.length || 0), 0)
  
  // Format proposal creation date
  const createdDate = proposal.createdAt ? new Date(proposal.createdAt) : new Date()
  const quotationDate = createdDate.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
  const quotationTime = createdDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
  
  // Currency formatting
  const currencyCode = proposal.currency?.code || 'INR'
  const totalPrice = formatCurrency(proposal.totalPriceCents || 0, currencyCode)
  const totalTravelers = trip?.totalTravelers || 2

  // Get curator info
  const curatorName = createdBy?.name || createdBy?.firstName + ' ' + createdBy?.lastName || 'Deyor Team'
  const curatorEmail = createdBy?.email || 'support@deyor.in'
  const curatorPhone = createdBy?.phone || createdBy?.countryCode + ' ' + createdBy?.phone || ''

  return `
    <!-- Page 1 - Cover Page -->
    <div class="max-w-4xl mx-auto p-4 print:p-0">
        <!-- Header -->
        <header class="mb-4 print:mb-3">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-gray-500 text-sm mb-2">${escapeHtml(customerName)}'s trip to</p>
                    <h1 class="text-3xl font-bold text-blue-600 mb-2" style="font-family: 'Playfair Display', serif;">${escapeHtml(destination)}</h1>
                                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">D</span>
                                    </div>
                                        </div>
                                    </div>
        </header>

        <!-- Main Card -->
        <main class="bg-white rounded-2xl shadow-md p-4 print:shadow-none print:rounded-none">
            <!-- Trip Summary -->
            <div class="mb-4">
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">${nights}N/${duration}D</span>
                    ${fromCity ? `<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">${escapeHtml(fromCity)}</span>` : ''}
                    ${firstHotel ? `<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">${escapeHtml(firstHotel)}</span>` : ''}
                                </div>
                
                <div class="flex items-start space-x-3 mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-gray-400">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" fill="currentColor"/>
                                        </svg>
                    <p class="text-gray-700 italic text-sm leading-relaxed">
                        ${escapeHtml(trip?.days?.[0]?.city?.name || destination)} offers an incredible travel experience with beautiful destinations, amazing hotels, and unforgettable activities.
                    </p>
                                    </div>
                                        </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Left Column - Contents -->
                <div class="lg:col-span-2">
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold text-gray-800 mb-2">Contents</h2>
                        <div class="space-y-2">
                            <div class="flex items-center space-x-3">
                                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">1</span>
                                    </div>
                                <span class="text-gray-700">Your Itinerary</span>
                                </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">2</span>
                                    </div>
                                <span class="text-gray-700">Day Wise Details</span>
                                        </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">3</span>
                                    </div>
                                <span class="text-gray-700">How To Book</span>
                                </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">4</span>
                                    </div>
                                <span class="text-gray-700">Cancellation & Date Change Policies</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Highlights -->
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold text-gray-800 mb-2">Highlights</h2>
                        <div class="flex flex-wrap gap-3">
                            ${hotelsCount > 0 ? `<div class="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                                <span class="text-gray-700 text-sm">${hotelsCount} Hotel${hotelsCount > 1 ? 's' : ''}</span>
                            </div>` : ''}
                            ${activitiesCount > 0 ? `<div class="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                                <span class="text-gray-700 text-sm">${activitiesCount} Activ${activitiesCount > 1 ? 'ities' : 'ity'}</span>
                            </div>` : ''}
                            <div class="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                                <span class="text-gray-700 text-sm">Meals Included</span>
                                    </div>
                                        </div>
                                    </div>
                                </div>

                <!-- Right Column - Curator Card -->
                <aside class="lg:col-span-1">
                    <div class="bg-blue-50 rounded-2xl p-6 shadow-sm avoid-break">
                        <div class="text-right">
                            <p class="text-gray-500 text-sm mb-1">Generated by</p>
                            <p class="text-gray-800 font-semibold text-lg mb-1">${escapeHtml(curatorName)}</p>
                            <p class="text-gray-500 text-sm mb-4">Travel Expert</p>
                            
                            <div class="space-y-2 text-sm text-gray-600">
                                ${curatorPhone ? `<p>Call: ${escapeHtml(curatorPhone)}</p>` : ''}
                                <p>Email: ${escapeHtml(curatorEmail)}</p>
                                <p class="text-gray-500">Quotation Created on ${quotationDate}</p>
                                <p class="text-gray-500">${quotationTime}</p>
                                    </div>
                                        </div>
                                    </div>
                </aside>
                                </div>

            <!-- Promo Banner -->
            <div class="mt-4 bg-gradient-to-r from-teal-400 to-green-500 rounded-2xl p-3 avoid-break">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div>
                            <h3 class="text-gray-800 font-semibold text-lg">Plan Your Trip with Deyor</h3>
                            <div class="flex items-center space-x-2 text-sm text-gray-600">
                                <span>A travel quotation</span>
                                <span class="text-gray-400">|</span>
                                <span>A Customize your service</span>
                                <span class="text-gray-400">|</span>
                                <span>A Customize to suit you</span>
                                    </div>
                                        </div>
                                    </div>
                    <button class="bg-white text-teal-600 px-6 py-2 rounded-full font-medium">
                        VIEW YOUR QUOTES
                    </button>
                                </div>
                            </div>

            <!-- Total Cost Box -->
            <div class="mt-4 bg-blue-50 rounded-2xl p-3 avoid-break">
                <div class="bg-red-500 text-white px-4 py-2 rounded-t-2xl -mt-6 -mx-6 mb-4">
                    <p class="text-sm font-medium">Total cost Excluding TCS</p>
                        </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-red-500 mb-1">${totalPrice}</div>
                    <p class="text-gray-600 mb-3">for ${totalTravelers} ${totalTravelers > 1 ? 'adults' : 'adult'}</p>
                    <button class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold text-base">
                        Pay Now
                    </button>
                    </div>
                    
                <!-- Footer inside main card -->
                <div class="mt-2 text-center">
                    <div class="flex items-center justify-center space-x-1 text-xs text-gray-500 italic">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="text-green-500">
                            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.91.66.95-2.3c.48.17.98.3 1.5.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75S7 14 17 8z" fill="currentColor"/>
                                        </svg>
                        <span>Please think twice before printing this mail. Save paper, it's good for the environment.</span>
                                    </div>
                </div>
            </div>
        </main>
                </div>
  `
}

// Generate Combined Pages (Cover + Itinerary + Day-Wise Details)
async function generateDynamicProposalPDF(proposalId: string, request: NextRequest) {
  // Get auth token from cookies
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = ServerCookieStorage.parseCookies(cookieHeader)
  const authStatus = ServerCookieStorage.getAuthStatus(cookies)
  const authToken = authStatus.tokens?.access || undefined
  
  console.log('Fetching proposal for PDF:', {
    proposalId,
    hasAuthToken: !!authToken
  })
  
  // Fetch proposal data
  const proposal = await fetchProposalData(proposalId, authToken)
  
  if (!proposal) {
    console.error('❌ Failed to fetch proposal data')
    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - PDF Generation</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        h1 { color: #E63946; }
        p { color: #666; }
    </style>
</head>
<body>
    <h1>Unable to Generate PDF</h1>
    <p>Failed to fetch proposal data for ID: ${proposalId}</p>
    <p>Please check:</p>
    <ul style="text-align: left; display: inline-block;">
        <li>You are logged in</li>
        <li>The proposal ID is correct</li>
        <li>The proposal exists in the system</li>
    </ul>
</body>
</html>
    `
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    })
  }
  
  if (!proposal.trip) {
    console.error('❌ Proposal exists but has no trip data')
    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - PDF Generation</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        h1 { color: #E63946; }
        p { color: #666; }
    </style>
</head>
<body>
    <h1>Unable to Generate PDF</h1>
    <p>Proposal "${proposal.name}" found but has no trip data.</p>
</body>
</html>
    `
    return new NextResponse(errorHtml, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    })
  }
  
  console.log('✅ Using dynamic proposal data:', {
    proposalId: proposal.id,
    proposalName: proposal.name,
    daysCount: proposal.trip?.days?.length || 0
  })

  const trip = proposal.trip
  const days = trip.days || []
  
  // Filter days with hotels
  const daysWithHotels = days.filter((day: any) => day.stay && day.stay.room)
  
  // Generate cover page
  const coverPage = generateDynamicCoverPage(proposal)
  
  // Generate itinerary page (add page break before)
  const itineraryPage = `<div class="page-break"></div>${generateDynamicItineraryPage(proposal)}`
  
  // Generate all day-wise pages (no page breaks between, let content flow naturally)
  const dayWisePages = daysWithHotels.map((day: any, index: number) => {
    const dayPage = generateDayWiseDetailsPage(day, proposal)
    // Only add page break before first day-wise page, not between days
    return index === 0 ? `<div class="page-break"></div>${dayPage}` : dayPage
  }).join('')

  // Combine all pages
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deyor Proposal - ${proposal.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page { size: A4; margin: 6mm; }
        @media print { 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .avoid-break { page-break-inside: avoid; break-inside: avoid; orphans: 3; widows: 3; }
            .page-break { page-break-after: always; break-after: page; }
            .allow-break { page-break-inside: auto; break-inside: auto; }
            /* Allow natural flow - only break between major sections */
            .max-w-4xl { page-break-inside: auto; }
            /* Prevent orphans and widows */
            section, div { orphans: 2; widows: 2; }
        }
        .deyor-red { color: #E63946; }
        .deyor-blue { color: #2E9AD6; }
        .deyor-muted { background-color: #EAF6FB; }
        .writing-mode-vertical { writing-mode: vertical-rl; text-orientation: mixed; }
    </style>
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 1000);
        }
    </script>
</head>
<body class="bg-gray-100 print:bg-white">
    ${coverPage}
    ${itineraryPage}
    ${dayWisePages}
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="deyor-proposal-${proposalId}.html"`
      }
    })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const page = searchParams.get('page')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    // If id is 'demo', return static demo pages
    if (id === 'demo') {
      // Return static demo (keeping existing static code for demo)
      // This would need the old generateCombinedPages function
      return NextResponse.json({ error: 'Demo mode not fully implemented. Use a real proposal ID.' }, { status: 400 })
    }

    // Return dynamic proposal PDF (cover + itinerary + day-wise details)
    const result = await generateDynamicProposalPDF(id, request)
    return result
    
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error?.message }, 
      { status: 500 }
    )
  }
}