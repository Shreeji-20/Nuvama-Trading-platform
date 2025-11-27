# Strategy-Wise Trading State Implementation

## Overview

Each strategy now has its own `tradingState` field that can be controlled independently from the global trading state. This allows you to start/pause/stop individual strategies while others continue running.

## Backend Implementation

### Model Changes - `BaseConfig`

Added new field to `BaseConfig` class in `strategy_config.py`:

```python
tradingState: Literal["START", "STOP", "PAUSE"] = Field("STOP", description="Individual strategy trading state")
```

**Default Value:** `"STOP"` (for safety)

### New Endpoints

#### POST `/strategy/trading-state/{strategy_id}`

Updates the trading state of a specific strategy.

**Request Body:**

```json
{
  "state": "START" | "STOP" | "PAUSE"
}
```

**Response:**

```json
{
  "message": "Strategy trading state updated to START",
  "strategyId": "STRATEGY_ABC123",
  "state": "START",
  "timestamp": "2025-11-13T10:30:00"
}
```

**Behavior:**

- Updates `baseConfig.tradingState` in Redis
- Updates timestamp
- Returns 404 if strategy not found
- Returns 500 on internal errors

#### GET `/strategy/trading-state/{strategy_id}`

Retrieves the current trading state of a specific strategy.

**Response:**

```json
{
  "message": "Strategy trading state retrieved successfully",
  "strategyId": "STRATEGY_ABC123",
  "state": "START"
}
```

**Behavior:**

- Returns current state from `baseConfig.tradingState`
- Defaults to `"STOP"` if field not found
- Returns 404 if strategy not found

## Frontend Implementation

### Updated Functions in `tradingControls.ts`

#### 1. `handleStrategyStatusChange(strategyId, newStatus, currentStrategyStatus, handlers)`

Now calls the backend API to update strategy state.

**State Mapping:**

- Frontend `"running"` → Backend `"START"`
- Frontend `"paused"` → Backend `"PAUSE"`
- Frontend `"stopped"` → Backend `"STOP"`

**Usage:**

```typescript
handleStrategyStatusChange("STRATEGY_ABC123", "running", strategyStatus, {
  setStrategyStatus,
});
```

#### 2. `startStrategy(strategyId, handlers)`

Starts a specific strategy by setting state to `"START"`.

**Implementation:**

```typescript
const response = await fetch(
  `${API_BASE_URL}/strategy/trading-state/${strategyId}`,
  {
    method: "POST",
    body: JSON.stringify({ state: "START" }),
  }
);
```

#### 3. `pauseStrategy(strategyId, handlers)`

Pauses a specific strategy by setting state to `"PAUSE"`.

#### 4. `stopStrategy(strategyId, handlers)`

Stops a specific strategy by setting state to `"STOP"`.

#### 5. `fetchStrategyTradingState(strategyId, handlers)` ✨ NEW

Fetches current strategy state from backend and syncs local UI.

**State Mapping:**

- Backend `"START"` → Frontend `"running"`
- Backend `"PAUSE"` → Frontend `"paused"`
- Backend `"STOP"` → Frontend `"stopped"`

**Usage:**

```typescript
// Fetch state when strategies are loaded
strategies.forEach((strategy) => {
  fetchStrategyTradingState(strategy.strategyId, { setStrategyStatus });
});
```

## UI Integration

### Radio Buttons in StrategyCard

Each strategy card has radio buttons for:

- 🟢 **Start/Play** (running)
- 🟡 **Pause** (paused)
- 🔴 **Stop/Square** (stopped)

### State Persistence

- Strategy state is stored in Redis `strategy_config:{strategyId}`
- State persists across frontend refreshes
- State is independent of global trading state

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│        Frontend - Individual Strategy Controls          │
│  Radio Buttons: ● Running  ○ Paused  ○ Stopped         │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │  API POST Call                    │
    │  /strategy/trading-state/{id}     │
    │  Body: {"state": "START"}         │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────┐
    │          Redis - Strategy Config         │
    │  Key: strategy_config:{strategyId}      │
    │  Field: baseConfig.tradingState         │
    │  Value: "START" | "STOP" | "PAUSE"      │
    └─────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────┐
    │     Strategy Execution Engine            │
    │  Checks baseConfig.tradingState          │
    │  before executing trades                 │
    └─────────────────────────────────────────┘
```

## Integration with Strategy Execution

### Reading State in Strategy Execution

```python
import redis
from redis_client import r
import json

