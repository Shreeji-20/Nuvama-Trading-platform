import { Strategy } from "../../types/deployedStrategies.types";

/**
 * Strategy Editing Functions
 * Functions for handling strategy editing operations
 */

export interface EditingHandlers {
  setEditingStrategy: (id: string | null) => void;
  setEditValues: (values: any) => void;
}

/**
 * Sanitize action config by converting string values to proper types
 */
export const sanitizeActionConfig = (config: any) => {
  if (!config) return config;

  const sanitized = { ...config };

  // Convert actionCount to integer
  if (sanitized.actionCount !== undefined && sanitized.actionCount !== null) {
    sanitized.actionCount =
      typeof sanitized.actionCount === "string"
        ? parseInt(sanitized.actionCount, 10)
        : sanitized.actionCount;
  }

  // Convert slOrderAdjust values to float
  if (sanitized.slOrderAdjust) {
    if (
      sanitized.slOrderAdjust.minPoints !== undefined &&
      sanitized.slOrderAdjust.minPoints !== null
    ) {
      sanitized.slOrderAdjust.minPoints =
        typeof sanitized.slOrderAdjust.minPoints === "string"
          ? parseFloat(sanitized.slOrderAdjust.minPoints)
          : sanitized.slOrderAdjust.minPoints;
    }
    if (
      sanitized.slOrderAdjust.maxPercentage !== undefined &&
      sanitized.slOrderAdjust.maxPercentage !== null
    ) {
      sanitized.slOrderAdjust.maxPercentage =
        typeof sanitized.slOrderAdjust.maxPercentage === "string"
          ? parseFloat(sanitized.slOrderAdjust.maxPercentage)
          : sanitized.slOrderAdjust.maxPercentage;
    }
  }

  return sanitized;
};

/**
 * Start editing a strategy
 */
export const startEditing = (strategy: Strategy, handlers: EditingHandlers) => {
  handlers.setEditingStrategy(strategy.strategyId);

  // Initialize editValues and ensure all symbols have strikeSteps
  const config = { ...strategy.config };
  let legs = config.legs || {};

  // Convert array to dict if needed (backward compatibility)
  if (Array.isArray(legs)) {
    const legsDict: Record<string, any> = {};
    legs.forEach((leg: any) => {
      const legId = leg.legId || `LEG_${Date.now()}_${Math.random()}`;
      legsDict[legId] = { ...leg, legId };
    });
    legs = legsDict;
    config.legs = legs;
  }

  const currentStrikeSteps =
    (config as any).dynamicHedgeSettings?.strikeSteps || {};
  const newStrikeSteps = { ...currentStrikeSteps };

  // Default strike steps per symbol
  const defaultStrikeSteps: Record<string, number> = {
    NIFTY: 50,
    SENSEX: 100,
    BANKNIFTY: 100,
    FINNIFTY: 50,
  };

  // Ensure all symbols in legs have entries in strikeSteps
  Object.values(legs).forEach((leg: any) => {
    if (leg.symbol && !(leg.symbol in newStrikeSteps)) {
      newStrikeSteps[leg.symbol] = defaultStrikeSteps[leg.symbol] ?? 50;
    }
  });

  // Update config with complete strikeSteps
  if ((config as any).dynamicHedgeSettings) {
    (config as any).dynamicHedgeSettings.strikeSteps = newStrikeSteps;
  }

  handlers.setEditValues(config);
};

/**
 * Cancel editing
 */
export const cancelEditing = (handlers: EditingHandlers) => {
  handlers.setEditingStrategy(null);
  handlers.setEditValues({});
};

/**
 * Prepare sanitized legs for saving
 */
