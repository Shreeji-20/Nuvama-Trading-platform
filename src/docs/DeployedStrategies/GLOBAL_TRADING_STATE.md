# Global Trading State Management

## Overview

The global trading state feature allows controlling the entire trading system from the frontend UI. The state is persisted in Redis and synchronized between backend and frontend.

## Backend Implementation

### Endpoint: `/global-trading-state`

#### GET `/global-trading-state`

Retrieves the current global trading state from Redis.

**Response:**

```json
{
  "message": "Global trading state retrieved successfully",
  "state": "START" | "STOP" | "PAUSE"
}
```

**Behavior:**

- If Redis key `globalTradingState` doesn't exist, it initializes with `"STOP"`
- Returns current state: `START`, `STOP`, or `PAUSE`

#### POST `/global-trading-state`

Updates the global trading state in Redis.

**Request Body:**

```json
{
  "state": "START" | "STOP" | "PAUSE"
}
```

**Response:**

```json
{
  "message": "Global trading state updated to START",
  "state": "START"
}
```

**Validation:**

- Accepts only: `START`, `STOP`, `PAUSE` (case-insensitive)
- Returns 400 error for invalid states

### Redis Key

- **Key Name:** `globalTradingState`
- **Type:** String
- **Values:** `"START"`, `"STOP"`, `"PAUSE"`
- **Default:** `"STOP"` (auto-initialized if not present)

## Frontend Implementation

### Functions in `tradingControls.ts`

#### 1. `fetchGlobalTradingState(handlers)`

Fetches current state from backend and syncs local UI state.

**Parameters:**

- `handlers`: GlobalTradingHandlers object with state setters

**State Mapping:**

- `"START"` → isTrading=true, isPaused=false
- `"PAUSE"` → isTrading=true, isPaused=true
- `"STOP"` → isTrading=false, isPaused=false

**Usage:**

```typescript
// Call on component mount
useEffect(() => {
  fetchGlobalTradingState({
    setIsTrading,
    setIsPaused,
    setTradingLoading,
  });
}, []);
```

#### 2. `handleStartTrading(handlers)`

Starts global trading by setting state to `"START"`.

**Behavior:**

- Sends POST request with `{ state: "START" }`
- Updates UI: isTrading=true, isPaused=false
- Shows success alert

#### 3. `handleStopTrading(handlers)`

Stops global trading by setting state to `"STOP"`.

**Behavior:**

- Shows confirmation dialog
- Sends POST request with `{ state: "STOP" }`
- Updates UI: isTrading=false, isPaused=false
- Shows success alert

#### 4. `handlePauseTrading(isPaused, handlers)`

Toggles pause state between `"PAUSE"` and `"START"`.

**Behavior:**

- Shows confirmation dialog
- If paused → sends `{ state: "START" }` (resume)
- If running → sends `{ state: "PAUSE" }` (pause)
- Updates UI: toggles isPaused
- Shows success alert

## UI Components

### Start Trading Button

- Icon: Play (▶️)
- Color: Green
- Action: Calls `handleStartTrading()`
- Disabled when: isTrading=true

### Pause Trading Button

- Icon: Pause (⏸️) or Play (▶️) when paused
- Color: Yellow
- Action: Calls `handlePauseTrading()`
- Text: "Pause Trading" or "Resume Trading"
- Disabled when: isTrading=false

### Stop Trading Button

- Icon: Square (⏹️)
- Color: Red
- Action: Calls `handleStopTrading()`
- Requires confirmation
- Disabled when: isTrading=false

## State Flow

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend UI                          │
│  [Start] [Pause/Resume] [Stop]                          │
└──────────────┬──────────────────────┬───────────────────┘
               │                       │
               ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  API POST Call   │    │  API GET Call    │
    │  /global-trading │    │  /global-trading │
    │  -state          │    │  -state          │
    └────────┬─────────┘    └────────┬─────────┘
             │                        │
             ▼                        ▼
    ┌─────────────────────────────────────────┐
    │          Redis Database                  │
    │  Key: "globalTradingState"              │
    │  Value: "START" | "STOP" | "PAUSE"      │
    └─────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────┐
    │     Trading System Components            │
    │  (Check Redis key to determine if       │
    │   orders should be executed)            │
    └─────────────────────────────────────────┘
```

## Integration with Trading System

### Reading State in Strategy Execution

```python
import redis
from redis_client import r

def should_execute_trade():
    """Check if trading is allowed"""
    state = r.get("globalTradingState")

    if state == "STOP":
        return False
    elif state == "PAUSE":
        return False
    elif state == "START":
        return True
    else:
        # Default to STOP if key doesn't exist
        return False

# In your strategy execution
if should_execute_trade():
    # Execute trading logic
    place_order(...)
else:
    # Skip trading, just monitor
    log("Trading is currently stopped/paused")
```

## Error Handling

### Backend

- Returns 400 for invalid state values
- Returns 500 for Redis connection errors
- Logs all errors with traceback

### Frontend

- Shows alert on API errors
- Logs errors to console
- Maintains previous state on error
- Loading state prevents multiple clicks

## Testing Checklist

- [ ] Start trading updates Redis to "START"
- [ ] Stop trading updates Redis to "STOP"
- [ ] Pause trading updates Redis to "PAUSE"
- [ ] Resume trading updates Redis to "START"
- [ ] GET endpoint returns current state
- [ ] Invalid state values rejected with 400
- [ ] State persists across frontend refreshes
- [ ] Confirmation dialogs work correctly
- [ ] Loading states prevent race conditions
- [ ] Error alerts show helpful messages

## Future Enhancements

1. **WebSocket Updates**: Real-time state sync across multiple clients
2. **Audit Log**: Track who changed state and when
3. **Scheduled Trading**: Auto-start/stop at specific times
4. **Emergency Stop**: Single button to stop all active strategies
5. **State History**: Track state changes over time
6. **Permission Control**: Role-based access to trading controls
7. **Notification System**: Alert on state changes via email/SMS
8. **Recovery Mode**: Auto-pause on system errors

## Notes

- State is stored as plain string in Redis (not JSON)
- State is case-insensitive in API but stored uppercase
- Default state is "STOP" for safety
- Frontend checks state on component mount
- All actions require user confirmation (except start)
