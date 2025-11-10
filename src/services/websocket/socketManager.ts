type Callback = (data: any) => void;

class SocketManager {
  private ws: WebSocket | null = null;
  private listeners: Record<string, Callback[]> = {};

  constructor(private url: string) {}

  private isConnected = false;
  private queue: Array<string> = [];
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("⚠️ WebSocket already connected");
      return;
    }

    console.log(`🔌 Connecting to WebSocket: ${this.url}`);

    try {
      this.ws = new WebSocket(this.url);
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log("✅ WebSocket connected");
      this.isConnected = true;
      this.resetReconnectState();

      // flush queued subscriptions
      this.queue.forEach((topic) => {
        this.ws?.send(JSON.stringify({ action: "subscribe", topics: [topic] }));
      });
      this.queue = [];
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const topic = payload.topic || "depth";
        const data = payload.data || payload;

        this.listeners[topic]?.forEach((cb) => cb(data));
      } catch (err) {
        console.error(err);
      }
    };

    this.ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
      this.isConnected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      console.error("🔍 Check if backend is running at:", this.url);
      this.isConnected = false;
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`
      );
      return;
    }

    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      this.connect();
    }, delay);
  }

  private resetReconnectState() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  subscribe(topic: string, callback: Callback) {
    if (!this.listeners[topic]) this.listeners[topic] = [];
    this.listeners[topic].push(callback);

    console.log(
      `🔔 Subscribed to topic: "${topic}" (${this.listeners[topic].length} total listeners)`
    );

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(
        `📤 Sending subscribe message to server for topic: "${topic}"`
      );
      this.ws.send(JSON.stringify({ action: "subscribe", topics: [topic] }));
    } else {
      console.log(
        `⏳ Queuing subscribe for topic: "${topic}" (waiting for connection, readyState: ${this.ws?.readyState})`
      );
      // queue until connection opens
      if (!this.queue.includes(topic)) {
        this.queue.push(topic);
      }
    }
  }

  disconnect() {
    console.log("🔌 Disconnecting WebSocket...");
    this.resetReconnectState();
    this.isConnected = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  unsubscribe(topic: string, callback: Callback) {
    console.log(`🔕 Attempting to unsubscribe from topic: "${topic}"`);

    if (!this.listeners[topic]) {
      console.warn(`⚠️ No listeners found for topic: "${topic}"`);
      return;
    }

    const beforeCount = this.listeners[topic].length;
    this.listeners[topic] = this.listeners[topic].filter(
      (cb) => cb !== callback
    );
    const afterCount = this.listeners[topic].length;

    console.log(
      `📊 Unsubscribe: ${beforeCount} → ${afterCount} listeners for "${topic}"`
    );

    // If no more listeners for this topic, send unsubscribe message to server
    if (this.listeners[topic].length === 0) {
      console.log(
        `📤 Sending unsubscribe message to server for topic: "${topic}"`
      );

      // Only send if WebSocket is open
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({ action: "unsubscribe", topics: [topic] })
        );
      } else {
        console.warn(
          `⚠️ WebSocket not open (readyState: ${this.ws?.readyState}), skipping server unsubscribe`
        );
      }

      delete this.listeners[topic];
      console.log(
        `✅ Topic "${topic}" fully unsubscribed and removed from listeners`
      );
    } else {
      console.log(
        `ℹ️ Topic "${topic}" still has ${this.listeners[topic].length} active listener(s)`
      );
    }
  }

  send(topic: string, data: any) {
    this.ws?.send(JSON.stringify({ topic, data }));
  }

  onmessage(topic: string, callback: Callback) {
    if (!this.listeners[topic]) this.listeners[topic] = [];
    this.listeners[topic].push(callback);
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Debug method to view all active subscriptions
  getActiveSubscriptions() {
    const subscriptions = Object.keys(this.listeners).map((topic) => ({
      topic,
      listenerCount: this.listeners[topic].length,
    }));
    console.log("📋 Active subscriptions:", subscriptions);
    return subscriptions;
  }
}

export const socketManager = new SocketManager("ws://localhost:8000/ws");
