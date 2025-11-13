import React, { useState, useEffect, useCallback, useRef } from "react";
import config from "../config/api";
import LegsConfigurationTable from "../components/LegsConfigurationTable";
import PremiumStrikeModal from "../components/PremiumStrikeModal";
import ActionConfigModal from "../components/ActionConfigModal";
import OpenPositionsTab from "../components/OpenPositionsTab";
import OpenOrdersTab from "../components/OpenOrdersTab";
import CompletedOrdersTab from "../components/CompletedOrdersTab";
import ExitSettingsTab from "../components/ExitSettingsTab";
import TargetSettingsTab from "../components/TargetSettingsTab";
import StoplossSettingsTab from "../components/StoplossSettingsTab";
import DynamicHedgeTab from "../components/DynamicHedgeTab";
import AtBrokerTab from "../components/AtBrokerTab";
import ExecutionParametersTab from "../components/ExecutionParametersTab";
import StartTradingButton from "../components/StartTradingButton";
import StopTradingButton from "../components/StopTradingButton";
import PauseTradingButton from "../components/PauseTradingButton";
import { useStrategyOrders } from "../hooks/useStrategyOrders";
import { usePnLCalculation } from "../hooks/usePnLCalculation";
import {
  StrategyCard,
  TabNavigation,
  EmptyState,
  LoadingSpinner,
} from "../components/DeployedStrategies";
import { Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { Strategy, Order } from "../types/deployedStrategies.types";
import { StrategyTag } from "../types/strategy.types";
import {
  isOrderComplete,
  isOrderRejected,
  isOrderCancelled,
  isOrderPending,
  isOrderCompletedOrFinished,
} from "../constants/deployedStrategies.constants";
import {
  handleStartTrading as startGlobalTrading,
  handleStopTrading as stopGlobalTrading,
  handlePauseTrading as pauseGlobalTrading,
  handleStrategyStatusChange as changeStrategyStatus,
  fetchGlobalTradingState,
  type StrategyStatus,
  fetchStrategies as fetchStrategiesAPI,
  fetchStrategyTags as fetchStrategyTagsAPI,
  updateStrategy as updateStrategyAPI,
  deleteStrategy as deleteStrategyAPI,
  copyStrategy as copyStrategyAPI,
  startEditing as startEditingStrategy,
  cancelEditing as cancelEditingStrategy,
  saveEdit as saveEditStrategy,
  handleEditChange as handleEditChangeValue,
  getEditValue as getEditValueUtil,
  useStrategyTabs,
  exportToExcel,
  handleSquareOff as handleSquareOffOrder,
  toggleStrategy as toggleStrategyExpansion,
  fetchOptionData as fetchOptionDataAPI,
} from "./DeployedStrategiesFunctions";

const DeployedStrategies: React.FC = () => {
  // Symbol options for dropdown
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [availableTags, setAvailableTags] = useState<StrategyTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [premiumStrikeModalLeg, setPremiumStrikeModalLeg] = useState<any>(null);
  const [actionConfigModalState, setActionConfigModalState] = useState<{
    legId: string | null;
    actionType: "target" | "stoploss" | "squareoff" | null;
  }>({ legId: null, actionType: null });
  const [currentEditingStrategyId, setCurrentEditingStrategyId] = useState<
    string | null
  >(null);
  const [isTrading, setIsTrading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tradingLoading, setTradingLoading] = useState(false);

  // Individual strategy trading status: 'stopped' | 'running' | 'paused'
  const [strategyStatus, setStrategyStatus] = useState<
    Record<string, StrategyStatus>
  >({});

  // Use custom hooks for tabs, orders and P&L
  const {
    getActiveTab,
    setStrategyTab,
    getActiveSettingsTab,
    setStrategySettingsTab,
  } = useStrategyTabs();

  const {
    orders: strategyOrders,
    loading: loadingOrders,
    fetchOrders,
    startAutoRefresh,
    stopAutoRefresh,
  } = useStrategyOrders();

  const { positionPnL, loadingPnL, calculatePnLForPositions } =
    usePnLCalculation();

  // Option data cache
  const [optionDataCache, setOptionDataCache] = useState<any[]>([]);
  const [lastOptionDataFetch, setLastOptionDataFetch] = useState<Date | null>(
    null
  );
  const optionDataIntervalRef = useRef<number | null>(null);

  const API_BASE_URL = config.API_BASE_URL;

  // Options for dynamic hedge settings
  const hedgeTypeOptions = ["premium Based", "fixed Distance"];

  // Tab configuration - Only for order tabs
  const tabs = [
    { id: "positions", label: "Open Positions" },
    { id: "orders", label: "Open Orders" },
    { id: "completed", label: "Completed Orders" },
    { id: "settings", label: "Strategy Settings" },
  ];

  // Nested tabs for Other Settings
  const settingsTabs = [
    { id: "execution", label: "Execution Parameters" },
    { id: "exit", label: "Exit Settings" },
    { id: "target", label: "Target Settings" },
    { id: "stoploss", label: "Stoploss Settings" },
    { id: "hedge", label: "Dynamic Hedge" },
    { id: "atbroker", label: "At Broker" },
  ];

  // Fetch all deployed strategies - wrapper
  const fetchStrategies = async () => {
    await fetchStrategiesAPI({
      setLoading,
      setError,
      setStrategies,
    });
  };

  // Fetch available strategy tags - wrapper
  const fetchStrategyTags = async () => {
    await fetchStrategyTagsAPI(setAvailableTags, setLoadingTags);
  };

  // Update strategy - wrapper
  const updateStrategy = async (strategyId: string, updatedConfig: any) => {
    await updateStrategyAPI(
      strategyId,
      updatedConfig,
      { setEditingStrategy, setEditValues },
      fetchStrategies
    );
  };

  // Delete strategy - wrapper
  const deleteStrategy = async (strategyId: string) => {
    await deleteStrategyAPI(strategyId, fetchStrategies);
  };

  // Copy strategy - wrapper
  const copyStrategy = async (strategy: Strategy) => {
    await copyStrategyAPI(strategy, strategies, fetchStrategies);
  };

  // Start editing strategy - wrapper
  const startEditing = (strategy: Strategy) => {
    startEditingStrategy(strategy, { setEditingStrategy, setEditValues });
  };

  // Cancel editing - wrapper
  const cancelEditing = () => {
    cancelEditingStrategy({ setEditingStrategy, setEditValues });
  };

  // Save edit - wrapper
  const saveEdit = (strategyId: string) => {
    saveEditStrategy(strategyId, editValues, updateStrategy);
  };

  // Handle edit change - wrapper
  const handleEditChange = (path: string, value: any) => {
    handleEditChangeValue(path, value, setEditValues);
  };

  // Get edit value - wrapper
  const getEditValue = (strategy: Strategy, path: string): any => {
    return getEditValueUtil(strategy, editingStrategy, editValues, path);
  };

  // Toggle strategy expansion - wrapper
  const toggleStrategy = (strategyId: string) => {
    toggleStrategyExpansion(
      strategyId,
      expandedStrategy,
      setExpandedStrategy,
      fetchOrders,
      startAutoRefresh,
      stopAutoRefresh
    );
  };

  // Handle Square Off - wrapper
  const handleSquareOff = (order: Order) => {
    handleSquareOffOrder(order, fetchOrders);
  };

  // Fetch option data - wrapper
  const fetchOptionData = useCallback(async () => {
    await fetchOptionDataAPI(setOptionDataCache, setLastOptionDataFetch);
  }, []);

  // Handle Start Trading - wrapper for global trading control
  const handleStartTrading = async () => {
    await startGlobalTrading({
      setIsTrading,
      setIsPaused,
      setTradingLoading,
    });
  };

  // Handle Stop Trading - wrapper for global trading control
  const handleStopTrading = async () => {
    await stopGlobalTrading({
      setIsTrading,
      setIsPaused,
      setTradingLoading,
    });
  };

  // Handle Pause Trading - wrapper for global trading control
  const handlePauseTrading = async () => {
    await pauseGlobalTrading(isPaused, {
      setIsTrading,
      setIsPaused,
      setTradingLoading,
    });
  };

  // Handle individual strategy status change - wrapper for strategy-wise control
  const handleStrategyStatusChange = async (
    strategyId: string,
    newStatus: StrategyStatus
  ) => {
    await changeStrategyStatus(strategyId, newStatus, strategyStatus, {
      setStrategyStatus,
    });
  };

  // Initialize
  useEffect(() => {
    // Function to fetch data
    const fetchData = () => {
      fetchStrategies();
      fetchStrategyTags();
    };

    // Fetch global trading state on mount
    fetchGlobalTradingState({
      setIsTrading,
      setIsPaused,
      setTradingLoading,
    });

    // Run immediately on mount
    fetchData();

    // Set interval to run every 1000 seconds (1000 * 1000 ms)
    const interval = setInterval(fetchData, 1000 * 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (optionDataIntervalRef.current) {
        clearInterval(optionDataIntervalRef.current);
      }
    };
  }, []);

  // Conditionally refresh option data only if there are open positions
  useEffect(() => {
    // Check if any strategy has open positions
    const hasAnyOpenPositions = Object.values(strategyOrders).some((orders) =>
      orders?.some((order) => order.entered === true && order.exited !== true)
    );

    if (hasAnyOpenPositions) {
      console.log(
        "[DeployedStrategies] Open positions detected, starting option data refresh"
      );

      // Clear any existing interval
      if (optionDataIntervalRef.current) {
        clearInterval(optionDataIntervalRef.current);
      }

      // Set up option data refresh interval (every 1 second)
      // optionDataIntervalRef.current = setInterval(() => {
      //   fetchOptionData();
      // }, 500);
    } else {
      console.log(
        "[DeployedStrategies] No open positions, stopping option data refresh"
      );

      // Clear interval if no open positions
      if (optionDataIntervalRef.current) {
        clearInterval(optionDataIntervalRef.current);
        optionDataIntervalRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (optionDataIntervalRef.current) {
        clearInterval(optionDataIntervalRef.current);
      }
    };
  }, [strategyOrders, fetchOptionData]);

  // Calculate P&L when orders change
  // The hook internally skips if no open positions and all closed are cached
  useEffect(() => {
    Object.entries(strategyOrders).forEach(([strategyId, orders]) => {
      if (orders) {
        calculatePnLForPositions(orders);
      }
    });
  }, [strategyOrders, calculatePnLForPositions]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-[100rem] mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-lg font-bold text-gray-900 dark:text-white mb-2">
                Deployed Strategies
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor and manage your active trading strategies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StartTradingButton
                onClick={handleStartTrading}
                disabled={isTrading || tradingLoading}
                loading={tradingLoading && !isTrading}
              />
              <PauseTradingButton
                onClick={handlePauseTrading}
                disabled={!isTrading || tradingLoading}
                loading={tradingLoading}
              />
              <StopTradingButton
                onClick={handleStopTrading}
                disabled={!isTrading || tradingLoading}
                loading={tradingLoading && isTrading}
              />
            </div>
          </div>
        </div>

        {/* Strategies List */}
        {strategies.length === 0 ? (
          <EmptyState
            icon="📊"
            message="No strategies deployed yet"
            description="Deploy a strategy to see it here"
          />
        ) : (
          <div className="space-y-4">
            {strategies.map((strategy) => {
              const isExpanded = expandedStrategy === strategy.strategyId;
              const isEditing = editingStrategy === strategy.strategyId;
              const orders = strategyOrders[strategy.strategyId];
              const isLoadingOrders = loadingOrders[strategy.strategyId];

              return (
                <div
                  key={strategy.strategyId}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  {/* Strategy Card Header */}
                  <StrategyCard
                    {...({
                      strategy,
                      isExpanded,
                      isEditing,
                      onToggleExpand: () => toggleStrategy(strategy.strategyId),
                      onStartEdit: () => startEditing(strategy),
                      onDelete: () => deleteStrategy(strategy.strategyId),
                      onCopyStrategy: () => copyStrategy(strategy),
                      onExportToExcel: () => exportToExcel(strategy),
                      onSave: () => saveEdit(strategy.strategyId),
                      onCancelEdit: cancelEditing,
                      ordersSummary: null,
                      strategyStatus:
                        strategyStatus[strategy.strategyId] || "stopped",
                      onStrategyStatusChange: handleStrategyStatusChange,
                    } as any)}
                  />

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {/* Always Visible Configuration Section */}
                      <div className="p-3 space-y-3">
                        {/* Base Configuration */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Base Configuration
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                Strategy ID
                              </div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                                {(strategy.config as any)?.baseConfig
                                  ?.strategyId || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                Strategy Name
                              </div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                                {(strategy.config as any)?.baseConfig
                                  ?.strategyName || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                User ID
                              </div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                                {(strategy.config as any)?.baseConfig?.userId ||
                                  "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                Symbol
                              </div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                                {(strategy.config as any)?.baseConfig?.symbol ||
                                  "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                Entry Time
                              </div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                                {(strategy.config as any)?.baseConfig
                                  ?.entryTime || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                Square Off Time
                              </div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                                {(strategy.config as any)?.baseConfig
                                  ?.squareOffTime || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                Execution Mode
                              </div>
                              {isEditing ? (
                                <select
                                  value={
                                    getEditValue(
                                      strategy,
                                      "baseConfig.executionMode"
                                    ) || "Simulation Mode"
                                  }
                                  onChange={(e) =>
                                    handleEditChange(
                                      "baseConfig.executionMode",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                  <option value="Live Mode">Live Mode</option>
                                  <option value="Simulation Mode">
                                    Simulation Mode
                                  </option>
                                </select>
                              ) : (
                                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                  <span
                                    className={`p-1 rounded text-xs font-medium ${
                                      (strategy.config as any)?.baseConfig
                                        ?.executionMode === "Live Mode"
                                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                    }`}
                                  >
                                    {(strategy.config as any)?.baseConfig
                                      ?.executionMode || "N/A"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Legs Configuration */}
                        {(strategy.config as any)?.legs &&
                          (Array.isArray((strategy.config as any).legs)
                            ? (strategy.config as any).legs.length > 0
                            : Object.keys((strategy.config as any).legs)
                                .length > 0) && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Legs Configuration (
                                {isEditing
                                  ? Array.isArray(editValues.legs)
                                    ? editValues.legs?.length
                                    : Object.keys(editValues.legs || {}).length
                                  : Array.isArray((strategy.config as any).legs)
                                  ? (strategy.config as any).legs.length
                                  : Object.keys(
                                      (strategy.config as any).legs || {}
                                    ).length}{" "}
                                legs)
                              </h4>
                              <LegsConfigurationTable
                                legs={
                                  isEditing
                                    ? editValues.legs
                                    : (strategy.config as any).legs
                                }
                                isEditing={isEditing}
                                onLegChange={(
                                  legId: string,
                                  field: string,
                                  value: any
                                ) => {
                                  const newLegs = { ...editValues.legs };
                                  const oldSymbol = newLegs[legId]?.symbol;

                                  newLegs[legId] = {
                                    ...newLegs[legId],
                                    [field]: value,
                                  };
                                  handleEditChange("legs", newLegs);

                                  // If symbol changed, update strikeSteps dictionary
                                  if (field === "symbol") {
                                    const currentStrikeSteps =
                                      editValues.dynamicHedgeSettings
                                        ?.strikeSteps || {};
                                    const newStrikeSteps = {
                                      ...currentStrikeSteps,
                                    };

                                    // Get default value for new symbol
                                    const defaultStrikeSteps: Record<
                                      string,
                                      number
                                    > = {
                                      NIFTY: 50,
                                      SENSEX: 100,
                                      BANKNIFTY: 100,
                                      FINNIFTY: 50,
                                    };

                                    // Add new symbol with default value if not exists
                                    if (value && !(value in newStrikeSteps)) {
                                      newStrikeSteps[value] =
                                        defaultStrikeSteps[value] ?? 50;
                                    }

                                    // Remove old symbol if no other legs use it
                                    if (oldSymbol && oldSymbol !== value) {
                                      const otherLegsUseOldSymbol =
                                        Object.values(newLegs).some(
                                          (leg: any) =>
                                            leg.legId !== legId &&
                                            leg.symbol === oldSymbol
                                        );
                                      if (
                                        !otherLegsUseOldSymbol &&
                                        oldSymbol in newStrikeSteps
                                      ) {
                                        delete newStrikeSteps[oldSymbol];
                                      }
                                    }

                                    handleEditChange(
                                      "dynamicHedgeSettings.strikeSteps",
                                      newStrikeSteps
                                    );
                                  }
                                }}
                                onDeleteLeg={(legId: string) => {
                                  const newLegs = { ...editValues.legs };
                                  delete newLegs[legId];
                                  handleEditChange("legs", newLegs);
                                }}
                                onCopyLeg={(legId: string) => {
                                  const legToCopy = editValues.legs[legId];
                                  if (legToCopy) {
                                    // Find the next available leg ID
                                    const existingLegNumbers = Object.values(
                                      editValues.legs
                                    )
                                      .map((leg: any) => {
                                        const match =
                                          leg.legId?.match(/LEG_(\d+)/);
                                        return match
                                          ? parseInt(match[1], 10)
                                          : 0;
                                      })
                                      .sort((a: number, b: number) => a - b);

                                    let nextLegNumber = 1;
                                    for (const num of existingLegNumbers) {
                                      if (num === nextLegNumber) {
                                        nextLegNumber++;
                                      } else {
                                        break;
                                      }
                                    }

                                    const newLegId = `LEG_${String(
                                      nextLegNumber
                                    ).padStart(3, "0")}`;
                                    const newLeg = {
                                      ...legToCopy,
                                      id: Date.now(),
                                      legId: newLegId,
                                    };
                                    const newLegs = {
                                      ...editValues.legs,
                                      [newLegId]: newLeg,
                                    };
                                    handleEditChange("legs", newLegs);
                                  }
                                }}
                                onAddLeg={() => {
                                  const baseConfig = (strategy.config as any)
                                    ?.baseConfig;

                                  // Find the next available leg ID
                                  const existingLegNumbers = Object.values(
                                    editValues.legs
                                  )
                                    .map((leg: any) => {
                                      const match =
                                        leg.legId?.match(/LEG_(\d+)/);
                                      return match ? parseInt(match[1], 10) : 0;
                                    })
                                    .sort((a: number, b: number) => a - b);

                                  let nextLegNumber = 1;
                                  for (const num of existingLegNumbers) {
                                    if (num === nextLegNumber) {
                                      nextLegNumber++;
                                    } else {
                                      break;
                                    }
                                  }

                                  const newLegId = `LEG_${String(
                                    nextLegNumber
                                  ).padStart(3, "0")}`;
                                  const newLeg = {
                                    id: Date.now(),
                                    legId: newLegId,
                                    strategyId:
                                      baseConfig?.strategyId ||
                                      strategy.strategyId,
                                    strategyName:
                                      baseConfig?.strategyName || "",
                                    symbol: "NIFTY",
                                    expiry: 0,
                                    action: "BUY",
                                    optionType: "CE",
                                    lots: 1,
                                    strike: "ATM",
                                    target: "NONE",
                                    targetValue: 0,
                                    stoploss: "NONE",
                                    stoplossValue: 0,
                                    priceType: "BIDASK",
                                    depthIndex: 1,
                                    orderType: "LIMIT",
                                    startTime: "",
                                    waitAndTrade: 0,
                                    waitAndTradeLogic: "NONE",
                                    dynamicHedge: false,
                                    onTargetAction: "NONE",
                                    onStoplossAction: "NONE",
                                    onSquareOffAction: "NONE",
                                    onTargetActionConfig: {
                                      actionType: "NONE",
                                      actionCount: 1,
                                      orderAtBroker: false,
                                      slOrderAdjust: {
                                        minPoints: 0,
                                        maxPercentage: 0,
                                      },
                                    },
                                    onStoplossActionConfig: {
                                      actionType: "NONE",
                                      actionCount: 1,
                                      orderAtBroker: false,
                                      slOrderAdjust: {
                                        minPoints: 0,
                                        maxPercentage: 0,
                                      },
                                    },
                                    onSquareOffActionConfig: {
                                      actionType: "NONE",
                                      actionCount: 1,
                                      orderAtBroker: false,
                                      slOrderAdjust: {
                                        minPoints: 0,
                                        maxPercentage: 0,
                                      },
                                    },
                                    premiumBasedStrike: false,
                                    premiumBasedStrikeConfig: {
                                      strikeType: "NearestPremium",
                                      maxDepth: 5,
                                      searchSide: "BOTH",
                                      value: 0,
                                      condition: "Greaterthanequal",
                                      between: 0,
                                      and: 0,
                                    },
                                  };
                                  const newLegs = {
                                    ...editValues.legs,
                                    [newLegId]: newLeg,
                                  };
                                  handleEditChange("legs", newLegs);
                                }}
                                onPremiumStrikeModalOpen={(legId: string) => {
                                  setPremiumStrikeModalLeg({
                                    index: legId,
                                    leg: editValues.legs[legId],
                                  });
                                  setCurrentEditingStrategyId(
                                    strategy.strategyId
                                  );
                                }}
                                onActionConfigModalOpen={(
                                  legId: string,
                                  actionType:
                                    | "target"
                                    | "stoploss"
                                    | "squareoff"
                                ) => {
                                  setActionConfigModalState({
                                    legId,
                                    actionType,
                                  });
                                  setCurrentEditingStrategyId(
                                    strategy.strategyId
                                  );
                                }}
                              />
                            </div>
                          )}
                      </div>

                      {/* Order Tabs Section */}
                      <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3 mt-4 mx-3 mb-3">
                        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                          <nav className="flex space-x-8 overflow-x-auto">
                            <TabNavigation
                              {...({
                                tabs,
                                activeTabId: getActiveTab(strategy.strategyId),
                                onTabChange: (tabId: string) =>
                                  setStrategyTab(strategy.strategyId, tabId),
                              } as any)}
                            />
                          </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="mt-4">
                          {/* Open Positions Tab */}
                          {getActiveTab(strategy.strategyId) ===
                            "positions" && (
                            <OpenPositionsTab
                              strategy={strategy}
                              orders={orders || null}
                              positionPnL={positionPnL}
                              loadingPnL={loadingPnL}
                              isRefreshing={isLoadingOrders || false}
                              onRefresh={() => fetchOrders(strategy.strategyId)}
                              onSquareOff={handleSquareOff}
                            />
                          )}

                          {/* Open Orders Tab */}
                          {getActiveTab(strategy.strategyId) === "orders" && (
                            <OpenOrdersTab
                              strategy={strategy}
                              orders={orders || null}
                              positionPnL={positionPnL}
                              loadingPnL={loadingPnL}
                              isRefreshing={isLoadingOrders || false}
                              onRefresh={() => fetchOrders(strategy.strategyId)}
                            />
                          )}

                          {/* Completed Orders Tab */}
                          {getActiveTab(strategy.strategyId) ===
                            "completed" && (
                            <CompletedOrdersTab
                              strategy={strategy}
                              orders={orders || null}
                              positionPnL={positionPnL}
                              loadingPnL={loadingPnL}
                              isRefreshing={isLoadingOrders || false}
                              onRefresh={() => fetchOrders(strategy.strategyId)}
                            />
                          )}

                          {/* Other Settings Tab */}
                          {getActiveTab(strategy.strategyId) === "settings" && (
                            <div>
                              {/* Nested Tabs for Settings */}
                              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                                <nav className="flex space-x-6 overflow-x-auto">
                                  {settingsTabs.map((tab) => (
                                    <button
                                      key={tab.id}
                                      onClick={() =>
                                        setStrategySettingsTab(
                                          strategy.strategyId,
                                          tab.id
                                        )
                                      }
                                      className={`py-2 px-1 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                                        getActiveSettingsTab(
                                          strategy.strategyId
                                        ) === tab.id
                                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
                                      }`}
                                    >
                                      {tab.label}
                                    </button>
                                  ))}
                                </nav>
                              </div>

                              {/* Settings Tab Content */}
                              <div className="mt-4">
                                {/* Execution Parameters */}
                                {getActiveSettingsTab(strategy.strategyId) ===
                                  "execution" && (
                                  <ExecutionParametersTab
                                    executionParams={
                                      (strategy.config as any)
                                        ?.executionParams || {}
                                    }
                                    isEditing={isEditing}
                                    onChange={(field: string, value: any) => {
                                      handleEditChange(
                                        `executionParams.${field}`,
                                        value
                                      );
                                    }}
                                    availableTags={availableTags}
                                    loadingTags={loadingTags}
                                  />
                                )}

                                {/* Exit Settings */}
                                {getActiveSettingsTab(strategy.strategyId) ===
                                  "exit" && (
                                  <ExitSettingsTab
                                    exitSettings={
                                      (strategy.config as any)?.exitSettings ||
                                      {}
                                    }
                                    isEditing={isEditing}
                                    onChange={(field: string, value: any) => {
                                      handleEditChange(
                                        `exitSettings.${field}`,
                                        value
                                      );
                                    }}
                                  />
                                )}

                                {/* Target Settings */}
                                {getActiveSettingsTab(strategy.strategyId) ===
                                  "target" && (
                                  <TargetSettingsTab
                                    targetSettings={
                                      (strategy.config as any)
                                        ?.targetSettings || {}
                                    }
                                    isEditing={isEditing}
                                    onChange={(field: string, value: any) => {
                                      handleEditChange(
                                        `targetSettings.${field}`,
                                        value
                                      );
                                    }}
                                  />
                                )}

                                {/* Stoploss Settings */}
                                {getActiveSettingsTab(strategy.strategyId) ===
                                  "stoploss" && (
                                  <StoplossSettingsTab
                                    stoplossSettings={
                                      (strategy.config as any)
                                        ?.stoplossSettings || {}
                                    }
                                    isEditing={isEditing}
                                    onChange={(field: string, value: any) => {
                                      handleEditChange(
                                        `stoplossSettings.${field}`,
                                        value
                                      );
                                    }}
                                  />
                                )}

                                {/* Dynamic Hedge Settings */}
                                {getActiveSettingsTab(strategy.strategyId) ===
                                  "hedge" && (
                                  <DynamicHedgeTab
                                    dynamicHedgeSettings={
                                      isEditing
                                        ? editValues.dynamicHedgeSettings
                                        : (strategy.config as any)
                                            ?.dynamicHedgeSettings || {}
                                    }
                                    legs={
                                      isEditing
                                        ? editValues.legs || []
                                        : (strategy.config as any)?.legs || []
                                    }
                                    isEditing={isEditing}
                                    onChange={(field: string, value: any) => {
                                      handleEditChange(
                                        `dynamicHedgeSettings.${field}`,
                                        value
                                      );
                                    }}
                                  />
                                )}

                                {/* At Broker Settings */}
                                {getActiveSettingsTab(strategy.strategyId) ===
                                  "atbroker" && (
                                  <AtBrokerTab
                                    atBrokerSettings={
                                      isEditing
                                        ? editValues.atBrokerSettings || {
                                            legSlAtBroker: false,
                                            legTpAtBroker: false,
                                            legReEntryAtBroker: false,
                                            legWnTAtBroker: false,
                                            slOrderTriggerAdjust: {
                                              minPoint: 0,
                                              maxPercentage: 0,
                                            },
                                          }
                                        : (strategy.config as any)
                                            ?.atBrokerSettings || {
                                            legSlAtBroker: false,
                                            legTpAtBroker: false,
                                            legReEntryAtBroker: false,
                                            legWnTAtBroker: false,
                                            slOrderTriggerAdjust: {
                                              minPoint: 0,
                                              maxPercentage: 0,
                                            },
                                          }
                                    }
                                    isEditing={isEditing}
                                    onChange={(field: string, value: any) => {
                                      handleEditChange(
                                        `atBrokerSettings.${field}`,
                                        value
                                      );
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium Strike Modal */}
      {premiumStrikeModalLeg &&
        currentEditingStrategyId &&
        editValues.legs &&
        editValues.legs[premiumStrikeModalLeg.index] && (
          <PremiumStrikeModal
            key={`${currentEditingStrategyId}-${
              premiumStrikeModalLeg.index
            }-${JSON.stringify(
              editValues.legs[premiumStrikeModalLeg.index]
                .premiumBasedStrikeConfig
            )}`}
            leg={editValues.legs[premiumStrikeModalLeg.index]}
            isOpen={true}
            onClose={() => {
              setPremiumStrikeModalLeg(null);
              setCurrentEditingStrategyId(null);
            }}
            onConfigChange={(field: string, value: any) => {
              const legId = premiumStrikeModalLeg.index;
              const newLegs = { ...editValues.legs };

              // Ensure premiumBasedStrikeConfig exists
              if (!newLegs[legId].premiumBasedStrikeConfig) {
                newLegs[legId] = {
                  ...newLegs[legId],
                  premiumBasedStrikeConfig: {
                    strikeType: "NearestPremium",
                    maxDepth: 5,
                    searchSide: "BOTH",
                    value: 0,
                    condition: "Greaterthanequal",
                    between: 0,
                    and: 0,
                  },
                };
              }

              newLegs[legId] = {
                ...newLegs[legId],
                premiumBasedStrikeConfig: {
                  ...newLegs[legId].premiumBasedStrikeConfig,
                  [field]: value,
                },
              };
              handleEditChange("legs", newLegs);
            }}
          />
        )}

      {/* Action Config Modal */}
      {actionConfigModalState.legId &&
        actionConfigModalState.actionType &&
        currentEditingStrategyId &&
        editValues.legs &&
        editValues.legs[actionConfigModalState.legId] && (
          <ActionConfigModal
            leg={editValues.legs[actionConfigModalState.legId]}
            isOpen={true}
            onClose={() => {
              setActionConfigModalState({ legId: null, actionType: null });
              setCurrentEditingStrategyId(null);
            }}
            actionType={actionConfigModalState.actionType}
            onConfigChange={(field: string, value: any) => {
              const legId = actionConfigModalState.legId!;
              const actionType = actionConfigModalState.actionType!;
              const newLegs = { ...editValues.legs };

              // Determine which config to update
              const configKey =
                actionType === "target"
                  ? "onTargetActionConfig"
                  : actionType === "stoploss"
                  ? "onStoplossActionConfig"
                  : "onSquareOffActionConfig";

              // Ensure action config exists
              if (!newLegs[legId][configKey]) {
                newLegs[legId] = {
                  ...newLegs[legId],
                  [configKey]: {
                    actionType: "NONE",
                    actionCount: 1,
                    orderAtBroker: false,
                    slOrderAdjust: {
                      minPoints: 0,
                      maxPercentage: 0,
                    },
                  },
                };
              }

              newLegs[legId] = {
                ...newLegs[legId],
                [configKey]: {
                  ...newLegs[legId][configKey],
                  [field]: value,
                },
              };

              // Also update the legacy field for backward compatibility
              if (field === "actionType") {
                if (actionType === "target") {
                  newLegs[legId].onTargetAction = value;
                } else if (actionType === "stoploss") {
                  newLegs[legId].onStoplossAction = value;
                } else if (actionType === "squareoff") {
                  newLegs[legId].onSquareOffAction = value;
                }
              }

              handleEditChange("legs", newLegs);
            }}
          />
        )}
    </div>
  );
};

export default DeployedStrategies;