def should_execute_strategy_trade(strategy_id: str) -> bool:
    """Check if strategy trading is allowed"""
    redis_key = f"strategy_config:{strategy_id}"
    config_data = r.hgetall(redis_key)

    if not config_data:
        return False

    strategy_config = {
        k.decode(): json.loads(v.decode()) if k.decode() != "timestamp" else v.decode()
        for k, v in config_data.items()
    }

    base_config = strategy_config.get("baseConfig", {})
    trading_state = base_config.get("tradingState", "STOP")

    if trading_state == "STOP":
        return False
    elif trading_state == "PAUSE":
        return False
    elif trading_state == "START":
        # Also check global state
        global_state = r.get("globalTradingState")
        if isinstance(global_state, bytes):
            global_state = global_state.decode('utf-8')

        return global_state == "START"
    else:
        return False

# In your strategy execution
if should_execute_strategy_trade(strategy_id):
    # Execute trading logic
    place_order(...)
else:
    # Skip trading
    log(f"Strategy {strategy_id} is currently stopped/paused")
```

## Hierarchy of Control

```
Global Trading State (affects ALL strategies)
    ↓
    ├─ If GLOBAL = STOP → No strategies can trade
    ├─ If GLOBAL = PAUSE → No strategies can trade
    └─ If GLOBAL = START → Check individual strategy states
        ↓
        Individual Strategy States
            ├─ Strategy A = START → ✅ Can trade
            ├─ Strategy B = PAUSE → ❌ Cannot trade
            └─ Strategy C = STOP  → ❌ Cannot trade
```

**Rule:** For a strategy to execute trades, BOTH global state AND strategy state must be `"START"`

## Complete State Management

### On Component Mount

```typescript
useEffect(() => {
  // Fetch global trading state
  fetchGlobalTradingState({
    setIsTrading,
    setIsPaused,
    setTradingLoading,
  });

  // Fetch strategies
  fetchStrategies();
}, []);

// After strategies are loaded
useEffect(() => {
  // Fetch individual strategy states
  strategies.forEach((strategy) => {
    fetchStrategyTradingState(strategy.baseConfig.strategyId, {
      setStrategyStatus,
    });
  });
}, [strategies]);
```

## Error Handling

### Backend

- Returns 404 if strategy doesn't exist
- Returns 500 for Redis errors
- Logs all errors with traceback
- Preserves existing strategy data on update

### Frontend

- Shows alert on API errors
- Logs errors to console
- Maintains previous state on error
- Confirmation dialogs for all state changes

## Testing Checklist

Backend:

- [ ] Create new strategy has tradingState = "STOP" by default
- [ ] POST /strategy/trading-state/{id} updates state correctly
- [ ] GET /strategy/trading-state/{id} returns current state
- [ ] Invalid strategy ID returns 404
- [ ] Invalid state values are rejected
- [ ] State persists in Redis
- [ ] Timestamp updates on state change

Frontend:

- [ ] Radio buttons show correct initial state
- [ ] Clicking radio buttons calls API
- [ ] State updates in UI after API success
- [ ] Error messages shown on failure
- [ ] Confirmation dialogs work
- [ ] State persists across page refresh
- [ ] Multiple strategies can have different states

## Files Modified

✅ `c:\Users\shree\OneDrive\Desktop\TrueData\routers\strategy_config.py`

- Added `tradingState` field to `BaseConfig`
- Added `StrategyTradingStateRequest` model
- Added POST `/strategy/trading-state/{strategy_id}` endpoint
- Added GET `/strategy/trading-state/{strategy_id}` endpoint

✅ `c:\Users\shree\OneDrive\Desktop\Reac_Nuvama\nuvama\src\pages\DeployedStrategiesFunctions\tradingControls.ts`

- Updated `handleStrategyStatusChange` with API call
- Updated `startStrategy` with API call
- Updated `pauseStrategy` with API call
- Updated `stopStrategy` with API call
- Added `fetchStrategyTradingState` function

✅ `c:\Users\shree\OneDrive\Desktop\Reac_Nuvama\nuvama\src\pages\DeployedStrategiesFunctions\index.ts`

- Exported `fetchStrategyTradingState`

## Benefits

1. **Granular Control** - Start/pause/stop individual strategies
2. **Safety** - Default state is STOP
3. **Persistence** - State survives restarts
4. **Independence** - Each strategy controlled separately
5. **Global Override** - Global state can stop all strategies
6. **Audit Trail** - Timestamps track state changes
7. **Type Safety** - Pydantic validation in backend
8. **Error Handling** - Comprehensive error messages

## Future Enhancements

1. **State History** - Track state changes over time per strategy
2. **Scheduled State Changes** - Auto-start/stop at specific times
3. **Conditional State** - Auto-pause on certain conditions
4. **Bulk Operations** - Start/stop multiple strategies at once
5. **State Groups** - Group strategies and control together
6. **Permission Control** - Role-based access to strategy controls
7. **Webhooks** - Notify on state changes
8. **State Analytics** - Report on strategy uptime/downtime

All changes complete with zero errors! 🎉
