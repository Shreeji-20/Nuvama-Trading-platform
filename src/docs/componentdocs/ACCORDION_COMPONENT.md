# Accordion Component Documentation

## Overview

A flexible, accessible accordion component with multiple variants, dark mode support, and customizable styling. Perfect for organizing collapsible content sections.

## Import

```tsx
import Accordion from "../../components/Accordion";
```

## Basic Usage

```tsx
<Accordion
  items={[
    {
      id: "item-1",
      title: "Section 1",
      content: <p>Content for section 1</p>,
    },
    {
      id: "item-2",
      title: "Section 2",
      content: <p>Content for section 2</p>,
    },
  ]}
/>
```

---

## Props Reference

### AccordionProps

| Prop             | Type                                     | Default      | Description                              |
| ---------------- | ---------------------------------------- | ------------ | ---------------------------------------- |
| `items`          | `AccordionItem[]`                        | **Required** | Array of accordion items                 |
| `allowMultiple`  | `boolean`                                | `false`      | Allow multiple items open simultaneously |
| `defaultOpenIds` | `(string \| number)[]`                   | `[]`         | IDs of items open by default             |
| `variant`        | `"default" \| "bordered" \| "separated"` | `"default"`  | Visual style variant                     |
| `className`      | `string`                                 | `""`         | Additional CSS classes                   |
| `centered`       | `boolean`                                | `true`       | Center with max-width container          |
| `padding`        | `boolean \| string`                      | `true`       | Container padding (true/false/custom)    |
| `onToggle`       | `function`                               | `undefined`  | Callback when item is toggled            |

### AccordionItem

```tsx
interface AccordionItem {
  id: string | number;
  title: string | React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}
```

---

## Variants

### Default

Basic accordion with simple styling and spacing.

```tsx
<Accordion variant="default" items={items} />
```

**Styling:**

- Light background headers
- Simple spacing
- Rounded corners

### Bordered

Accordion with borders and no spacing between items.

```tsx
<Accordion variant="bordered" items={items} />
```

**Styling:**

- Single border around all items
- Border separators between items
- No gaps between sections

### Separated

Each item has its own card with shadow and spacing.

```tsx
<Accordion variant="separated" items={items} />
```

**Styling:**

- Individual cards with shadows
- Spacing between items
- Best for distinct sections

---

## Examples

### Basic Accordion

```tsx
<Accordion
  items={[
    {
      id: 1,
      title: "What is React?",
      content: (
        <p>React is a JavaScript library for building user interfaces.</p>
      ),
    },
    {
      id: 2,
      title: "What is TypeScript?",
      content: <p>TypeScript is a typed superset of JavaScript.</p>,
    },
  ]}
/>
```

### With Icons

```tsx
import { User, Settings, Bell } from "lucide-react";

<Accordion
  items={[
    {
      id: "profile",
      title: "Profile Settings",
      icon: <User className="w-4 h-4" />,
      content: <ProfileForm />,
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      content: <NotificationSettings />,
    },
  ]}
/>;
```

### Allow Multiple Open

```tsx
<Accordion
  allowMultiple={true}
  defaultOpenIds={["section-1", "section-3"]}
  items={sections}
/>
```

### Custom Title with JSX

```tsx
<Accordion
  variant="separated"
  items={[
    {
      id: "user-1",
      title: (
        <div className="flex items-center justify-between w-full">
          <span className="font-semibold">John Doe</span>
          <div className="flex gap-2 text-xs">
            <span className="text-gray-500">Admin</span>
            <span className="text-green-600">● Active</span>
          </div>
        </div>
      ),
      icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> john@example.com
          </p>
          <p>
            <strong>Role:</strong> Administrator
          </p>
          <p>
            <strong>Last Login:</strong> 2 hours ago
          </p>
        </div>
      ),
    },
  ]}
/>
```

### Disabled Items

```tsx
<Accordion
  items={[
    {
      id: 1,
      title: "Available Section",
      content: <p>This can be opened</p>,
    },
    {
      id: 2,
      title: "Locked Section",
      content: <p>This is disabled</p>,
      disabled: true,
    },
  ]}
/>
```

