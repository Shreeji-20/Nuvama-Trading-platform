/**
 * DeployedStrategiesFunctions Module
 *
 * This module contains all the business logic functions for the DeployedStrategies component.
 * It separates concerns by extracting complex logic into reusable, testable functions.
 */

// Trading Controls
export {
  // Global Trading Control Functions
  handleStartTrading,
  handleStopTrading,
  handlePauseTrading,

  // Strategy-Wise Trading Control Functions
  handleStrategyStatusChange,
  startStrategy,
  pauseStrategy,
  stopStrategy,

  // Utility Functions
  getStrategyStatus,
  isStrategyRunning,
  isStrategyPaused,
  isStrategyStopped,

  // Types
  type StrategyStatus,
  type GlobalTradingHandlers,
  type StrategyStatusHandlers,
} from "./tradingControls";

// Strategy Operations
export {
  fetchStrategies,
  fetchStrategyTags,
  updateStrategy,
  deleteStrategy,
  copyStrategy,
  type StrategyOperationHandlers,
} from "./strategyOperations";

// Strategy Editing
export {
  sanitizeActionConfig,
  startEditing,
  cancelEditing,
  prepareSanitizedLegs,
  saveEdit,
  handleEditChange,
  getEditValue,
  type EditingHandlers,
} from "./strategyEditing";

// Tab Management Hook
export { useStrategyTabs, type UseStrategyTabsReturn } from "./useStrategyTabs";

// Export Utilities
export { exportToExcel, exportMultipleStrategiesToExcel } from "./exportUtils";

// Order Operations
export {
  handleSquareOff,
  toggleStrategy,
  fetchOptionData,
} from "./orderOperations";
