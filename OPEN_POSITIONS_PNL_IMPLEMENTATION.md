# Open Positions P&L Implementation

## Overview

Updated the DeployedStrategies component to properly fetch and calculate P&L for open and closed positions by integrating with the backend strategy orders API.

## Backend Integration

### Redis Key Patterns Used

1. **Strategy Orders**: `{strategy_id}:{userId}_{strategyName}_{legId}{orderId}`

   - Stores all order details for a strategy
   - Contains: `entered`, `exited`, `response`, `orderDetailsKey`, etc.

2. **Live Orders (for LIVEMODE)**: `order:{userId}_{strategyName}_{legId}{orderId}`

   - Stores live order updates from broker
   - Contains: `fPrc` (filled price), `fQty` (filled quantity), `sts` (status), etc.

3. **Exit Orders**: `EXIT:{orderDetailsKey}`
   - Stores exit order details for closed positions
   - Contains exit price (`fPrc`) and exit order information

### Backend Endpoints Used

1. **GET** `/strategy-orders/get/{strategy_id}/live-details`

   - Fetches all orders for a strategy with enriched live data
   - Returns orders with `entered`, `exited` flags

2. **GET** `/strategy-orders/exit-order/{orderDetailsKey}`

   - Fetches exit order details for closed positions
   - Used to calculate realized P&L

3. **GET** `/strategy-orders/live-order/{user_id}/{strategy_name}/{leg_id}/{order_id}`
   - Fetches individual live order details (optional endpoint)

## Position Types & P&L Calculation

### 1. **Closed Positions** (`entered: true`, `exited: true`)

**Logic:**

- Fetch exit order using `EXIT:{orderDetailsKey}` pattern
- Calculate realized P&L using entry price and exit price
- Formula:

  ```javascript
  // For BUY orders
  P&L = (Exit Price - Entry Price) × Quantity

  // For SELL orders
  P&L = (Entry Price - Exit Price) × Quantity
  ```

**Data Sources:**

- Entry Price: `response.data.fPrc` (from strategy order)
- Exit Price: `response.data.fPrc` (from EXIT order)
- Quantity: `response.data.fQty`

### 2. **Open Positions** (`entered: true`, `exited: false`)

**Logic:**

- Fetch current market price from option data cache
- Calculate unrealized P&L using entry price and current market price
- Formula:

  ```javascript
  // For BUY orders (use bid price - price at which we can sell)
  Current Price = Market Depth Bid
  P&L = (Current Price - Entry Price) × Quantity

  // For SELL orders (use ask price - price at which we need to buy back)
  Current Price = Market Depth Ask
  P&L = (Entry Price - Current Price) × Quantity
  ```

**Data Sources:**

- Entry Price:
  - **SIMULATIONMODE**: `response.data.fPrc`
  - **LIVEMODE**: Fetch from `order:*` key using backend API
- Current Price: From cached option data (bid/ask prices)
- Quantity: `response.data.fQty`

## Key Changes Made

### 1. Updated `calculateSinglePositionPnL` Function

**Before:**

- Used `orderId` from `response.data.orderId`
- Didn't distinguish between LIVEMODE and SIMULATIONMODE
- Limited error logging

**After:**

- Uses correct orderId: `response.data.oID` or `response.data.oid` (broker order ID)
- Handles LIVEMODE by fetching from live order keys
- Enhanced logging with emojis for better debugging:
  - 🔍 Searching
  - ✅ Success
  - ⚠️ Warning
  - ❌ Error
  - 💰 Closed Position P&L
  - 💵 Open Position P&L
  - 📊 Calculation details
  - 📈 Market depth

### 2. Updated Order ID Extraction

**Standardized across all components:**

```javascript
const orderId =
  order?.response?.data?.oID || // Broker order ID (LIVEMODE)
  order?.response?.data?.oid || // Alternative broker order ID
  order?.orderId || // Direct orderId field
  order?.exchangeOrderNumber; // Fallback
```

**Updated in:**

- `calculateSinglePositionPnL` function
- `PositionRow` component
- Position tab rendering
- `getStrategySummary` function
- `exportToExcel` function

