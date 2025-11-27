import config from "../../config/api";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Global Trading Control Functions
 * These functions control the overall trading system
 */

export interface GlobalTradingHandlers {
  setIsTrading: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  setTradingLoading: (value: boolean) => void;
}

/**
 * Fetch current global trading state from backend
 */
export const fetchGlobalTradingState = async (
  handlers: GlobalTradingHandlers
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/global-trading-state`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch global trading state: ${response.status}`
      );
    }

    const data = await response.json();
    const state = data.state; // "START", "STOP", "PAUSE", or "RESUME"

    // Update local state based on backend state
    // Note: RESUME should be treated same as START (backend converts RESUME to START)
    if (state === "START" || state === "RESUME") {
      handlers.setIsTrading(true);
      handlers.setIsPaused(false);
    } else if (state === "PAUSE") {
      handlers.setIsTrading(true);
      handlers.setIsPaused(true);
    } else {
      // STOP
      handlers.setIsTrading(false);
      handlers.setIsPaused(false);
    }

    return { success: true, state };
  } catch (error: any) {
    console.error("Error fetching global trading state:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle global start trading
 */
export const handleStartTrading = async (handlers: GlobalTradingHandlers) => {
  try {
    handlers.setTradingLoading(true);

    const response = await fetch(`${API_BASE_URL}/global-trading-state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: "START" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start trading: ${response.status}`);
    }

    const data = await response.json();

    handlers.setIsTrading(true);
    handlers.setIsPaused(false);
    alert(data.message || "Trading started successfully!");
  } catch (error: any) {
    console.error("Error starting trading:", error);
    alert(`Failed to start trading: ${error.message}`);
  } finally {
    handlers.setTradingLoading(false);
  }
};

/**
 * Handle global stop trading
 */
export const handleStopTrading = async (handlers: GlobalTradingHandlers) => {
  if (!confirm("Are you sure you want to stop trading?")) {
    return;
  }

  try {
    handlers.setTradingLoading(true);

    const response = await fetch(`${API_BASE_URL}/global-trading-state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: "STOP" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to stop trading: ${response.status}`);
    }

    const data = await response.json();

    handlers.setIsTrading(false);
    handlers.setIsPaused(false); // Reset pause state when stopping
    alert(data.message || "Trading stopped successfully!");
  } catch (error: any) {
    console.error("Error stopping trading:", error);
    alert(`Failed to stop trading: ${error.message}`);
  } finally {
    handlers.setTradingLoading(false);
  }
};

/**
 * Handle global pause trading
 */
export const handlePauseTrading = async (
  isPaused: boolean,
  handlers: GlobalTradingHandlers
) => {
  if (
    !confirm(
      `Are you sure you want to ${isPaused ? "resume" : "pause"} trading?`
    )
  ) {
    return;
  }

  try {
    handlers.setTradingLoading(true);

    const response = await fetch(`${API_BASE_URL}/global-trading-state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: isPaused ? "RESUME" : "PAUSE" }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to ${isPaused ? "resume" : "pause"} trading: ${response.status}`
      );
    }

    const data = await response.json();

    // When resuming (isPaused was true), set isTrading to true and isPaused to false
    // When pausing (isPaused was false), set isTrading to true and isPaused to true
    if (isPaused) {
      // Resuming
      handlers.setIsTrading(true);
      handlers.setIsPaused(false);
    } else {
      // Pausing
      handlers.setIsTrading(true);
      handlers.setIsPaused(true);
    }

    alert(
      data.message || `Trading ${isPaused ? "resumed" : "paused"} successfully!`
    );
  } catch (error: any) {
    console.error("Error pausing trading:", error);
    alert(
      `Failed to ${isPaused ? "resume" : "pause"} trading: ${error.message}`
    );
  } finally {
    handlers.setTradingLoading(false);
  }
};

/**
 * Strategy-Wise Trading Control Functions
 * These functions control individual strategies
 */

export type StrategyStatus = "stopped" | "running" | "paused";

export interface StrategyStatusHandlers {
  setStrategyStatus: React.Dispatch<
    React.SetStateAction<Record<string, StrategyStatus>>
  >;
}

/**
 * Handle individual strategy status change
 */
