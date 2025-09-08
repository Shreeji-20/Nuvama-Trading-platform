# IndexCards Component

A reusable React component for displaying stock index data with real-time updates and beautiful UI.

## Features

- 🔄 **Real-time Updates**: Auto-refreshes data every 30 seconds
- 🎨 **Customizable Themes**: Different color themes for each index
- 📱 **Responsive Design**: Adapts to different screen sizes (1-4 columns)
- 🌙 **Dark Mode Support**: Full dark theme compatibility
- 📊 **Rich Data Display**: Price, change, high/low, volume
- ⚡ **Loading States**: Skeleton loading animations
- 🔗 **API Integration**: Fetches live data from backend

## Usage

### Basic Usage

```jsx
import IndexCards from '../components/IndexCards';

// Display 2 indices
<IndexCards indices={['NIFTY', 'SENSEX']} />

// Display 4 indices (recommended for Strategies page)
<IndexCards indices={['NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY']} />
```

### With Custom Styling

```jsx
<IndexCards indices={["NIFTY", "SENSEX"]} className="mb-6" />
```

### With Backend Data (Object Format)

```jsx
const indexData = [
  {
    symbol: "NIFTY",
    name: "NIFTY 50",
    price: 24891.4,
    change: 156.75,
    changePercent: 0.63,
    high: 24918.45,
    low: 24734.65,
    volume: 1200000000,
  },
  // ... more indices
];

<IndexCards indices={indexData} />;
```

## API Integration

The component expects your backend to have endpoints like:

```
GET /index/NIFTY
GET /index/SENSEX
GET /index/BANKNIFTY
GET /index/FINNIFTY
```

### Expected API Response

```json
{
  "symbol": "NIFTY",
  "name": "NIFTY 50",
  "price": 24891.4,
  "change": 156.75,
  "changePercent": 0.63,
  "high": 24918.45,
  "low": 24734.65,
  "volume": 1200000000
}
```

Alternative field names are also supported:

- `ltp`, `current_price` for price
- `net_change` for change
- `percent_change` for changePercent
- `day_high` for high
- `day_low` for low
- `total_volume` for volume

## Supported Indices

The component comes with built-in themes and icons for:

- **NIFTY** - Blue theme, trending chart icon
- **SENSEX** - Orange theme, bar chart icon
- **BANKNIFTY** - Green theme, money icon
- **FINNIFTY** - Purple theme, building icon
- **Custom indices** - Gray theme, default chart icon

## Responsive Grid Layout

The component automatically adjusts grid columns based on the number of indices:

- **1 index**: 1 column
- **2 indices**: 1 column on mobile, 2 on desktop
- **3 indices**: 1 column on mobile, 2 on tablet, 3 on desktop
- **4 indices**: 1 column on mobile, 2 on tablet, 4 on desktop
- **5+ indices**: 1 column on mobile, 2 on tablet, 3 on desktop, 4 on xl screens

## Props

| Prop        | Type                     | Default | Description                            |
| ----------- | ------------------------ | ------- | -------------------------------------- |
| `indices`   | `string[]` \| `object[]` | `[]`    | Array of index symbols or data objects |
| `className` | `string`                 | `''`    | Additional CSS classes                 |

## Examples in the App

### Strategies Page

```jsx
<IndexCards
  indices={["NIFTY", "SENSEX", "BANKNIFTY", "FINNIFTY"]}
  className="mb-6"
/>
```

### Option Chain Pages

```jsx
<IndexCards indices={["NIFTY", "SENSEX"]} className="" />
```

## Error Handling

- Shows skeleton loading during initial load
- Displays error state if API calls fail
- Gracefully handles missing data fields
- Continues with cached data if refresh fails

## Performance

- Memoized API calls to prevent unnecessary requests
- Auto-cleanup of intervals on component unmount
- Efficient re-rendering with React hooks
- Optimized grid layouts for different screen sizes

## Backend Setup Required

Make sure your backend supports these endpoints:

```
http://localhost:8000/index/NIFTY
http://localhost:8000/index/SENSEX
http://localhost:8000/index/BANKNIFTY
http://localhost:8000/index/FINNIFTY
```
