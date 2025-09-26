import React, { useState, useEffect } from "react";

const AdvancedOptionsBuilder = () => {
  // Base configuration state
  const [baseConfig, setBaseConfig] = useState({
    strategyId: `STRATEGY_${Date.now().toString().slice(-6)}`, // Unique strategy ID
    symbol: "NIFTY",
    expiry: "",
    lots: 1,
    underlying: "Spot",
    priceType: "LTP",
    orderType: "Limit",
    buyTradesFirst: false,
    depthIndex: 1,
  });

  // Legs state
  const [legs, setLegs] = useState([]);
  const [activeTab, setActiveTab] = useState("strategy");
  const [legCounter, setLegCounter] = useState(1);

  // Options for dropdowns
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];
  const expiryOptions = [
    "16-Sep-2025",
    "23-Sep-2025",
    "30-Sep-2025",
    "07-Oct-2025",
    "14-Oct-2025",
    "21-Oct-2025",
  ];
  const dynamicExpiryOptions = [
    "None",
    "Current Week",
    "Next Week",
    "Next Week + 1",
    "Next Week + 2",
    "Monthly",
    "Next Monthly",
  ];
  const underlyingOptions = ["Spot", "Futures"];
  const priceTypeOptions = ["LTP", "BidAsk", "Depth"];
  const orderTypeOptions = ["Limit", "Market"];
  const strikeOptions = [
    "ATM-200",
    "ATM-150",
    "ATM-100",
    "ATM-50",
    "ATM",
    "ATM+50",
    "ATM+100",
    "ATM+150",
    "ATM+200",
  ];
  const targetOptions = ["Absolute", "Percentage", "Points"];
  const stoplossOptions = ["Absolute", "Percentage"];
  const depthOptions = [1, 2, 3, 4, 5];
  const tabs = [
    { id: "strategy", label: "Execution Parameters" },
    { id: "analysis", label: "Target Settings" },
    { id: "stoploss", label: "Stoploss Settings" },
    { id: "exit", label: "Exit Settings" },
    { id: "hedge", label: "Dynamic Hedge" },
    { id: "backtest", label: "Backtest" },
    { id: "deploy", label: "Deploy" },
  ];

  // Execution parameters state
  const [executionParams, setExecutionParams] = useState({
    // Card 1: Form Parameters
    product: "NRML",
    strategyTag: "",
    legsExecution: "Parallel",
    portfolioExecutionMode: "startTime",
    entryOrderType: "Limit",
    // Card 2: Time Parameters
    runOnDays: [],
    startTime: "",
    endTime: "",
    squareoffTime: "",
  });

  // Options for execution parameters
  const productOptions = ["NRML", "MIS", "CNC"];
  const strategyTagOptions = [
    "Conservative",
    "Aggressive",
    "Balanced",
    "Momentum",
  ];
  const legsExecutionOptions = ["Parallel", "One by One", "Sequential"];
  const portfolioExecutionModeOptions = [
    "startTime",
    "underlyingPremium",
    "combinedPremium",
  ];
  const entryOrderTypeOptions = ["Limit", "Market", "SL", "SL-M"];
  const daysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Target settings state
  const [targetSettings, setTargetSettings] = useState({
    targetType: "CombinedProfit",
    targetValue: 0,
  });

  // Options for target settings
  const targetTypeOptions = [
    "CombinedProfit",
    "IndividualLegProfit",
    "PercentageProfit",
    "PremiumTarget",
    "UnderlyingMovement",
  ];

  // Options for stoploss settings
  const stoplossTypeOptions = [
    "CombinedLoss",
    "IndividualLegLoss",
    "PercentageLoss",
    "PremiumLoss",
    "UnderlyingMovement",
  ];

  // Options for exit settings
  const exitOrderTypeOptions = ["Limit", "Market", "SL", "SL-M", "SL-L"];

  // Stoploss settings state
  const [stoplossSettings, setStoplossSettings] = useState({
    // Card 1: Stoploss Configuration
    stoplossType: "CombinedProfit",
    stoplossValue: 0,
    stoplossWait: 0,
    // Card 2: Square Off Options
    sqrOffOnlyLossLegs: false,
    sqrOffOnlyProfitLegs: false,
  });

  // Exit settings state
  const [exitSettings, setExitSettings] = useState({
    // Card 1: Exit Configuration
    exitOrderType: "Limit",
    exitSellFirst: false,
    holdBuyTime: 0,
    // Card 2: Retry Settings
    waitBtwnRetry: 0,
    maxWaitTime: 0,
  });

  // Dynamic hedge settings state
  const [dynamicHedgeSettings, setDynamicHedgeSettings] = useState({
    // Card 1: Hedge Parameters
    hedgeType: "premium Based",
    minHedgeDistance: 0,
    maxHedgeDistance: 0,
    minPremium: 0.0,
    maxPremium: 0.0,
    // Card 2: Strike Configuration
    strikeSteps: 100,
    strike500: false,
  });

  // Options for dynamic hedge settings
  const hedgeTypeOptions = ["premium Based", "fixed Distance"];

  // Handle base config changes
  const handleBaseConfigChange = (field, value) => {
    setBaseConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Generate new strategy ID
  const generateNewStrategyId = () => {
    setBaseConfig((prev) => ({
      ...prev,
      strategyId: `STRATEGY_${Date.now().toString().slice(-6)}`,
    }));
  };

  // Handle execution parameters changes
  const handleExecutionParamChange = (field, value) => {
    setExecutionParams((prev) => ({ ...prev, [field]: value }));
  };

  // Handle days selection (multiple)
  const handleDaysChange = (day) => {
    setExecutionParams((prev) => ({
      ...prev,
      runOnDays: prev.runOnDays.includes(day)
        ? prev.runOnDays.filter((d) => d !== day)
        : [...prev.runOnDays, day],
    }));
  };

  // Handle target settings changes
  const handleTargetSettingsChange = (field, value) => {
    setTargetSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle stoploss settings changes
  const handleStoplossSettingsChange = (field, value) => {
    setStoplossSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle exit settings changes
  const handleExitSettingsChange = (field, value) => {
    setExitSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle dynamic hedge settings changes
  const handleDynamicHedgeSettingsChange = (field, value) => {
    setDynamicHedgeSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Add new leg
  const addLeg = () => {
    const newLeg = {
      id: Date.now(), // Internal unique identifier
      legId: `LEG_${legCounter.toString().padStart(3, "0")}`, // User-friendly leg ID
      orderType: "BUY",
      optionType: "CE",
      lots: 1,
      expiry: expiryOptions[0],
      strike: "ATM",
      target: "Absolute",
      targetValue: 0,
      stoploss: "Absolute",
      stoplossValue: 0,
      startTime: "",
      dynamicExpiry: "None",
      waitAndTrade: false,
    };
    setLegs((prev) => [...prev, newLeg]);
    setLegCounter((prev) => prev + 1);
  };

  // Update leg
  const updateLeg = (legId, field, value) => {
    setLegs((prev) =>
      prev.map((leg) => (leg.id === legId ? { ...leg, [field]: value } : leg))
    );
  };

  // Remove leg
  const removeLeg = (legId) => {
    setLegs((prev) => prev.filter((leg) => leg.id !== legId));
  };

  // Toggle button component
  const ToggleButton = ({ value, onChange, options }) => {
    const handleToggle = () => {
      // Find current index and toggle to next option
      const currentIndex = options.indexOf(value);
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex]);
    };

    return (
      <button
        type="button"
        onClick={handleToggle}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-500 hover:bg-blue-600 text-white transition-colors min-w-[60px]"
      >
        {value}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Advanced Options Strategy Builder
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Build and analyze complex options strategies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500 font-medium">
                Live Data
              </span>
            </div>
          </div>
        </div>

        {/* Base Index Configuration Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
              Base Index Configuration
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Symbol
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Expiry
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Lots
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Underlying
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Price Type
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Depth Index
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Order Type
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Buy First
                  </th>
                  <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-2">
                    <select
                      value={baseConfig.symbol}
                      onChange={(e) =>
                        handleBaseConfigChange("symbol", e.target.value)
                      }
                      className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {symbolOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={baseConfig.expiry}
                      onChange={(e) =>
                        handleBaseConfigChange("expiry", e.target.value)
                      }
                      className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Expiry</option>
                      {expiryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={baseConfig.lots}
                      onChange={(e) =>
                        handleBaseConfigChange(
                          "lots",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 text-xs text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                      min="1"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={baseConfig.underlying}
                      onChange={(e) =>
                        handleBaseConfigChange("underlying", e.target.value)
                      }
                      className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {underlyingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={baseConfig.priceType}
                      onChange={(e) =>
                        handleBaseConfigChange("priceType", e.target.value)
                      }
                      className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {priceTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={baseConfig.depthIndex}
                      onChange={(e) =>
                        handleBaseConfigChange(
                          "depthIndex",
                          parseInt(e.target.value)
                        )
                      }
                      disabled={baseConfig.priceType !== "Depth"}
                      className={`w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        baseConfig.priceType !== "Depth"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {depthOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={baseConfig.orderType}
                      onChange={(e) =>
                        handleBaseConfigChange("orderType", e.target.value)
                      }
                      className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {orderTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={baseConfig.buyTradesFirst}
                        onChange={(e) =>
                          handleBaseConfigChange(
                            "buyTradesFirst",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center">
                      <button
                        onClick={addLeg}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
                      >
                        Add Leg
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legs Builder Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                Legs Builder ({legs.length} legs)
              </h2>
            </div>
            {legs.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total legs: {legs.length}
              </div>
            )}
          </div>

          {legs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No legs added yet. Click "Add Leg" to start building your
                strategy.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Leg ID
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Order
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Option
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Lots
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Expiry
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Strike
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Target
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Target Value
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Stop Loss
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Stop Loss Value
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Start Time
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Dynamic Expiry
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Wait & Trade
                    </th>
                    <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {legs.map((leg, index) => (
                    <tr
                      key={leg.id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        index % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-800"
                          : "bg-white dark:bg-gray-700"
                      }`}
                    >
                      <td className="p-2">
                        <div className="text-center">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                            {leg.legId}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center">
                          <ToggleButton
                            value={leg.orderType}
                            onChange={(value) =>
                              updateLeg(leg.id, "orderType", value)
                            }
                            options={["BUY", "SELL"]}
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center">
                          <ToggleButton
                            value={leg.optionType}
                            onChange={(value) =>
                              updateLeg(leg.id, "optionType", value)
                            }
                            options={["CE", "PE"]}
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={leg.lots}
                          onChange={(e) =>
                            updateLeg(
                              leg.id,
                              "lots",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-16 text-xs text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                          min="1"
                          style={{ fontSize: "0.6rem" }}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={leg.expiry}
                          onChange={(e) =>
                            updateLeg(leg.id, "expiry", e.target.value)
                          }
                          className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {expiryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={leg.strike}
                          onChange={(e) =>
                            updateLeg(leg.id, "strike", e.target.value)
                          }
                          className="w-full text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {strikeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={leg.target}
                          onChange={(e) =>
                            updateLeg(leg.id, "target", e.target.value)
                          }
                          className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {targetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={leg.targetValue}
                          onChange={(e) =>
                            updateLeg(
                              leg.id,
                              "targetValue",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-12 text-xs text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                          step="0.01"
                          style={{ fontSize: "0.6rem" }}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={leg.stoploss}
                          onChange={(e) =>
                            updateLeg(leg.id, "stoploss", e.target.value)
                          }
                          className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {stoplossOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={leg.stoplossValue}
                          onChange={(e) =>
                            updateLeg(
                              leg.id,
                              "stoplossValue",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-12 text-xs text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                          step="0.01"
                          style={{ fontSize: "0.6rem" }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="time"
                          value={leg.startTime}
                          onChange={(e) =>
                            updateLeg(leg.id, "startTime", e.target.value)
                          }
                          className="w-32 text-xs text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={leg.dynamicExpiry}
                          onChange={(e) =>
                            updateLeg(leg.id, "dynamicExpiry", e.target.value)
                          }
                          className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {dynamicExpiryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={leg.waitAndTrade}
                            onChange={(e) =>
                              updateLeg(
                                leg.id,
                                "waitAndTrade",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeLeg(leg.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Horizontal Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
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
            {activeTab === "strategy" && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Execution Parameters
                </h3>

                {/* Cards in Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Form Parameters */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Form Parameters
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Product
                            </td>
                            <td className="p-2">
                              <select
                                value={executionParams.product}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "product",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {productOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Strategy Tag
                            </td>
                            <td className="p-2">
                              <select
                                value={executionParams.strategyTag}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "strategyTag",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Tag</option>
                                {strategyTagOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Legs Execution
                            </td>
                            <td className="p-2">
                              <select
                                value={executionParams.legsExecution}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "legsExecution",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {legsExecutionOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Portfolio Execution Mode
                            </td>
                            <td className="p-2">
                              <select
                                value={executionParams.portfolioExecutionMode}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "portfolioExecutionMode",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {portfolioExecutionModeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Entry Order Type
                            </td>
                            <td className="p-2">
                              <select
                                value={executionParams.entryOrderType}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "entryOrderType",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {entryOrderTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 2: Time Parameters */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Time Parameters
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Run On Days
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {daysOptions.map((day) => (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDaysChange(day)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      executionParams.runOnDays.includes(day)
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                    }`}
                                  >
                                    {day.slice(0, 3)}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Start Time
                            </td>
                            <td className="p-2">
                              <input
                                type="time"
                                value={executionParams.startTime}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                className="w-32 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              End Time
                            </td>
                            <td className="p-2">
                              <input
                                type="time"
                                value={executionParams.endTime}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                className="w-32 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Square Off Time
                            </td>
                            <td className="p-2">
                              <input
                                type="time"
                                value={executionParams.squareoffTime}
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "squareoffTime",
                                    e.target.value
                                  )
                                }
                                className="w-32 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="space-y-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Target Settings
                </h3>

                {/* Target Settings Card */}
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                      Target Configuration
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full max-w-md mx-auto">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-center p-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Parameter
                          </th>
                          <th className="text-center p-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-600">
                          <td className="p-3 text-xs text-center text-gray-700 dark:text-gray-300 font-medium">
                            Target Type
                          </td>
                          <td className="p-3">
                            <select
                              value={targetSettings.targetType}
                              onChange={(e) =>
                                handleTargetSettingsChange(
                                  "targetType",
                                  e.target.value
                                )
                              }
                              className="w-full text-xs text-center p-3 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              {targetTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-xs text-center text-gray-700 dark:text-gray-300 font-medium">
                            Target Value
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={targetSettings.targetValue}
                              onChange={(e) =>
                                handleTargetSettingsChange(
                                  "targetValue",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mx-auto"
                              step="0.01"
                              placeholder="Enter target value"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Target Summary */}
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        Current Target Configuration
                      </div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                        {targetSettings.targetType}:{" "}
                        {targetSettings.targetValue}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stoploss" && (
              <div className="space-y-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Stoploss Settings
                </h3>

                {/* Cards in Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Stoploss Configuration */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Stoploss Configuration
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Stoploss Type
                            </td>
                            <td className="p-2">
                              <select
                                value={stoplossSettings.stoplossType}
                                onChange={(e) =>
                                  handleStoplossSettingsChange(
                                    "stoplossType",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              >
                                {stoplossTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Stoploss Value
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={stoplossSettings.stoplossValue}
                                onChange={(e) =>
                                  handleStoplossSettingsChange(
                                    "stoplossValue",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mx-auto"
                                step="0.01"
                                placeholder="Enter stoploss value"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Stoploss Wait (seconds)
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={stoplossSettings.stoplossWait}
                                onChange={(e) =>
                                  handleStoplossSettingsChange(
                                    "stoplossWait",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mx-auto"
                                step="0.1"
                                placeholder="Wait time in seconds"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 2: Square Off Options */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Square Off Options
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Option
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Enabled
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Square Off Only Loss Legs
                            </td>
                            <td className="p-2">
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={stoplossSettings.sqrOffOnlyLossLegs}
                                  onChange={(e) =>
                                    handleStoplossSettingsChange(
                                      "sqrOffOnlyLossLegs",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Square Off Only Profit Legs
                            </td>
                            <td className="p-2">
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    stoplossSettings.sqrOffOnlyProfitLegs
                                  }
                                  onChange={(e) =>
                                    handleStoplossSettingsChange(
                                      "sqrOffOnlyProfitLegs",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Stoploss Summary */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Current Stoploss Configuration
                    </div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                      Type: {stoplossSettings.stoplossType} | Value:{" "}
                      {stoplossSettings.stoplossValue} | Wait:{" "}
                      {stoplossSettings.stoplossWait}s
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Loss Legs:{" "}
                      {stoplossSettings.sqrOffOnlyLossLegs
                        ? "Enabled"
                        : "Disabled"}{" "}
                      | Profit Legs:{" "}
                      {stoplossSettings.sqrOffOnlyProfitLegs
                        ? "Enabled"
                        : "Disabled"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "exit" && (
              <div className="space-y-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Exit Settings
                </h3>

                {/* Cards in Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Exit Configuration */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Exit Configuration
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Exit Order Type
                            </td>
                            <td className="p-2">
                              <select
                                value={exitSettings.exitOrderType}
                                onChange={(e) =>
                                  handleExitSettingsChange(
                                    "exitOrderType",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                              >
                                {exitOrderTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Exit Sell First
                            </td>
                            <td className="p-2">
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={exitSettings.exitSellFirst}
                                  onChange={(e) =>
                                    handleExitSettingsChange(
                                      "exitSellFirst",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Hold Buy Time (seconds)
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={exitSettings.holdBuyTime}
                                onChange={(e) =>
                                  handleExitSettingsChange(
                                    "holdBuyTime",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 mx-auto"
                                step="0.1"
                                placeholder="Hold time in seconds"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 2: Retry Settings */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Retry Settings
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Wait Between Retry (seconds)
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={exitSettings.waitBtwnRetry}
                                onChange={(e) =>
                                  handleExitSettingsChange(
                                    "waitBtwnRetry",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mx-auto"
                                step="0.1"
                                placeholder="Wait time between retries"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Max Wait Time (seconds)
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={exitSettings.maxWaitTime}
                                onChange={(e) =>
                                  handleExitSettingsChange(
                                    "maxWaitTime",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mx-auto"
                                step="0.1"
                                placeholder="Maximum wait time"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Exit Summary */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      Current Exit Configuration
                    </div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                      Order Type: {exitSettings.exitOrderType} | Sell First:{" "}
                      {exitSettings.exitSellFirst ? "Yes" : "No"} | Hold Buy:{" "}
                      {exitSettings.holdBuyTime}s
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Wait Between Retry: {exitSettings.waitBtwnRetry}s | Max
                      Wait: {exitSettings.maxWaitTime}s
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hedge" && (
              <div className="space-y-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Dynamic Hedge Settings
                </h3>

                {/* Grid layout for 2 cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Hedge Parameters */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Hedge Parameters
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Hedge Type
                            </td>
                            <td className="p-2">
                              <select
                                value={dynamicHedgeSettings.hedgeType}
                                onChange={(e) =>
                                  handleDynamicHedgeSettingsChange(
                                    "hedgeType",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              >
                                {hedgeTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Min Hedge Distance
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={dynamicHedgeSettings.minHedgeDistance}
                                onChange={(e) =>
                                  handleDynamicHedgeSettingsChange(
                                    "minHedgeDistance",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                                placeholder="Min distance"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Max Hedge Distance
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={dynamicHedgeSettings.maxHedgeDistance}
                                onChange={(e) =>
                                  handleDynamicHedgeSettingsChange(
                                    "maxHedgeDistance",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                                placeholder="Max distance"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Min Premium
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={dynamicHedgeSettings.minPremium}
                                onChange={(e) =>
                                  handleDynamicHedgeSettingsChange(
                                    "minPremium",
                                    parseFloat(e.target.value) || 0.0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                                placeholder="Min premium"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">
                              Max Premium
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={dynamicHedgeSettings.maxPremium}
                                onChange={(e) =>
                                  handleDynamicHedgeSettingsChange(
                                    "maxPremium",
                                    parseFloat(e.target.value) || 0.0
                                  )
                                }
                                className="w-24 text-xs text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                                placeholder="Max premium"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 2: Strike Configuration */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Strike Configuration
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full max-w-md mx-auto">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-3 text-xs text-center text-gray-700 dark:text-gray-300 font-medium">
                              Strike Steps
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={dynamicHedgeSettings.strikeSteps}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 100;
                                  // Ensure value is multiple of 100
                                  const roundedValue =
                                    Math.round(value / 100) * 100;
                                  handleDynamicHedgeSettingsChange(
                                    "strikeSteps",
                                    roundedValue
                                  );
                                }}
                                className="w-32 text-xs text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                                step="100"
                                min="100"
                                placeholder="Multiples of 100"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 text-xs text-center text-gray-700 dark:text-gray-300 font-medium">
                              Strike 500
                            </td>
                            <td className="p-3">
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={dynamicHedgeSettings.strike500}
                                  onChange={(e) =>
                                    handleDynamicHedgeSettingsChange(
                                      "strike500",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Strike Configuration Info */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Current Strike Configuration
                        </div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                          Steps: {dynamicHedgeSettings.strikeSteps} | Strike
                          500:{" "}
                          {dynamicHedgeSettings.strike500
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Hedge Summary */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Current Dynamic Hedge Configuration
                    </div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                      Type: {dynamicHedgeSettings.hedgeType} | Distance:{" "}
                      {dynamicHedgeSettings.minHedgeDistance} -{" "}
                      {dynamicHedgeSettings.maxHedgeDistance} | Premium:{" "}
                      {dynamicHedgeSettings.minPremium} -{" "}
                      {dynamicHedgeSettings.maxPremium}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Strike Steps: {dynamicHedgeSettings.strikeSteps} | Strike
                      500:{" "}
                      {dynamicHedgeSettings.strike500 ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "backtest" && (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  Backtesting results will be displayed here
                </div>
              </div>
            )}

            {activeTab === "deploy" && (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  Strategy deployment options will be displayed here
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central Strategy Action Button */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Strategy Deployment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deploy your complete strategy with all configured parameters
            </p>
          </div> */}

          {/* Strategy Summary and Action Buttons Side by Side */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Strategy Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center">
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Strategy ID
                </div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  {baseConfig.strategyId}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Total Legs
                </div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  {legs.length}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Execution Mode
                </div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  {executionParams.legsExecution}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Target Type
                </div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  {targetSettings.targetType}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <button
                onClick={() => {
                  // Collect all parameters for API call
                  const strategyData = {
                    baseConfig,
                    legs,
                    executionParams,
                    targetSettings,
                    stoplossSettings,
                    exitSettings,
                    timestamp: new Date().toISOString(),
                  };
                  console.log("Strategy Data to be sent:", strategyData);
                  // TODO: Replace with actual API call
                  alert(
                    "Strategy saved! Check console for full data structure."
                  );
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
              >
                🚀 Deploy Strategy
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to clear all configuration? This action cannot be undone."
                    )
                  ) {
                    // Reset all states
                    setBaseConfig({
                      strategyId: `STRATEGY_${Date.now().toString().slice(-6)}`,
                      symbol: "NIFTY",
                      expiry: "",
                      lots: 1,
                      underlying: "Spot",
                      priceType: "LTP",
                      orderType: "Limit",
                      buyTradesFirst: false,
                      depthIndex: 1,
                    });
                    setLegs([]);
                    setLegCounter(1);
                    setExecutionParams({
                      product: "NRML",
                      strategyTag: "",
                      legsExecution: "Parallel",
                      portfolioExecutionMode: "startTime",
                      entryOrderType: "Limit",
                      runOnDays: [],
                      startTime: "",
                      endTime: "",
                      squareoffTime: "",
                    });
                    setTargetSettings({
                      targetType: "CombinedProfit",
                      targetValue: 0,
                    });
                    setStoplossSettings({
                      stoplossType: "CombinedLoss",
                      stoplossValue: 0,
                      stoplossWait: 0,
                      sqrOffOnlyLossLegs: false,
                      sqrOffOnlyProfitLegs: false,
                    });
                    setExitSettings({
                      exitOrderType: "Limit",
                      exitSellFirst: false,
                      holdBuyTime: 0,
                      waitBtwnRetry: 0,
                      maxWaitTime: 0,
                    });
                    setActiveTab("strategy");
                  }
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedOptionsBuilder;
