# StrategiesFilter Component

## Overview

A comprehensive filtering component for the DeployedStrategies page that provides multiple filter options to help users find and manage their trading strategies efficiently.

## Location

`src/components/DeployedStrategies/StrategiesFilter.tsx`

## Features

### Filter Options

1. **Search Text Filter**

   - Search by strategy name or strategy ID
   - Real-time text search with case-insensitive matching
   - Full-width search bar with search icon

2. **Symbol Filter**

   - Filter by trading symbols (NIFTY, BANKNIFTY, FINNIFTY, SENSEX)
   - Dropdown selection
   - Shows "All Symbols" as default option

3. **Tag Filter**

   - Filter by strategy tags
   - Dynamically populated from available tags
   - Shows "All Tags" as default option

4. **Status Filter**

   - Filter by strategy trading status
   - Options: Running, Paused, Stopped
   - Shows "All Status" as default option

5. **Execution Mode Filter**

   - Filter by execution mode
   - Options: Live Mode, Simulation Mode
   - Shows "All Modes" as default option

6. **Underlying Filter**

   - Filter by underlying asset type
   - Options: Spot, Futures
   - Shows "All Types" as default option

7. **Lots Range Filters**

   - **Min Lots**: Filter strategies with minimum number of lots
   - **Max Lots**: Filter strategies with maximum number of lots
   - Numeric input fields with validation

8. **Selected Only Checkbox**
   - Toggle to show only strategies marked as "Selected for Trading"
   - Checkbox with label

### UI Features

- **Active Filter Indicator**: Shows "Active" badge when filters are applied
- **Clear All Button**: One-click to reset all filters
- **Filter Summary**: Displays:
  - Total strategies showing vs total strategies
  - Number of selected strategies
  - Number of running strategies
  - Number of strategies in Live Mode
- **Responsive Grid**: Adapts to different screen sizes (1/2/4 columns)
- **Dark Mode Support**: Full dark mode compatibility

## Props

```typescript
interface FilterOptions {
  symbol: string;
  tag: string;
  status: string;
  showSelectedOnly: boolean;
  executionMode: string;
  underlying: string;
  searchText: string;
  minLots: string;
  maxLots: string;
}

interface StrategiesFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  strategies: Strategy[];
  filteredStrategies: Strategy[];
  availableTags: StrategyTag[];
  symbolOptions: string[];
}
```

### Prop Descriptions

- `filters`: Current filter state object
- `onFiltersChange`: Callback function when any filter changes
- `strategies`: All strategies (unfiltered)
- `filteredStrategies`: Strategies after applying filters
- `availableTags`: Available strategy tags for tag dropdown
- `symbolOptions`: Available symbols for symbol dropdown

## Usage Example

```tsx
import { StrategiesFilter } from "../components/DeployedStrategies";
import type { FilterOptions } from "../components/DeployedStrategies/StrategiesFilter";

const MyComponent = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    symbol: "",
    tag: "",
    status: "",
    showSelectedOnly: false,
    executionMode: "",
    underlying: "",
    searchText: "",
    minLots: "",
    maxLots: "",
  });

  // Filter logic
  const filteredStrategies = strategies.filter((strategy) => {
    // Apply search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const strategyId = strategy.strategyId?.toLowerCase() || "";
      const strategyName =
        strategy.config?.baseConfig?.strategyName?.toLowerCase() || "";
      if (
        !strategyId.includes(searchLower) &&
        !strategyName.includes(searchLower)
      ) {
        return false;
      }
    }

    // Apply symbol filter
    if (filters.symbol && strategy.symbols) {
      const hasSymbol = strategy.symbols.some(
        (symbol) => symbol.toLowerCase() === filters.symbol.toLowerCase()
      );
      if (!hasSymbol) return false;
    }

    // ... other filters

    return true;
  });

  return (
    <StrategiesFilter
      filters={filters}
      onFiltersChange={setFilters}
      strategies={strategies}
      filteredStrategies={filteredStrategies}
      availableTags={availableTags}
      symbolOptions={["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"]}
    />
  );
};
```

## Filter Logic Implementation

The filter logic is implemented in the parent component (DeployedStrategies.tsx):

```typescript
const filteredStrategies = strategies.filter((strategy) => {
  // Search text
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    const strategyId = strategy.strategyId?.toLowerCase() || "";
    const strategyName =
      strategy.config?.baseConfig?.strategyName?.toLowerCase() || "";
    if (
      !strategyId.includes(searchLower) &&
      !strategyName.includes(searchLower)
    ) {
      return false;
    }
  }

  // Symbol filter
  if (filters.symbol && strategy.symbols) {
    const hasSymbol = strategy.symbols.some(
      (symbol) => symbol.toLowerCase() === filters.symbol.toLowerCase()
    );
    if (!hasSymbol) return false;
  }

  // Tag filter
  if (filters.tag) {
    const strategyTag = strategy.config?.executionParams?.strategyTag || "";
    if (strategyTag.toLowerCase() !== filters.tag.toLowerCase()) return false;
  }

  // Status filter
  if (filters.status) {
    const status = strategyStatus[strategy.strategyId] || "stopped";
    if (status !== filters.status) return false;
  }

  // Execution mode filter
  if (filters.executionMode) {
    const mode = strategy.config?.baseConfig?.executionMode || "";
    if (mode !== filters.executionMode) return false;
  }

  // Underlying filter
  if (filters.underlying) {
    const underlying = strategy.config?.baseConfig?.underlying || "";
    if (underlying !== filters.underlying) return false;
  }

  // Lots range filter
  const lots = strategy.config?.baseConfig?.lots || 0;
  if (filters.minLots && lots < parseInt(filters.minLots)) return false;
  if (filters.maxLots && lots > parseInt(filters.maxLots)) return false;

  // Selected only filter
  if (filters.showSelectedOnly && !strategy.isSelectedForTrading) {
    return false;
  }

  return true;
});
```

## Styling

The component uses Tailwind CSS with dark mode support:

- **Light Mode**: White background, gray borders, blue accents
- **Dark Mode**: Dark gray background, darker borders, blue accents
- **Focus States**: Blue ring on focus for accessibility
- **Hover States**: Subtle hover effects on buttons

## Accessibility

- Proper label associations for all inputs
- Keyboard navigation support
- Focus indicators on all interactive elements
- Screen reader friendly structure

## Benefits

1. **User Experience**: Easy to find specific strategies quickly
2. **Performance**: Client-side filtering for instant results
3. **Flexibility**: Multiple filter combinations supported
4. **Visibility**: Clear feedback on active filters and results
5. **Maintainability**: Separate component for easy updates
6. **Reusability**: Can be used in other strategy listing pages

## Future Enhancements

Potential additions:

- Save filter presets
- Filter history
- Advanced search with operators (AND/OR)
- Date range filters for strategy creation
- P&L range filters
- Export filtered strategies
- Bulk actions on filtered strategies
