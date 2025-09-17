'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import HotelDetailsModal from '@/components/hotels/HotelDetailsModal'
import HotelDetailsPage from '@/components/hotels/HotelDetailsPage'
import { Hotel, Room } from '@/types/hotel'
import { mockHotelDetails } from '@/lib/mocks/hotels'

export default function HotelDetailsDemoPage() {
  const [showModal, setShowModal] = useState(false)
  const [showPage, setShowPage] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [mode, setMode] = useState<'modal' | 'page'>('modal')

  const handleSelectRoom = (hotel: Hotel, room: Room) => {
    setSelectedHotel(hotel)
    setSelectedRoom(room)
    console.log('Selected room:', { hotel: hotel.name, room: room.name, price: room.totalPrice })
  }

  const demoProps = {
    hotelId: 'hotel-kuta-heritage',
    checkIn: '2025-10-16',
    checkOut: '2025-10-19',
    nights: 3,
    adults: 2,
    childrenCount: 0,
    onSelectRoom: handleSelectRoom
  }

  if (showPage) {
    return (
      <HotelDetailsPage
        {...demoProps}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hotel Details Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Test the hotel details modal and page components with mock data
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Demo Hotel Card */}
          <Card className="overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <Image
                src={mockHotelDetails.images[0]}
                alt={mockHotelDetails.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < mockHotelDetails.starRating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{mockHotelDetails.name}</CardTitle>
              <p className="text-sm text-gray-600">{mockHotelDetails.address}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{mockHotelDetails.rooms[0]?.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">for 3 nights</span>
                </div>
                <div className="text-sm text-gray-600">
                  {mockHotelDetails.rating} ({mockHotelDetails.ratingsCount} reviews)
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {mockHotelDetails.badges.slice(0, 3).map((badge, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Mode
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant={mode === 'modal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('modal')}
                    className="flex-1"
                  >
                    Modal
                  </Button>
                  <Button
                    variant={mode === 'page' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('page')}
                    className="flex-1"
                  >
                    Page
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setShowModal(true)}
                  className="w-full"
                  disabled={mode === 'page'}
                >
                  Open Hotel Details Modal
                </Button>
                <Button
                  onClick={() => setShowPage(true)}
                  variant="outline"
                  className="w-full"
                  disabled={mode === 'modal'}
                >
                  Open Hotel Details Page
                </Button>
              </div>

              {selectedRoom && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-1">Room Selected!</h3>
                  <p className="text-sm text-green-700">
                    {selectedRoom.name} - ₹{selectedRoom.totalPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Features Demonstrated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Image Gallery with Thumbnails',
                'Full-screen Image Preview',
                'Room Selection with Filtering',
                'Price Confirmation for Changes',
                'Facilities & Amenities Panel',
                'Hotel Policies Display',
                'Guest Reviews & Ratings',
                'Interactive Map Placeholder',
                'Responsive Design',
                'Framer Motion Animations',
                'Accessibility Features',
                'GraphQL Integration Ready'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 text-sm text-gray-600"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Integration Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. GraphQL Integration</h3>
              <p className="text-sm text-gray-600 mb-2">
                Replace mock data in <code className="bg-gray-100 px-1 rounded">hooks/useHotelDetails.ts</code>:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// TODO: GraphQL - Replace with real GraphQL call
const result = await graphQLClient.request(GET_HOTEL_DETAILS, variables)
setHotel(result.hotel)`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. Proposal Integration</h3>
              <p className="text-sm text-gray-600 mb-2">
                Connect with your proposal system:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const handleSelectRoom = (hotel: Hotel, room: Room) => {
  // Update proposal with selected hotel/room
  updateProposal({
    ...proposal,
    hotels: [...proposal.hotels, { hotel, room }]
  })
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. Usage in Components</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Modal usage
<HotelDetailsModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  hotelId="hotel-id"
  onSelectRoom={handleSelectRoom}
  checkIn="2025-10-16"
  checkOut="2025-10-19"
  nights={3}
  adults={2}
  childrenCount={0}
/>

// Page usage
<HotelDetailsPage
  hotelId="hotel-id"
  onSelectRoom={handleSelectRoom}
  checkIn="2025-10-16"
  checkOut="2025-10-19"
  nights={3}
  adults={2}
  childrenCount={0}
/>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotel Details Modal */}
      <HotelDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        {...demoProps}
      />
    </div>
  )
}
