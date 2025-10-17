import React, { useState, useEffect } from "react";

const DeployedStrategies = () => {
  // Symbol options for dropdown
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];

  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedStrategy, setExpandedStrategy] = useState(null);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [activeTab, setActiveTab] = useState({}); // Tab state for each strategy (keyed by strategyId)
  const [premiumStrikeModalLeg, setPremiumStrikeModalLeg] = useState(null); // Track which leg's modal is open
  const [currentEditingStrategyId, setCurrentEditingStrategyId] =
    useState(null); // Track which strategy is being edited
  const [strategyOrders, setStrategyOrders] = useState({}); // Orders for each strategy (keyed by strategyId)
  const [loadingOrders, setLoadingOrders] = useState({}); // Loading state for orders (keyed by strategyId)

  const API_BASE_URL = "http://localhost:8000";

  // Options for dynamic hedge settings
  const hedgeTypeOptions = ["premium Based", "fixed Distance"];

  // Tab configuration
  const tabs = [
    { id: "parameters", label: "Configuration" },
    { id: "positions", label: "Open Positions" },
    { id: "orders", label: "Open Orders" },
    { id: "completed", label: "Completed Orders" },
  ];

  // Get active tab for a strategy (default to "parameters")
  const getActiveTab = (strategyId) => {
    return activeTab[strategyId] || "parameters";
  };

  // Set active tab for a strategy
  const setStrategyTab = (strategyId, tabId) => {
    setActiveTab((prev) => ({ ...prev, [strategyId]: tabId }));
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
      console.log("Fetched strategies:", data);

      setStrategies(data.strategies || []);
    } catch (err) {
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
  const updateStrategy = async (strategyId, updatedConfig) => {
    try {
      console.log(
        "Updating strategy with config:",
        JSON.stringify(updatedConfig, null, 2)
      );

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
        // Get detailed error message from response
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        console.error("Update error response:", errorData);

        // Handle validation errors specifically
        if (response.status === 422 && errorData.detail?.errors) {
          const errorMessages = errorData.detail.errors
            .map((err) => `${err.loc.join(".")}: ${err.msg}`)
            .join("\n");
          throw new Error(`Validation errors:\n${errorMessages}`);
        }

        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Strategy updated:", result);

      // Refresh strategies list
      fetchStrategies();
      setEditingStrategy(null);
      setEditValues({});

      alert("Strategy updated successfully!");
    } catch (err) {
      console.error("Error updating strategy:", err);
      alert(`Failed to update strategy: ${err.message}`);
    }
  };

  // Delete strategy
  const deleteStrategy = async (strategyId) => {
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
    } catch (err) {
      console.error("Error deleting strategy:", err);
      alert(`Failed to delete strategy: ${err.message}`);
    }
  };

  // Start editing strategy
  const startEditing = (strategy) => {
    setEditingStrategy(strategy.strategyId);
    setEditValues(strategy.config);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingStrategy(null);
    setEditValues({});
  };

  // Save edited strategy
  const saveEdit = (strategyId) => {
    // Ensure all legs have required fields with defaults
    const sanitizedConfig = {
      ...editValues,
      legs:
        editValues.legs?.map((leg) => ({
          ...leg,
          strategyId: editValues.baseConfig?.strategyId || strategyId,
          strategyName: editValues.baseConfig?.strategyName || "",
          executionMode: leg.executionMode || "Regular", // Add default if missing
          startTime: leg.startTime || "",
          waitAndTrade: leg.waitAndTrade || 0,
          waitAndTradeLogic: leg.waitAndTradeLogic || "Absolute",
          dynamicHedge: leg.dynamicHedge || false,
          onTargetAction: leg.onTargetAction || "REENTRY",
          onStoplossAction: leg.onStoplossAction || "REENTRY",
        })) || [],
      // Ensure dynamicHedgeSettings has strikeDistance if hedgeType is fixed Distance
      dynamicHedgeSettings: editValues.dynamicHedgeSettings
        ? {
            ...editValues.dynamicHedgeSettings,
            strikeDistance:
              editValues.dynamicHedgeSettings.hedgeType === "fixed Distance"
                ? editValues.dynamicHedgeSettings.strikeDistance || 1
                : editValues.dynamicHedgeSettings.strikeDistance || 1,
          }
        : undefined,
    };

    console.log(
      "Sanitized config before update:",
      JSON.stringify(sanitizedConfig, null, 2)
    );
    updateStrategy(strategyId, sanitizedConfig);
  };

  // Handle edit value change
  const handleEditChange = (path, value) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      const keys = path.split(".");
      let current = newValues;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      // Update all legs when strategyId or strategyName changes
      if (
        path === "baseConfig.strategyId" ||
        path === "baseConfig.strategyName"
      ) {
        const field = keys[keys.length - 1];
        if (newValues.legs) {
          newValues.legs = newValues.legs.map((leg) => ({
            ...leg,
            [field]: value,
          }));
        }
      }

      return newValues;
    });
  };

  // Handle leg field change
  const handleLegChange = (legIndex, field, value) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }
      newValues.legs[legIndex] = {
        ...newValues.legs[legIndex],
        [field]: value,
      };
      return newValues;
    });
  };

  // Add new leg function
  const handleAddLeg = (strategyId) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }

      const legCounter = newValues.legs.length + 1;
      const newLeg = {
        id: Date.now(),
        legId: `LEG_${legCounter.toString().padStart(3, "0")}`,
        strategyId: newValues.baseConfig?.strategyId || strategyId,
        strategyName: newValues.baseConfig?.strategyName || "",
        symbol: "NIFTY",
        expiry: 0,
        action: "BUY",
        optionType: "CE",
        lots: 1,
        strike: "ATM",
        target: "Absolute",
        targetValue: 0,
        stoploss: "Absolute",
        stoplossValue: 0,
        priceType: "LTP",
        depthIndex: 0,
        orderType: "Limit",
        startTime: "",
        waitAndTrade: 0,
        waitAndTradeLogic: "Absolute",
        dynamicHedge: false,
        onTargetAction: "REENTRY",
        onStoplossAction: "REENTRY",
        premiumBasedStrike: false,
      };

      newValues.legs.push(newLeg);
      return newValues;
    });
  };

  // Delete leg function
  const handleDeleteLeg = (legIndex) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }
      newValues.legs.splice(legIndex, 1);
      return newValues;
    });
  };

  // Update premium based strike config for a specific leg
  const handlePremiumStrikeConfigChange = (legIndex, field, value) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }
      if (!newValues.legs[legIndex].premiumBasedStrikeConfig) {
        newValues.legs[legIndex].premiumBasedStrikeConfig = {
          strikeType: "NearestPremium",
          maxDepth: 5,
          searchSide: "BOTH",
          value: 0,
          condition: "Greaterthanequal",
          between: 0,
          and: 0,
        };
      }
      newValues.legs[legIndex] = {
        ...newValues.legs[legIndex],
        premiumBasedStrikeConfig: {
          ...newValues.legs[legIndex].premiumBasedStrikeConfig,
          [field]: value,
        },
      };
      return newValues;
    });
  };

  // Get value from edit state or original strategy
  const getEditValue = (strategy, path) => {
    if (editingStrategy !== strategy.strategyId) {
      // Not editing, return original value
      const keys = path.split(".");
      let value = strategy.config;
      for (const key of keys) {
        value = value?.[key];
      }
      return value;
    }
    // Editing, return from editValues
    const keys = path.split(".");
    let value = editValues;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  };

  // Toggle strategy expansion
  const toggleExpand = (strategyId) => {
    setExpandedStrategy(expandedStrategy === strategyId ? null : strategyId);

    // Fetch orders when expanding a strategy
    if (expandedStrategy !== strategyId) {
      fetchStrategyOrders(strategyId);
    }
  };

  // Fetch orders for a specific strategy
  const fetchStrategyOrders = async (strategyId) => {
    try {
      setLoadingOrders((prev) => ({ ...prev, [strategyId]: true }));

      // Use the live-details endpoint to get enriched order data
      const response = await fetch(
        `${API_BASE_URL}/strategy-orders/get/${strategyId}/live-details`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        `Fetched orders with live details for strategy ${strategyId}:`,
        data
      );

      // Store orders for this strategy
      setStrategyOrders((prev) => ({
        ...prev,
        [strategyId]: data.orders || null,
      }));
    } catch (err) {
      console.error(`Error fetching orders for strategy ${strategyId}:`, err);
      // Set null for this strategy to indicate fetch was attempted but failed
      setStrategyOrders((prev) => ({
        ...prev,
        [strategyId]: null,
      }));
    } finally {
      setLoadingOrders((prev) => ({ ...prev, [strategyId]: false }));
    }
  };

  useEffect(() => {
    fetchStrategies();
    fetchStrategyTags();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStrategies, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && strategies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading strategies...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-4">
      <div className="max-w-[100rem] mx-auto space-y-4">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm md:text-md font-bold text-gray-900 dark:text-white">
                Deployed Strategies
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                View and manage all deployed strategy configurations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStrategies}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Strategies
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {strategies.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Error: {error}
            </p>
          </div>
        )}

        {/* Strategies List */}
        {strategies.length === 0 ? (
          <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-8 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No strategies deployed yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deploy a strategy from the Advanced Options Builder to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <div
                key={strategy.strategyId}
                className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden"
              >
                {/* Strategy Header */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleExpand(strategy.strategyId)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            expandedStrategy === strategy.strategyId
                              ? "rotate-90"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {strategy.strategyId}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Deployed:{" "}
                          {new Date(strategy.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-4 mr-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Symbols
                          </div>
                          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {strategy.symbols?.join(", ") || "N/A"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Legs
                          </div>
                          <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                            {strategy.config?.legs?.length || 0}
                          </div>
                        </div>
                      </div>
                      {editingStrategy === strategy.strategyId ? (
                        <>
                          <button
                            onClick={() => saveEdit(strategy.strategyId)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            ✕ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(strategy)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteStrategy(strategy.strategyId)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedStrategy === strategy.strategyId && (
                  <div className="p-3 space-y-3">
                    {/* Base Configuration */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Base Configuration
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Strategy ID
                          </div>
                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                            {getEditValue(strategy, "baseConfig.strategyId") ||
                              "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Lots
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <input
                              type="number"
                              value={
                                getEditValue(strategy, "baseConfig.lots") || ""
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.lots",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          ) : (
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              {getEditValue(strategy, "baseConfig.lots") ||
                                "N/A"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Underlying
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <select
                              value={
                                getEditValue(
                                  strategy,
                                  "baseConfig.underlying"
                                ) || "Spot"
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.underlying",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="Spot">Spot</option>
                              <option value="Futures">Futures</option>
                            </select>
                          ) : (
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              {getEditValue(
                                strategy,
                                "baseConfig.underlying"
                              ) || "N/A"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Buy Trades First
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <select
                              value={
                                getEditValue(
                                  strategy,
                                  "baseConfig.buyTradesFirst"
                                )
                                  ? "true"
                                  : "false"
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.buyTradesFirst",
                                  e.target.value === "true"
                                )
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="false">No</option>
                              <option value="true">Yes</option>
                            </select>
                          ) : (
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              {getEditValue(
                                strategy,
                                "baseConfig.buyTradesFirst"
                              )
                                ? "Yes"
                                : "No"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Simulation Mode
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <select
                              value={
                                getEditValue(
                                  strategy,
                                  "baseConfig.executionMode"
                                ) || "Live Mode"
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.executionMode",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="Live Mode">Live Mode</option>
                              <option value="Simulation Mode">
                                Simulation Mode
                              </option>
                            </select>
                          ) : (
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  getEditValue(
                                    strategy,
                                    "baseConfig.executionMode"
                                  ) === "Live Mode"
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                }`}
                              >
                                {getEditValue(
                                  strategy,
                                  "baseConfig.executionMode"
                                ) || "Live Mode"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Legs Table */}
                    {strategy.config?.legs &&
                      strategy.config.legs.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Legs Configuration ({strategy.config.legs.length}{" "}
                            legs)
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs table-auto border-collapse">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Leg ID
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Symbol
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Expiry
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Action
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Option
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Lots
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Strike
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Target
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Target Val
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    SL
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    SL Val
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Price Type
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Depth
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    W&T Logic
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Wait&Trade
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    Dynamic Hedge
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    On Target Action
                                  </th>
                                  <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    On Stoploss Action
                                  </th>
                                  {editingStrategy === strategy.strategyId && (
                                    <th className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                      Actions
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {(editingStrategy === strategy.strategyId
                                  ? editValues.legs
                                  : strategy.config.legs
                                ).map((leg, index) => (
                                  <tr
                                    key={leg.id || index}
                                    className="border-b border-gray-100 dark:border-gray-600"
                                  >
                                    <td className="p-2 text-center text-gray-900 dark:text-white">
                                      {leg.legId}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={leg.symbol || ""}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "symbol",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="">
                                            Select Symbol
                                          </option>
                                          {symbolOptions.map((symbol) => (
                                            <option key={symbol} value={symbol}>
                                              {symbol}
                                            </option>
                                          ))}
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.symbol}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={leg.expiry || 0}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "expiry",
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value={0}>0</option>
                                          <option value={1}>1</option>
                                          <option value={2}>2</option>
                                          <option value={3}>3</option>
                                          <option value={4}>4</option>
                                          <option value={5}>5</option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.expiry}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            leg.action || leg.orderType || "BUY"
                                          }
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "action",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="BUY">BUY</option>
                                          <option value="SELL">SELL</option>
                                        </select>
                                      ) : (
                                        <span
                                          className={`px-1 py-0.5 rounded text-xs font-medium ${
                                            (leg.action || leg.orderType) ===
                                            "BUY"
                                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500"
                                              : (leg.action ||
                                                  leg.orderType) === "SELL"
                                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500"
                                              : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500"
                                          }`}
                                        >
                                          {leg.action || leg.orderType || "N/A"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={leg.optionType || "CE"}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "optionType",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="CE">CE</option>
                                          <option value="PE">PE</option>
                                        </select>
                                      ) : (
                                        <span
                                          className={`px-1 py-0.5 rounded text-xs font-medium ${
                                            leg.optionType === "CE"
                                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500"
                                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500"
                                          }`}
                                        >
                                          {leg.optionType}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={leg.lots || ""}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "lots",
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          className="w-16 text-xs text-center px-1 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.lots}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="flex items-center gap-1">
                                            <input
                                              type="checkbox"
                                              checked={
                                                leg.premiumBasedStrike || false
                                              }
                                              onChange={(e) =>
                                                handleLegChange(
                                                  index,
                                                  "premiumBasedStrike",
                                                  e.target.checked
                                                )
                                              }
                                              className="w-3 h-3 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-[0.5rem] text-gray-600 dark:text-gray-400">
                                              Premium
                                            </span>
                                          </div>
                                          {!leg.premiumBasedStrike ? (
                                            <input
                                              type="text"
                                              value={leg.strike || ""}
                                              onChange={(e) =>
                                                handleLegChange(
                                                  index,
                                                  "strike",
                                                  e.target.value
                                                )
                                              }
                                              className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            />
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPremiumStrikeModalLeg(index);
                                                setCurrentEditingStrategyId(
                                                  strategy.strategyId
                                                );
                                              }}
                                              className="px-2 py-1 text-[0.6rem] bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                            >
                                              Configure
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.premiumBasedStrike
                                            ? "Premium Based"
                                            : leg.strike}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={leg.target || "Absolute"}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "target",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="None">None</option>
                                          <option value="Absolute">
                                            Absolute
                                          </option>
                                          <option value="Percentage">
                                            Percentage
                                          </option>
                                          <option value="Points">Points</option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.target}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={leg.targetValue || ""}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "targetValue",
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-16 text-xs text-center px-1 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.targetValue}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={leg.stoploss || "Absolute"}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "stoploss",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="None">None</option>
                                          <option value="Absolute">
                                            Absolute
                                          </option>
                                          <option value="Percentage">
                                            Percentage
                                          </option>
                                          <option value="Points">Points</option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.stoploss}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={leg.stoplossValue || ""}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "stoplossValue",
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-16 text-xs text-center px-1 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.stoplossValue}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={leg.priceType || "LTP"}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "priceType",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="LTP">LTP</option>
                                          <option value="BidAsk">BidAsk</option>
                                          <option value="Depth">Depth</option>
                                          <option value="BID">BID</option>
                                          <option value="ASK">ASK</option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.priceType}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={leg.depthIndex || ""}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "depthIndex",
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          className="w-12 text-xs text-center px-1 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.depthIndex}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            leg.waitAndTradeLogic || "Absolute"
                                          }
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "waitAndTradeLogic",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="NONE">NONE</option>
                                          <option value="Absolute">
                                            Absolute
                                          </option>
                                          <option value="Percentage">
                                            Percentage
                                          </option>
                                          <option value="POINTS">POINTS</option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.waitAndTradeLogic || "Absolute"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={leg.waitAndTrade || 0}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleLegChange(
                                              index,
                                              "waitAndTrade",
                                              value === ""
                                                ? 0
                                                : parseFloat(value)
                                            );
                                          }}
                                          step="0.1"
                                          placeholder="0 or -1.5"
                                          className="w-16 text-xs text-center px-1 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.waitAndTrade || 0}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
                                      <div className="flex justify-center">
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="checkbox"
                                            checked={leg.dynamicHedge || false}
                                            onChange={(e) =>
                                              handleLegChange(
                                                index,
                                                "dynamicHedge",
                                                e.target.checked
                                              )
                                            }
                                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                          />
                                        ) : (
                                          <span className="text-gray-900 dark:text-white">
                                            {leg.dynamicHedge ? "✓" : "-"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            leg.onTargetAction || "REENTRY"
                                          }
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "onTargetAction",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="None">None</option>
                                          <option value="REENTRY">
                                            REENTRY
                                          </option>
                                          <option value="REEXECUTE">
                                            REEXECUTE
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.onTargetAction || "REENTRY"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1 text-center">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            leg.onStoplossAction || "REENTRY"
                                          }
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "onStoplossAction",
                                              e.target.value
                                            )
                                          }
                                          className="w-auto text-xs text-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="None">None</option>
                                          <option value="REENTRY">
                                            REENTRY
                                          </option>
                                          <option value="REEXECUTE">
                                            REEXECUTE
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.onStoplossAction || "REENTRY"}
                                        </span>
                                      )}
                                    </td>
                                    {editingStrategy ===
                                      strategy.strategyId && (
                                      <td className="p-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteLeg(index)}
                                          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {editingStrategy === strategy.strategyId && (
                              <div className="mt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddLeg(strategy.strategyId)
                                  }
                                  className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                >
                                  + Add Leg
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Horizontal Tabs */}
                    <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3 mt-4">
                      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="flex space-x-8 overflow-x-auto">
                          {tabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() =>
                                setStrategyTab(strategy.strategyId, tab.id)
                              }
                              className={`py-2 px-1 border-b-2 font-medium text-[0.6rem] whitespace-nowrap transition-colors ${
                                getActiveTab(strategy.strategyId) === tab.id
                                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="mt-4">
                        {/* Configuration Tab */}
                        {getActiveTab(strategy.strategyId) === "parameters" && (
                          <div className="space-y-4">
                            {/* Execution Parameters */}
                            {strategy.config?.executionParams && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  Execution Parameters
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Product
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.product"
                                          ) || "NRML"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.product",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="NRML">NRML</option>
                                        <option value="MIS">MIS</option>
                                        <option value="CNC">CNC</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.product"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strategy Name
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="text"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.strategyName"
                                          ) || ""
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.strategyName",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter strategy name"
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.strategyName"
                                        ) || "-"}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strategy Tag
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.strategyTag"
                                          ) || ""
                                        }
                                        onChange={(e) => {
                                          handleEditChange(
                                            "executionParams.strategyTag",
                                            e.target.value
                                          );
                                        }}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        disabled={loadingTags}
                                      >
                                        <option value="">
                                          {loadingTags
                                            ? "Loading..."
                                            : "Select Tag"}
                                        </option>
                                        {availableTags.map((tag) => (
                                          <option key={tag.id} value={tag.id}>
                                            {tag.tagName} (
                                            {
                                              Object.keys(
                                                tag.userMultipliers || {}
                                              ).length
                                            }{" "}
                                            users)
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {(() => {
                                          const tagId = getEditValue(
                                            strategy,
                                            "executionParams.strategyTag"
                                          );
                                          if (tagId) {
                                            const tag = availableTags.find(
                                              (t) => t.id === tagId
                                            );
                                            return tag?.tagName || tagId;
                                          }
                                          return "None";
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Legs Execution
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.legsExecution"
                                          ) || "Parallel"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.legsExecution",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="Parallel">
                                          Parallel
                                        </option>
                                        <option value="One by One">
                                          One by One
                                        </option>
                                        <option value="Sequential">
                                          Sequential
                                        </option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.legsExecution"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Entry Order Type
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.entryOrderType"
                                          ) || "Limit"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.entryOrderType",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="Limit">Limit</option>
                                        <option value="Market">Market</option>
                                        <option value="SL">SL</option>
                                        <option value="SL-M">SL-M</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.entryOrderType"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Start Time
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="text"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.startTime"
                                          ) || ""
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.startTime",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="HH:MM"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.startTime"
                                        ) || "N/A"}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Target & Stoploss */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {strategy.config?.targetSettings && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Target Settings
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Type:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            getEditValue(
                                              strategy,
                                              "targetSettings.targetType"
                                            ) || "CombinedProfit"
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "targetSettings.targetType",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="CombinedProfit">
                                            CombinedProfit
                                          </option>
                                          <option value="IndividualLegProfit">
                                            IndividualLegProfit
                                          </option>
                                          <option value="PercentageProfit">
                                            PercentageProfit
                                          </option>
                                          <option value="PremiumTarget">
                                            PremiumTarget
                                          </option>
                                          <option value="UnderlyingMovement">
                                            UnderlyingMovement
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "targetSettings.targetType"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Value:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={
                                            getEditValue(
                                              strategy,
                                              "targetSettings.targetValue"
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "targetSettings.targetValue",
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "targetSettings.targetValue"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {strategy.config?.stoplossSettings && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    Stoploss Settings
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Type:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            getEditValue(
                                              strategy,
                                              "stoplossSettings.stoplossType"
                                            ) || "CombinedLoss"
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "stoplossSettings.stoplossType",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="CombinedLoss">
                                            CombinedLoss
                                          </option>
                                          <option value="CombinedProfit">
                                            CombinedProfit
                                          </option>
                                          <option value="IndividualLegLoss">
                                            IndividualLegLoss
                                          </option>
                                          <option value="PercentageLoss">
                                            PercentageLoss
                                          </option>
                                          <option value="PremiumLoss">
                                            PremiumLoss
                                          </option>
                                          <option value="UnderlyingMovement">
                                            UnderlyingMovement
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "stoplossSettings.stoplossType"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Value:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={
                                            getEditValue(
                                              strategy,
                                              "stoplossSettings.stoplossValue"
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "stoplossSettings.stoplossValue",
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "stoplossSettings.stoplossValue"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Exit Settings */}
                            {strategy.config?.exitSettings && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Exit Settings
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Order Type
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "exitSettings.exitOrderType"
                                          ) || "Limit"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "exitSettings.exitOrderType",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="Limit">Limit</option>
                                        <option value="Market">Market</option>
                                        <option value="SL">SL</option>
                                        <option value="SL-M">SL-M</option>
                                        <option value="SL-L">SL-L</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "exitSettings.exitOrderType"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Exit Sell First
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "exitSettings.exitSellFirst"
                                          )
                                            ? "true"
                                            : "false"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "exitSettings.exitSellFirst",
                                            e.target.value === "true"
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "exitSettings.exitSellFirst"
                                        )
                                          ? "Yes"
                                          : "No"}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Max Wait Time
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="number"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "exitSettings.maxWaitTime"
                                          ) || ""
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "exitSettings.maxWaitTime",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "exitSettings.maxWaitTime"
                                        )}
                                        s
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Dynamic Hedge Settings */}
                            {strategy.config?.dynamicHedgeSettings && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                  Dynamic Hedge Settings
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Hedge Type
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.hedgeType"
                                          ) || "premium Based"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "dynamicHedgeSettings.hedgeType",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="premium Based">
                                          premium Based
                                        </option>
                                        <option value="fixed Distance">
                                          fixed Distance
                                        </option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "dynamicHedgeSettings.hedgeType"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strike Steps
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="number"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.strikeSteps"
                                          ) || ""
                                        }
                                        onChange={(e) => {
                                          const value =
                                            e.target.value === ""
                                              ? 1
                                              : parseInt(e.target.value);
                                          handleEditChange(
                                            "dynamicHedgeSettings.strikeSteps",
                                            value
                                          );
                                        }}
                                        step="1"
                                        min="1"
                                        placeholder="Any integer"
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "dynamicHedgeSettings.strikeSteps"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strike 500
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.strike500"
                                          )
                                            ? "true"
                                            : "false"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "dynamicHedgeSettings.strike500",
                                            e.target.value === "true"
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "dynamicHedgeSettings.strike500"
                                        )
                                          ? "Yes"
                                          : "No"}
                                      </div>
                                    )}
                                  </div>
                                  {getEditValue(
                                    strategy,
                                    "dynamicHedgeSettings.hedgeType"
                                  ) === "fixed Distance" && (
                                    <div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Strike Distance
                                      </div>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={
                                            getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.strikeDistance"
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "dynamicHedgeSettings.strikeDistance",
                                              parseInt(e.target.value) || 1
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                          min="1"
                                        />
                                      ) : (
                                        <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.strikeDistance"
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {getEditValue(
                                    strategy,
                                    "dynamicHedgeSettings.hedgeType"
                                  ) === "premium Based" && (
                                    <>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Min Hedge Distance
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.minHedgeDistance"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.minHedgeDistance",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Min distance"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.minHedgeDistance"
                                            ) || 0}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Max Hedge Distance
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.maxHedgeDistance"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.maxHedgeDistance",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Max distance"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.maxHedgeDistance"
                                            ) || 0}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Min Premium
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.minPremium"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.minPremium",
                                                parseFloat(e.target.value) ||
                                                  0.0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Min premium"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.minPremium"
                                            ) || 0.0}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Max Premium
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.maxPremium"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.maxPremium",
                                                parseFloat(e.target.value) ||
                                                  0.0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Max premium"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.maxPremium"
                                            ) || 0.0}
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Open Positions Tab */}
                        {getActiveTab(strategy.strategyId) === "positions" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                Open Positions
                              </h3>
                              <button
                                onClick={() =>
                                  fetchStrategyOrders(strategy.strategyId)
                                }
                                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              >
                                🔄 Refresh
                              </button>
                            </div>

                            {loadingOrders[strategy.strategyId] ? (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                  Loading positions...
                                </p>
                              </div>
                            ) : strategyOrders[strategy.strategyId] === null ||
                              strategyOrders[strategy.strategyId] ===
                                undefined ? (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                                <div className="text-gray-400 dark:text-gray-500 mb-2">
                                  <svg
                                    className="w-12 h-12 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  No positions found
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Positions will appear here when orders are
                                  executed
                                </p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Leg ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Symbol
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Strike
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Action
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Quantity
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Avg Price
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Entry Time
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Position Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {strategyOrders[strategy.strategyId]
                                      .filter((order) => {
                                        // Show positions with entry:true
                                        return order.entry === true;
                                      })
                                      .map((order, idx) => {
                                        const liveDetails = order;
                                        const isExited = order.exited === true;

                                        return (
                                          <tr
                                            key={idx}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                              isExited ? "opacity-50" : ""
                                            }`}
                                          >
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.orderId ||
                                                liveDetails?.exchangeOrderNumber ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.legId || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.symbol || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.strike || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  order.action === "BUY" ||
                                                  liveDetails?.transactionType ===
                                                    "BUY"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}
                                              >
                                                {order.action ||
                                                  liveDetails?.transactionType ||
                                                  "N/A"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                                              {liveDetails?.fillQuantity ||
                                                liveDetails?.totalQuantity ||
                                                order.quantity ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                                              {liveDetails?.averagePrice &&
                                              liveDetails.averagePrice !==
                                                "0.00"
                                                ? `₹${liveDetails.averagePrice}`
                                                : order.limitPrice
                                                ? `₹${order.limitPrice}`
                                                : "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {liveDetails?.orderTime ||
                                                (order.placedTime
                                                  ? new Date(
                                                      order.placedTime
                                                    ).toLocaleString()
                                                  : "N/A")}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  isExited
                                                    ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                }`}
                                              >
                                                {isExited ? "Exited" : "Active"}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                                {strategyOrders[strategy.strategyId].filter(
                                  (order) => order.entry === true
                                ).length === 0 && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No open positions
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Open Orders Tab */}
                        {getActiveTab(strategy.strategyId) === "orders" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                Open Orders
                              </h3>
                              <button
                                onClick={() =>
                                  fetchStrategyOrders(strategy.strategyId)
                                }
                                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              >
                                🔄 Refresh
                              </button>
                            </div>

                            {loadingOrders[strategy.strategyId] ? (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                  Loading orders...
                                </p>
                              </div>
                            ) : strategyOrders[strategy.strategyId] === null ||
                              strategyOrders[strategy.strategyId] ===
                                undefined ? (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                                <div className="text-gray-400 dark:text-gray-500 mb-2">
                                  <svg
                                    className="w-12 h-12 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  No orders found
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Orders will appear here when placed
                                </p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Leg ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Symbol
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Strike
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Action
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Qty / Fill Qty
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Limit / Avg Price
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order Time
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Status
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                                        Rejection Reason
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {strategyOrders[strategy.strategyId]
                                      .filter((order) => {
                                        console.log(order);
                                        // Show only pending orders (not rejected, not complete, not cancelled)
                                        const liveDetails = order;
                                        const status = (
                                          liveDetails?.status || "unknown"
                                        ).toUpperCase();
                                        const isPending =
                                          status === "PENDING" ||
                                          status === "OPEN";

                                        // Exclude rejected, complete, executed, and cancelled orders
                                        const isCompleted =
                                          status === "REJECTED" ||
                                          status === "COMPLETE" ||
                                          status === "EXECUTED" ||
                                          status === "CANCELLED" ||
                                          status === "CANCELED";

                                        return (
                                          isPending ||
                                          (!isCompleted && status === "UNKNOWN")
                                        );
                                      })
                                      .map((order, idx) => {
                                        const liveDetails = order;
                                        const status = (
                                          liveDetails?.status || "unknown"
                                        ).toUpperCase();
                                        const isRejected =
                                          status === "REJECTED";
                                        const isComplete =
                                          status === "COMPLETE" ||
                                          status === "EXECUTED";
                                        const isPending =
                                          status === "PENDING" ||
                                          status === "OPEN";

                                        return (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                          >
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.orderId ||
                                                liveDetails?.exchangeOrderNumber ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.legId || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.symbol || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.strike || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  order.action === "BUY" ||
                                                  liveDetails?.transactionType ===
                                                    "BUY"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}
                                              >
                                                {order.action ||
                                                  liveDetails?.transactionType ||
                                                  "N/A"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {liveDetails ? (
                                                <div className="flex flex-col">
                                                  <span>
                                                    {liveDetails.totalQuantity ||
                                                      order.quantity ||
                                                      "N/A"}
                                                  </span>
                                                  {liveDetails.fillQuantity &&
                                                    liveDetails.fillQuantity !==
                                                      "0" && (
                                                      <span className="text-green-600 dark:text-green-400 font-semibold">
                                                        Filled:{" "}
                                                        {
                                                          liveDetails.fillQuantity
                                                        }
                                                      </span>
                                                    )}
                                                </div>
                                              ) : (
                                                order.quantity || "N/A"
                                              )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {liveDetails ? (
                                                <div className="flex flex-col">
                                                  <span>
                                                    ₹
                                                    {liveDetails.price ||
                                                      order.limitPrice ||
                                                      "0.00"}
                                                  </span>
                                                  {liveDetails.averagePrice &&
                                                    liveDetails.averagePrice !==
                                                      "0.00" && (
                                                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                        Avg: ₹
                                                        {
                                                          liveDetails.averagePrice
                                                        }
                                                      </span>
                                                    )}
                                                </div>
                                              ) : order.limitPrice ? (
                                                `₹${order.limitPrice}`
                                              ) : (
                                                "N/A"
                                              )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {liveDetails?.orderTime ||
                                                (order.placedTime
                                                  ? new Date(
                                                      order.placedTime
                                                    ).toLocaleString()
                                                  : "N/A")}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  isRejected
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    : isComplete
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : isPending
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                }`}
                                              >
                                                {liveDetails?.status ||
                                                  (order.response?.data?.msg?.includes(
                                                    "success"
                                                  )
                                                    ? "Success"
                                                    : "Pending")}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-white break-words">
                                              {liveDetails?.rejectionReason ||
                                                "-"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                                {strategyOrders[strategy.strategyId].filter(
                                  (order) => {
                                    const liveDetails = order;
                                    const status = (
                                      liveDetails?.status || "unknown"
                                    ).toUpperCase();
                                    const isPending =
                                      status === "PENDING" || status === "OPEN";
                                    const isCompleted =
                                      status === "REJECTED" ||
                                      status === "COMPLETE" ||
                                      status === "EXECUTED" ||
                                      status === "CANCELLED" ||
                                      status === "CANCELED";
                                    return (
                                      isPending ||
                                      (!isCompleted && status === "UNKNOWN")
                                    );
                                  }
                                ).length === 0 && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No pending orders
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Completed Orders Tab */}
                        {getActiveTab(strategy.strategyId) === "completed" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                Completed Orders
                              </h3>
                              <button
                                onClick={() =>
                                  fetchStrategyOrders(strategy.strategyId)
                                }
                                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              >
                                🔄 Refresh
                              </button>
                            </div>

                            {loadingOrders[strategy.strategyId] ? (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                  Loading orders...
                                </p>
                              </div>
                            ) : strategyOrders[strategy.strategyId] === null ||
                              strategyOrders[strategy.strategyId] ===
                                undefined ? (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                                <div className="text-gray-400 dark:text-gray-500 mb-2">
                                  <svg
                                    className="w-12 h-12 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  No completed orders
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Order history will appear here
                                </p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Leg ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Symbol
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Strike
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Action
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Fill Qty
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Avg Fill Price
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order Time
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Status
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                                        Rejection Reason
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {strategyOrders[strategy.strategyId]
                                      .filter((order) => {
                                        // Show rejected, complete, executed, and cancelled orders
                                        const liveStatus = (
                                          order?.status || ""
                                        ).toUpperCase();
                                        const isCompleted =
                                          liveStatus === "REJECTED" ||
                                          liveStatus === "COMPLETE" ||
                                          liveStatus === "EXECUTED" ||
                                          liveStatus === "CANCELLED" ||
                                          liveStatus === "CANCELED";

                                        const oldStatus =
                                          order.response?.data?.msg?.includes(
                                            "success"
                                          ) ||
                                          order.response?.data?.msg?.includes(
                                            "complete"
                                          );

                                        return isCompleted || oldStatus;
                                      })
                                      .map((order, idx) => {
                                        const liveDetails = order;
                                        const status = (
                                          liveDetails?.status || "unknown"
                                        ).toUpperCase();
                                        const isRejected =
                                          status === "REJECTED";
                                        const isCancelled =
                                          status === "CANCELLED" ||
                                          status === "CANCELED";

                                        return (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                          >
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.orderId ||
                                                liveDetails?.exchangeOrderNumber ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.legId || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.symbol || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.strike || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  order.action === "BUY" ||
                                                  liveDetails?.transactionType ===
                                                    "BUY"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}
                                              >
                                                {order.action ||
                                                  liveDetails?.transactionType ||
                                                  "N/A"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                                              {liveDetails?.fillQuantity ||
                                                liveDetails?.totalQuantity ||
                                                order.quantity ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                                              {liveDetails?.averagePrice &&
                                              liveDetails.averagePrice !==
                                                "0.00"
                                                ? `₹${liveDetails.averagePrice}`
                                                : liveDetails?.fillPrice &&
                                                  liveDetails.fillPrice !==
                                                    "0.00"
                                                ? `₹${liveDetails.fillPrice}`
                                                : order.limitPrice
                                                ? `₹${order.limitPrice}`
                                                : "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {liveDetails?.orderTime ||
                                                (order.placedTime
                                                  ? new Date(
                                                      order.placedTime
                                                    ).toLocaleString()
                                                  : "N/A")}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  isRejected
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    : isCancelled
                                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                }`}
                                              >
                                                {isRejected
                                                  ? "Rejected"
                                                  : isCancelled
                                                  ? "Cancelled"
                                                  : liveDetails?.status?.toUpperCase() ===
                                                      "COMPLETE" ||
                                                    liveDetails?.status?.toUpperCase() ===
                                                      "EXECUTED"
                                                  ? "Completed"
                                                  : order.response?.data?.msg ||
                                                    "Completed"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-white break-words">
                                              {liveDetails?.rejectionReason ||
                                                "-"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                                {strategyOrders[strategy.strategyId].filter(
                                  (order) => {
                                    const liveStatus = (
                                      order?.status || ""
                                    ).toUpperCase();
                                    const isCompleted =
                                      liveStatus === "REJECTED" ||
                                      liveStatus === "COMPLETE" ||
                                      liveStatus === "EXECUTED" ||
                                      liveStatus === "CANCELLED" ||
                                      liveStatus === "CANCELED";

                                    const oldStatus =
                                      order.response?.data?.msg?.includes(
                                        "success"
                                      ) ||
                                      order.response?.data?.msg?.includes(
                                        "complete"
                                      );

                                    return isCompleted || oldStatus;
                                  }
                                ).length === 0 && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No completed orders yet
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Premium Based Strike Configuration Modal */}
        {premiumStrikeModalLeg !== null && currentEditingStrategyId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              {(() => {
                const leg = editValues.legs?.[premiumStrikeModalLeg];
                if (!leg) return null;

                // Ensure premiumBasedStrikeConfig exists
                if (!leg.premiumBasedStrikeConfig) {
                  leg.premiumBasedStrikeConfig = {
                    strikeType: "NearestPremium",
                    maxDepth: 5,
                    searchSide: "BOTH",
                    value: 0,
                    condition: "Greaterthanequal",
                    between: 0,
                    and: 0,
                  };
                }

                return (
                  <>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Premium Based Strike - {leg.legId}
                      </h3>
                      <button
                        onClick={() => {
                          setPremiumStrikeModalLeg(null);
                          setCurrentEditingStrategyId(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Strike Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Strike Type
                        </label>
                        <select
                          value={leg.premiumBasedStrikeConfig.strikeType}
                          onChange={(e) =>
                            handlePremiumStrikeConfigChange(
                              premiumStrikeModalLeg,
                              "strikeType",
                              e.target.value
                            )
                          }
                          className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="NearestPremium">
                            Nearest Premium
                          </option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>

                      {/* Max Depth */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Depth
                        </label>
                        <input
                          type="number"
                          value={leg.premiumBasedStrikeConfig.maxDepth}
                          onChange={(e) =>
                            handlePremiumStrikeConfigChange(
                              premiumStrikeModalLeg,
                              "maxDepth",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>

                      {/* Search Side */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Search Side
                        </label>
                        <select
                          value={leg.premiumBasedStrikeConfig.searchSide}
                          onChange={(e) =>
                            handlePremiumStrikeConfigChange(
                              premiumStrikeModalLeg,
                              "searchSide",
                              e.target.value
                            )
                          }
                          className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ITM">ITM</option>
                          <option value="OTM">OTM</option>
                          <option value="BOTH">BOTH</option>
                        </select>
                      </div>

                      {/* Conditional Fields based on Strike Type */}
                      {leg.premiumBasedStrikeConfig.strikeType ===
                      "NearestPremium" ? (
                        <>
                          {/* Value */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Value
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={leg.premiumBasedStrikeConfig.value}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "value",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Condition */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Condition
                            </label>
                            <select
                              value={leg.premiumBasedStrikeConfig.condition}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "condition",
                                  e.target.value
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Greaterthanequal">
                                Greater Than or Equal (≥)
                              </option>
                              <option value="lessthanequal">
                                Less Than or Equal (≤)
                              </option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Between */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Between
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={leg.premiumBasedStrikeConfig.between}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "between",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* And */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              And
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={leg.premiumBasedStrikeConfig.and}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "and",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setPremiumStrikeModalLeg(null);
                          setCurrentEditingStrategyId(null);
                        }}
                        className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeployedStrategies;
