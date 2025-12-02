# ReactTable Component Documentation

## Overview

A powerful, flexible, and feature-rich table component built with TanStack Table. Supports sorting, filtering, pagination, inline editing, custom styling, and button actions.

## Import

```tsx
import { ReactTable } from "../pages/table";
```

## Basic Usage

```tsx
<ReactTable data={users} title="Users Table" description="List of all users" />
```

---

## Props Reference

### Data Props

| Prop           | Type                     | Default | Description                      |
| -------------- | ------------------------ | ------- | -------------------------------- |
| `data`         | `any[]`                  | `[]`    | Array of data objects to display |
| `columnOrder`  | `string[] \| null`       | `null`  | Specify column order             |
| `hideColumns`  | `string[]`               | `[]`    | Array of column IDs to hide      |
| `columnLabels` | `Record<string, string>` | `{}`    | Custom labels for columns        |

### Display Props

| Prop          | Type                 | Default                   | Description                                    |
| ------------- | -------------------- | ------------------------- | ---------------------------------------------- |
| `title`       | `string`             | `"Data Table"`            | Table title                                    |
| `description` | `string`             | `"Displaying table data"` | Table description                              |
| `showHeader`  | `boolean`            | `true`                    | Show/hide header                               |
| `headerStyle` | `"card" \| "inline"` | `"card"`                  | Header display style                           |
| `headerGap`   | `boolean`            | `true`                    | Gap between header and table (card style only) |
| `showFooter`  | `boolean`            | `true`                    | Show/hide pagination footer                    |
| `showFilters` | `boolean`            | `true`                    | Show/hide filter inputs                        |
| `fullHeight`  | `boolean`            | `true`                    | Full viewport height                           |
| `centered`    | `boolean`            | `true`                    | Center content with max-width                  |
| `padding`     | `boolean \| string`  | `true`                    | Container padding (true/false/custom classes)  |

### Scroll & Pagination

| Prop              | Type      | Default   | Description                              |
| ----------------- | --------- | --------- | ---------------------------------------- |
| `scrollMode`      | `boolean` | `false`   | Enable scroll mode (disables pagination) |
| `maxScrollHeight` | `string`  | `"500px"` | Max height in scroll mode                |

### Editing Props

| Prop              | Type                        | Default | Description                              |
| ----------------- | --------------------------- | ------- | ---------------------------------------- |
| `editable`        | `boolean`                   | `false` | Enable inline editing                    |
| `editableColumns` | `string[]`                  | `[]`    | Columns that can be edited (empty = all) |
| `onCellEdit`      | `function`                  | `null`  | Callback when cell is edited             |
| `cellInputType`   | `Record<string, InputType>` | `{}`    | Input type per column                    |
| `dropdownOptions` | `Record<string, string[]>`  | `{}`    | Options for select inputs                |

### Styling Props

| Prop         | Type       | Default | Description                      |
| ------------ | ---------- | ------- | -------------------------------- |
| `cellStyler` | `function` | `null`  | Custom cell styling function     |
| `rounded`    | `boolean`  | `false` | Rounded corners for styled cells |

### Button Props

| Prop               | Type                                             | Default | Description                 |
| ------------------ | ------------------------------------------------ | ------- | --------------------------- |
| `buttonColumns`    | `Record<string, ButtonConfig \| ButtonConfig[]>` | `{}`    | Action buttons in columns   |
| `headerButtons`    | `HeaderButtonConfig[]`                           | `[]`    | Buttons in table header     |
| `showAddRow`       | `boolean`                                        | `false` | Show "Add Row" button       |
| `onAddRow`         | `function`                                       | `null`  | Callback when row is added  |
| `defaultRowValues` | `any`                                            | `{}`    | Default values for new rows |

---

## Button Configuration

### Row Buttons (ButtonConfig)

```tsx
interface ButtonConfig {
  label: string | ((rowData: any, rowIndex: number) => string);
  onClick: (rowData: any, rowIndex: number) => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "light"
    | "dark";
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean | ((rowData: any, rowIndex: number) => boolean);
}
```

**Example:**

```tsx
buttonColumns={{
  actions: [
    {
      label: "Edit",
      onClick: (rowData) => editUser(rowData),
      variant: "primary",
      icon: <Edit className="w-3 h-3" />
    },
    {
      label: "Delete",
      onClick: (rowData) => deleteUser(rowData),
      variant: "danger",
      disabled: (rowData) => rowData.isProtected
    }
  ]
}}
```

### Header Buttons (HeaderButtonConfig)

```tsx
interface HeaderButtonConfig {
  label: string;
  onClick: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "light"
    | "dark";
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
```

**Example:**

