import React, { useEffect, useRef, useState } from "react";

const WS_URL = "ws://localhost:8000/ws";

export default function MultiSubscription() {
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket");

      // Subscribe to prices + alerts only
      ws.current?.send(
        JSON.stringify({
          action: "subscribe",
          topics: ["prices", "alerts"],
        })
      );
    };

    ws.current.onmessage = (event) => {
      console.log("📩 Message:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    ws.current.onclose = () => console.log("❌ Disconnected");

    return () => ws.current?.close();
  }, []);

  return (
    <div>
      <h2>Multi-topic WebSocket Demo</h2>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