### 3. Updated `fetchExitOrder` Function

**Enhancements:**

- Added URL encoding for orderDetailsKey
- Enhanced logging for debugging
- Better error handling

### 4. Market Data Integration

**Option Data Cache:**

- Fetched every 1 second for real-time prices
- Cached globally to avoid redundant API calls
- Used for all open position P&L calculations

**Price Selection Logic:**

```javascript
// For BUY positions (we want to sell)
currentPrice = depthData.bid;

// For SELL positions (we need to buy back)
currentPrice = depthData.ask;
```

## UI Updates

### Position Table Columns

1. User ID
2. Square Off Action (button for open positions)
3. Order ID
4. Leg ID (with HEDGE badge if applicable)
5. Symbol
6. Strike
7. Action (BUY/SELL)
8. Quantity
9. Entry Price
10. Current/Exit Price (dynamic based on position status)
11. P&L (color-coded: green for profit, red for loss)
12. Entry Time
13. Status (Open/Closed)

### P&L Display

- **Positive P&L**: Green text with `+₹` prefix
- **Negative P&L**: Red text with `-₹` prefix
- **Loading**: Shows `-` placeholder
- **Total P&L**: Displayed in strategy summary badge

### Auto-Refresh

- Orders refresh every 1 second when positions/orders tabs are active
- Option data refreshes every 1 second for live prices
- Live indicator shown when auto-refresh is active

## Testing Checklist

### For Open Positions

- [ ] Verify entry price is fetched correctly (both SIMULATIONMODE and LIVEMODE)
- [ ] Verify current price updates in real-time
- [ ] Verify P&L calculation for BUY orders
- [ ] Verify P&L calculation for SELL orders
- [ ] Verify P&L color coding (green/red)
- [ ] Verify total P&L aggregation

### For Closed Positions

- [ ] Verify exit order is fetched correctly
- [ ] Verify exit price is displayed
- [ ] Verify realized P&L calculation
- [ ] Verify closed positions are marked correctly
- [ ] Verify P&L persists (doesn't recalculate unnecessarily)

### For HEDGE Orders

- [ ] Verify hedge orders are identified (check for `_HEDGE` in key)
- [ ] Verify hedge badge is displayed
- [ ] Verify P&L calculation for hedge orders

## Console Logging

Added comprehensive console logging for debugging:

```javascript
// Example logs you'll see:
🔍 Fetching exit order for closed position: STRATEGY_926719:70204607_Saturday_run_LEG_001251020000234833
✅ Exit price from exit order: 107.35
💰 Closed Position P&L - Order 251020000234833: Entry=132.15, Exit=107.35, Action=SELL, Qty=20, P&L=496.00

📊 Calculating P&L for open position 251020000226421:
📈 Market depth for 251020000226421: Bid=95.50, Ask=96.00, LTP=95.75
💵 Open Position P&L - Order 251020000226421: Entry=107.35, Current=96.00, Action=SELL, Qty=20, P&L=227.00
```

## Error Handling

1. **Missing Order ID**: Logs warning and skips P&L calculation
2. **Missing Entry Price**: Logs warning with available data
3. **Failed Exit Order Fetch**: Logs warning and continues
4. **Failed Market Depth Fetch**: Logs warning and shows `-` in UI
5. **Invalid P&L Data**: Shows `-` instead of NaN or undefined

## Performance Optimizations

1. **Memoization**: Used `useCallback` for fetch functions
2. **Batch Updates**: P&L calculations update state once per order
3. **Cached Option Data**: Fetched once and reused for all positions
4. **Conditional Rendering**: Only calculate P&L for visible positions

## Known Limitations

1. P&L calculation depends on option data cache availability
2. Live order fetch for LIVEMODE requires proper key format
3. Exit orders must exist in Redis for closed positions
4. Market data updates every 1 second (not tick-by-tick)

## Future Enhancements

1. Add P&L history tracking
2. Add P&L charts/graphs
3. Add export P&L to CSV
4. Add P&L alerts/notifications
5. Add intraday P&L tracking
6. Add position-wise target/stoploss indicators
