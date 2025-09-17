'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Room } from '@/types/hotel'
import RoomRow from './RoomRow'

interface RoomListProps {
  rooms: Room[]
  onSelectRoom: (room: Room) => void
  selectedRoomId?: string
  className?: string
}

interface RoomGroup {
  name: string
  rooms: Room[]
  isExpanded: boolean
}

export default function RoomList({ 
  rooms, 
  onSelectRoom, 
  selectedRoomId,
  className = '' 
}: RoomListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [boardFilter, setBoardFilter] = useState('all')
  const [refundableFilter, setRefundableFilter] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Group rooms by their group property
  const roomGroups = useMemo(() => {
    const groups: { [key: string]: Room[] } = {}
    
    rooms.forEach(room => {
      const groupName = room.group || 'Other'
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(room)
    })

    return Object.entries(groups).map(([name, rooms]) => ({
      name,
      rooms,
      isExpanded: expandedGroups.has(name)
    }))
  }, [rooms, expandedGroups])

  // Filter rooms based on search and filters
  const filteredRoomGroups = useMemo(() => {
    return roomGroups.map(group => ({
      ...group,
      rooms: group.rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            room.bedType.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesBoard = boardFilter === 'all' || room.board.toLowerCase().includes(boardFilter.toLowerCase())
        
        const matchesRefundable = !refundableFilter || room.refundable
        
        return matchesSearch && matchesBoard && matchesRefundable
      })
    })).filter(group => group.rooms.length > 0)
  }, [roomGroups, searchQuery, boardFilter, refundableFilter])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  const expandAllGroups = () => {
    setExpandedGroups(new Set(roomGroups.map(group => group.name)))
  }

  const collapseAllGroups = () => {
    setExpandedGroups(new Set())
  }

  const clearFilters = () => {
    setSearchQuery('')
    setBoardFilter('all')
    setRefundableFilter(false)
  }

  const hasActiveFilters = searchQuery || boardFilter !== 'all' || refundableFilter

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Available Rooms</h2>
          <p className="text-sm text-gray-600">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAllGroups}
            className="text-xs"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAllGroups}
            className="text-xs"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Filter Rooms</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary/80"
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          
          {/* Board Type Filter */}
          <Select value={boardFilter} onValueChange={setBoardFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Meal Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meal Plans</SelectItem>
              <SelectItem value="room only">Room Only</SelectItem>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="half board">Half Board</SelectItem>
              <SelectItem value="full board">Full Board</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Refundable Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="refundable"
              checked={refundableFilter}
              onCheckedChange={(checked) => setRefundableFilter(checked as boolean)}
            />
            <label htmlFor="refundable" className="text-sm text-gray-700">
              Refundable only
            </label>
          </div>
        </div>
      </div>

      {/* Room Groups */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRoomGroups.map((group, groupIndex) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <span className="text-sm text-gray-500">
                    {group.rooms.length} option{group.rooms.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {expandedGroups.has(group.name) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {/* Group Rooms */}
              <AnimatePresence>
                {expandedGroups.has(group.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      {group.rooms.map((room, roomIndex) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: roomIndex * 0.05 }}
                        >
                          <RoomRow
                            room={room}
                            onSelect={onSelectRoom}
                            isSelected={selectedRoomId === room.id}
                            showImages={true}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredRoomGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}







