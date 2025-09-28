# Slot-Based Activity Filtering Implementation

This document describes the implementation of slot-based filtering and timeline blocking for activities based on the new `slot` and `startTime` fields.

## Overview

The system now supports:
- **Slot-based filtering**: Filter activities by time of day (morning, afternoon, evening, full_day)
- **Timeline blocking**: Prevent overlapping activities in the same time slot
- **Start time filtering**: Show activities that start within the selected slot
- **Conflict detection**: Block activities that would overlap with existing ones

## Key Components

### 1. **Activity Slot Filter Utility** (`/lib/utils/activitySlotFilter.ts`)

**Core Functions:**
- `filterActivitiesBySlot()` - Filter activities by day slot
- `filterActivitiesByStartTime()` - Filter activities by start time within slot
- `hasTimeConflict()` - Check for time overlaps
- `calculateEndTime()` - Calculate activity end time
- `getAvailableTimeSlots()` - Get available time slots

**Time Management:**
- `timeToMinutes()` - Convert time to minutes since midnight
- `minutesToTime()` - Convert minutes back to time string
- `isTimeInRange()` - Check if time falls within range
- `isTimeOverlap()` - Check for time conflicts

### 2. **Slot Selector Component** (`/components/activities/SlotSelector.tsx`)

**Features:**
- Visual slot selection with icons
- Blocked slot indication
- Time of day filtering
- Responsive grid layout

**Props:**
```typescript
interface SlotSelectorProps {
  selectedSlot: DaySlot | null
  onSlotChange: (slot: DaySlot | null) => void
  blockedSlots: DaySlot[]
  className?: string
}
```

### 3. **Activity Timeline Component** (`/components/activities/ActivityTimeline.tsx`)

**Features:**
- Display scheduled activities
- Show start/end times
- Visual timeline representation
- Slot-based grouping

**Props:**
```typescript
interface ActivityTimelineProps {
  blockedSlots: ActivityTimeBlock[]
  selectedSlot?: string
  className?: string
}
```

## Data Structure Updates

### **Activity Interface** (`/types/activity.ts`)

**Added Fields:**
```typescript
interface Activity {
  // ... existing fields
  slot: 'morning' | 'afternoon' | 'evening' | 'full_day'
  startTime: string
}
```

### **ActivityTimeBlock Interface**

**New Interface:**
```typescript
interface ActivityTimeBlock {
  id: string
  startTime: string
  endTime: string
  title: string
  slot: DaySlot
}
```

## GraphQL Updates

### **Activity Queries** (`/graphql/queries/activities.ts`)

**Added Fields:**
```graphql
activity {
  id
  title
  # ... other fields
  slot
  startTime
  # ... other fields
}
```

### **Trip Query** (`/graphql/queries/proposal.ts`)

**Added Fields:**
```graphql
activity {
  id
  title
  # ... other fields
  slot
  startTime
  # ... other fields
}
```

## Implementation Details

### **Slot-Based Filtering Logic**

1. **Filter by Slot**: `filterActivitiesBySlot(activities, 'morning')`
2. **Filter by Start Time**: `filterActivitiesByStartTime(activities, 'morning')`
3. **Check Conflicts**: `hasTimeConflict(newActivity, existingActivities)`

### **Timeline Blocking**

1. **Calculate End Time**: `calculateEndTime(startTime, durationMinutes)`
2. **Check Overlaps**: `isTimeOverlap(start1, end1, start2, end2)`
3. **Update Blocked Slots**: Automatically update when activities are added/removed

### **Time Slot Management**

**Day Time Slots:**
- **Morning**: 06:00 - 12:00
- **Afternoon**: 12:00 - 18:00
- **Evening**: 18:00 - 23:59
- **Full Day**: 06:00 - 23:59

**Available Time Slots:**
- 30-minute intervals within each slot
- Automatic conflict detection
- Real-time availability updates

## Usage Examples

### **Filter Activities by Slot**
```typescript
// Filter morning activities
const morningActivities = filterActivitiesBySlot(activities, 'morning')

// Filter activities by start time within afternoon slot
const afternoonActivities = filterActivitiesByStartTime(activities, 'afternoon')
```

### **Check for Time Conflicts**
```typescript
// Check if new activity conflicts with existing ones
const hasConflict = hasTimeConflict(newActivity, existingActivities)

if (hasConflict) {
  throw new Error('Activity conflicts with existing schedule')
}
```

### **Get Available Time Slots**
```typescript
// Get available time slots for morning
const availableSlots = getAvailableTimeSlots('morning', blockedActivities)
```

## UI Components

### **Slot Selector**
```tsx
<SlotSelector
  selectedSlot={selectedSlot}
  onSlotChange={setSelectedSlot}
  blockedSlots={blockedSlots}
/>
```

### **Activity Timeline**
```tsx
<ActivityTimeline
  blockedSlots={blockedTimeSlots}
  selectedSlot={selectedSlot}
/>
```

## Error Handling

### **Time Conflict Prevention**
- Automatic conflict detection before booking
- Clear error messages for overlapping activities
- Visual indication of blocked time slots

### **Validation**
- Start time validation within slot ranges
- Duration validation for activity length
- Slot availability checking

## Benefits

### ✅ **Enhanced User Experience**
- Clear time slot visualization
- Prevents double-booking
- Intuitive slot selection

### ✅ **Better Activity Management**
- Slot-based organization
- Time conflict prevention
- Efficient scheduling

### ✅ **Improved Data Integrity**
- Prevents overlapping activities
- Validates time constraints
- Maintains schedule consistency

## Testing Scenarios

- ✅ **Morning Activities**: Filter and display morning activities
- ✅ **Afternoon Activities**: Filter and display afternoon activities
- ✅ **Evening Activities**: Filter and display evening activities
- ✅ **Full Day Activities**: Filter and display full day activities
- ✅ **Time Conflicts**: Prevent overlapping activities
- ✅ **Slot Blocking**: Block unavailable time slots
- ✅ **Timeline Updates**: Real-time timeline updates

This implementation provides a comprehensive slot-based filtering system that enhances the activity booking experience while preventing scheduling conflicts.
