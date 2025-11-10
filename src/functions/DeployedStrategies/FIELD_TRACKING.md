# Simplified Field-Level Update System

## Overview

The editing system now uses a pure field-level tracking approach that sends **only the changed fields** to the backend, with exact paths for nested fields.

## How It Works

### 1. **Start Editing**

When you click "Edit" on a strategy:

```typescript
startEditing(strategy, setEditingStrategy, setChangedFields, setEditValues);
```

- Deep clones the strategy config
- Resets `changedFields` to empty object `{}`
- Stores the config in `editValues` for UI display

### 2. **Track Changes**

When any field is modified:

```typescript
handleEditChange('baseConfig.executionMode', 'Live Mode', ...);
handleEditChange('legs.LEG_001.quantity', 10, ...);
handleEditChange('legs.LEG_001.onTargetActionConfig.actionCount', 2, ...);
```

Each change is tracked with:

- **Exact path**: Full dot-notation path to the field
- **Value**: The new value

The `changedFields` object grows as you edit:

```javascript
{
  "baseConfig.executionMode": "Live Mode",
  "legs.LEG_001.quantity": 10,
  "legs.LEG_001.onTargetActionConfig.actionCount": 2
}
```

### 3. **Save Changes**

When you click "Save":

```typescript
saveEdit(strategyId);
```

The system:

1. Checks if there are any changes (`changedFields` not empty)
2. Sends **ONLY** the changed fields to backend:

```json
{
  "strategyId": "STRATEGY_ABC123",
  "changes": {
    "baseConfig.executionMode": "Live Mode",
    "legs.LEG_001.quantity": 10,
    "legs.LEG_001.onTargetActionConfig.actionCount": 2
  }
}
```

3. Backend receives and applies only these specific fields
4. Full config is validated after changes are applied

## Examples

### Example 1: Change Execution Mode

```typescript
// User changes execution mode dropdown
handleEditChange('baseConfig.executionMode', 'Live Mode');

// On save, sends:
{
  "changes": {
    "baseConfig.executionMode": "Live Mode"
  }
}
```

### Example 2: Edit a Leg's Quantity

```typescript
// User changes LEG_001 quantity from 5 to 10
handleEditChange('legs.LEG_001.quantity', 10);

// On save, sends:
{
  "changes": {
    "legs.LEG_001.quantity": 10
  }
}
```

### Example 3: Multiple Nested Changes

```typescript
// User makes several changes:
handleEditChange('baseConfig.executionMode', 'Live Mode');
handleEditChange('legs.LEG_001.quantity', 10);
handleEditChange('legs.LEG_001.symbol', 'BANKNIFTY');
handleEditChange('legs.LEG_002.onTargetActionConfig.actionCount', 2);
handleEditChange('executionParams.orderRetryCount', 5);

// On save, sends ALL changes:
{
  "changes": {
    "baseConfig.executionMode": "Live Mode",
    "legs.LEG_001.quantity": 10,
    "legs.LEG_001.symbol": "BANKNIFTY",
    "legs.LEG_002.onTargetActionConfig.actionCount": 2,
    "executionParams.orderRetryCount": 5
  }
}
```

## Benefits

✅ **Minimal Network Traffic**: Only changed fields are sent (typically < 1KB vs full config ~5KB+)  
✅ **Clear Intent**: Backend knows exactly what was changed  
✅ **Audit Trail**: Easy to log and track what fields were modified  
✅ **Performance**: Faster updates with smaller payloads  
✅ **Conflict Resolution**: Easier to handle concurrent edits

## Backend Integration

The backend endpoint `/strategy/update-fields/{strategy_id}` receives the changes and:

1. Retrieves existing config from Redis
2. Applies each change by navigating the path
3. Validates the complete config after applying changes
4. Saves back to Redis if valid

Example backend log:

```
📝 Received field updates for STRATEGY_ABC123
✅ Updated field: baseConfig.executionMode = Live Mode
✅ Updated field: legs.LEG_001.quantity = 10
✅ Strategy fields updated successfully (2 fields changed)
```

## Notes

- **No sanitization**: Values are sent as-is, backend validates
- **No backend field removal**: We send what user changed, backend handles its own fields
- **Deep clone on start**: Prevents reference issues during editing
- **Path-based tracking**: Works for any level of nesting
- **Reset on cancel**: All changes are discarded
- **Empty check**: Alerts if user tries to save with no changes
