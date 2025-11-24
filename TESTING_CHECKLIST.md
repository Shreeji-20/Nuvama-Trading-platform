# Testing Checklist for Refactored StrategyTags

## Pre-Migration

- [ ] Backup original `StrategyTags.jsx` to `StrategyTags_OLD.jsx`
- [ ] Rename `StrategyTags_NEW.jsx` to `StrategyTags.jsx`

## Functional Tests

### Page Load

- [ ] Page loads without errors
- [ ] Users are fetched and displayed in dropdown
- [ ] Existing tags are loaded and displayed in table
- [ ] Loading spinner shows during data fetch

### Create Tag Flow

- [ ] Can select user from dropdown
- [ ] Can enter multiplier value
- [ ] "Add" button adds user to "Added Users" table
- [ ] Can add multiple users with different multipliers
- [ ] Can remove user from "Added Users" table
- [ ] Can update multiplier in "Added Users" table
- [ ] Tag name is required (validation)
- [ ] At least one user required (validation)
- [ ] Can toggle "Allow Market Orders" checkbox
- [ ] Can set retry after and retry count
- [ ] Can toggle "Market at Last" checkbox
- [ ] Can select price type (LTP/BidAsk/Depth)
- [ ] Depth index appears when "Depth" selected
- [ ] Can select better price logic type
- [ ] Can enter better price logic value
- [ ] "Create Tag" button submits successfully
- [ ] Success message appears after creation
- [ ] Form resets after successful creation
- [ ] New tag appears in table immediately

### Table Display

- [ ] All 8 columns display correctly
- [ ] Tag name shows as blue badge
- [ ] Description displays or shows "-"
- [ ] Users & Multipliers show as green badges
- [ ] Market Orders shows Yes/No badge with correct color
- [ ] Order Failure shows retry count and interval
- [ ] Modify Options shows price type and logic type
- [ ] Created date formats correctly
- [ ] Actions column shows Edit and Delete buttons

### Inline Editing

- [ ] Click "Edit" button enters edit mode
- [ ] Row highlights with blue background
- [ ] Tag name becomes input field
- [ ] Description becomes input field
- [ ] User multipliers become number inputs
- [ ] Market Orders becomes checkbox
- [ ] Retry count/after become number inputs
- [ ] Price type becomes select dropdown
- [ ] Better Price Logic becomes select dropdown
- [ ] "Save" and "Cancel" buttons appear
- [ ] Can modify all fields
- [ ] "Save" button updates tag successfully
- [ ] Success message appears
- [ ] Table updates with new values
- [ ] "Cancel" button exits edit mode without saving
- [ ] Edit mode only affects one row at a time

### Delete Tag

- [ ] Click "Delete" button shows confirmation dialog
- [ ] Clicking "OK" deletes the tag
- [ ] Success message appears
- [ ] Tag disappears from table
- [ ] Clicking "Cancel" does nothing

### Error Handling

- [ ] Network errors show error message
- [ ] API errors display error message
- [ ] Validation errors show appropriate messages
- [ ] Messages auto-dismiss after 5 seconds

### UI/UX

- [ ] All text sizes are 0.7rem as expected
- [ ] Dark mode works correctly
- [ ] Hover effects work on buttons
- [ ] Transitions are smooth
- [ ] Table is responsive
- [ ] Form is responsive on mobile
- [ ] Loading states disable buttons
- [ ] No console errors

## Component Integration Tests

- [ ] StrategyTagsHeader displays correctly
- [ ] MessageAlert shows/hides properly
- [ ] CreateTagForm renders all sections
- [ ] TagsTable displays loading state
- [ ] TagsTable displays empty state
- [ ] TagTableRow switches between view/edit modes

## Performance

- [ ] Page loads quickly
- [ ] No unnecessary re-renders
- [ ] API calls are not duplicated
- [ ] State updates are efficient

## Regression Tests

- [ ] All original functionality works
- [ ] No visual differences from original
- [ ] Same API endpoints are called
- [ ] Same data format is sent/received

## Notes

- Record any issues found:
  - Issue:
  - Steps to reproduce:
  - Expected:
  - Actual:
