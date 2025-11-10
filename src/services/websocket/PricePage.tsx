// PricePage.tsx
import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

export function PricePage() {
  const socket = useSocket();
  const [data, setData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");

  useEffect(() => {
    console.log("🎬 PricePage component mounted");

    // Check if socket is connected
    const checkConnection = () => {
      if (socket.isOpen()) {
        setConnectionStatus("Connected ✅");
        console.log("✅ WebSocket is connected and ready");
      } else {
        setConnectionStatus("Disconnected ❌");
        console.log("❌ WebSocket is not connected");
      }
    };

    // Check connection status initially and periodically
    checkConnection();
    const statusInterval = setInterval(checkConnection, 2000);

    const handleDepth = (receivedData: any) => {
      console.log("📊 Depth data received:", receivedData);
      setData(receivedData);
    };

    // Subscribe to the 'depth' topic
    console.log("🔔 Subscribing to 'reduced_quotes' topic...");
    socket.subscribe("reduced_quotes", handleDepth);

    // Cleanup when component unmounts
    return () => {
      console.log("🧹 PricePage component unmounting - cleaning up...");
      console.log("🔕 Unsubscribing from 'reduced_quotes' topic...");
      socket.unsubscribe("reduced_quotes", handleDepth);
      clearInterval(statusInterval);
      console.log("✅ PricePage cleanup complete");
    };
  }, [socket]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        WebSocket Price Monitor
      </h2>

      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Status:{" "}
          <span
            className={
              connectionStatus.includes("✅")
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {connectionStatus}
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Listening for 'depth' topic messages
        </p>
        <button
          onClick={() => socket.getActiveSubscriptions()}
          className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
        >
          Check Active Subscriptions (see console)
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Latest Data:
        </h3>
        <pre className="text-xs overflow-auto max-h-96 text-gray-700 dark:text-gray-300">
          {data ? JSON.stringify(data, null, 2) : "Waiting for data..."}
        </pre>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> Make sure your WebSocket server is running at
          ws://localhost:8000/ws and sending messages with topic: "depth"
        </p>
      </div>
    </div>
  );
}
