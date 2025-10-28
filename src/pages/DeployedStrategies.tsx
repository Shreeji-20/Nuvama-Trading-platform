import React, { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import config from "../config/api";
import LegsConfigurationTable from "../components/LegsConfigurationTable";
import OpenPositionsTab from "../components/OpenPositionsTab";
import OpenOrdersTab from "../components/OpenOrdersTab";
import CompletedOrdersTab from "../components/CompletedOrdersTab";
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
import {
  isOrderComplete,
  isOrderRejected,
  isOrderCancelled,
  isOrderPending,
  isOrderCompletedOrFinished,
} from "../constants/deployedStrategies.constants";

const DeployedStrategies: React.FC = () => {
  // Symbol options for dropdown
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [premiumStrikeModalLeg, setPremiumStrikeModalLeg] = useState<any>(null);
  const [currentEditingStrategyId, setCurrentEditingStrategyId] = useState<
    string | null
  >(null);

  // Use custom hooks for orders and P&L
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

  const API_BASE_URL = "http://localhost:8000";

  // Options for dynamic hedge settings
  const hedgeTypeOptions = ["premium Based", "fixed Distance"];

  // Tab configuration - Only for order tabs
  const tabs = [
    { id: "positions", label: "Open Positions" },
    { id: "orders", label: "Open Orders" },
    { id: "completed", label: "Completed Orders" },
  ];

  // Get active tab for a strategy (default to "positions")
  const getActiveTab = (strategyId: string): string => {
    return activeTab[strategyId] || "positions";
  };

  // Set active tab for a strategy
  const setStrategyTab = (strategyId: string, tabId: string) => {
    setActiveTab((prev) => ({ ...prev, [strategyId]: tabId }));

    // Always fetch orders and start auto-refresh for order tabs
    fetchOrders(strategyId);
    startAutoRefresh(strategyId);
  };

  // Fetch all deployed strategies
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/strategy/list`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStrategies(data.strategies || []);
    } catch (err: any) {
      console.error("Error fetching strategies:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available strategy tags
  const fetchStrategyTags = async () => {
    try {
      setLoadingTags(true);
      const response = await fetch(`${API_BASE_URL}/strategy-tags/list`);
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      } else {
        console.error("Failed to fetch strategy tags");
      }
    } catch (error) {
      console.error("Error fetching strategy tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  // Update strategy
  const updateStrategy = async (strategyId: string, updatedConfig: any) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/strategy/update/${strategyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedConfig),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        console.error("Update error response:", errorData);

        if (response.status === 422 && errorData.detail?.errors) {
          const errorMessages = errorData.detail.errors
            .map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
            .join("\n");
          throw new Error(`Validation errors:\n${errorMessages}`);
        }

        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      await response.json();
      fetchStrategies();
      setEditingStrategy(null);
      setEditValues({});

      alert("Strategy updated successfully!");
    } catch (err: any) {
      console.error("Error updating strategy:", err);
      alert(`Failed to update strategy: ${err.message}`);
    }
  };

  // Delete strategy
  const deleteStrategy = async (strategyId: string) => {
    if (!confirm(`Are you sure you want to delete strategy ${strategyId}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/strategy/delete/${strategyId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Strategy deleted successfully!");
      fetchStrategies();
    } catch (err: any) {
      console.error("Error deleting strategy:", err);
      alert(`Failed to delete strategy: ${err.message}`);
    }
  };

  // Copy strategy
  const copyStrategy = async (strategy: Strategy) => {
    const originalId = strategy.strategyId;
    const timestamp = Date.now();
    const newStrategyId = `${originalId}_copy_${timestamp}`;
    const newConfig = JSON.parse(JSON.stringify(strategy.config));

    if (newConfig.baseConfig) {
      newConfig.baseConfig.strategyId = newStrategyId;
    }

    if (
      !confirm(
        `Create a copy of strategy "${originalId}"?\n\nNew Strategy ID: ${newStrategyId}`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/stratergy/stratergy_1/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strategyId: newStrategyId,
            symbols: strategy.symbols || [],
            config: newConfig,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      alert(
        `Strategy copied successfully!\n\nNew Strategy ID: ${newStrategyId}`
      );
      fetchStrategies();
    } catch (err: any) {
      console.error("Error copying strategy:", err);
      alert(`Failed to copy strategy: ${err.message}`);
    }
  };

  // Start editing strategy
  const startEditing = (strategy: Strategy) => {
    setEditingStrategy(strategy.strategyId);
    setEditValues(strategy.config);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingStrategy(null);
    setEditValues({});
  };

  // Save edited strategy
  const saveEdit = (strategyId: string) => {
    const sanitizedConfig = {
      ...editValues,
      legs:
        editValues.legs?.map((leg: any) => ({
          ...leg,
          strategyId: editValues.baseConfig?.strategyId || strategyId,
          strategyName: editValues.baseConfig?.strategyName || "",
        })) || [],
    };

    updateStrategy(strategyId, sanitizedConfig);
  };

  // Handle edit changes
  const handleEditChange = (path: string, value: any) => {
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

  // Get edit value
  const getEditValue = (strategy: Strategy, path: string): any => {
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

  // Toggle strategy expansion
  const toggleStrategy = (strategyId: string) => {
    const willBeExpanded = expandedStrategy !== strategyId;
    setExpandedStrategy((prev) => (prev === strategyId ? null : strategyId));

    // If expanding, fetch orders and start auto-refresh
    if (willBeExpanded) {
      fetchOrders(strategyId);
      startAutoRefresh(strategyId);
    } else {
      // If collapsing, stop auto-refresh
      stopAutoRefresh(strategyId);
    }
  };

  // Handle Square Off for a position
  const handleSquareOff = async (order: Order) => {
    const orderId =
      order?.response?.data?.oID ||
      order?.orderId ||
      order?.exchangeOrderNumber;
    const userId = order?.userId;

    if (!orderId || !userId) {
      alert("Cannot square off: Missing order ID or user ID");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to square off this position?\n\nOrder ID: ${orderId}\nUser: ${userId}`
      )
    ) {
      return;
    }

    try {
      // TODO: Implement the square off API call here
      alert(`Square off initiated for Order ID: ${orderId}`);
      // Refresh orders after square off
    } catch (error: any) {
      console.error("Error squaring off position:", error);
      alert(`Failed to square off position: ${error.message}`);
    }
  };

  // Fetch all option data once
  const fetchOptionData = useCallback(async () => {
    try {
      const response = await fetch(
        config.buildUrl(config.ENDPOINTS.OPTIONDATA)
      );

      if (!response.ok) {
        console.warn("Failed to fetch option data");
        return;
      }

      const data = await response.json();
      setOptionDataCache(data || []);
      setLastOptionDataFetch(new Date());
    } catch (err) {
      console.error("Error fetching option data:", err);
    }
  }, []);

  // Export strategy to Excel
  const exportToExcel = (strategy: Strategy) => {
    try {
      const config = strategy.config as any;
      const baseConfig = config?.baseConfig || {};
      const legs = config?.legs || [];

      // Create base config sheet data
      const baseConfigData = [
        ["Strategy Configuration"],
        ["Strategy ID", baseConfig.strategyId || "N/A"],
        ["Strategy Name", baseConfig.strategyName || "N/A"],
        ["User ID", baseConfig.userId || "N/A"],
        ["Strategy Type", baseConfig.strategyType || "N/A"],
        ["Symbol", baseConfig.symbol || "N/A"],
        ["Entry Time", baseConfig.entryTime || "N/A"],
        ["Square Off Time", baseConfig.squareOffTime || "N/A"],
        ["Execution Mode", baseConfig.executionMode || "N/A"],
        ["Quantity Multiplier", baseConfig.quantityMultiplier || "N/A"],
      ];

      // Create legs sheet data
      const legsData = [
        [
          "Leg ID",
          "Symbol",
          "Option Type",
          "Strike Distance",
          "Expiry",
          "Action",
          "Quantity",
          "Order Type",
          "Limit Price",
          "Is Hedge",
        ],
        ...legs.map((leg: any) => [
          leg.legId || "",
          leg.symbol || "",
          leg.optionType || "",
          leg.strikeDistance || "",
          leg.expiry || "",
          leg.action || "",
          leg.quantity || "",
          leg.orderType || "",
          leg.limitPrice || "",
          leg.isHedge ? "Yes" : "No",
        ]),
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      const wsBase = XLSX.utils.aoa_to_sheet(baseConfigData);
      const wsLegs = XLSX.utils.aoa_to_sheet(legsData);

      XLSX.utils.book_append_sheet(wb, wsBase, "Configuration");
      XLSX.utils.book_append_sheet(wb, wsLegs, "Legs");

      // Save file
      const fileName = `${strategy.strategyId}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      alert("Failed to export strategy to Excel");
    }
  };

  // Initialize
  useEffect(() => {
    fetchStrategies();
    fetchStrategyTags();
    fetchOptionData();

    // Set up option data refresh interval (every 1 second)
    optionDataIntervalRef.current = setInterval(() => {
      fetchOptionData();
    }, 1000);

    // Cleanup
    return () => {
      if (optionDataIntervalRef.current) {
        clearInterval(optionDataIntervalRef.current);
      }
    };
  }, [fetchOptionData]);

  // Calculate P&L when orders change
  useEffect(() => {
    Object.entries(strategyOrders).forEach(([strategyId, orders]) => {
      if (orders) {
        calculatePnLForPositions(orders);
      }
    });
  }, [strategyOrders, calculatePnLForPositions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <LoadingSpinner message="Loading deployed strategies..." />
      </div>
    );
  }

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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Deployed Strategies
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your active trading strategies
          </p>
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
                              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                <span
                                  className={`p-1 rounded text-xs font-medium ${
                                    (strategy.config as any)?.baseConfig
                                      ?.executionMode === "LIVEMODE"
                                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                      : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                  }`}
                                >
                                  {(strategy.config as any)?.baseConfig
                                    ?.executionMode || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Legs Configuration */}
                        {(strategy.config as any)?.legs &&
                          (strategy.config as any).legs.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Legs Configuration (
                                {(strategy.config as any).legs.length} legs)
                              </h4>
                              <LegsConfigurationTable
                                legs={(strategy.config as any).legs}
                                isEditing={isEditing}
                                onLegChange={(
                                  legIndex: number,
                                  field: string,
                                  value: any
                                ) => {
                                  const newLegs = [...editValues.legs];
                                  newLegs[legIndex] = {
                                    ...newLegs[legIndex],
                                    [field]: value,
                                  };
                                  handleEditChange("legs", newLegs);
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
                              loadingOrders={isLoadingOrders || false}
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
                              loadingOrders={isLoadingOrders || false}
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
                              loadingOrders={isLoadingOrders || false}
                              positionPnL={positionPnL}
                              loadingPnL={loadingPnL}
                              isRefreshing={isLoadingOrders || false}
                              onRefresh={() => fetchOrders(strategy.strategyId)}
                            />
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
    </div>
  );
};

export default DeployedStrategies;
