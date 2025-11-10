# WebSocket Data Format Reference

## Topic: "depth"

### Raw WebSocket Message Structure

```json
{
  "topic": "depth",
  "data": {
    "NIFTY_23000_CE-0": {
      "response": {
        "data": {
          "symbolname": "NIFTY",
          "strikeprice": "23000",
          "optiontype": "CE",
          "expiry": "0",
          "bPr": "150.50",
          "aPr": "151.00",
          "ltp": "150.75",
          "spotPrc": "23015.25"
        }
      }
    },
    "NIFTY_23000_PE-0": {
      "response": {
        "data": {
          "symbolname": "NIFTY",
          "strikeprice": "23000",
          "optiontype": "PE",
          "expiry": "0",
          "bPr": "135.25",
          "aPr": "135.75",
          "ltp": "135.50",
          "spotPrc": "23015.25"
        }
      }
    }
  }
}
```

## Field Descriptions

| Field         | Type   | Description               | Example                      |
| ------------- | ------ | ------------------------- | ---------------------------- |
| `symbolname`  | string | Underlying symbol         | "NIFTY", "SENSEX"            |
| `strikeprice` | string | Strike price              | "23000"                      |
| `optiontype`  | string | Option type               | "CE" (Call), "PE" (Put)      |
| `expiry`      | string | Expiry weeks from current | "0" (current), "1", "2", "3" |
| `bPr`         | string | Bid price                 | "150.50"                     |
| `aPr`         | string | Ask price                 | "151.00"                     |
| `ltp`         | string | Last traded price         | "150.75"                     |
| `spotPrc`     | string | Spot/underlying price     | "23015.25"                   |

## Key Format Pattern

```
{SYMBOL}_{STRIKE}_{TYPE}-{EXPIRY}

Examples:
- NIFTY_23000_CE-0
- NIFTY_23050_PE-1
- SENSEX_75000_CE-0
```

## Frontend Row Structure

After parsing, data is stored as:

```javascript
{
  strike: 23000,
  ceBid: 150.50,   // Call Bid
  ceAsk: 151.00,   // Call Ask
  ceLtp: 150.75,   // Call LTP
  peBid: 135.25,   // Put Bid
  peAsk: 135.75,   // Put Ask
  peLtp: 135.50    // Put LTP
}
```

## Computed Spreads

### Bid Spread

```javascript
BidSpread = peBid + ceBid;
// Example: 135.25 + 150.50 = 285.75
```

### Ask Spread

```javascript
AskSpread = peAsk + ceAsk;
// Example: 135.75 + 151.00 = 286.75
```

## Filtering Logic

WebSocket sends data for ALL strikes and expiries. Frontend must filter:

```javascript
// Filter by symbol and expiry
if (d.symbolname !== symbol || String(d.expiry) !== String(expiry)) return;
```

## Update Batching

Multiple updates can arrive simultaneously. Use RAF batching:

```javascript
// Pending updates map
pendingUpdatesRef.current = new Map();

// On WebSocket message
pendingUpdatesRef.current.set(strike, {
  ceBid: parseFloat(d.bPr),
  ceAsk: parseFloat(d.aPr),
  // ...
});

// Apply all pending updates in RAF callback
setRows((prevRows) => {
  const rowsMap = new Map(prevRows.map((r) => [r.strike, { ...r }]));
  pendingUpdatesRef.current.forEach((updates, strike) => {
    Object.assign(rowsMap.get(strike), updates);
  });
  return Array.from(rowsMap.values());
});
```

## Type Conversion

All numeric fields come as **strings** from WebSocket. Must parse:

```javascript
const strike = Number(d.strikeprice);
const bid = parseFloat(d.bPr);
const ask = parseFloat(d.aPr);
const ltp = parseFloat(d.ltp);
const spot = parseFloat(d.spotPrc);
```

## Null Handling

Missing data should be handled gracefully:

```javascript
ceBid: d.bPr ? parseFloat(d.bPr) : null,
ceAsk: d.aPr ? parseFloat(d.aPr) : null,
ceLtp: d.ltp ? parseFloat(d.ltp) : null,
```

UI should display "-" for null values:

```javascript
{
  r.ceBid != null ? formatCurrency(r.ceBid) : "-";
}
```

## Example Message Flow

```
1. WebSocket receives:
   {
     "NIFTY_23000_CE-0": {...},
     "NIFTY_23000_PE-0": {...},
     "NIFTY_23050_CE-0": {...}
   }

2. Filter by symbol="NIFTY", expiry="0"
   All pass ✅

3. Group by strike:
   23000 → {ceBid, ceAsk, peBid, peAsk, ...}
   23050 → {ceBid, ceAsk, peBid, peAsk, ...}

4. Store in pendingUpdatesRef

5. RAF scheduled (if not already)

6. RAF callback merges into state
   - Throttle to 60fps
   - Batch merge all strikes
   - Sort by strike ascending
   - Update UI
```

---

**Reference Date**: December 2024  
**Backend WebSocket**: ws://localhost:8000 (Socket.IO)  
**Frontend Client**: socketManager.ts (native WebSocket)
