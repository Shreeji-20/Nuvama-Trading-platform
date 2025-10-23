# Backend API Quick Reference - Strategy Orders

## Base URL

```
http://localhost:8000
```

## Endpoints

### 1. Get All Orders for a Strategy (with Live Details)

```http
GET /strategy-orders/get/{strategy_id}/live-details
```

**Description**: Fetches all orders for a specific strategy with enriched live data.

**Response Example**:

```json
{
  "message": "Live order details retrieved successfully for strategy STRATEGY_926719",
  "strategyId": "STRATEGY_926719",
  "count": 5,
  "orders": [
    {
      "userId": "70204607",
      "orderId": "251020000234833",
      "legId": "LEG_001",
      "symbol": "SENSEX",
      "strike": 84900,
      "optionType": "CE",
      "action": "SELL",
      "quantity": 20,
      "executionMode": "LIVEMODE",
      "entered": true,
      "exited": false,
      "isHedge": false,
      "orderDetailsKey": "STRATEGY_926719:70204607_Saturday_run_LEG_001251020000234833",
      "response": {
        "data": {
          "oID": "251020000234833",
          "fPrc": "132.15",
          "fQty": "20",
          "sts": "complete"
        }
      },
      "liveDetails": {
        "status": "complete",
        "fillPrice": "132.15",
        "fillQuantity": "20"
      }
    }
  ]
}
```

**Key Fields**:

- `entered: true` - Order has been entered/executed
- `exited: true` - Position has been closed (for closed positions)
- `exited: false` - Position is still open (for open positions)
- `isHedge: true` - This is a hedge order
- `orderDetailsKey` - Used to fetch exit orders

---

### 2. Get Exit Order

```http
GET /strategy-orders/exit-order/{orderDetailsKey}
```

**Description**: Fetches exit order details for closed positions.

**Example Request**:

```
GET /strategy-orders/exit-order/STRATEGY_926719:70204607_Saturday_run_LEG_001251020000234833
```

**Response Example**:

```json
{
  "message": "Exit order retrieved successfully",
  "redisKey": "EXIT:STRATEGY_926719:70204607_Saturday_run_LEG_001251020000234833",
  "data": {
    "response": {
      "data": {
        "oID": "251020000234844",
        "fPrc": "107.35",
        "fQty": "20",
        "sts": "complete",
        "tTyp": "BUY"
      }
    }
  }
}
```

**Key Fields**:

- `fPrc` - Exit price (filled price)
- `fQty` - Exit quantity
- `tTyp` - Transaction type (BUY for exiting SELL, SELL for exiting BUY)

---

### 3. Get Live Order by Components

```http
GET /strategy-orders/live-order/{user_id}/{strategy_name}/{leg_id}/{order_id}
```

**Description**: Fetches live order details by individual components.

**Example Request**:

```
GET /strategy-orders/live-order/70204607/Saturday_run/LEG_001/251020000234833
```

**Response Example**:

```json
{
  "message": "Live order details retrieved successfully",
  "redisKey": "order:70204607_Saturday_run_LEG_001251020000234833",
  "orderDetails": {
    "response": {
      "data": {
        "oID": "251020000234833",
        "fPrc": "132.15",
        "fQty": "20",
        "sts": "complete",
        "ordTim": "20/10/2025 15:22:29"
      }
    }
  }
}
```

---

### 4. Get Market Depth

```http
GET /strategy-orders/depth/{symbol}/{strike}/{option_type}/{expiry}
```

**Description**: Get market depth data for calculating live P&L.

**Example Request**:

```
GET /strategy-orders/depth/SENSEX/84900/CE/0
```

**Response Example**:

```json
{
  "message": "Depth data retrieved successfully",
  "redisKey": "depth:SENSEX_84900.0_CE-0",
  "data": {
    "bid": 95.5,
    "ask": 96.0,
    "ltp": 95.75
  }
}
```

---

## Redis Key Patterns

### Strategy Orders

```
{strategyId}:{userId}_{strategyName}_{legId}{orderId}
```

**Example**: `STRATEGY_926719:70204607_Saturday_run_LEG_001251020000234833`

### Live Orders (Simulation Mode)

```
order:{userId}_{strategyName}_{legId}{orderId}
```

**Example**: `order:70204607_Saturday_run_LEG_001251020000234833`

### Live Orders (Live Mode)

```
order:{userId}_{strategyName}_{legId}{orderId}
```

**Example**: `order:70204607_Saturday_run_LEG_001251020000234833`

Note: For LIVEMODE, the orderId is the broker's order ID (oID).

### Hedge Orders

```
{strategyId}:{userId}_{strategyName}_{legId}_HEDGE{orderId}
order:{userId}_{strategyName}_{legId}_HEDGE{orderId}
```

**Example**:

- `STRATEGY_926719:70204607_Saturday_run_LEG_001_HEDGE251020000234855`
- `order:70204607_Saturday_run_LEG_001_HEDGE251020000234855`

### Exit Orders

```
EXIT:{orderDetailsKey}
```

**Example**: `EXIT:STRATEGY_926719:70204607_Saturday_run_LEG_001251020000234833`

