'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ActivityExplorerModal from '@/components/activities/ActivityExplorerModal'
import ActivityDetailsModal from '@/components/activities/ActivityDetailsModal'
import { Activity, ActivitySelection } from '@/types/activity'

export default function ActivityDemoPage() {
  const [showExplorer, setShowExplorer] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [addedActivities, setAddedActivities] = useState<ActivitySelection[]>([])

  const handleSelectActivity = (activity: Activity, selection: ActivitySelection) => {
    setAddedActivities(prev => [...prev, selection])
    setShowExplorer(false)
    console.log('Activity added to package:', { activity, selection })
  }

  const handleViewDetails = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowDetails(true)
  }

  const handleAddToPackage = (activity: Activity, selection: ActivitySelection) => {
    setAddedActivities(prev => [...prev, selection])
    setShowDetails(false)
    setSelectedActivity(null)
    console.log('Activity added to package:', { activity, selection })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const totalPrice = addedActivities.reduce((total, activity) => total + activity.totalPrice, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Activity Management Demo</h1>
          <p className="text-lg text-gray-700 mb-6">
            This demo showcases the Add/Change Activity flow for the Deyor travel platform.
            Click the buttons below to test the Activity Explorer and Details modals.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-brand" />
                Add Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Open the Activity Explorer to browse and select activities for your itinerary.
              </p>
              <Button
                onClick={() => setShowExplorer(true)}
                className="w-full bg-brand hover:bg-brand/90"
              >
                Open Activity Explorer
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-brand" />
                View Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Open the Activity Details modal to see the full booking flow.
              </p>
              <Button
                onClick={() => handleViewDetails({
                  id: 'demo-activity',
                  title: 'Bali Sunrise Trekking at Mount Batur',
                  shortDesc: 'Experience the magical sunrise from Mount Batur',
                  longDesc: 'A detailed description of the activity...',
                  durationMins: 480,
                  availability: [],
                  basePrice: 450000,
                  pricingType: 'person',
                  category: ['Adventure'],
                  tags: ['Sunrise', 'Trekking'],
                  images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'],
                  rating: 4.8,
                  reviewsCount: 1247,
                  extras: [],
                  location: 'Mount Batur, Bali',
                  pickupOptions: [],
                  cancellationPolicy: 'Free cancellation up to 24 hours',
                  minPax: 2,
                  maxPax: 20,
                  difficulty: 'Moderate',
                  included: [],
                  excluded: [],
                  whatToBring: [],
                  meetingPoint: 'Ubud Center',
                  provider: 'Bali Adventure Tours',
                  instantConfirmation: true,
                  mobileTicket: true,
                  freeCancellation: true,
                  cancellationHours: 24
                })}
                variant="outline"
                className="w-full"
              >
                Open Activity Details
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-brand" />
                Package Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand mb-2">
                  {addedActivities.length}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Activities Added
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(totalPrice)}
                </div>
                <div className="text-xs text-gray-500">
                  Total Package Value
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Added Activities List */}
        {addedActivities.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Added Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addedActivities.map((activitySelection, index) => (
                  <motion.div
                    key={`${activitySelection.activity.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {activitySelection.activity.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(activitySelection.activity.durationMins)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {activitySelection.activity.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {activitySelection.adults} adults, {activitySelection.childrenCount} children
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {activitySelection.scheduleSlot.startTime}
                        </div>
                      </div>
                      {activitySelection.extras.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm text-gray-600">Extras:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activitySelection.extras.map((extra) => (
                              <Badge key={extra.id} variant="secondary" className="text-xs">
                                {extra.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-brand">
                        {formatPrice(activitySelection.totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activitySelection.activity.pricingType === 'person' ? 'per person' : 'per activity'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Add to Proposal Page</h4>
              <p className="text-gray-600 text-sm">
                Import and use the ActivityExplorerModal in your proposal creation page:
              </p>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs mt-2 overflow-x-auto">
{`import ActivityExplorerModal from '@/components/activities/ActivityExplorerModal'

// In your component:
const [showActivityExplorer, setShowActivityExplorer] = useState(false)

<ActivityExplorerModal
  isOpen={showActivityExplorer}
  onClose={() => setShowActivityExplorer(false)}
  onSelectActivity={(activity, selection) => {
    // Update your proposal state
    updateProposal({ activities: [...proposal.activities, selection] })
  }}
  dayId="day-1"
  mode="add"
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. GraphQL Integration</h4>
              <p className="text-gray-600 text-sm">
                Replace mock data with real GraphQL queries in the hooks:
              </p>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs mt-2 overflow-x-auto">
{`// In hooks/useActivitySearch.ts and hooks/useActivityDetails.ts
// Replace the mock implementation with:
const result = await graphQLClient.request(GET_ACTIVITIES, variables)
return result.activities`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Proposal Integration</h4>
              <p className="text-gray-600 text-sm">
                Connect with your useProposal hook to update the proposal state:
              </p>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs mt-2 overflow-x-auto">
{`const { proposal, updateProposal } = useProposal()

const handleAddActivity = (activity, selection) => {
  updateProposal({
    activities: [...proposal.activities, {
      id: generateId(),
      activityId: activity.id,
      ...selection,
      dayId: selectedDayId
    }]
  })
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <ActivityExplorerModal
          isOpen={showExplorer}
          onClose={() => setShowExplorer(false)}
          onSelectActivity={handleSelectActivity}
          dayId="demo-day"
          mode="add"
        />

        {selectedActivity && (
          <ActivityDetailsModal
            isOpen={showDetails}
            onClose={() => {
              setShowDetails(false)
              setSelectedActivity(null)
            }}
            activityId={selectedActivity.id}
            onAddToPackage={handleAddToPackage}
            dayId="demo-day"
            checkIn="2024-10-10T14:00:00Z"
            checkOut="2024-10-13T12:00:00Z"
            adults={2}
            childrenCount={0}
          />
        )}
      </motion.div>
    </div>
  )
}