```tsx
headerButtons={[
  {
    label: "Export",
    onClick: () => exportData(),
    variant: "success",
    icon: <Download className="h-4 w-4" />
  },
  {
    label: "Refresh",
    onClick: () => fetchData(),
    variant: "secondary",
    className: "bg-purple-500 hover:bg-purple-600 text-white"
  }
]}
```

---

## Advanced Examples

### Editable Table with Dropdowns

```tsx
<ReactTable
  data={users}
  editable={true}
  editableColumns={["name", "role", "status"]}
  cellInputType={{
    name: "text",
    role: "select",
    status: "select",
    password: "password",
  }}
  dropdownOptions={{
    role: ["Admin", "User", "Manager"],
    status: ["Active", "Inactive"],
  }}
  onCellEdit={(rowIndex, columnId, newValue, rowData) => {
    console.log("Cell edited:", { rowIndex, columnId, newValue });
  }}
/>
```

### Custom Cell Styling

```tsx
<ReactTable
  data={orders}
  rounded={true}
  cellStyler={(value, columnId, rowData) => {
    if (columnId === "status") {
      if (value === "Completed") {
        return {
          bgColor: "bg-green-100 dark:bg-green-900/20",
          textColor: "text-green-800 dark:text-green-300",
          rounded: "rounded-full",
        };
      }
      if (value === "Pending") {
        return {
          bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
          textColor: "text-yellow-800 dark:text-yellow-300",
          rounded: "rounded-full",
        };
      }
    }
    return null;
  }}
/>
```

### Scroll Mode Table

```tsx
<ReactTable
  data={largeDataset}
  scrollMode={true}
  maxScrollHeight="600px"
  showFooter={false}
  fullHeight={false}
/>
```

### No Padding, Inline Header

```tsx
<ReactTable
  data={compactData}
  padding={false}
  headerStyle="inline"
  fullHeight={false}
  centered={false}
/>
```

### Add Row Functionality

```tsx
<ReactTable
  data={users}
  showAddRow={true}
  defaultRowValues={{
    userId: "",
    userName: "New User",
    role: "User",
    status: "Active",
  }}
  onAddRow={(newRow) => {
    setUsers([...users, newRow]);
  }}
/>
```

---

## Button Variants

| Variant     | Description                      | Colors                              |
| ----------- | -------------------------------- | ----------------------------------- |
| `primary`   | Default blue                     | `bg-blue-600 hover:bg-blue-700`     |
| `secondary` | Gray                             | `bg-gray-600 hover:bg-gray-700`     |
| `danger`    | Red                              | `bg-red-600 hover:bg-red-700`       |
| `success`   | Green                            | `bg-green-600 hover:bg-green-700`   |
| `warning`   | Yellow                           | `bg-yellow-500 hover:bg-yellow-600` |
| `light`     | Light gray (dark mode adaptive)  | `bg-gray-100 hover:bg-gray-200`     |
| `dark`      | Dark gray (inverts in dark mode) | `bg-gray-800 hover:bg-gray-900`     |

---

## Input Types

Supported cell input types:

- `"text"` - Text input
- `"number"` - Number input
- `"select"` - Dropdown select
- `"checkbox"` - Checkbox (displays ✓/✗)
- `"password"` - Password input

---

## Callbacks

### onCellEdit

```tsx
(rowIndex: number, columnId: string, newValue: any, rowData: any) => void
```

Called when a cell is edited.

### onAddRow

```tsx
(newRowData: any) => void
```

Called when "Add Row" button is clicked.

---

## Tips & Best Practices

1. **Performance**: Use `columnOrder` and `hideColumns` to optimize large tables
2. **Responsive**: Table automatically handles responsive breakpoints
3. **Dark Mode**: Fully supports dark mode with tailwind classes
4. **Accessibility**: Built-in keyboard navigation and focus states
5. **Custom Buttons**: Use `className` prop to override variant styles completely
6. **Dynamic Buttons**: Button labels and disabled states can be functions for dynamic behavior

---

## Common Use Cases

### User Management Table

```tsx
<ReactTable
  title="Users"
  data={users}
  headerButtons={[
    { label: "Add User", onClick: () => openModal(), variant: "primary" },
  ]}
  buttonColumns={{
    actions: [
      { label: "Edit", onClick: editUser, variant: "primary" },
      { label: "Delete", onClick: deleteUser, variant: "danger" },
    ],
  }}
/>
```

### Order Status Table

```tsx
<ReactTable
  data={orders}
  cellStyler={(value, columnId) => {
    if (columnId === "amount" && value > 1000) {
      return { textColor: "text-green-600 dark:text-green-400", bgColor: "" };
    }
    return null;
  }}
/>
```

### Compact Embedded Table

```tsx
<ReactTable
  data={items}
  padding={false}
  fullHeight={false}
  showHeader={false}
  showFooter={false}
  showFilters={false}
/>
```
