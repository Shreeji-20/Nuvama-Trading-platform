# DeployedStrategiesFunctions

This folder contains the business logic functions for the DeployedStrategies component, organized into separate modules for better maintainability and testability.

## Structure

```
DeployedStrategiesFunctions/
├── index.ts              # Main export file
├── tradingControls.ts    # Trading control functions
└── README.md            # This file
```

## Modules

### tradingControls.ts

Contains all trading control functions, divided into two categories:

#### Global Trading Controls

Functions that control the overall trading system:

- **`handleStartTrading`** - Start global trading
- **`handleStopTrading`** - Stop global trading
- **`handlePauseTrading`** - Pause/resume global trading

#### Strategy-Wise Trading Controls

Functions that control individual strategies:

- **`handleStrategyStatusChange`** - Change the status of a specific strategy
- **`startStrategy`** - Start a specific strategy
- **`pauseStrategy`** - Pause a specific strategy
- **`stopStrategy`** - Stop a specific strategy

#### Utility Functions

Helper functions for checking strategy status:

- **`getStrategyStatus`** - Get the current status of a strategy
- **`isStrategyRunning`** - Check if a strategy is running
- **`isStrategyPaused`** - Check if a strategy is paused
- **`isStrategyStopped`** - Check if a strategy is stopped

## Types

### StrategyStatus

```typescript
type StrategyStatus = "stopped" | "running" | "paused";
```

### GlobalTradingHandlers

```typescript
interface GlobalTradingHandlers {
  setIsTrading: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  setTradingLoading: (value: boolean) => void;
}
```

### StrategyStatusHandlers

```typescript
interface StrategyStatusHandlers {
  setStrategyStatus: React.Dispatch<
    React.SetStateAction<Record<string, StrategyStatus>>
  >;
}
```

## Usage

### Import from index

```typescript
import {
  handleStartTrading,
  handleStopTrading,
  handlePauseTrading,
  handleStrategyStatusChange,
  type StrategyStatus,
} from "./DeployedStrategiesFunctions";
```

### Or import directly from modules

```typescript
import {
  handleStartTrading,
  startStrategy,
  type StrategyStatus,
} from "./DeployedStrategiesFunctions/tradingControls";
```

### Example: Global Trading Control

```typescript
// In your component
const handleStart = async () => {
  await handleStartTrading({
    setIsTrading,
    setIsPaused,
    setTradingLoading,
  });
};
```

### Example: Strategy-Wise Control

```typescript
// In your component
const handleStatusChange = async (
  strategyId: string,
  newStatus: StrategyStatus
) => {
  await handleStrategyStatusChange(strategyId, newStatus, strategyStatus, {
    setStrategyStatus,
  });
};
```

## API Integration

All functions currently simulate API calls with setTimeout. To integrate with the actual backend:

1. Locate the `// TODO:` comments in each function
2. Uncomment and modify the API endpoint URLs
3. Handle the response data appropriately
4. Remove or comment out the `await new Promise(...)` simulation line

Example:

```typescript
// Replace this:
await new Promise((resolve) => setTimeout(resolve, 500));

// With this:
const response = await fetch(`${API_BASE_URL}/trading/start`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
});

if (!response.ok) {
  throw new Error(`Failed to start trading: ${response.status}`);
}
```

## Benefits of This Organization

1. **Separation of Concerns** - Business logic is separated from UI components
2. **Reusability** - Functions can be used in multiple components
3. **Testability** - Easier to write unit tests for isolated functions
4. **Maintainability** - Changes to business logic don't require touching UI code
5. **Type Safety** - TypeScript types ensure proper usage across the application
6. **Documentation** - Centralized location for all trading control logic

## Future Enhancements

Consider adding:

- Error handling utilities
- Logging functions
- Analytics tracking
- State persistence functions
- Batch operation functions (e.g., start/stop multiple strategies)
