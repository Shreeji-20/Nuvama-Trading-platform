import React, { useState, useEffect, useCallback, useMemo } from "react";
import IndexCards from "../components/IndexCards";

const DEV_BASE_URL = "http://localhost:8000";
const BASE_URL = DEV_BASE_URL;

const MultiLegSpread = () => {
  // State for managing spread strategies
  const [strategies, setStrategies] = useState([]);
  const [displayStrategies, setDisplayStrategies] = useState([]);

  // Form state for adding new leg to current strategy
  const [currentStrategy, setCurrentStrategy] = useState({
    id: null,
    name: "",
    legs: [],
    totalSpread: null,
  });

  const [legForm, setLegForm] = useState({
    symbol: "NIFTY",
    strike: "",
    expiry: "0",
    optionType: "CE",
    orderType: "buy",
    quantity: 1,
  });

  const [strategyName, setStrategyName] = useState("");
  const [editingStrategy, setEditingStrategy] = useState(null);

  // Symbol and expiry options
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];
  const expiryOptions = useMemo(
    () => [
      { value: "0", label: "Current Week" },
      { value: "1", label: "Next Week" },
      { value: "2", label: "Week + 2" },
      { value: "3", label: "Week + 3" },
    ],
    []
  );

  // Filter function to get leg price from option data
  const filterLegPrice = useCallback(
    (data, symbol, expiry, strikeprice, optiontype, orderType) => {
      const match = (data || []).find(
        (item) =>
          item?.response?.data?.symbolname?.includes(symbol) &&
          String(item?.response?.data?.expiry) === String(expiry) &&
          Number(item?.response?.data?.strikeprice) === Number(strikeprice) &&
          item?.response?.data?.optiontype === optiontype
      );

      if (!match) return null;

      const d = match.response.data;
      return orderType === "buy"
        ? d.askValues?.[0]?.price ?? null // Buy → Ask
        : d.bidValues?.[0]?.price ?? null; // Sell → Bid
    },
    []
  );

  // Update all strategy spreads
  const updateAllSpreads = useCallback(async () => {
    if (!Array.isArray(strategies) || strategies.length === 0) {
      setDisplayStrategies([]);
      return;
    }

    try {
      // Fetch optiondata once for all strategies
      const res = await fetch(`${BASE_URL}/optiondata`);
      if (!res.ok) throw new Error("Failed to fetch optiondata");
      const optionData = await res.json();

      console.log("Fetched option data:", optionData?.length, "items");

      const updatedStrategies = strategies.map((strategy) => {
        if (!strategy.legs || strategy.legs.length === 0) {
          return { ...strategy, totalSpread: null };
        }

        let totalSpread = 0;
        let hasValidPrice = false;
        let legDetails = [];

        for (const leg of strategy.legs) {
          const legPrice = filterLegPrice(
            optionData,
            leg.symbol,
            leg.expiry,
            leg.strike,
            leg.optionType,
            leg.orderType
          );

          legDetails.push({
            leg: `${leg.symbol} ${leg.strike} ${leg.optionType}`,
            price: legPrice,
            orderType: leg.orderType,
            quantity: leg.quantity,
          });

          if (legPrice !== null) {
            hasValidPrice = true;
            // If sell order, subtract the price (negative contribution)
            // If buy order, add the price (positive contribution)
            const contribution =
              leg.orderType === "sell"
                ? -Number(legPrice) * leg.quantity
                : Number(legPrice) * leg.quantity;
            totalSpread += contribution;
          }
        }

        console.log(`Strategy "${strategy.name}" calculation:`, {
          legDetails,
          totalSpread: hasValidPrice ? totalSpread : null,
        });

        return {
          ...strategy,
          totalSpread: hasValidPrice ? totalSpread : null,
        };
      });

      setDisplayStrategies(updatedStrategies);
    } catch (err) {
      console.error("Error updating spreads:", err);
      setDisplayStrategies(
        strategies.map((s) => ({ ...s, totalSpread: null }))
      );
    }
  }, [strategies, filterLegPrice]);

  // Handle form changes
  const handleLegFormChange = (e) => {
    setLegForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add leg to current strategy
  const addLegToStrategy = () => {
    if (!legForm.strike) {
      alert("Please enter a strike price");
      return;
    }

    const newLeg = {
      id: Date.now() + Math.random(),
      symbol: legForm.symbol,
      strike: Number(legForm.strike),
      expiry: legForm.expiry,
      optionType: legForm.optionType,
      orderType: legForm.orderType,
      quantity: Number(legForm.quantity),
    };

    setCurrentStrategy((prev) => ({
      ...prev,
      legs: [...prev.legs, newLeg],
    }));

    // Reset leg form
    setLegForm({
      symbol: "NIFTY",
      strike: "",
      expiry: "0",
      optionType: "CE",
      orderType: "buy",
      quantity: 1,
    });
  };

  // Remove leg from current strategy
  const removeLegFromStrategy = (legId) => {
    setCurrentStrategy((prev) => ({
      ...prev,
      legs: prev.legs.filter((leg) => leg.id !== legId),
    }));
  };

  // Save strategy
  const saveStrategy = async () => {
    if (!strategyName.trim()) {
      alert("Please enter a strategy name");
      return;
    }

    if (currentStrategy.legs.length === 0) {
      alert("Please add at least one leg to the strategy");
      return;
    }

    const strategyToSave = {
      id: editingStrategy ? editingStrategy.id : Date.now(),
      name: strategyName,
      legs: currentStrategy.legs,
      totalSpread: null,
    };

    try {
      // Save to backend
      const method = editingStrategy ? "PUT" : "POST";
      const url = editingStrategy
        ? `${BASE_URL}/multileg-spreads/${editingStrategy.id}`
        : `${BASE_URL}/multileg-spreads`;

      console.log(`Making ${method} request to:`, url);
      console.log("Strategy data:", strategyToSave);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(strategyToSave),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to save strategy: ${res.status} - ${errorText}`
        );
      }

      const savedStrategy = await res.json();
      console.log("Strategy saved successfully:", savedStrategy);

      // Update local state with saved strategy
      if (editingStrategy) {
        setStrategies((prev) =>
          prev.map((s) => (s.id === editingStrategy.id ? savedStrategy : s))
        );
      } else {
        setStrategies((prev) => [...prev, savedStrategy]);
      }

      // Reset form
      resetForm();
      alert("Strategy saved successfully!");
    } catch (err) {
      console.error("Error saving strategy:", err);
      alert(`Failed to save strategy: ${err.message}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentStrategy({
      id: null,
      name: "",
      legs: [],
      totalSpread: null,
    });
    setStrategyName("");
    setEditingStrategy(null);
  };

  // Load strategy for editing
  const loadStrategyForEdit = (strategy) => {
    setEditingStrategy(strategy);
    setCurrentStrategy(strategy);
    setStrategyName(strategy.name);
  };

  // Delete strategy
  const deleteStrategy = async (strategyId) => {
    if (!confirm("Are you sure you want to delete this strategy?")) return;

    try {
      console.log(`Deleting strategy with ID: ${strategyId}`);

      const res = await fetch(`${BASE_URL}/multileg-spreads/${strategyId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to delete strategy: ${res.status} - ${errorText}`
        );
      }

      // Update local state
      setStrategies((prev) => prev.filter((s) => s.id !== strategyId));
      console.log("Strategy deleted successfully");
      alert("Strategy deleted successfully!");
    } catch (err) {
      console.error("Error deleting strategy:", err);
      alert(`Failed to delete strategy: ${err.message}`);
    }
  };

  // Load strategies on mount
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        console.log("Loading strategies from backend...");

        const res = await fetch(`${BASE_URL}/multileg-spreads`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to load strategies: ${res.status} - ${errorText}`
          );
        }

        const data = await res.json();
        console.log("Strategies loaded:", data);

        if (Array.isArray(data)) {
          setStrategies(data);
        } else if (data.strategies && Array.isArray(data.strategies)) {
          setStrategies(data.strategies);
        } else {
          console.warn("Unexpected data format:", data);
          setStrategies([]);
        }
      } catch (err) {
        console.error("Error loading strategies:", err);
        // Don't show alert for initial load failure - user might not have backend running
        console.log(
          "Failed to load strategies from backend, starting with empty list"
        );
        setStrategies([]);
      }
    };
    loadStrategies();
  }, []);

  // Live spread updates
  useEffect(() => {
    let interval;
    let mounted = true;

    const performUpdate = async () => {
      if (mounted) {
        await updateAllSpreads();
      }
    };

    // Initial update
    performUpdate();

    // Set up interval for live updates
    interval = setInterval(performUpdate, 1000); // Update every 100 milliseconds

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [updateAllSpreads]);

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 dark:bg-purple-500 rounded-xl p-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">
                Multi-Leg Spread Builder
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
                Create complex option strategies with multiple legs across
                different symbols
              </p>
            </div>
          </div>
        </div>

        {/* Index Cards */}
        <IndexCards indices={["NIFTY", "SENSEX"]} className="" />
        {/* <IndexCards indices={["BANKNIFTY", "FINNIFTY"]} className="" /> */}

        {/* Strategy Builder */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary">
              {editingStrategy ? "Edit Strategy" : "Build New Strategy"}
            </h2>
            {editingStrategy && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Strategy Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Strategy Name
            </label>
            <input
              type="text"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              placeholder="Enter strategy name (e.g., Iron Condor, Straddle)"
              className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
            />
          </div>

          {/* Add Leg Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Symbol
              </label>
              <select
                name="symbol"
                value={legForm.symbol}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                {symbolOptions.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Strike
              </label>
              <input
                name="strike"
                type="number"
                value={legForm.strike}
                onChange={handleLegFormChange}
                placeholder="Strike price"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Expiry
              </label>
              <select
                name="expiry"
                value={legForm.expiry}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                {expiryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Type
              </label>
              <select
                name="optionType"
                value={legForm.optionType}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="CE">Call (CE)</option>
                <option value="PE">Put (PE)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Order
              </label>
              <select
                name="orderType"
                value={legForm.orderType}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="buy">Buy (+)</option>
                <option value="sell">Sell (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                value={legForm.quantity}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={addLegToStrategy}
                className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg p-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Add Leg
              </button>
            </div>
          </div>

          {/* Current Strategy Legs */}
          {currentStrategy.legs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary mb-3">
                Current Strategy Legs ({currentStrategy.legs.length})
              </h3>
              <div className="grid gap-3">
                {currentStrategy.legs.map((leg, index) => (
                  <div
                    key={leg.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-dark-elevated rounded-lg border border-gray-200 dark:border-dark-border"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="bg-gray-100 dark:bg-dark-surface px-2 py-1 rounded text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                        Leg {index + 1}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          leg.orderType === "buy"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {leg.orderType === "buy" ? "+" : "-"} {leg.quantity}x
                      </span>
                      <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                        {leg.symbol} {leg.strike} {leg.optionType}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        Exp:{" "}
                        {
                          expiryOptions.find((e) => e.value === leg.expiry)
                            ?.label
                        }
                      </span>
                    </div>
                    <button
                      onClick={() => removeLegFromStrategy(leg.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={saveStrategy}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  {editingStrategy ? "Update Strategy" : "Save Strategy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Strategies */}
        {displayStrategies.length > 0 && (
          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-elevated dark:to-dark-surface border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary">
                Saved Strategies ({displayStrategies.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-elevated">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Strategy Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Legs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Net Spread
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
                  {displayStrategies.map((strategy) => (
                    <tr
                      key={strategy.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                          {strategy.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {strategy.legs.map((leg, idx) => (
                            <div
                              key={leg.id}
                              className="text-sm text-gray-600 dark:text-dark-text-secondary"
                            >
                              <span
                                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  leg.orderType === "buy"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></span>
                              {leg.orderType === "buy" ? "+" : "-"}
                              {leg.quantity}x {leg.symbol} {leg.strike}{" "}
                              {leg.optionType}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-lg font-mono font-bold ${
                            strategy.totalSpread === null
                              ? "text-gray-400 dark:text-dark-text-muted"
                              : strategy.totalSpread >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {strategy.totalSpread !== null
                            ? `₹${strategy.totalSpread.toFixed(2)}`
                            : "Calculating..."}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => loadStrategyForEdit(strategy)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStrategy(strategy.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiLegSpread;
