import { setNestedProperty } from "../../hooks/commonFunctions";

// Types
export type Strategy = any; // Replace with your actual strategy type

// Pure update functions that return new state
export const updateBaseConfig = (
  strategies: Strategy[],
  strategyId: string,
  columnId: string,
  newValue: any
): Strategy[] => {
  return Object.keys(strategies).map((key: any) => {
    if (strategies[key].base_config.strategy_id === strategyId) {
      return {
        ...strategies[key],
        base_config: setNestedProperty(
          strategies[key].base_config,
          columnId,
          newValue
        ),
      };
    }
    return strategies[key];
  });
};

export const updateLegs = (
  strategies: Strategy[],
  strategyId: string,
  rowIndex: number,
  columnId: string,
  newValue: any
): Strategy[] => {
  return Object.keys(strategies).map((key: any) => {
    if (strategies[key].base_config.strategy_id === strategyId) {
      const legKey = Object.keys(strategies[key].legs)[rowIndex];
      // Patch request here (legKey ,columnId, newValue)
      return {
        ...strategies[key],
        legs: {
          ...strategies[key].legs,
          [legKey]: setNestedProperty(
            strategies[key].legs[legKey],
            columnId,
            newValue
          ),
        },
      };
    }
    return strategies[key];
  });
};

export const deleteLeg = (
  strategies: Strategy[],
  strategyId: string,
  rowIndex: number
): Strategy[] => {
  return Object.keys(strategies).map((key: any) => {
    if (strategies[key].base_config.strategy_id === strategyId) {
      const legKey = Object.keys(strategies[key].legs)[rowIndex];
      const { [legKey]: _, ...updatedLegs } = strategies[key].legs;
      console.log("Deleting leg:", legKey);
      console.log("Updated legs after deletion:", updatedLegs);
      return {
        ...strategies[key],
        legs: updatedLegs,
      };
    }
    return strategies[key];
  });
};

export const copyLeg = (
  strategies: Strategy[],
  strategyId: string,
  rowIndex: number
): Strategy[] => {
  return Object.keys(strategies).map((key: any) => {
    if (strategies[key].base_config.strategy_id === strategyId) {
      const legKey = Object.keys(strategies[key].legs)[rowIndex];
      const legToCopy = strategies[key].legs[legKey];
      const newLegKey = `leg_${Date.now()}`; // Simple unique key generation
      return {
        ...strategies[key],
        legs: {
          ...strategies[key].legs,
          [newLegKey]: { ...legToCopy },
        },
      };
    }
    return strategies[key];
  });
};

export const updateExecutionParams = (
  strategies: Strategy[],
  strategyId: string,
  columnId: string,
  newValue: any
): Strategy[] => {
  return Object.keys(strategies).map((key: any) => {
    if (strategies[key].base_config.strategy_id === strategyId) {
      return {
        ...strategies[key],
        execution_params: setNestedProperty(
          strategies[key].execution_params,
          columnId,
          newValue
        ),
      };
    }
    return strategies[key];
  });
};
