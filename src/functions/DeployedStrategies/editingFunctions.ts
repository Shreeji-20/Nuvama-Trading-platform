import { Strategy } from "../../types/deployedStrategies.types";

/**
 * Start editing a strategy
 * Initializes edit mode and resets change tracking
 */
export const startEditing = (
  strategy: Strategy,
  setEditingStrategy: (id: string) => void,
  setChangedFields: (fields: Record<string, any>) => void,
  setEditValues: (values: any) => void
) => {
  setEditingStrategy(strategy.strategyId);
  setChangedFields({}); // Reset changed fields tracker

  // Deep clone the config to avoid reference issues
  const config = JSON.parse(JSON.stringify(strategy.config));
  setEditValues(config);
};

/**
 * Cancel editing
 * Resets all editing state
 */
export const cancelEditing = (
  setEditingStrategy: (id: string | null) => void,
  setEditValues: (values: any) => void,
  setChangedFields: (fields: Record<string, any>) => void
) => {
  setEditingStrategy(null);
  setEditValues({});
  setChangedFields({});
};

/**
 * Handle edit changes
 * Tracks field changes with exact paths (including nested fields)
 *
 * Examples:
 * - Simple field: "baseConfig.executionMode" = "Live Mode"
 * - Nested field: "legs.LEG_001.quantity" = 10
 * - Deep nested: "legs.LEG_001.onTargetActionConfig.actionCount" = 2
 */
export const handleEditChange = (
  path: string,
  value: any,
  setEditValues: (updater: (prev: any) => any) => void,
  setChangedFields: (
    updater: (prev: Record<string, any>) => Record<string, any>
  ) => void
) => {
  // Update the edit values
  setEditValues((prev: any) => {
    const keys = path.split(".");
    const newValues = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid mutations
    let current = newValues;

    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Set the final value
    current[keys[keys.length - 1]] = value;
    return newValues;
  });

  // Track the changed field with exact path and value
  setChangedFields((prev) => ({
    ...prev,
    [path]: value,
  }));

  console.log(`✏️ Field changed: ${path} =`, value);
};

/**
 * Get edit value from strategy or editValues
 */
export const getEditValue = (
  strategy: Strategy,
  path: string,
  editingStrategy: string | null,
  editValues: any
): any => {
  const keys = path.split(".");
  let value =
    editingStrategy === strategy.strategyId ? editValues : strategy.config;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
};
