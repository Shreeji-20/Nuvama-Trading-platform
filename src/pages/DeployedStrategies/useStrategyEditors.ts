import { useCallback } from "react";
import {
  updateBaseConfig,
  updateLegs,
  updateExecutionParams,
  Strategy,
} from "./EditFunctions";

/**
 * Custom hook for creating strategy edit handlers
 * Returns memoized callbacks that update strategies state
 */
export const useStrategyEditors = (
  strategyId: string,
  setStrategies: React.Dispatch<React.SetStateAction<Strategy[]>>
) => {
  const handleBaseConfigEdit = useCallback(
    (rowIndex: number, columnId: string, newValue: any) => {
      setStrategies((prev) =>
        updateBaseConfig(prev, strategyId, columnId, newValue)
      );
    },
    [strategyId, setStrategies]
  );

  const handleLegsEdit = useCallback(
    (rowIndex: number, columnId: string, newValue: any) => {
      setStrategies((prev) =>
        updateLegs(prev, strategyId, rowIndex, columnId, newValue)
      );
    },
    [strategyId, setStrategies]
  );

  const handleExecutionParamsEdit = useCallback(
    (rowIndex: number, columnId: string, newValue: any) => {
      setStrategies((prev) =>
        updateExecutionParams(prev, strategyId, columnId, newValue)
      );
    },
    [strategyId, setStrategies]
  );

  return {
    handleBaseConfigEdit,
    handleLegsEdit,
    handleExecutionParamsEdit,
  };
};
