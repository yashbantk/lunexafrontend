"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TopBar } from "@/components/proposals/TopBar"
import { ProposalHeader } from "@/components/proposals/ProposalHeader"
import { FlightCard } from "@/components/proposals/FlightCard"
import { HotelCard } from "@/components/proposals/HotelCard"
import { DayAccordion } from "@/components/proposals/DayAccordion"
import { PriceSummary } from "@/components/proposals/PriceSummary"
import { AddEditModal } from "@/components/proposals/AddEditModal"
import HotelSelectModal from "@/components/hotels/HotelSelectModal"
import ActivityExplorerModal from "@/components/activities/ActivityExplorerModal"
import { useProposal } from "@/hooks/useProposal"
import { Proposal, Day, Flight, Hotel, Activity, PriceBreakdown } from "@/types/proposal"
import { Hotel as HotelType } from "@/types/hotel"
import { Activity as ActivityType, ActivitySelection } from "@/types/activity"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CreateProposalPage() {
  const { proposal, updateProposal, saveProposal, isLoading } = useProposal()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'flight' | 'hotel' | 'activity' | 'day'>('flight')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isHotelSelectOpen, setIsHotelSelectOpen] = useState(false)
  const [editingHotelIndex, setEditingHotelIndex] = useState<number | null>(null)
  const [isActivityExplorerOpen, setIsActivityExplorerOpen] = useState(false)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (proposal) {
        saveProposal(proposal)
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [proposal, saveProposal])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        saveProposal(proposal)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [proposal, saveProposal])

  const handleAddItem = (type: 'flight' | 'hotel' | 'activity' | 'day') => {
    setModalType(type)
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEditItem = (type: 'flight' | 'hotel' | 'activity' | 'day', item: any) => {
    setModalType(type)
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleFieldChange = (field: string, value: any) => {
    if (!proposal) return
    updateProposal({
      ...proposal,
      [field]: value
    })
  }

  const handleHotelSelect = (hotel: HotelType, room: any) => {
    if (!proposal) return

    // Convert hotel type to proposal hotel type
    const proposalHotel: Hotel = {
      id: hotel.id,
      name: hotel.name,
      image: hotel.images[0],
      rating: hotel.rating,
      starRating: hotel.starRating,
      address: hotel.address,
      checkIn: proposal.hotels[editingHotelIndex || 0]?.checkIn || new Date().toISOString(),
      checkOut: proposal.hotels[editingHotelIndex || 0]?.checkOut || new Date().toISOString(),
      roomType: room.name,
      boardBasis: room.board,
      bedType: room.bedType,
      nights: proposal.hotels[editingHotelIndex || 0]?.nights || 1,
      pricePerNight: room.pricePerNight,
      refundable: room.refundable,
      currency: 'INR'
    }

    if (editingHotelIndex !== null) {
      // Update existing hotel
      const updatedHotels = [...proposal.hotels]
      updatedHotels[editingHotelIndex] = proposalHotel
      updateProposal({
        ...proposal,
        hotels: updatedHotels
      })
    } else {
      // Add new hotel
      updateProposal({
        ...proposal,
        hotels: [...proposal.hotels, proposalHotel]
      })
    }

    setIsHotelSelectOpen(false)
    setEditingHotelIndex(null)
  }

  const handleChangeHotel = (index: number) => {
    setEditingHotelIndex(index)
    setIsHotelSelectOpen(true)
  }

  const handleActivitySelect = (activity: ActivityType, selection: ActivitySelection) => {
    if (!proposal) return

    // Convert activity selection to proposal activity
    const proposalActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: activity.title,
      description: activity.shortDesc,
      duration: `${Math.floor(activity.durationMins / 60)}h ${activity.durationMins % 60}m`,
      price: selection.totalPrice,
      currency: 'INR',
      time: selection.scheduleSlot.startTime,
      type: selection.scheduleSlot.type === 'full-day' ? 'morning' : selection.scheduleSlot.type as 'morning' | 'afternoon' | 'evening',
      included: activity.included.length > 0
    }

    // Add to the specific day or create a new day
    if (editingDayIndex !== null) {
      const updatedDays = [...proposal.days]
      updatedDays[editingDayIndex] = {
        ...updatedDays[editingDayIndex],
        activities: [...(updatedDays[editingDayIndex].activities || []), proposalActivity]
      }
      updateProposal({
        ...proposal,
        days: updatedDays
      })
    } else {
      // Add to first day or create a new day
      if (proposal.days.length > 0) {
        const updatedDays = [...proposal.days]
        updatedDays[0] = {
          ...updatedDays[0],
          activities: [...(updatedDays[0].activities || []), proposalActivity]
        }
        updateProposal({
          ...proposal,
          days: updatedDays
        })
      } else {
        // Create a new day with the activity
        const newDay: Day = {
          id: `day-${Date.now()}`,
          dayNumber: 1,
          date: new Date().toISOString(),
          title: 'Day 1',
          summary: '',
          activities: [proposalActivity],
          transfers: [],
          meals: {
            breakfast: false,
            lunch: false,
            dinner: false
          },
          arrival: {
            flight: '',
            time: '',
            description: '',
            date: new Date().toISOString()
          },
          departure: {
            flight: '',
            time: '',
            description: '',
            date: new Date().toISOString()
          }
        }
        updateProposal({
          ...proposal,
          days: [...proposal.days, newDay]
        })
      }
    }

    setIsActivityExplorerOpen(false)
    setEditingDayIndex(null)
  }

  const handleAddActivity = (dayIndex?: number) => {
    setEditingDayIndex(dayIndex !== undefined ? dayIndex : null)
    setIsActivityExplorerOpen(true)
  }

  const handleSaveItem = (item: any) => {
    if (!proposal) return
    
    if (editingItem) {
      // Update existing item
      const updatedProposal = { ...proposal }
      const arrayKey = `${modalType}s` as keyof Proposal
      if (Array.isArray(updatedProposal[arrayKey])) {
        (updatedProposal[arrayKey] as any[]) = (updatedProposal[arrayKey] as any[]).map((i: any) => 
          i.id === editingItem.id ? { ...i, ...item } : i
        )
      }
      updateProposal(updatedProposal)
    } else {
      // Add new item
      const updatedProposal = { ...proposal }
      const arrayKey = `${modalType}s` as keyof Proposal
      if (Array.isArray(updatedProposal[arrayKey])) {
        (updatedProposal[arrayKey] as any[]) = [...(updatedProposal[arrayKey] as any[]), { ...item, id: Date.now().toString() }]
      }
      updateProposal(updatedProposal)
    }
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <TopBar 
        totalPrice={proposal?.priceBreakdown?.total || 0}
        onSaveDraft={() => saveProposal(proposal)}
      />
      
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProposalHeader 
                proposal={proposal}
                onUpdate={updateProposal}
              />
             </motion.div>

             {/* Date Availability Calendar */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.05 }}
             >
               <div className="bg-white rounded-2xl shadow-xl p-6">
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Near by travel dates with special price</h2>
                 <div className="grid grid-cols-7 gap-2">
                   {Array.from({ length: 14 }, (_, i) => {
                     const date = new Date(2025, 9, 8 + i) // October 8-21, 2025
                     const isSelected = i === 6 // Sunday, 19 Oct
                     const isWeekend = date.getDay() === 0 || date.getDay() === 6
                     
                     return (
                       <div key={i} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
                         isSelected 
                           ? 'bg-primary text-white' 
                           : isWeekend 
                             ? 'bg-gray-100 hover:bg-gray-200' 
                             : 'bg-white hover:bg-gray-50 border border-gray-200'
                       }`}>
                         <div className="text-xs font-medium">
                           {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                         </div>
                         <div className="text-sm font-semibold mt-1">
                           {date.getDate()}
                         </div>
                         <div className="text-xs mt-1">
                           {date.toLocaleDateString('en-US', { month: 'short' })}
                         </div>
                         {!isSelected && (
                           <div className="mt-2">
                             <div className="text-xs text-gray-500 mb-1">Special Price</div>
                             <button className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90">
                               Check Price
                             </button>
                           </div>
                         )}
                         {isSelected && (
                           <div className="mt-2 text-xs">Selected Date</div>
                         )}
                       </div>
                     )
                   })}
                 </div>
               </div>
             </motion.div>

             {/* Flights Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Flights</h2>
                  <button
                    onClick={() => handleAddItem('flight')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    + Add Flight
                  </button>
                </div>
                <div className="space-y-4">
                  {proposal?.flights?.map((flight, index) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      onEdit={() => handleEditItem('flight', flight)}
                      onRemove={() => {
                        if (!proposal) return
                        updateProposal({
                          ...proposal,
                          flights: proposal.flights.filter((f: Flight) => f.id !== flight.id)
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Hotels Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Hotels</h2>
                  <button
                    onClick={() => {
                      setEditingHotelIndex(null)
                      setIsHotelSelectOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    + Add Hotel
                  </button>
                </div>
                <div className="space-y-4">
                  {proposal?.hotels?.map((hotel, index) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onEdit={() => handleChangeHotel(index)}
                      onRemove={() => {
                        if (!proposal) return
                        updateProposal({
                          ...proposal,
                          hotels: proposal.hotels.filter((h: Hotel) => h.id !== hotel.id)
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Day-by-Day Itinerary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
                  <button
                    onClick={() => handleAddItem('day')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    + Add Day
                  </button>
                </div>
                <div className="space-y-4">
                  {proposal?.days?.map((day, index) => (
                    <DayAccordion
                      key={day.id}
                      day={day}
                      onEdit={() => handleEditItem('day', day)}
                      onRemove={() => {
                        if (!proposal) return
                        updateProposal({
                          ...proposal,
                          days: proposal.days.filter((d: Day) => d.id !== day.id)
                        })
                      }}
                      onAddActivity={() => handleAddActivity(index)}
                    />
                  ))}
                </div>
               </div>
             </motion.div>

             {/* Optional Sections */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
             >
               <div className="bg-white rounded-2xl shadow-xl p-6">
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Services</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Visa Section */}
                   <div className="space-y-4">
                     <h3 className="font-medium text-gray-900">Visa</h3>
                     <div className="p-4 border border-gray-200 rounded-lg">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="font-medium text-gray-900">Indonesia - E-visa</div>
                           <div className="text-sm text-gray-600">Tourist / Single Entry / E-Visa</div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <span className="text-sm text-red-600 font-medium">Not Included</span>
                           <button className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
                             + ADD
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Travel Insurance Section */}
                   <div className="space-y-4">
                     <h3 className="font-medium text-gray-900">Travel Insurance</h3>
                     <div className="p-4 border border-gray-200 rounded-lg">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="font-medium text-gray-900">Comprehensive Travel Insurance</div>
                           <div className="text-sm text-gray-600">Coverage for medical, trip cancellation, and baggage</div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <span className="text-sm text-red-600 font-medium">Not Included</span>
                           <button className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
                             + ADD
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </motion.div>

             {/* Proposal Metadata */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.5 }}
             >
               <div className="bg-white rounded-2xl shadow-xl p-6">
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposal Details</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="clientName">Client Name</Label>
                     <Input
                       id="clientName"
                       value={proposal?.clientName || ''}
                       onChange={(e) => handleFieldChange('clientName', e.target.value)}
                       placeholder="Enter client name"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="clientEmail">Client Email</Label>
                     <Input
                       id="clientEmail"
                       type="email"
                       value={proposal?.clientEmail || ''}
                       onChange={(e) => handleFieldChange('clientEmail', e.target.value)}
                       placeholder="Enter client email"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="clientPhone">Client Phone</Label>
                     <Input
                       id="clientPhone"
                       value={proposal?.clientPhone || ''}
                       onChange={(e) => handleFieldChange('clientPhone', e.target.value)}
                       placeholder="Enter client phone"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="salesperson">Salesperson</Label>
                     <Input
                       id="salesperson"
                       value={proposal?.salesperson || ''}
                       onChange={(e) => handleFieldChange('salesperson', e.target.value)}
                       placeholder="Enter salesperson name"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="validityDays">Validity (Days)</Label>
                     <Input
                       id="validityDays"
                       type="number"
                       value={proposal?.validityDays || 7}
                       onChange={(e) => handleFieldChange('validityDays', parseInt(e.target.value))}
                       placeholder="7"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="markupPercent">Markup %</Label>
                     <Input
                       id="markupPercent"
                       type="number"
                       value={proposal?.markupPercent || 5}
                       onChange={(e) => handleFieldChange('markupPercent', parseFloat(e.target.value))}
                       placeholder="5"
                     />
                   </div>
                 </div>
                 <div className="mt-4">
                   <Label htmlFor="internalNotes">Internal Notes</Label>
                   <Textarea
                     id="internalNotes"
                     value={proposal?.internalNotes || ''}
                     onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
                     placeholder="Add any internal notes or special instructions..."
                     rows={3}
                   />
                 </div>
               </div>
             </motion.div>
           </div>

           {/* Right Column - Price Summary */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-24"
            >
              <PriceSummary
                proposal={proposal}
                onSaveProposal={() => saveProposal(proposal)}
                onExportPDF={() => window.print()}
                onPreview={() => console.log('Preview proposal')}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        item={editingItem}
        onSave={handleSaveItem}
        proposal={proposal || undefined}
      />

      {/* Hotel Selection Modal */}
      <HotelSelectModal
        isOpen={isHotelSelectOpen}
        onClose={() => {
          setIsHotelSelectOpen(false)
          setEditingHotelIndex(null)
        }}
        onSelectHotel={handleHotelSelect}
        currentHotel={undefined}
        stayId="stay-1"
        checkIn={proposal?.hotels[editingHotelIndex || 0]?.checkIn || new Date().toISOString()}
        checkOut={proposal?.hotels[editingHotelIndex || 0]?.checkOut || new Date().toISOString()}
        nights={proposal?.hotels[editingHotelIndex || 0]?.nights || 1}
        adults={2}
        childrenCount={0}
      />

      {/* Activity Explorer Modal */}
      <ActivityExplorerModal
        isOpen={isActivityExplorerOpen}
        onClose={() => {
          setIsActivityExplorerOpen(false)
          setEditingDayIndex(null)
        }}
        onSelectActivity={handleActivitySelect}
        dayId={editingDayIndex !== null ? proposal?.days[editingDayIndex]?.id || 'day-1' : 'day-1'}
        mode="add"
      />
    </div>
  )
}
