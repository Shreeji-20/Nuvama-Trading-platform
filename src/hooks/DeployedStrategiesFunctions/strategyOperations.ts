import config from "../../config/api";
import { Strategy } from "../../types/deployedStrategies.types";
import axios from "axios";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Strategy CRUD Operations
 * Functions for creating, reading, updating, and deleting strategies
 */

export interface StrategyOperationHandlers {
  setError: (value: string | null) => void;
  setStrategies: (strategies: Strategy[]) => void;
  setEditingStrategy: (id: string | null) => void;
  setEditValues: (values: any) => void;
}

/**
 * Fetch all deployed strategies from the backend
 */
export const fetchStrategies = async (
  handlers: Pick<StrategyOperationHandlers, "setError" | "setStrategies">
) => {
  try {
    handlers.setError(null);
    const response = await axios.get(`${API_BASE_URL}/strategy/list`);
    handlers.setStrategies(response.data.strategies || []);
  } catch (err: any) {
    console.error("Error fetching strategies:", err);
    handlers.setError(err.message);
  }
};

/**
 * Fetch available strategy tags
 */
export const fetchStrategyTags = async (
  setAvailableTags: (tags: any[]) => void
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/strategy-tags/list`);
    setAvailableTags(response.data);
  } catch (error) {
    console.error("Error fetching strategy tags:", error);
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
    await axios.put(
      `${API_BASE_URL}/strategy/update/${strategyId}`,
      updatedConfig
    );

    fetchStrategies();
    handlers.setEditingStrategy(null);
    handlers.setEditValues({});

    alert("Strategy updated successfully!");
  } catch (err: any) {
    console.error("Error updating strategy:", err);

    if (err.response?.status === 422 && err.response?.data?.detail?.errors) {
      const errorMessages = err.response.data.detail.errors
        .map((error: any) => `${error.loc.join(".")}: ${error.msg}`)
        .join("\n");
      alert(`Failed to update strategy:\nValidation errors:\n${errorMessages}`);
    } else {
      alert(
        `Failed to update strategy: ${
          err.response?.data?.detail || err.message
        }`
      );
    }
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
    await axios.delete(`${API_BASE_URL}/strategy/delete/${strategyId}`);

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

  const defaultNewStrategyName = `${originalName}_copy_${nextCopyNumber}`;

  // Ask user if they want to use default name or enter custom name
  const useDefaultName = confirm(
    `Copy strategy "${originalName}"?\n\nDefault name: "${defaultNewStrategyName}"\n\nClick OK to use default name, or Cancel to enter custom name.`
  );

  let newStrategyName: string | null;

  if (useDefaultName) {
    newStrategyName = defaultNewStrategyName;
  } else {
    // Ask for custom name
    newStrategyName = prompt(
      `Enter a custom name for the copied strategy:`,
      defaultNewStrategyName
    );

    // If user cancelled the prompt or entered empty string
    if (!newStrategyName || newStrategyName.trim() === "") {
      return; // Cancel the copy operation
    }

    newStrategyName = newStrategyName.trim();

    // Check if name already exists
    const nameExists = strategies.some(
      (s) => (s.config as any)?.baseConfig?.strategyName === newStrategyName
    );

    if (nameExists) {
      alert(
        `A strategy with the name "${newStrategyName}" already exists. Please choose a different name.`
      );
      return;
    }
  }

  // Generate a new unique strategy ID (8 character hex like backend does)
  const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
  const newStrategyId = `STRATEGY_${randomHex}`;

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

  try {
    // Use the correct backend endpoint
    const response = await axios.post(
      `${API_BASE_URL}/strategy/create`,
      newConfig
    );

    alert(
      `Strategy copied successfully!\n\nNew Strategy ID: ${response.data.strategyId}\nNew Strategy Name: ${newStrategyName}`
    );
    fetchStrategies();
  } catch (err: any) {
    console.error("Error copying strategy:", err);
    alert(
      `Failed to copy strategy: ${err.response?.data?.detail || err.message}`
    );
  }
};

/**
 * Fetch strategy status from Redis (strategy_status:{strategy_id})
 * Returns 'NONE' if key not found
 */
export const fetchStrategyStatus = async (
  strategyId: string
): Promise<string> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/strategy/status/${strategyId}`
    );
    return response.data.status || "NONE";
  } catch (error) {
    console.error(`Error fetching strategy status for ${strategyId}:`, error);
    return "NONE";
  }
};

/**
 * Fetch strategy statuses for multiple strategies
 */
export const fetchMultipleStrategyStatuses = async (
  strategyIds: string[]
): Promise<Record<string, string>> => {
  const statusPromises = strategyIds.map(async (strategyId) => {
    const status = await fetchStrategyStatus(strategyId);
    return { strategyId, status };
  });

  const results = await Promise.all(statusPromises);

  const statusMap: Record<string, string> = {};
  results.forEach(({ strategyId, status }) => {
    statusMap[strategyId] = status;
  });

  return statusMap;
};
