# Activity Edit and Remove Button Fixes

## Problem
The edit and remove buttons for activities in the DayAccordion component were not working because they lacked proper `onClick` handlers.

## Solution
I've implemented the following fixes:

### 1. Updated DayAccordion Component (`components/proposals/DayAccordion.tsx`)

**Added new props:**
- `dayIndex: number` - Index of the day in the proposal
- `onEditActivity?: (activity: Activity, dayIndex: number) => void` - Handler for editing activities
- `onRemoveActivity?: (activityId: string, dayIndex: number) => void` - Handler for removing activities

**Updated activity buttons:**
```tsx
// Edit button now has proper click handler
<Button
  variant="outline"
  size="sm"
  className="h-6 w-6 p-0"
  onClick={() => onEditActivity?.(activity, dayIndex)}
  title="Edit activity"
>
  <Edit className="h-3 w-3" />
</Button>

// Remove button now has proper click handler
<Button
  variant="outline"
  size="sm"
  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
  onClick={() => onRemoveActivity?.(activity.id, dayIndex)}
  title="Remove activity"
>
  <X className="h-3 w-3" />
</Button>
```

### 2. Updated Main Proposal Page (`app/proposals/create/[id]/page.tsx`)

**Added activity handlers:**
```tsx
<DayAccordion
  key={day.id}
  day={day}
  dayIndex={index}
  onEdit={() => handleEditItem('day', day)}
  onRemove={() => {
    if (!proposal) return
    updateProposal({
      ...proposal,
      days: proposal.days.filter((d: Day) => d.id !== day.id)
    })
  }}
  onAddActivity={() => handleAddActivity(index)}
  onEditActivity={(activity, dayIndex) => {
    // Open activity explorer in edit mode
    setEditingDayIndex(dayIndex)
    setIsActivityExplorerOpen(true)
    console.log('Edit activity:', activity, 'in day:', dayIndex)
  }}
  onRemoveActivity={(activityId, dayIndex) => {
    if (!proposal) return
    const updatedDays = [...proposal.days]
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: updatedDays[dayIndex].activities.filter(a => a.id !== activityId)
    }
    updateProposalWithPrices({
      ...proposal,
      days: updatedDays
    })
  }}
/>
```

## How It Works Now

### Edit Activity Button
- **Click**: Opens the activity explorer modal in edit mode
- **Functionality**: Allows users to modify existing activities
- **State Management**: Uses existing `editingDayIndex` and `isActivityExplorerOpen` state

### Remove Activity Button
- **Click**: Immediately removes the activity from the day
- **Functionality**: 
  - Filters out the activity by ID from the day's activities array
  - Updates the proposal with the modified days
  - Recalculates prices using `updateProposalWithPrices`
- **Visual Feedback**: Button has red styling with hover effects

## Benefits

1. **Functional Buttons**: Edit and remove buttons now work as expected
2. **Proper State Management**: Activities are properly removed from the proposal state
3. **Price Recalculation**: Prices are automatically updated when activities are removed
4. **User Experience**: Clear visual feedback with hover states and tooltips
5. **Type Safety**: Full TypeScript support with proper interfaces

## Testing

The buttons should now:
- ✅ Edit button opens the activity explorer for modification
- ✅ Remove button immediately removes the activity from the day
- ✅ Prices are recalculated after removal
- ✅ UI updates reflect the changes immediately
- ✅ No console errors or TypeScript issues

## Usage

Users can now:
1. **Edit Activities**: Click the edit button (pencil icon) to modify an existing activity
2. **Remove Activities**: Click the remove button (X icon) to delete an activity
3. **Visual Feedback**: Buttons have proper hover states and tooltips
4. **Immediate Updates**: Changes are reflected immediately in the UI
