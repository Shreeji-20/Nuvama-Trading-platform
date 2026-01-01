# Nested Field Editing in ReactTable

## Overview

The `ReactTable` component now supports editing nested fields using dot notation (e.g., `"config.enabled"`, `"settings.theme.darkMode"`).

## How It Works

### 1. **Nested Field Access**

The table automatically generates columns for nested objects and allows you to edit them using dot notation paths.

### 2. **Configuration**

```tsx
<ReactTable
  data={myData}
  editable={true}
  editableColumns={[
    "name", // Top-level field
    "config.enabled", // Nested field (1 level)
    "settings.theme.darkMode", // Nested field (2 levels)
    "on_square_off_action_config.create_order", // Your actual nested field
  ]}
  cellInputType={{
    name: "text",
    "config.enabled": "checkbox",
    "settings.theme.darkMode": "checkbox",
    "on_square_off_action_config.create_order": "checkbox",
  }}
  onCellEdit={(rowIndex, columnId, newValue, rowData) => {
    // columnId will be the full path like "config.enabled"
    // Update your data accordingly
    console.log(`Row ${rowIndex}, Field: ${columnId}, New Value: ${newValue}`);
  }}
/>
```

## Real Example from ConfigTables.tsx

### Before (using modal workaround):

```tsx
// Had to hide nested fields
hideColumns={[
  "on_square_off_action_config.*",
]}

// Then use a modal to edit them separately
<FlexibleModal>
  <FlexibleForm fields={...} />
</FlexibleModal>
```

### After (direct editing):

```tsx
<ReactTable
  editableColumns={[
    "symbol",
    "lots",
    // Nested fields can now be edited directly!
    "on_square_off_action_config.create_order",
    "on_square_off_action_config.modify_order",
    "on_square_off_action_config.cancel_order",
    "on_square_off_action_config.square_off",
    "on_square_off_action_config.reverse_order",
  ]}
  cellInputType={{
    symbol: "select",
    lots: "number",
    // Nested field types
    "on_square_off_action_config.create_order": "checkbox",
    "on_square_off_action_config.modify_order": "checkbox",
    "on_square_off_action_config.cancel_order": "checkbox",
    "on_square_off_action_config.square_off": "checkbox",
    "on_square_off_action_config.reverse_order": "checkbox",
  }}
  // Only hide the configs you DON'T want to show
  hideColumns={["on_stoploss_action_config.*", "on_target_action_config.*"]}
/>
```

## Features

### ✅ Supported Input Types for Nested Fields

- `checkbox` - Toggle boolean values
- `text` - Edit text values
- `number` - Edit numeric values
- `select` - Dropdown selection
- `password` - Password input

### ✅ What Works

- Reading nested values (display in table)
- Editing nested values (click to edit)
- Checkbox toggle for nested booleans (click once to toggle)
- Text/number input for nested primitives
- Dropdown selection for nested fields

### ✅ Column Hiding

You can still hide nested columns using wildcards:

```tsx
hideColumns={[
  "config.*",                    // Hide all fields under config
  "settings.theme.*",            // Hide all fields under settings.theme
  "on_square_off_action_config.*" // Hide all onSquareOffActionConfig fields
]}
```

## onCellEdit Callback

When a nested field is edited, your `onCellEdit` receives the full path:

```tsx
onCellEdit={(rowIndex, columnId, newValue, rowData) => {
  // columnId = "on_square_off_action_config.create_order"
  // newValue = true/false
  // rowData = entire row object

  // You need to update your data structure accordingly
  // The table passes the dot notation path, you handle the update
}}
```

## Tips

1. **Column Labels**: Use `columnLabels` to provide friendly names:

   ```tsx
   columnLabels={{
     "on_square_off_action_config.create_order": "Create Order",
     "on_square_off_action_config.modify_order": "Modify Order",
   }}
   ```

2. **Column Order**: Control which columns appear first:

   ```tsx
   columnOrder={[
     "symbol",
     "lots",
     "on_square_off_action_config.create_order",
     // ... rest will appear after
   ]}
   ```

3. **Dropdown Options**: Works for nested fields too:
   ```tsx
   dropdownOptions={{
     "config.mode": ["dev", "prod", "test"],
     "settings.theme.color": ["light", "dark", "auto"],
   }}
   ```

## Migration Guide

If you were using the modal pattern before:

1. **Remove** the modal and `flattenObject` calls
2. **Add** nested field paths to `editableColumns`
3. **Add** nested field types to `cellInputType`
4. **Remove** the nested fields from `hideColumns` (or keep them if you don't want to show them)
5. **Update** your `onCellEdit` handler to process nested paths

That's it! The table now handles nested field editing automatically.
