import React, { useState, useEffect } from "react";

const DEV_BASE_URL = "http://localhost:8000";

const AdvancedOptionsTable = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [usersForDropdown, setUsersForDropdown] = useState([]);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editValues, setEditValues] = useState({});

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
      const response = await fetch(`${DEV_BASE_URL}/advanced-options/${editingStrategy}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editValues),
      });
      
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
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested field change (for legs)
  const handleLegChange = (legKey, field, value) => {
    setEditValues(prev => ({
      ...prev,
      legs: {
        ...prev.legs,
        [legKey]: {
          ...prev.legs[legKey],
          [field]: value
        }
      }
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
        fetchStrategies(); // Refresh the list
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

  // Update strategy user selection
  const updateStrategy = async (strategyId, updatedData) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${DEV_BASE_URL}/advanced-options/${strategyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );
      if (response.ok) {
        setMessage("Strategy updated successfully");
        fetchStrategies(); // Refresh the list
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

  // Get user name from user ID
  const getUserName = (userId) => {
    const user = usersForDropdown.find(
      (u) => String(u.userid ?? u.id) === String(userId)
    );
    return user ? user.username ?? user.userid ?? user.id : userId;
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

        {/* Strategies Table */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl border border-light-border dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-elevated dark:bg-dark-elevated">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Strategy ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Legs
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Bidding Leg
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Spread
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Users
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {!Array.isArray(strategies) || strategies.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-8 text-center text-light-text-muted dark:text-dark-text-muted"
                    >
                      No strategies found
                    </td>
                  </tr>
                ) : (
                  strategies.map((strategy) => (
                    <tr
                      key={strategy.strategy_id || strategy.id}
                      className="hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-light-text-primary dark:text-dark-text-primary font-mono">
                        {strategy.strategy_id || strategy.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <div className="space-y-1">
                          {strategy.legs &&
                            Object.entries(strategy.legs).map(([key, leg]) => (
                              <div key={key} className="text-xs">
                                {key}: {leg?.symbol} {leg?.strike} {leg?.type}
                              </div>
                            ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {strategy.bidding_leg ? (
                          <div className="text-xs">
                            {strategy.bidding_leg.symbol}{" "}
                            {strategy.bidding_leg.strike}{" "}
                            {strategy.bidding_leg.type}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {strategy.desired_spread}
                      </td>
                      <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {strategy.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <div className="space-y-2">
                          {/* Selected users display */}
                          {(strategy.user_ids || []).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(strategy.user_ids || []).map((userId) => (
                                <span
                                  key={userId}
                                  className="inline-block px-2 py-1 bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent text-xs rounded"
                                >
                                  {getUserName(userId)}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* User selection checkboxes */}
                          <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                            {Array.isArray(usersForDropdown) &&
                              usersForDropdown.map((u) => {
                                const val = String(u.userid ?? u.id);
                                const label = u.username ?? u.userid ?? u.id;
                                const checked = Array.isArray(strategy.user_ids)
                                  ? strategy.user_ids.map(String).includes(val)
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
                                          strategy.user_ids
                                        )
                                          ? strategy.user_ids.map(String)
                                          : [];
                                        const next = e.target.checked
                                          ? Array.from(new Set([...curr, val]))
                                          : curr.filter((x) => x !== val);

                                        updateStrategy(
                                          strategy.strategy_id || strategy.id,
                                          {
                                            ...strategy,
                                            user_ids: next,
                                          }
                                        );
                                      }}
                                    />
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary truncate">
                                      {label}
                                    </span>
                                  </label>
                                );
                              })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            strategy.run_state === 0
                              ? "bg-light-warning/20 text-light-warning dark:bg-dark-warning/20 dark:text-dark-warning"
                              : strategy.run_state === 1
                              ? "bg-light-success/20 text-light-success dark:bg-dark-success/20 dark:text-dark-success"
                              : strategy.run_state === 2
                              ? "bg-light-error/20 text-light-error dark:bg-dark-error/20 dark:text-dark-error"
                              : "bg-light-info/20 text-light-info dark:bg-dark-info/20 dark:text-dark-info"
                          }`}
                        >
                          {strategy.run_state === 0
                            ? "Pending"
                            : strategy.run_state === 1
                            ? "Running"
                            : strategy.run_state === 2
                            ? "Stopped"
                            : "Not Started"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              deleteStrategy(
                                strategy.strategy_id || strategy.id
                              )
                            }
                            className="text-light-error dark:text-dark-error hover:text-light-error-hover dark:hover:text-dark-error-hover transition-colors"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