### No Padding

```tsx
<Accordion padding={false} items={items} />
```

### Custom Padding

```tsx
<Accordion padding="p-8" items={items} />
```

### With onToggle Callback

```tsx
<Accordion
  items={items}
  onToggle={(id, isOpen) => {
    console.log(`Item ${id} is now ${isOpen ? "open" : "closed"}`);
    trackEvent("accordion_toggle", { id, isOpen });
  }}
/>
```

---

## Advanced Use Cases

### Strategy Details Accordion

```tsx
<Accordion
  variant="separated"
  allowMultiple={true}
  items={strategies.map((strategy) => ({
    id: strategy.id,
    title: (
      <div className="flex items-center justify-between w-full">
        <span className="font-semibold">{strategy.name}</span>
        <div className="flex gap-3 text-xs">
          <span className="text-gray-500">{strategy.legsCount} Legs</span>
          <span
            className={`font-medium ${
              strategy.status === "ACTIVE" ? "text-green-600" : "text-gray-600"
            }`}
          >
            {strategy.status}
          </span>
        </div>
      </div>
    ),
    icon: <Settings className="w-4 h-4" />,
    content: <StrategyDetails strategy={strategy} />,
  }))}
/>
```

### FAQ Accordion

```tsx
<Accordion
  variant="bordered"
  items={faqs.map((faq, index) => ({
    id: index,
    title: faq.question,
    content: <p className="text-sm">{faq.answer}</p>,
  }))}
/>
```

### Nested Content with Tables

```tsx
<Accordion
  variant="separated"
  padding={false}
  items={[
    {
      id: "data-1",
      title: "User Data",
      content: (
        <ReactTable
          data={userData}
          padding={false}
          fullHeight={false}
          showHeader={false}
        />
      ),
    },
  ]}
/>
```

---

## Styling & Theming

### Dark Mode

Accordion automatically adapts to dark mode using Tailwind's `dark:` variants.

### Custom Styling

Use the `className` prop to add custom styles:

```tsx
<Accordion className="my-custom-class" items={items} />
```

### Centering & Layout

```tsx
// Centered with max-width (default)
<Accordion centered={true} items={items} />

// Full width
<Accordion centered={false} items={items} />
```

---

## Accessibility

- **Keyboard Navigation**: Full support with focus states
- **ARIA**: Proper button semantics
- **Focus Indicators**: Visible focus rings on header buttons
- **Disabled State**: Properly styled and non-interactive

---

## Animation

- Smooth chevron rotation on open/close
- Fade-in animation for content
- Slide-in effect when expanding

---

## Tips & Best Practices

1. **Performance**: Use `allowMultiple={false}` for cleaner UX in long lists
2. **Icons**: Add icons for better visual hierarchy
3. **Responsive Titles**: Use JSX titles for complex layouts
4. **State Management**: Use `defaultOpenIds` for initially expanded items
5. **Callbacks**: Track user interactions with `onToggle`
6. **Variants**:
   - Use `separated` for distinct sections
   - Use `bordered` for compact, grouped content
   - Use `default` for simple, minimal styling

---

## Common Patterns

### User List Accordion

```tsx
<Accordion
  variant="separated"
  items={users.map((user) => ({
    id: user.id,
    title: user.name,
    icon: <User className="w-4 h-4" />,
    content: <UserDetails user={user} />,
  }))}
/>
```

### Settings Sections

```tsx
<Accordion
  variant="bordered"
  allowMultiple={true}
  defaultOpenIds={["general"]}
  items={[
    { id: "general", title: "General", content: <GeneralSettings /> },
    { id: "security", title: "Security", content: <SecuritySettings /> },
    {
      id: "notifications",
      title: "Notifications",
      content: <NotificationSettings />,
    },
  ]}
/>
```

### Data Explorer

```tsx
<Accordion
  variant="separated"
  padding={false}
  items={datasets.map((dataset) => ({
    id: dataset.id,
    title: `${dataset.name} (${dataset.count} items)`,
    content: <DataTable data={dataset.data} />,
  }))}
/>
```