export const prepareSanitizedLegs = (
  editValues: any,
  strategyId: string
): Record<string, any> => {
  let sanitizedLegs = editValues.legs || {};

  // Convert array to dict if needed (backward compatibility)
  if (Array.isArray(editValues.legs)) {
    const legsDict: Record<string, any> = {};
    editValues.legs.forEach((leg: any) => {
      const legId = leg.legId || `LEG_${Date.now()}_${Math.random()}`;
      legsDict[legId] = {
        ...leg,
        legId: legId,
        strategyId: editValues.baseConfig?.strategyId || strategyId,
        strategyName: editValues.baseConfig?.strategyName || "",
        // Sanitize action configs
        onTargetActionConfig: sanitizeActionConfig(leg.onTargetActionConfig),
        onStoplossActionConfig: sanitizeActionConfig(
          leg.onStoplossActionConfig
        ),
        onSquareOffActionConfig: sanitizeActionConfig(
          leg.onSquareOffActionConfig
        ),
      };
    });
    sanitizedLegs = legsDict;
  } else {
    // Already dict, just update references and sanitize action configs
    const updatedLegs: Record<string, any> = {};
    Object.entries(sanitizedLegs).forEach(([legId, leg]: [string, any]) => {
      updatedLegs[legId] = {
        ...leg,
        strategyId: editValues.baseConfig?.strategyId || strategyId,
        strategyName: editValues.baseConfig?.strategyName || "",
        // Sanitize action configs
        onTargetActionConfig: sanitizeActionConfig(leg.onTargetActionConfig),
        onStoplossActionConfig: sanitizeActionConfig(
          leg.onStoplossActionConfig
        ),
        onSquareOffActionConfig: sanitizeActionConfig(
          leg.onSquareOffActionConfig
        ),
      };
    });
    sanitizedLegs = updatedLegs;
  }

  return sanitizedLegs;
};

/**
 * Deep compare two objects and return only the changed fields
 */
const getChangedFields = (original: any, updated: any): any => {
  if (original === updated) return undefined;

  // Handle null/undefined cases
  if (original === null || original === undefined) return updated;
  if (updated === null || updated === undefined) return updated;

  // Handle primitive types
  if (typeof original !== "object" || typeof updated !== "object") {
    return original !== updated ? updated : undefined;
  }

  // Handle arrays
  if (Array.isArray(original) || Array.isArray(updated)) {
    // For arrays, if they're different, return the whole updated array
    if (JSON.stringify(original) !== JSON.stringify(updated)) {
      return updated;
    }
    return undefined;
  }

  // Handle objects
  const changes: any = {};
  let hasChanges = false;

  // Check all keys in updated object
  const allKeys = new Set([
    ...Object.keys(original || {}),
    ...Object.keys(updated || {}),
  ]);

  for (const key of allKeys) {
    const originalValue = original[key];
    const updatedValue = updated[key];

    if (
      typeof updatedValue === "object" &&
      updatedValue !== null &&
      !Array.isArray(updatedValue)
    ) {
      const nestedChanges = getChangedFields(originalValue, updatedValue);
      if (nestedChanges !== undefined) {
        changes[key] = nestedChanges;
        hasChanges = true;
      }
    } else if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
      changes[key] = updatedValue;
      hasChanges = true;
    }
  }

  return hasChanges ? changes : undefined;
};

/**
 * Save edited strategy (sends only changed fields)
 */
export const saveEdit = (
  strategyId: string,
  editValues: any,
  updateStrategy: (strategyId: string, config: any) => void,
  originalStrategy?: Strategy
) => {
  const sanitizedLegs = prepareSanitizedLegs(editValues, strategyId);

  const sanitizedConfig = {
    ...editValues,
    legs: sanitizedLegs,
  };

  // If we have the original strategy, calculate only the changed fields
  if (originalStrategy?.config) {
    const changedFields = getChangedFields(
      originalStrategy.config,
      sanitizedConfig
    );

    if (changedFields && Object.keys(changedFields).length > 0) {
      // Send only changed fields
      updateStrategy(strategyId, changedFields);
    } else {
      console.log("No changes detected, skipping update");
      // Still close editing mode even if no changes
      return;
    }
  } else {
    // Fallback: send full config if original not available
    updateStrategy(strategyId, sanitizedConfig);
  }
};

/**
 * Handle edit changes to nested properties
 */
export const handleEditChange = (
  path: string,
  value: any,
  setEditValues: (fn: (prev: any) => any) => void
) => {
  setEditValues((prev: any) => {
    const keys = path.split(".");
    const newValues = { ...prev };
    let current = newValues;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return newValues;
  });
};

/**
 * Get edit value from nested path
 */
export const getEditValue = (
  strategy: Strategy,
  editingStrategy: string | null,
  editValues: any,
  path: string
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
