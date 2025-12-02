// Types
export type Strategy = any; // Replace with your actual strategy type

// Pure update functions that return new state
export const updateBaseConfig = (
  strategies: Strategy[],
  strategyId: string,
  columnId: string,
  newValue: any
): Strategy[] => {
  return strategies.map((strategy) => {
    if (strategy.baseConfig.strategyId === strategyId) {
      return {
        ...strategy,
        baseConfig: {
          ...strategy.baseConfig,
          [columnId]: newValue,
        },
      };
    }
    return strategy;
  });
};

export const updateLegs = (
  strategies: Strategy[],
  strategyId: string,
  rowIndex: number,
  columnId: string,
  newValue: any
): Strategy[] => {
  return strategies.map((strategy) => {
    if (strategy.baseConfig.strategyId === strategyId) {
      const legKey = Object.keys(strategy.legs)[rowIndex];
      console.log(
        "Updating leg:",
        legKey,
        "Column:",
        columnId,
        "New Value:",
        newValue
      );
      return {
        ...strategy,
        legs: {
          ...strategy.legs,
          [legKey]: {
            ...strategy.legs[legKey],
            [columnId]: newValue,
          },
        },
      };
    }
    return strategy;
  });
};

export const updateExecutionParams = (
  strategies: Strategy[],
  strategyId: string,
  columnId: string,
  newValue: any
): Strategy[] => {
  return strategies.map((strategy) => {
    if (strategy.baseConfig.strategyId === strategyId) {
      return {
        ...strategy,
        executionParams: {
          ...strategy.executionParams,
          [columnId]: newValue,
        },
      };
    }
    return strategy;
  });
};
