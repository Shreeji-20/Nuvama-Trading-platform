# WebSocket Setup - Troubleshooting Guide

## ✅ Issues Fixed

### 1. **Import Path Errors**

- ❌ Before: `import { useSocket } from "./services/websocket/socketContext"`
- ✅ After: `import { useSocket } from "./services/websocket/SocketContext"`
- **Note:** File is named `SocketContext.tsx` (capital S), not `socketContext.tsx`

### 2. **SocketProvider Initialization**

- ❌ Before: SocketProvider was commented out in App.jsx
- ✅ After: Entire app wrapped in `<SocketProvider>` at root level
- **Result:** WebSocket connects when app starts, not when navigating to specific route

### 3. **Removed Invalid Hook Call**

- ❌ Before: `useSocket()` called in App component outside SocketProvider
- ✅ After: Removed the unused `const socket = useSocket()` from App.jsx

### 4. **Enhanced PricePage with Debugging**

- Added connection status indicator
- Added detailed console logging
- Added visual feedback for received data
- Added `isOpen()` check to verify connection

## 🧪 How to Test

### Step 1: Start Your WebSocket Server

Your backend must have a WebSocket endpoint at: `ws://localhost:8000/ws`

**Example Python FastAPI WebSocket Server:**

```python
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected")

    try:
        # Listen for subscription messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"📨 Received: {message}")

            if message.get("action") == "subscribe":
                topics = message.get("topics", [])
                print(f"🔔 Client subscribed to: {topics}")

                # Send test data every 2 seconds
                asyncio.create_task(send_test_data(websocket, topics))

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        print("❌ Client disconnected")

async def send_test_data(websocket: WebSocket, topics: list):
    """Send test data to subscribed topics"""
    counter = 0
    while True:
        try:
            for topic in topics:
                test_data = {
                    "topic": topic,
                    "data": {
                        "price": 50000 + (counter % 100),
                        "volume": 1000 + counter,
                        "timestamp": counter
                    }
                }
                await websocket.send_text(json.dumps(test_data))
                print(f"📤 Sent data to topic '{topic}': {test_data}")

            counter += 1
            await asyncio.sleep(2)
        except:
            break

# Run with: uvicorn filename:app --reload --port 8000
```

### Step 2: Start Your React App

```bash
npm run dev
```

### Step 3: Navigate to Price Page

Open: `http://localhost:5173/advanced-options-table`

### Step 4: Check Browser Console

You should see:

```
✅ WebSocket connected
🔔 Subscribing to 'depth' topic...
📊 Depth data received: {...}
```

### Step 5: Check Server Console

You should see:

```
✅ Client connected
📨 Received: {'action': 'subscribe', 'topics': ['depth']}
🔔 Client subscribed to: ['depth']
📤 Sent data to topic 'depth': {...}
```

## 🔍 Debugging Checklist

### ✅ Frontend Checks

- [ ] Browser console shows "✅ WebSocket connected"
- [ ] PricePage shows "Connected ✅" status
- [ ] No CORS errors in console
- [ ] No import/path errors in console

### ✅ Backend Checks

- [ ] WebSocket server is running on port 8000
- [ ] Server logs show "Client connected"
- [ ] Server receives subscription message
- [ ] Server is sending data to correct topic

### ✅ Network Checks

- [ ] Check Network tab in DevTools
- [ ] Look for "WS" (WebSocket) connection
- [ ] Verify connection status is "101 Switching Protocols"
- [ ] See messages being sent/received

## 📁 File Structure

```
src/
├── App.jsx                          ✅ Wrapped in SocketProvider
├── services/
│   ├── websocket/
│   │   ├── SocketContext.tsx       ✅ Provides socket to components
│   │   ├── socketManager.ts        ✅ WebSocket client logic
│   │   └── PricePage.tsx           ✅ Example component using socket
```

## 🎯 Key Changes Made

### App.jsx

```jsx
// ✅ Correct import (capital S)
import { SocketProvider } from "./services/websocket/SocketContext";

function App() {
  return (
    <SocketProvider>
      {" "}
      {/* ✅ Wraps entire app */}
      <Router>{/* All routes have access to socket */}</Router>
    </SocketProvider>
  );
}
```

### PricePage.tsx

```tsx
// ✅ Correct import (capital S)
import { useSocket } from "./SocketContext";

export function PricePage() {
  const socket = useSocket(); // ✅ Now works because we're inside SocketProvider

  useEffect(() => {
    socket.subscribe("depth", handleDepth);
    return () => socket.unsubscribe("depth", handleDepth);
  }, [socket]);
}
```

## 🚨 Common Issues

### Issue: "WebSocket disconnected" immediately

**Solution:** Make sure backend server is running and listening on `ws://localhost:8000/ws`

### Issue: "No data received"

**Solution:**

1. Check server is sending messages with correct topic name ("depth")
2. Check message format: `{ topic: "depth", data: {...} }`

### Issue: "Connection failed"

**Solution:**

1. Verify URL in `socketManager.ts` matches your backend
2. Check CORS settings on backend allow WebSocket connections

### Issue: TypeError in console

**Solution:** Clear browser cache and restart dev server

## 📊 Message Format

### Client → Server (Subscribe)

```json
{
  "action": "subscribe",
  "topics": ["depth"]
}
```

### Server → Client (Data)

```json
{
  "topic": "depth",
  "data": {
    "price": 50000,
    "volume": 1000,
    "timestamp": 123456
  }
}
```

## 🎉 Success Indicators

When working correctly, you'll see:

- ✅ Green "Connected ✅" status in PricePage
- ✅ Live data updating in the UI
- ✅ Console logs showing received messages
- ✅ No error messages in browser console
- ✅ WebSocket connection in Network tab (status 101)

---

**Need Help?** Check browser console and server logs for error messages.
