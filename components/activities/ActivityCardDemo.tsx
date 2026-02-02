'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ActivityCardWithGraphQL from './ActivityCardWithGraphQL'
import { Activity } from '@/types/activity'

export default function ActivityCardDemo() {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  // Test with the provided activity ID
  const testActivityId = "2"

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivityId(activity.id)
  }

  const handleViewDetails = (activity: Activity) => {
    // In a real app, this would open the details modal
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Activity Card GraphQL Integration Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Testing the integration of GraphQL Activity query with existing Activity card UI
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Badge variant="outline" className="text-sm">
              Activity ID: {testActivityId}
            </Badge>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">GraphQL Query</h4>
              <p className="text-sm text-gray-600 mb-2">
                Using the provided Activity query with activityId: &quot;{testActivityId}&quot;
              </p>
              <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono">
                query Activity($activityId: ID!) &#123;<br/>
                &nbsp;&nbsp;activity(id: $activityId) &#123;<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;id, title, summary, description, rating...<br/>
                &nbsp;&nbsp;&#125;<br/>
                &#125;
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Data Mapping</h4>
              <p className="text-sm text-gray-600">
                GraphQL response is transformed to match existing Activity interface:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• activityOptions → availability (ScheduleSlot[])</li>
                <li>• activityAddons → extras (Extra[])</li>
                <li>• activityImages → images (string[])</li>
                <li>• activityCategoryMaps → category (string[])</li>
                <li>• Complex nested data → Simplified flat structure</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Error Handling</h4>
              <p className="text-sm text-gray-600">
                If GraphQL fails, the system automatically falls back to mock data to ensure the UI remains functional.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Card with GraphQL Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
              <ActivityCardWithGraphQL
                activityId={testActivityId}
                onSelect={handleSelectActivity}
                onViewDetails={handleViewDetails}
                isSelected={selectedActivityId === testActivityId}
                viewMode={viewMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Expected Data Display */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Data from GraphQL Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Basic Info</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><strong>Title:</strong> Mumbai City Tour</li>
                  <li><strong>Summary:</strong> Explore the best of Mumbai city</li>
                  <li><strong>Rating:</strong> 4.50</li>
                  <li><strong>Duration:</strong> 480 minutes (8 hours)</li>
                  <li><strong>Location:</strong> Mumbai, IN</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Highlights & Tags</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><strong>Highlights:</strong> Gateway of India, Marine Drive, Dhobi Ghat</li>
                  <li><strong>Tags:</strong> sightseeing, city tour, cultural</li>
                  <li><strong>Category:</strong> City Tours</li>
                  <li><strong>Instant Booking:</strong> true</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pricing & Options</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><strong>Base Price:</strong> $50.00 (5000 cents)</li>
                  <li><strong>Child Price:</strong> $25.00 (2500 cents)</li>
                  <li><strong>Max Participants:</strong> 15</li>
                  <li><strong>Meal Plan:</strong> Lunch Included (veg)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Add-ons & Images</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><strong>Add-ons:</strong> Private Car Upgrade ($20.00)</li>
                  <li><strong>Images:</strong> 1 image with caption &quot;Mumbai City Tour&quot;</li>
                  <li><strong>Supplier:</strong> Sample Tour Operator</li>
                  <li><strong>Refundable:</strong> true</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
