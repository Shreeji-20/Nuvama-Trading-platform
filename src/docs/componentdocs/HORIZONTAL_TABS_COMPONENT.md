# HorizontalTabs Component Documentation

## Overview

A modern, fully-featured tabs component with multiple variants, icons support, and dark mode. Perfect for organizing content into switchable sections.

## Import

```tsx
import { HorizontalTabs } from "../../components/HorizontalTabs";
```

## Basic Usage

```tsx
<HorizontalTabs
  tabs={[
    {
      id: "tab1",
      label: "Tab 1",
      content: <div>Content for Tab 1</div>,
    },
    {
      id: "tab2",
      label: "Tab 2",
      content: <div>Content for Tab 2</div>,
    },
  ]}
/>
```

---

## Props Reference

### HorizontalTabsProps

| Prop               | Type                                  | Default      | Description                           |
| ------------------ | ------------------------------------- | ------------ | ------------------------------------- |
| `tabs`             | `Tab[]`                               | **Required** | Array of tab objects                  |
| `defaultActiveTab` | `string`                              | First tab ID | ID of initially active tab            |
| `onChange`         | `function`                            | `undefined`  | Callback when tab changes             |
| `variant`          | `"default" \| "pills" \| "underline"` | `"default"`  | Visual style variant                  |
| `fullWidth`        | `boolean`                             | `false`      | Make tabs span full width             |
| `centered`         | `boolean`                             | `true`       | Center with max-width container       |
| `padding`          | `boolean \| string`                   | `true`       | Container padding (true/false/custom) |

### Tab Interface

```tsx
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}
```

---

## Variants

### Default

Classic tabs with border-bottom indicator.

```tsx
<HorizontalTabs variant="default" tabs={tabs} />
```

**Styling:**

- Rounded top corners
- Border-bottom on active tab
- Background color change
- Best for traditional layouts

### Pills

Modern pill-shaped tabs.

```tsx
<HorizontalTabs variant="pills" tabs={tabs} />
```

**Styling:**

- Fully rounded corners
- Solid background on active
- Shadow on active tab
- Best for modern, clean interfaces

### Underline

Minimal underline indicator.

```tsx
<HorizontalTabs variant="underline" tabs={tabs} />
```

**Styling:**

- Bottom border indicator only
- No background change
- Clean, minimal design
- Best for subtle navigation

---

## Examples

### Basic Tabs

```tsx
const tabs = [
  {
    id: "overview",
    label: "Overview",
    content: <div>Overview content here</div>,
  },
  {
    id: "details",
    label: "Details",
    content: <div>Details content here</div>,
  },
  {
    id: "settings",
    label: "Settings",
    content: <div>Settings content here</div>,
  },
];

<HorizontalTabs tabs={tabs} />;
```

### With Icons

```tsx
import { User, Settings, Bell } from "lucide-react";

<HorizontalTabs
  variant="pills"
  tabs={[
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      content: <ProfilePage />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      content: <SettingsPage />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      content: <NotificationsPage />,
    },
  ]}
/>;
```

### Full Width Tabs

```tsx
<HorizontalTabs variant="underline" fullWidth={true} tabs={tabs} />
```

### Disabled Tab

```tsx
<HorizontalTabs
  tabs={[
    {
      id: "active",
      label: "Active Tab",
      content: <div>This tab works</div>,
    },
    {
      id: "disabled",
      label: "Disabled Tab",
      content: <div>This content won't show</div>,
      disabled: true,
    },
  ]}
/>
```

### With onChange Callback

```tsx
<HorizontalTabs
  tabs={tabs}
  defaultActiveTab="settings"
  onChange={(tabId) => {
    console.log("Active tab:", tabId);
    trackPageView(tabId);
  }}
/>
```

### No Padding

```tsx
<HorizontalTabs padding={false} tabs={tabs} />
```

### Custom Padding

```tsx
<HorizontalTabs padding="p-2" tabs={tabs} />
```

---

## Advanced Use Cases

### User Dashboard Tabs

```tsx
import { User, Activity, CreditCard, Settings } from "lucide-react";

<HorizontalTabs
  variant="pills"
  tabs={[
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <UserProfile user={currentUser} />
        </div>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity className="h-4 w-4" />,
      content: <ActivityFeed activities={activities} />,
    },
    {
      id: "billing",
      label: "Billing",
      icon: <CreditCard className="h-4 w-4" />,
      content: <BillingInfo />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      content: <UserSettings />,
    },
  ]}
/>;
```

### Data Views with Tables