export const handleStrategyStatusChange = async (
  strategyId: string,
  newStatus: StrategyStatus,
  currentStrategyStatus: Record<string, StrategyStatus>,
  handlers: StrategyStatusHandlers
) => {
  const currentStatus = currentStrategyStatus[strategyId] || "stopped";

  // Don't do anything if already in that state
  if (currentStatus === newStatus) {
    return;
  }

  const statusText = {
    running: "start",
    paused: "pause",
    stopped: "stop",
  };

  const statusToBackend = {
    running: "START",
    paused: "PAUSE",
    stopped: "STOP",
  };

  if (
    !confirm(
      `Are you sure you want to ${statusText[newStatus]} strategy ${strategyId}?`
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy/trading-state/${strategyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: statusToBackend[newStatus] }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to ${statusText[newStatus]} strategy: ${response.status}`
      );
    }

    const data = await response.json();

    handlers.setStrategyStatus((prev) => ({
      ...prev,
      [strategyId]: newStatus,
    }));

    alert(
      data.message ||
        `Strategy ${strategyId} ${statusText[newStatus]}ed successfully!`
    );
  } catch (error: any) {
    console.error(`Error changing strategy status:`, error);
    alert(`Failed to ${statusText[newStatus]} strategy: ${error.message}`);
  }
};

/**
 * Start a specific strategy
 */
export const startStrategy = async (
  strategyId: string,
  handlers: StrategyStatusHandlers
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy/trading-state/${strategyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: "START" }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to start strategy: ${response.status}`);
    }

    handlers.setStrategyStatus((prev) => ({
      ...prev,
      [strategyId]: "running",
    }));

    return { success: true };
  } catch (error: any) {
    console.error(`Error starting strategy:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Pause a specific strategy
 */
export const pauseStrategy = async (
  strategyId: string,
  handlers: StrategyStatusHandlers
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy/trading-state/${strategyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: "PAUSE" }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to pause strategy: ${response.status}`);
    }

    handlers.setStrategyStatus((prev) => ({
      ...prev,
      [strategyId]: "paused",
    }));

    return { success: true };
  } catch (error: any) {
    console.error(`Error pausing strategy:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Stop a specific strategy
 */
export const stopStrategy = async (
  strategyId: string,
  handlers: StrategyStatusHandlers
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy/trading-state/${strategyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: "STOP" }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to stop strategy: ${response.status}`);
    }

    handlers.setStrategyStatus((prev) => ({
      ...prev,
      [strategyId]: "stopped",
    }));

    return { success: true };
  } catch (error: any) {
    console.error(`Error stopping strategy:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the status of a strategy
 */
export const getStrategyStatus = (
  strategyId: string,
  strategyStatus: Record<string, StrategyStatus>
): StrategyStatus => {
  return strategyStatus[strategyId] || "running";
};

/**
 * Check if a strategy is running
 */
export const isStrategyRunning = (
  strategyId: string,
  strategyStatus: Record<string, StrategyStatus>
): boolean => {
  return strategyStatus[strategyId] === "running";
};

/**
 * Check if a strategy is paused
 */
export const isStrategyPaused = (
  strategyId: string,
  strategyStatus: Record<string, StrategyStatus>
): boolean => {
  return strategyStatus[strategyId] === "paused";
};

/**
 * Check if a strategy is stopped
 */
export const isStrategyStopped = (
  strategyId: string,
  strategyStatus: Record<string, StrategyStatus>
): boolean => {
  return (strategyStatus[strategyId] || "running") === "stopped";
};

/**
 * Fetch strategy trading state from backend and update local state
 */
export const fetchStrategyTradingState = async (
  strategyId: string,
  handlers: StrategyStatusHandlers
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy/trading-state/${strategyId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch strategy trading state: ${response.status}`
      );
    }

    const data = await response.json();
    const state = data.state; // "START", "STOP", or "PAUSE"

    // Map backend state to frontend status
    const statusMap: Record<string, StrategyStatus> = {
      START: "running",
      PAUSE: "paused",
      STOP: "stopped",
    };

    const frontendStatus = statusMap[state] || "running";

    handlers.setStrategyStatus((prev) => ({
      ...prev,
      [strategyId]: frontendStatus,
    }));

    return { success: true, state: frontendStatus };
  } catch (error: any) {
    console.error(`Error fetching strategy trading state:`, error);
    return { success: false, error: error.message };
  }
};
