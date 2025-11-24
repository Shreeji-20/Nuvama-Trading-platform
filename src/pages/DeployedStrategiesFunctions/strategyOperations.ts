import config from "../../config/api";
import { Strategy } from "../../types/deployedStrategies.types";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Strategy CRUD Operations
 * Functions for creating, reading, updating, and deleting strategies
 */

export interface StrategyOperationHandlers {
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setStrategies: (strategies: Strategy[]) => void;
  setEditingStrategy: (id: string | null) => void;
  setEditValues: (values: any) => void;
}

/**
 * Fetch all deployed strategies from the backend
 */
export const fetchStrategies = async (
  handlers: Pick<
    StrategyOperationHandlers,
    "setLoading" | "setError" | "setStrategies"
  >
) => {
  try {
    handlers.setLoading(true);
    handlers.setError(null);
    const response = await fetch(`${API_BASE_URL}/strategy/list`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    handlers.setStrategies(data.strategies || []);
  } catch (err: any) {
    console.error("Error fetching strategies:", err);
    handlers.setError(err.message);
  } finally {
    handlers.setLoading(false);
  }
};

/**
 * Fetch available strategy tags
 */
export const fetchStrategyTags = async (
  setAvailableTags: (tags: any[]) => void,
  setLoadingTags: (loading: boolean) => void
) => {
  try {
    setLoadingTags(true);
    const response = await fetch(`${API_BASE_URL}/strategy-tags/list`);
    if (response.ok) {
      const tags = await response.json();
      setAvailableTags(tags);
    } else {
      console.error("Failed to fetch strategy tags");
    }
  } catch (error) {
    console.error("Error fetching strategy tags:", error);
  } finally {
    setLoadingTags(false);
  }
};

/**
 * Update an existing strategy
 */
export const updateStrategy = async (
  strategyId: string,
  updatedConfig: any,
  handlers: Pick<
    StrategyOperationHandlers,
    "setEditingStrategy" | "setEditValues"
  >,
  fetchStrategies: () => void
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy/update/${strategyId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      console.error("Update error response:", errorData);

      if (response.status === 422 && errorData.detail?.errors) {
        const errorMessages = errorData.detail.errors
          .map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
          .join("\n");
        throw new Error(`Validation errors:\n${errorMessages}`);
      }

      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }
    await response.json();
    fetchStrategies();
    handlers.setEditingStrategy(null);
    handlers.setEditValues({});

    alert("Strategy updated successfully!");
  } catch (err: any) {
    console.error("Error updating strategy:", err);
    alert(`Failed to update strategy: ${err.message}`);
  }
};

/**
 * Delete a strategy
 */
export const deleteStrategy = async (
  strategyId: string,
  fetchStrategies: () => void
) => {
  if (!confirm(`Are you sure you want to delete strategy ${strategyId}?`)) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy/delete/${strategyId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert("Strategy deleted successfully!");
    fetchStrategies();
  } catch (err: any) {
    console.error("Error deleting strategy:", err);
    alert(`Failed to delete strategy: ${err.message}`);
  }
};

/**
 * Copy a strategy and create a new one
 */
export const copyStrategy = async (
  strategy: Strategy,
  strategies: Strategy[],
  fetchStrategies: () => void
) => {
  const originalName =
    (strategy.config as any)?.baseConfig?.strategyName || strategy.strategyId;

  // Find existing copies to determine the next copy number
  const existingCopyNumbers = strategies
    .map((s) => {
      const name = (s.config as any)?.baseConfig?.strategyName || "";
      // Match pattern: originalName_copy_1, originalName_copy_2, etc.
      const copyMatch = name.match(
        new RegExp(
          `^${originalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_copy_(\\d+)$`
        )
      );
      return copyMatch ? parseInt(copyMatch[1], 10) : 0;
    })
    .filter((num) => num > 0)
    .sort((a, b) => a - b);

  // Find the next available copy number
  let nextCopyNumber = 1;
  for (const num of existingCopyNumbers) {
    if (num === nextCopyNumber) {
      nextCopyNumber++;
    } else {
      break;
    }
  }

  // Generate a new unique strategy ID (8 character hex like backend does)
  const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
  const newStrategyId = `STRATEGY_${randomHex}`;
  const newStrategyName = `${originalName}_copy_${nextCopyNumber}`;

  // Deep clone the configuration
  const newConfig = JSON.parse(JSON.stringify(strategy.config));

  if (newConfig.baseConfig) {
    newConfig.baseConfig.strategyId = newStrategyId;
    newConfig.baseConfig.strategyName = newStrategyName;

    // Reset state fields - copied strategy should start fresh
    newConfig.baseConfig.isSelectedForTrading = false;
    newConfig.baseConfig.tradingState = "NONE";
    newConfig.baseConfig.strategyState = "NONE";
  }

  // Update leg IDs and strategy references, and reset runtime fields
  if (newConfig.legs) {
    // Handle both array and dict format
    if (Array.isArray(newConfig.legs)) {
      // Convert array to dict format
      const legsDict: Record<string, any> = {};
      newConfig.legs.forEach((leg: any) => {
        const legId = leg.legId || `LEG_${Date.now()}`;
        legsDict[legId] = {
          ...leg,
          legId: legId,
          strategyId: newStrategyId,
          strategyName: newStrategyName,
          // Reset runtime fields in legs
          reEnterCount: 0,
          reEnterLogic: "NONE",
          hedgeSelectedStrike: undefined,
          selectedStrike: undefined,
          initialLegPrice: undefined,
        };
      });
      newConfig.legs = legsDict;
    } else {
      // Already dict format, just update references and reset runtime fields
      const updatedLegs: Record<string, any> = {};
      Object.entries(newConfig.legs).forEach(([legId, leg]: [string, any]) => {
        updatedLegs[legId] = {
          ...leg,
          strategyId: newStrategyId,
          strategyName: newStrategyName,
          // Reset runtime fields in legs
          reEnterCount: 0,
          reEnterLogic: "NONE",
          hedgeSelectedStrike: undefined,
          selectedStrike: undefined,
          initialLegPrice: undefined,
        };
      });
      newConfig.legs = updatedLegs;
    }
  }

  if (
    !confirm(
      `Create a copy of strategy "${originalName}"?\n\nNew Strategy Name: ${newStrategyName}`
    )
  ) {
    return;
  }

  try {
    // Use the correct backend endpoint
    const response = await fetch(`${API_BASE_URL}/strategy/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newConfig),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    alert(
      `Strategy copied successfully!\n\nNew Strategy ID: ${result.strategyId}\nNew Strategy Name: ${newStrategyName}`
    );
    fetchStrategies();
  } catch (err: any) {
    console.error("Error copying strategy:", err);
    alert(`Failed to copy strategy: ${err.message}`);
  }
};