```tsx
<HorizontalTabs
  variant="underline"
  fullWidth={true}
  tabs={[
    {
      id: "all",
      label: "All Users",
      content: (
        <ReactTable data={allUsers} padding={false} fullHeight={false} />
      ),
    },
    {
      id: "active",
      label: "Active",
      content: (
        <ReactTable data={activeUsers} padding={false} fullHeight={false} />
      ),
    },
    {
      id: "inactive",
      label: "Inactive",
      content: (
        <ReactTable data={inactiveUsers} padding={false} fullHeight={false} />
      ),
    },
  ]}
/>
```

### Statistics Dashboard

```tsx
<HorizontalTabs
  variant="default"
  tabs={[
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Revenue" value="$12,345" />
          <StatCard title="Users" value="1,234" />
          <StatCard title="Orders" value="567" />
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      content: <ChartsView data={analyticsData} />,
    },
    {
      id: "reports",
      label: "Reports",
      content: <ReportsTable reports={reports} />,
    },
  ]}
/>
```

### Conditional Tabs

```tsx
const tabs = [
  {
    id: "public",
    label: "Public Info",
    content: <PublicData />,
  },
];

if (isAdmin) {
  tabs.push({
    id: "admin",
    label: "Admin Panel",
    content: <AdminPanel />,
  });
}

<HorizontalTabs tabs={tabs} />;
```

---

## External State Management

Use the `useTabs` hook for external control:

```tsx
import { HorizontalTabs, useTabs } from "../../components/HorizontalTabs";

function MyComponent() {
  const { activeTab, setActiveTab } = useTabs("profile");

  return (
    <div>
      <button onClick={() => setActiveTab("settings")}>Go to Settings</button>

      <HorizontalTabs
        tabs={tabs}
        defaultActiveTab={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}
```

---

## Styling & Theming

### Dark Mode

Automatically adapts to dark mode with proper contrast and colors.

### Responsive Design

- Adapts padding at different breakpoints
- Stacks naturally on small screens
- Full width option for mobile-friendly layouts

### Centering & Layout

```tsx
// Centered with max-width (default)
<HorizontalTabs centered={true} tabs={tabs} />

// Full width
<HorizontalTabs centered={false} tabs={tabs} />
```

---

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Focus States**: Visible focus indicators
- **Disabled State**: Properly styled and non-interactive
- **ARIA**: Semantic button elements

---

## Tips & Best Practices

1. **Icons**: Add icons for better visual navigation
2. **Default Tab**: Always set a sensible `defaultActiveTab`
3. **Variants**:
   - Use `pills` for modern, app-like interfaces
   - Use `underline` for minimal, content-focused layouts
   - Use `default` for traditional web applications
4. **Full Width**: Enable for mobile-friendly navigation
5. **Callbacks**: Track tab changes for analytics
6. **Content**: Keep tab content focused and related
7. **Labels**: Use clear, concise tab labels (1-2 words)

---

## Common Patterns

### Settings Tabs

```tsx
<HorizontalTabs
  variant="underline"
  fullWidth={false}
  tabs={[
    { id: "general", label: "General", content: <GeneralSettings /> },
    { id: "security", label: "Security", content: <SecuritySettings /> },
    {
      id: "notifications",
      label: "Notifications",
      content: <NotificationSettings />,
    },
    { id: "advanced", label: "Advanced", content: <AdvancedSettings /> },
  ]}
/>
```

### Product Details

```tsx
<HorizontalTabs
  variant="pills"
  tabs={[
    {
      id: "description",
      label: "Description",
      content: <ProductDescription />,
    },
    { id: "specs", label: "Specifications", content: <ProductSpecs /> },
    { id: "reviews", label: "Reviews", content: <ProductReviews /> },
  ]}
/>
```

### Admin Dashboard

```tsx
<HorizontalTabs
  variant="default"
  fullWidth={true}
  tabs={[
    {
      id: "users",
      label: "Users",
      icon: <Users className="h-4 w-4" />,
      content: <UsersTable />,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart className="h-4 w-4" />,
      content: <OrdersTable />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart className="h-4 w-4" />,
      content: <AnalyticsDashboard />,
    },
  ]}
/>
```

---

## Comparison with Accordion

Use **HorizontalTabs** when:

- Content sections are mutually exclusive
- Only one view should be visible at a time
- Navigation between sections is the primary use case
- You want a traditional tabbed interface

Use **Accordion** when:

- Multiple sections can be open simultaneously
- Content is hierarchical or grouped
- Vertical space is a concern
- Users need to compare content across sections
