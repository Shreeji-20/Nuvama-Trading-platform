import { useCallback } from "react";
import {
  updateBaseConfig,
  updateLegs,
  updateExecutionParams,
  Strategy,
  copyLeg,
  deleteLeg,
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

  const handleLegDelete = useCallback(
    (rowIndex: number) => {
      setStrategies((prev) => deleteLeg(prev, strategyId, rowIndex));
    },
    [strategyId, setStrategies]
  );

  const handleCopyLeg = useCallback(
    (rowIndex: number) => {
      setStrategies((prev) => copyLeg(prev, strategyId, rowIndex));
    },
    [strategyId, setStrategies]
  );

  const handleAddLeg = useCallback(() => {
    setStrategies((prev) => copyLeg(prev, strategyId, 0)); // Example: copying the first leg as a new leg
  }, [strategyId, setStrategies]);

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
    handleLegDelete,
    handleAddLeg,
    handleCopyLeg,
    handleExecutionParamsEdit,
  };
};
