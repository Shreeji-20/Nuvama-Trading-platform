/**
 * DeployedStrategiesFunctions Module
 *
 * This module contains all the business logic functions for the DeployedStrategies component.
 * It separates concerns by extracting complex logic into reusable, testable functions.
 */

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
