# Strategy Editors Refactoring Options

## Current Implementation (Approach 2)

Your current setup uses factory functions, which is good! But we can make it even better.

### How to Upgrade to Approach 3 (Custom Hook)

**Step 1: Update DeployedStrategies.tsx**

Replace this:

```tsx
<BaseConfigTable
  onCellEdit={createBaseConfigEditHandler(
    strategy.baseConfig.strategyId,
    setStrategies
  )}
/>
```

With this:

```tsx
// Inside the Accordion items.map(), BUT you can't use hooks inside .map()
// So you need to refactor to a separate component
```

**Step 2: Create StrategyAccordionItem component**

```tsx
// StrategyAccordionItem.tsx
import { useStrategyEditors } from "./useStrategyEditors";
import {
  BaseConfigTable,
  LegsTable,
  ExecutionParamsTable,
} from "./ConfigTables";

interface Props {
  strategy: any;
}

export const StrategyAccordionItem: React.FC<Props> = ({ strategy }) => {
  const editors = useStrategyEditors(
    strategy.baseConfig.strategyId,
    setStrategies
  );

  return (
    <div>
      <BaseConfigTable
        data={strategy.baseConfig}
        onCellEdit={editors.handleBaseConfigEdit}
      />
      <LegsTable legs={strategy.legs} onCellEdit={editors.handleLegsEdit} />
      <ExecutionParamsTable
        data={strategy.executionParams}
        onCellEdit={editors.handleExecutionParamsEdit}
      />
    </div>
  );
};
```

**Step 3: Use in Accordion**

```tsx
<Accordion
  items={strategies.map((strategy) => ({
    id: strategy.baseConfig.strategyId,
    title: <StrategyTitle strategy={strategy} />,
    content: (
      <StrategyAccordionItem
        strategy={strategy}
        setStrategies={setStrategies}
      />
    ),
  }))}
/>
```

## Performance Benefits

### Approach 2 (Current)

- ❌ Creates new function on every render
- ❌ Can cause child components to re-render unnecessarily

### Approach 3 (Recommended)

- ✅ Functions memoized with `useCallback`
- ✅ Only recreates when `strategyId` or `setStrategies` changes
- ✅ Better React DevTools profiling

## Testing Benefits

### Pure Functions (both approaches have this)

```tsx
// EditFunctions.test.ts
test("updateBaseConfig updates the correct strategy", () => {
  const strategies = [{ baseConfig: { strategyId: "1", name: "Old" } }];

  const result = updateBaseConfig(strategies, "1", "name", "New");

  expect(result[0].baseConfig.name).toBe("New");
});
```

No need to mock React, useState, or anything!

## Recommendation

**For your current use case:**

- Stick with **Approach 2** (what I just implemented) if:

  - Performance isn't critical
  - You prefer simplicity
  - Less files to manage

- Upgrade to **Approach 3** if:
  - You want maximum performance
  - Following React best practices is important
  - You plan to scale this pattern to many components

Both are significantly better than your original approach!