### Market Depth

```
depth:{symbol}_{strike}.0_{optionType}-{expiry}
```

**Example**: `depth:SENSEX_84900.0_CE-0`

---

## Order Status Values

### Complete/Filled

- `"COMPLETE"`
- `"COMPLETED"`
- `"EXECUTED"`
- `"FILLED"`

### Rejected

- `"REJECTED"`
- `"REJECT"`

### Cancelled

- `"CANCELLED"`
- `"CANCELED"`
- `"CANCELLED_BY_USER"`
- `"CANCEL"`

### Pending

- `"PENDING"`
- `"OPEN"`
- `"NEW"`
- `"ACCEPTED"`
- `"TRIGGER_PENDING"`

---

## Sample Order Data Structure

### Simulation Mode Order

```json
{
  "userId": "70204607",
  "exchange": "BFO",
  "symbol": "SENSEX",
  "strike": 84900,
  "optionType": "CE",
  "quantity": 20,
  "orderType": "LIMIT",
  "limitPrice": 132.15,
  "executionMode": "SIMULATIONMODE",
  "action": "SELL",
  "legId": "LEG_001",
  "strategyId": "STRATEGY_926719",
  "orderId": "251020000234833",
  "entered": true,
  "exited": false,
  "orderDetailsKey": "STRATEGY_926719:70204607_Saturday_run_LEG_001251020000234833",
  "response": {
    "data": {
      "fPrc": "132.15",
      "fQty": "20"
    }
  }
}
```

### Live Mode Order

```json
{
  "userId": "70204607",
  "exchange": "BFO",
  "symbol": "SENSEX",
  "strike": 84100,
  "optionType": "PE",
  "quantity": 20,
  "orderType": "LIMIT",
  "limitPrice": 107.35,
  "executionMode": "LIVEMODE",
  "action": "BUY",
  "legId": "LEG_002",
  "strategyId": "STRATEGY_926719",
  "orderId": "251020000226421",
  "entered": true,
  "exited": false,
  "orderDetailsKey": "STRATEGY_926719:70204607_Saturday_run_LEG_002251020000226421",
  "response": {
    "data": {
      "oID": "251020000226421",
      "fPrc": "107.35",
      "fQty": "20",
      "sts": "complete",
      "tSym": "SENSEX25O2384100PE"
    }
  }
}
```

### Live Order (from order:\* key)

```json
{
  "response": {
    "data": {
      "oID": "251020000226421",
      "fPrc": "107.35",
      "fQty": "20",
      "sts": "complete",
      "tTyp": "BUY",
      "ordTim": "20/10/2025 15:10:15",
      "tSym": "SENSEX25O2384100PE",
      "rmk": "70204607_Saturday_run_LEG_002"
    },
    "streaming_type": "orderFiler"
  }
}
```

---

## Frontend Usage Examples

### Fetch Strategy Orders

```javascript
const response = await fetch(
  `http://localhost:8000/strategy-orders/get/${strategyId}/live-details`
);
const data = await response.json();
const orders = data.orders;
```

### Identify Open Positions

```javascript
const openPositions = orders.filter(
  (order) => order.entered === true && order.exited !== true
);
```

### Identify Closed Positions

```javascript
const closedPositions = orders.filter(
  (order) => order.entered === true && order.exited === true
);
```

### Fetch Exit Order

```javascript
const orderDetailsKey = order.orderDetailsKey;
const response = await fetch(
  `http://localhost:8000/strategy-orders/exit-order/${encodeURIComponent(
    orderDetailsKey
  )}`
);
const exitData = await response.json();
const exitPrice = exitData.data?.response?.data?.fPrc;
```

### Calculate P&L for Open Position

```javascript
const entryPrice = parseFloat(order.response.data.fPrc);
const quantity = parseInt(order.response.data.fQty);
const action = order.action; // "BUY" or "SELL"

// Fetch market depth
const response = await fetch(
  `http://localhost:8000/strategy-orders/depth/${order.symbol}/${order.strike}/${order.optionType}/${order.expiry}`
);
const depthData = await response.json();

// Get current price
const currentPrice =
  action === "BUY"
    ? parseFloat(depthData.data.bid) // For BUY, use bid (selling price)
    : parseFloat(depthData.data.ask); // For SELL, use ask (buying price)

// Calculate P&L
let pnl = 0;
if (action === "BUY") {
  pnl = (currentPrice - entryPrice) * quantity;
} else {
  pnl = (entryPrice - currentPrice) * quantity;
}
```

### Calculate P&L for Closed Position

```javascript
const entryPrice = parseFloat(order.response.data.fPrc);
const quantity = parseInt(order.response.data.fQty);
const action = order.action;

// Fetch exit order
const exitOrder = await fetchExitOrder(order.orderDetailsKey);
const exitPrice = parseFloat(exitOrder.response.data.fPrc);

// Calculate P&L
let pnl = 0;
if (action === "BUY") {
  pnl = (exitPrice - entryPrice) * quantity;
} else {
  pnl = (entryPrice - exitPrice) * quantity;
}
```
