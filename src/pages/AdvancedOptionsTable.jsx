import React, { useState, useEffect } from "react";

const DEV_BASE_URL = "http://localhost:8000";

const AdvancedOptionsTable = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [usersForDropdown, setUsersForDropdown] = useState([]);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Helper function to format numeric expiry values
  const formatExpiry = (expiry) => {
    const expiryMap = {
      0: "Current",
      1: "Next",
      2: "Week+2",
      3: "Month 1",
      4: "Month 2",
      5: "Month 3",
      6: "Month 4",
      7: "Month 5",
      8: "Month 6",
      9: "Month 7",
    };

    if (typeof expiry === "number") {
      return expiryMap[expiry] || `Cycle ${expiry}`;
    }

    // Legacy date format handling
    if (typeof expiry === "string" && expiry.includes("-")) {
      try {
        return new Date(expiry).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
      } catch {
        return expiry;
      }
    }

    return expiry || "-";
  };

  // Fetch all strategies
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${DEV_BASE_URL}/advanced-options`);
      if (response.ok) {
        const data = await response.json();
        const strategiesArray = data.strategies || [];
        setStrategies(Array.isArray(strategiesArray) ? strategiesArray : []);
      } else {
        setMessage("Error fetching strategies");
        setStrategies([]);
      }
    } catch (error) {
      console.error("Error fetching strategies:", error);
      setMessage("Error fetching strategies");
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${DEV_BASE_URL}/users`);
      if (response.ok) {
        const users = await response.json();
        setUsersForDropdown(Array.isArray(users) ? users : []);
      } else {
        console.error("Error fetching users:", response.status);
        setUsersForDropdown([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersForDropdown([]);
    }
  };

  // Start editing a strategy
  const startEditing = (strategy) => {
    setEditingStrategy(strategy.strategy_id || strategy.id);
    setEditValues({ ...strategy });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingStrategy(null);
    setEditValues({});
  };

  // Save changes and update strategy
  const saveChanges = async () => {
    if (!editingStrategy) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${DEV_BASE_URL}/advanced-options/${editingStrategy}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editValues),
        }
      );

      if (response.ok) {
        setMessage("Strategy updated successfully");
        fetchStrategies();
        setEditingStrategy(null);
        setEditValues({});
      } else {
        setMessage("Error updating strategy");
      }
    } catch (error) {
      console.error("Error updating strategy:", error);
      setMessage("Error updating strategy");
    } finally {
      setLoading(false);
    }
  };

  // Handle field change during editing
  const handleFieldChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested field change (for legs)
  const handleLegChange = (legKey, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [legKey]: {
        ...prev[legKey],
        [field]: value,
      },
    }));
  };

  // Delete strategy
  const deleteStrategy = async (strategyId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${DEV_BASE_URL}/advanced-options/${strategyId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setMessage("Strategy deleted successfully");
        fetchStrategies();
      } else {
        setMessage("Error deleting strategy");
      }
    } catch (error) {
      console.error("Error deleting strategy:", error);
      setMessage("Error deleting strategy");
    } finally {
      setLoading(false);
    }
  };

  // Update strategy state (play/pause/resume/exit)
  const updateStrategyState = async (strategyId, newState) => {
    try {
      setLoading(true);
      const strategy = strategies.find(
        (s) => (s.strategy_id || s.id) === strategyId
      );
      if (!strategy) return;

      const updatedStrategy = { ...strategy, run_state: newState };
      const response = await fetch(
        `${DEV_BASE_URL}/advanced-options/${strategyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedStrategy),
        }
      );

      if (response.ok) {
        setMessage(
          `Strategy ${
            newState === 0 ? "started" : newState === 1 ? "paused" : "stopped"
          } successfully`
        );
        fetchStrategies();
      } else {
        setMessage("Error updating strategy state");
      }
    } catch (error) {
      console.error("Error updating strategy state:", error);
      setMessage("Error updating strategy state");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStrategies();
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            Advanced Options Strategies
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Manage and monitor your multi-leg options strategies
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-light-info dark:bg-dark-info/20 border border-light-info dark:border-dark-info rounded-lg">
            <p className="text-light-text-primary dark:text-dark-text-primary">
              {message}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-6 p-4 bg-light-elevated dark:bg-dark-elevated rounded-lg">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Loading...
            </p>
          </div>
        )}

        {/* Strategies Cards */}
        <div className="space-y-6">
          {!Array.isArray(strategies) || strategies.length === 0 ? (
            <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl border border-light-border dark:border-dark-border p-8 text-center">
              <p className="text-light-text-muted dark:text-dark-text-muted">
                No strategies found
              </p>
            </div>
          ) : (
            strategies.map((strategy) => {
              const strategyId = strategy.strategy_id || strategy.id;
              const isEditing = editingStrategy === strategyId;
              const currentValues = isEditing ? editValues : strategy;

              return (
                <div
                  key={strategyId}
                  className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl border border-light-border dark:border-dark-border overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-light-elevated dark:bg-dark-elevated px-6 py-4 border-b border-light-border dark:border-dark-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentValues.notes || ""}
                              onChange={(e) =>
                                handleFieldChange("notes", e.target.value)
                              }
                              placeholder="Strategy Notes"
                              className="text-lg font-semibold bg-transparent border-b border-light-border dark:border-dark-border focus:border-light-accent dark:focus:border-dark-accent outline-none text-light-text-primary dark:text-dark-text-primary"
                            />
                          ) : (
                            currentValues.notes || "Advanced Options Strategy"
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-light-text-muted dark:text-dark-text-muted font-mono">
                          <span>ID: {strategyId}</span>
                          {currentValues.legs_count && (
                            <span>• Legs: {currentValues.legs_count}</span>
                          )}
                          {(() => {
                            const legCount = Object.keys(currentValues).filter(
                              (key) =>
                                key.startsWith("leg") &&
                                typeof currentValues[key] === "object" &&
                                currentValues[key] !== null
                            ).length;
                            return legCount > 0 ? (
                              <span>• Dynamic Legs: {legCount}</span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveChanges}
                              disabled={loading}
                              className="px-4 py-2 bg-light-success dark:bg-dark-success text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 bg-light-muted dark:bg-dark-muted text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(strategy)}
                              className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteStrategy(strategyId)}
                              className="px-4 py-2 bg-light-error dark:bg-dark-error text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                      {/* Legs Section - Takes 2 columns on XL screens */}
                      <div className="xl:col-span-2 space-y-4">
                        <h4 className="text-md font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
                          Strategy Legs
                        </h4>
                        {(() => {
                          // Extract legs from currentValues (leg1, leg2, leg3, etc.)
                          const legs = {};
                          Object.keys(currentValues).forEach((key) => {
                            if (
                              key.startsWith("leg") &&
                              typeof currentValues[key] === "object" &&
                              currentValues[key] !== null
                            ) {
                              legs[key] = currentValues[key];
                            }
                          });

                          return Object.keys(legs).length > 0 ? (
                            <div className="bg-light-elevated dark:bg-dark-elevated rounded-lg p-3">
                              {/* Horizontal scrollable table for legs */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-light-border dark:border-dark-border">
                                      <th className="text-left py-2 px-2 font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Leg
                                      </th>
                                      <th className="text-left py-2 px-2 font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Symbol
                                      </th>
                                      <th className="text-left py-2 px-2 font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Strike
                                      </th>
                                      <th className="text-left py-2 px-2 font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Type
                                      </th>
                                      <th className="text-left py-2 px-2 font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Expiry
                                      </th>
                                      <th className="text-left py-2 px-2 font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Action
                                      </th>
                                      <th className="text-left py-2 px-2 font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                        Qty
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(legs).map(
                                      ([legKey, leg]) => (
                                        <tr
                                          key={legKey}
                                          className="border-b border-light-border/50 dark:border-dark-border/50"
                                        >
                                          <td className="py-2 px-2 font-medium text-light-text-primary dark:text-dark-text-primary uppercase">
                                            {legKey}
                                          </td>
                                          <td className="py-2 px-2">
                                            {isEditing ? (
                                              <input
                                                type="text"
                                                value={leg?.symbol || ""}
                                                onChange={(e) =>
                                                  handleLegChange(
                                                    legKey,
                                                    "symbol",
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                              />
                                            ) : (
                                              <span className="text-light-text-primary dark:text-dark-text-primary">
                                                {leg?.symbol || "-"}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-2">
                                            {isEditing ? (
                                              <input
                                                type="number"
                                                value={leg?.strike || ""}
                                                onChange={(e) =>
                                                  handleLegChange(
                                                    legKey,
                                                    "strike",
                                                    Number(e.target.value)
                                                  )
                                                }
                                                className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                              />
                                            ) : (
                                              <span className="text-light-text-primary dark:text-dark-text-primary">
                                                {leg?.strike || "-"}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-2">
                                            {isEditing ? (
                                              <select
                                                value={leg?.type || ""}
                                                onChange={(e) =>
                                                  handleLegChange(
                                                    legKey,
                                                    "type",
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                              >
                                                <option value="CE">CE</option>
                                                <option value="PE">PE</option>
                                              </select>
                                            ) : (
                                              <span className="text-light-text-primary dark:text-dark-text-primary">
                                                {leg?.type || "-"}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-2">
                                            {isEditing ? (
                                              <input
                                                type="number"
                                                min="0"
                                                max="9"
                                                value={leg?.expiry || ""}
                                                onChange={(e) =>
                                                  handleLegChange(
                                                    legKey,
                                                    "expiry",
                                                    Number(e.target.value)
                                                  )
                                                }
                                                className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                                placeholder="0-9"
                                              />
                                            ) : (
                                              <span className="text-light-text-primary dark:text-dark-text-primary">
                                                {formatExpiry(leg?.expiry)}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-2">
                                            {isEditing ? (
                                              <select
                                                value={leg?.action || ""}
                                                onChange={(e) =>
                                                  handleLegChange(
                                                    legKey,
                                                    "action",
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                              >
                                                <option value="BUY">BUY</option>
                                                <option value="SELL">
                                                  SELL
                                                </option>
                                              </select>
                                            ) : (
                                              <span
                                                className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                                  leg?.action === "BUY"
                                                    ? "bg-light-success/20 text-light-success dark:bg-dark-success/20 dark:text-dark-success"
                                                    : "bg-light-error/20 text-light-error dark:bg-dark-error/20 dark:text-dark-error"
                                                }`}
                                              >
                                                {leg?.action || "-"}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-2">
                                            {isEditing ? (
                                              <input
                                                type="number"
                                                value={leg?.quantity || ""}
                                                onChange={(e) =>
                                                  handleLegChange(
                                                    legKey,
                                                    "quantity",
                                                    Number(e.target.value)
                                                  )
                                                }
                                                className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                              />
                                            ) : (
                                              <span className="text-light-text-primary dark:text-dark-text-primary">
                                                {leg?.quantity || "-"}
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-light-elevated dark:bg-dark-elevated rounded-lg p-4 text-center">
                              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                No strategy legs configured
                              </p>
                            </div>
                          );
                        })()}

                        {/* Bidding Leg Section */}
                        {currentValues.bidding_leg && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mt-3">
                            <div className="font-medium text-blue-700 dark:text-blue-300 text-sm uppercase mb-2">
                              Bidding Leg
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-blue-200 dark:border-blue-800">
                                    <th className="text-left py-1 px-2 font-medium text-blue-600 dark:text-blue-300">
                                      Symbol
                                    </th>
                                    <th className="text-left py-1 px-2 font-medium text-blue-600 dark:text-blue-300">
                                      Strike
                                    </th>
                                    <th className="text-left py-1 px-2 font-medium text-blue-600 dark:text-blue-300">
                                      Type
                                    </th>
                                    <th className="text-left py-1 px-2 font-medium text-blue-600 dark:text-blue-300">
                                      Expiry
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="py-1 px-2">
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={
                                            currentValues.bidding_leg?.symbol ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleFieldChange("bidding_leg", {
                                              ...currentValues.bidding_leg,
                                              symbol: e.target.value,
                                            })
                                          }
                                          className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                        />
                                      ) : (
                                        <span className="text-light-text-primary dark:text-dark-text-primary">
                                          {currentValues.bidding_leg?.symbol ||
                                            "-"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1 px-2">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={
                                            currentValues.bidding_leg?.strike ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleFieldChange("bidding_leg", {
                                              ...currentValues.bidding_leg,
                                              strike: Number(e.target.value),
                                            })
                                          }
                                          className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                        />
                                      ) : (
                                        <span className="text-light-text-primary dark:text-dark-text-primary">
                                          {currentValues.bidding_leg?.strike ||
                                            "-"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1 px-2">
                                      {isEditing ? (
                                        <select
                                          value={
                                            currentValues.bidding_leg?.type ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleFieldChange("bidding_leg", {
                                              ...currentValues.bidding_leg,
                                              type: e.target.value,
                                            })
                                          }
                                          className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                        >
                                          <option value="CE">CE</option>
                                          <option value="PE">PE</option>
                                        </select>
                                      ) : (
                                        <span className="text-light-text-primary dark:text-dark-text-primary">
                                          {currentValues.bidding_leg?.type ||
                                            "-"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1 px-2">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          min="0"
                                          max="9"
                                          value={
                                            currentValues.bidding_leg?.expiry ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleFieldChange("bidding_leg", {
                                              ...currentValues.bidding_leg,
                                              expiry: Number(e.target.value),
                                            })
                                          }
                                          className="w-full px-1 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                          placeholder="0-9"
                                        />
                                      ) : (
                                        <span className="text-light-text-primary dark:text-dark-text-primary">
                                          {formatExpiry(
                                            currentValues.bidding_leg?.expiry
                                          )}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Strategy Configuration - Takes 1 column */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
                          Configuration
                        </h4>
                        <div className="bg-light-elevated dark:bg-dark-elevated rounded-lg p-2 space-y-1">
                          {/* Base Legs Display */}
                          {currentValues.base_legs &&
                            currentValues.base_legs.length > 0 && (
                              <div className="mb-2 pb-2 border-b border-light-border dark:border-dark-border col-span-2">
                                <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                  Base Legs
                                </label>
                                <div className="flex flex-wrap gap-1">
                                  {currentValues.base_legs.map((leg) => (
                                    <span
                                      key={leg}
                                      className="inline-block px-1.5 py-0.5 bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent text-xs rounded border border-light-accent/20 dark:border-dark-accent/20"
                                    >
                                      {leg}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Desired Spread
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={currentValues.desired_spread || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      "desired_spread",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                />
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.desired_spread}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Exit Spread
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={
                                    currentValues.exit_desired_spread || ""
                                  }
                                  onChange={(e) =>
                                    handleFieldChange(
                                      "exit_desired_spread",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                />
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.exit_desired_spread}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Quantity
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={currentValues.quantity || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      "quantity",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                />
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.quantity}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Slices
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={currentValues.slices || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      "slices",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                />
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.slices}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Action
                              </label>
                              {isEditing ? (
                                <select
                                  value={currentValues.action || ""}
                                  onChange={(e) =>
                                    handleFieldChange("action", e.target.value)
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                >
                                  <option value="BUY">BUY</option>
                                  <option value="SELL">SELL</option>
                                </select>
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.action}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Start Price
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={currentValues.start_price || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      "start_price",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                />
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.start_price}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Exit Start
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={currentValues.exit_start || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      "exit_start",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                />
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.exit_start}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Order Type
                              </label>
                              {isEditing ? (
                                <select
                                  value={currentValues.order_type || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      "order_type",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                                >
                                  <option value="LIMIT">LIMIT</option>
                                  <option value="MARKET">MARKET</option>
                                </select>
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.order_type}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Notes Section */}
                          {(currentValues.notes || isEditing) && (
                            <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border">
                              <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                                Notes
                              </label>
                              {isEditing ? (
                                <textarea
                                  value={currentValues.notes || ""}
                                  onChange={(e) =>
                                    handleFieldChange("notes", e.target.value)
                                  }
                                  rows={2}
                                  className="w-full px-2 py-1 text-xs border border-light-border dark:border-dark-border rounded bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary resize-vertical"
                                  placeholder="Add strategy notes..."
                                />
                              ) : (
                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary">
                                  {currentValues.notes || "No notes"}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Strategy Control Buttons */}
                          <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border">
                            <label className="block text-xs text-light-text-muted dark:text-dark-text-muted mb-1">
                              Status & Controls
                            </label>
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  currentValues.run_state === 0
                                    ? "bg-light-success/20 text-light-success dark:bg-dark-success/20 dark:text-dark-success"
                                    : currentValues.run_state === 1
                                    ? "bg-light-warning/20 text-light-warning dark:bg-dark-warning/20 dark:text-dark-warning"
                                    : currentValues.run_state === 2
                                    ? "bg-light-error/20 text-light-error dark:bg-dark-error/20 dark:text-dark-error"
                                    : "bg-light-info/20 text-light-info dark:bg-dark-info/20 dark:text-dark-info"
                                }`}
                              >
                                {currentValues.run_state === 0
                                  ? "Running"
                                  : currentValues.run_state === 1
                                  ? "Paused"
                                  : currentValues.run_state === 2
                                  ? "Stopped"
                                  : "Not Started"}
                              </span>

                              {!isEditing && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() =>
                                      updateStrategyState(strategyId, 0)
                                    }
                                    disabled={loading}
                                    className="px-2 py-1 rounded text-xs bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 disabled:opacity-50"
                                    title="Start/Resume"
                                  >
                                    ▶
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateStrategyState(strategyId, 1)
                                    }
                                    disabled={loading}
                                    className="px-2 py-1 rounded text-xs bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200 disabled:opacity-50"
                                    title="Pause"
                                  >
                                    ⏸
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateStrategyState(strategyId, 2)
                                    }
                                    disabled={loading}
                                    className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 disabled:opacity-50"
                                    title="Stop/Exit"
                                  >
                                    ⏹
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Users Section - Takes 1 column */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2">
                          Selected Users
                        </h4>
                        <div className="bg-light-elevated dark:bg-dark-elevated rounded-lg p-4">
                          {(currentValues.user_ids || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(currentValues.user_ids || []).map((userId) => {
                                const user = usersForDropdown.find(
                                  (u) =>
                                    String(u.userid ?? u.id) === String(userId)
                                );
                                const label = user
                                  ? user.username ?? user.userid ?? user.id
                                  : userId;
                                return (
                                  <span
                                    key={userId}
                                    className="inline-block px-2 py-1 bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent text-xs rounded border border-light-accent/20 dark:border-dark-accent/20"
                                  >
                                    {label}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-3">
                              No users selected
                            </div>
                          )}

                          {isEditing && (
                            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                              {Array.isArray(usersForDropdown) &&
                                usersForDropdown.map((u) => {
                                  const val = String(u.userid ?? u.id);
                                  const label = u.username ?? u.userid ?? u.id;
                                  const checked = Array.isArray(
                                    currentValues.user_ids
                                  )
                                    ? currentValues.user_ids
                                        .map(String)
                                        .includes(val)
                                    : false;

                                  return (
                                    <label
                                      key={val}
                                      className="flex items-center space-x-1 text-xs cursor-pointer hover:bg-light-surface dark:hover:bg-dark-surface p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        className="w-3 h-3 text-light-accent dark:text-dark-accent border-light-border dark:border-dark-border rounded focus:ring-1 focus:ring-light-accent dark:focus:ring-dark-accent"
                                        checked={checked}
                                        onChange={(e) => {
                                          const curr = Array.isArray(
                                            currentValues.user_ids
                                          )
                                            ? currentValues.user_ids.map(String)
                                            : [];
                                          const next = e.target.checked
                                            ? Array.from(
                                                new Set([...curr, val])
                                              )
                                            : curr.filter((x) => x !== val);

                                          handleFieldChange("user_ids", next);
                                        }}
                                      />
                                      <span className="text-light-text-secondary dark:text-dark-text-secondary truncate">
                                        {label}
                                      </span>
                                    </label>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchStrategies}
            disabled={loading}
            className="px-6 py-3 bg-light-accent dark:bg-dark-accent text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedOptionsTable;
