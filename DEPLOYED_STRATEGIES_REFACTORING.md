# DeployedStrategies Component Refactoring

## Overview

The `DeployedStrategies.jsx` file (3447 lines) has been split into multiple smaller, reusable components and organized files for better maintainability.

## New File Structure

### Types

- **`src/types/deployedStrategies.types.ts`** - Comprehensive TypeScript type definitions including:
  - `Order`, `OrderResponseData`, `LiveOrderDetails`
  - `PositionPnLData`, `MarketDepthData`, `OptionData`
  - `DeployedStrategy`, `StrategySummary`
  - Component prop interfaces for all new components
  - Helper interfaces for state management

### Constants

- **`src/constants/deployedStrategies.constants.ts`** - Centralized constants:
  - `ORDER_STATUS` - Status matching arrays
  - `SYMBOL_OPTIONS` - Trading symbols
  - `TABS` - Tab configuration
  - `HEDGE_TYPE_OPTIONS` - Hedge types
  - `REFRESH_INTERVALS` - Auto-refresh timing
  - Order status helper functions (`isOrderComplete`, `isOrderRejected`, etc.)

### Components

#### 1. **StrategyHeader.tsx**

Displays the page header with:

- Title and description
- Refresh button with loading state
- Total strategies count

**Props:**

- `strategiesCount: number`
- `onRefresh: () => void`
- `loading?: boolean`

#### 2. **OpenPositionsTab.tsx**

Shows all open and closed positions with:

- Position summary (open/closed counts, total P&L)
- Live refresh indicator
- Position table with entry/exit prices
- Real-time P&L calculation display
- Square off functionality

**Props:** `TabContentProps` interface

#### 3. **OpenOrdersTab.tsx**

Displays pending orders with:

- Order count badge
- Live refresh indicator
- Detailed order information (qty, fill qty, prices)
- Status badges (pending, rejected, etc.)
- Rejection reasons

**Props:** `TabContentProps` interface

#### 4. **CompletedOrdersTab.tsx**

Shows completed/rejected/cancelled orders with:

- Order count badge
- Live refresh indicator
- Final order details (fill qty, avg price)
- Status indicators
- Historical data

**Props:** `TabContentProps` interface

## Benefits of Refactoring

### 1. **Maintainability**

- Each component has a single, clear responsibility
- Easier to locate and fix bugs
- Changes to one tab don't affect others

### 2. **Reusability**

- Tab components can be reused in other strategy views
- Common types and constants prevent duplication
- Helper functions centralized for consistency

### 3. **Type Safety**

- Comprehensive TypeScript interfaces
- Better IDE autocomplete and error detection
- Clear prop contracts between components

### 4. **Testing**

- Smaller components are easier to unit test
- Can mock props and test in isolation
- Helper functions can be tested independently

### 5. **Performance**

- Components can be optimized individually
- Easier to implement React.memo where needed
- Clearer data flow

## Remaining Work in Main File

The main `DeployedStrategies.jsx` file still contains:

- Strategy CRUD operations (fetch, update, delete, copy)
- Edit state management
- Auto-refresh logic
- P&L calculation functions
- Option data caching
- Excel export functionality
- Strategy card and configuration display

## Recommended Next Steps

### Phase 2: Custom Hooks

Extract business logic into custom hooks:

1. **`useStrategyOrders.ts`**

   - Order fetching logic
   - Auto-refresh management
   - Loading states

2. **`usePnLCalculation.ts`**

   - P&L calculation for positions
   - Market depth fetching
   - Option data caching

3. **`useStrategyActions.ts`**

   - CRUD operations (create, read, update, delete)
   - Copy strategy
   - Export to Excel

4. **`useEditState.ts`**
   - Edit mode management
   - Form state handling
   - Validation

### Phase 3: Additional Components

5. **`StrategyConfigurationView.tsx`**

   - Base configuration display/edit
   - Legs table integration
   - Execution parameters
   - Target/stoploss settings
   - Dynamic hedge settings

6. **`EditPremiumStrikeModal.tsx`**
   - Premium based strike configuration modal
   - Form handling for strike config

## Usage Example

```tsx
import StrategyHeader from "../components/StrategyHeader";
import OpenPositionsTab from "../components/OpenPositionsTab";
import {
  TABS,
  isOrderComplete,
} from "../constants/deployedStrategies.constants";
import { Order, PositionPnLData } from "../types/deployedStrategies.types";

function DeployedStrategies() {
  const [strategies, setStrategies] = useState([]);

  return (
    <div>
      <StrategyHeader
        strategiesCount={strategies.length}
        onRefresh={fetchStrategies}
        loading={loading}
      />

      {/* Strategy cards and tabs */}
      <OpenPositionsTab
        strategy={strategy}
        orders={orders}
        loadingOrders={false}
        positionPnL={pnlData}
        loadingPnL={{}}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onSquareOff={handleSquareOff}
      />
    </div>
  );
}
```

## File Size Comparison

- **Before:** 1 file, 3447 lines
- **After:**
  - Main file: ~2000-2500 lines (estimated after full refactor)
  - Types: 200 lines
  - Constants: 60 lines
  - Components: 4 files, ~200-300 lines each
  - Hooks: TBD (estimated 300-500 lines total)

**Total reduction in main file complexity: ~40-50%**

## Migration Notes

- Existing `DeployedStrategies` folder components (StrategyCard, PositionRow, etc.) are being reused
- New components use TypeScript (.tsx) for better type safety
- Constants file uses helper functions for order status checking
- All new components are documented with clear prop interfaces
