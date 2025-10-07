import React, { useState, useEffect } from "react";

const DeployedStrategies = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedStrategy, setExpandedStrategy] = useState(null);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

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
          executionMode: leg.executionMode || "Regular", // Add default if missing
          startTime: leg.startTime || "",
          waitAndTrade: leg.waitAndTrade || 0,
          waitAndTradeLogic: leg.waitAndTradeLogic || "Absolute",
          dynamicExpiry: leg.dynamicExpiry || "None",
          dynamicHedge: leg.dynamicHedge || false,
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
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
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Leg ID
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Symbol
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Expiry
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Order
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Option
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Lots
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Strike
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Target
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Target Val
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    SL
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    SL Val
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Price Type
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Depth
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    W&T Logic
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Wait&Trade
                                  </th>
                                  <th className="text-left p-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Dynamic Hedge
                                  </th>
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
                                    <td className="p-1 text-gray-900 dark:text-white">
                                      {leg.legId}
                                    </td>
                                    <td className="p-1">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="text"
                                          value={leg.symbol || ""}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "symbol",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.symbol}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="text"
                                          value={leg.expiry || ""}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "expiry",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.expiry}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={leg.orderType || "BUY"}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "orderType",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="BUY">BUY</option>
                                          <option value="SELL">SELL</option>
                                        </select>
                                      ) : (
                                        <span
                                          className={`px-1 py-0.5 rounded text-xs font-medium ${
                                            leg.orderType === "BUY"
                                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                          }`}
                                        >
                                          {leg.orderType}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="CE">CE</option>
                                          <option value="PE">PE</option>
                                        </select>
                                      ) : (
                                        <span
                                          className={`px-1 py-0.5 rounded text-xs font-medium ${
                                            leg.optionType === "CE"
                                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                              : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                          }`}
                                        >
                                          {leg.optionType}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.lots}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
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
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.strike}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
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
                                    <td className="p-1">
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
                                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.targetValue}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="Absolute">
                                            Absolute
                                          </option>
                                          <option value="Percentage">
                                            Percentage
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.stoploss}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.stoplossValue}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="LTP">LTP</option>
                                          <option value="BidAsk">BidAsk</option>
                                          <option value="Depth">Depth</option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.priceType}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-12 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.depthIndex}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
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
                                          className="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="Absolute">
                                            Absolute
                                          </option>
                                          <option value="Percentage">
                                            Percentage
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-gray-900 dark:text-white">
                                          {leg.waitAndTradeLogic || "Absolute"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-1">
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={leg.waitAndTrade || 0}
                                          onChange={(e) =>
                                            handleLegChange(
                                              index,
                                              "waitAndTrade",
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          step="0.1"
                                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

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
                                value={(() => {
                                  const tagValue = getEditValue(
                                    strategy,
                                    "executionParams.strategyTag"
                                  );
                                  try {
                                    if (tagValue) {
                                      const parsed = JSON.parse(tagValue);
                                      return parsed.strategyTag?.id || "";
                                    }
                                  } catch {}
                                  return tagValue || "";
                                })()}
                                onChange={(e) => {
                                  const selectedTagId = e.target.value;
                                  if (selectedTagId) {
                                    const selectedTag = availableTags.find(
                                      (tag) => tag.id === selectedTagId
                                    );
                                    if (selectedTag) {
                                      handleEditChange(
                                        "executionParams.strategyTag",
                                        JSON.stringify({
                                          strategyTag: selectedTag,
                                        })
                                      );
                                    }
                                  } else {
                                    handleEditChange(
                                      "executionParams.strategyTag",
                                      ""
                                    );
                                  }
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                disabled={loadingTags}
                              >
                                <option value="">
                                  {loadingTags ? "Loading..." : "Select Tag"}
                                </option>
                                {availableTags.map((tag) => (
                                  <option key={tag.id} value={tag.id}>
                                    {tag.tagName} (
                                    {
                                      Object.keys(tag.userMultipliers || {})
                                        .length
                                    }{" "}
                                    users)
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                {(() => {
                                  const tagValue = getEditValue(
                                    strategy,
                                    "executionParams.strategyTag"
                                  );
                                  try {
                                    if (tagValue) {
                                      const parsed = JSON.parse(tagValue);
                                      return (
                                        parsed.strategyTag?.tagName || "None"
                                      );
                                    }
                                  } catch {}
                                  return tagValue || "None";
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
                                <option value="Parallel">Parallel</option>
                                <option value="One by One">One by One</option>
                                <option value="Sequential">Sequential</option>
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
                              {editingStrategy === strategy.strategyId ? (
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
                              {editingStrategy === strategy.strategyId ? (
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
                              {editingStrategy === strategy.strategyId ? (
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
                              {editingStrategy === strategy.strategyId ? (
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
                                onChange={(e) =>
                                  handleEditChange(
                                    "dynamicHedgeSettings.strikeSteps",
                                    parseInt(e.target.value) || 100
                                  )
                                }
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
                          {getEditValue(
                            strategy,
                            "dynamicHedgeSettings.hedgeType"
                          ) === "fixed Distance" && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Strike Distance
                              </div>
                              {editingStrategy === strategy.strategyId ? (
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
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeployedStrategies;
