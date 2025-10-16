import React, { useState, useEffect } from "react";

const AdvancedOptionsBuilder = () => {
  // Strategy tags state
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Base configuration state
  const [baseConfig, setBaseConfig] = useState({
    strategyId: `STRATEGY_${Date.now().toString().slice(-6)}`, // Unique strategy ID
    strategyName: "",
    lots: 1,
    underlying: "Spot",
    buyTradesFirst: false,
    executionMode: "Live Mode",
  });

  // Legs state
  const [legs, setLegs] = useState([]);
  const [activeTab, setActiveTab] = useState("strategy");
  const [legCounter, setLegCounter] = useState(1);
  const [premiumStrikeModalLeg, setPremiumStrikeModalLeg] = useState(null); // Track which leg's modal is open

  // Options for dropdowns
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];
  const expiryOptions = [0, 1, 2, 3, 4, 5];
  const dynamicExpiryOptions = [
    "None",
    "Current Week",
    "Next Week",
    "Next Week+1",
    "Monthly",
  ];
  const underlyingOptions = ["Spot", "Futures"];
  const priceTypeOptions = ["LTP", "BidAsk", "Depth", "BID", "ASK"];
  const orderTypeOptions = ["Limit", "Market"];
  // Generate dynamic strike options based on symbol
  const getStrikeOptions = (symbol) => {
    // Determine step size: 50 for NIFTY and FINNIFTY, 100 for others
    const stepSize = symbol === "NIFTY" || symbol === "FINNIFTY" ? 50 : 100;
    const strikes = [];

    // Generate 50 strikes down and 50 strikes up from ATM
    for (let i = -50; i <= 50; i++) {
      const offset = i * stepSize;
      if (offset === 0) {
        strikes.push("ATM");
      } else if (offset > 0) {
        strikes.push(`ATM+${offset}`);
      } else {
        strikes.push(`ATM${offset}`); // Negative sign already included
      }
    }

    return strikes;
  };
  const targetOptions = ["Absolute", "Percentage", "Points"];
  const stoplossOptions = ["Absolute", "Percentage"];
  const depthOptions = [1, 2, 3, 4, 5];
  const actionOptions = ["REENTRY", "REEXECUTE"];
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

  // API Base URL
  const API_BASE_URL = "http://localhost:8000";

  // Options for execution parameters
  const productOptions = ["NRML", "MIS", "CNC"];
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
    strikeDistance: 1,
  });

  // API integration states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null); // 'success' | 'error' | null
  const [deploymentMessage, setDeploymentMessage] = useState("");

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

  // Fetch tags on component mount
  useEffect(() => {
    fetchStrategyTags();
  }, []);

  // Handle execution parameters changes
  const handleExecutionParamChange = (field, value) => {
    if (field === "strategyTag") {
      // If a tag is selected, store the full tag data
      if (value) {
        const selectedTag = availableTags.find((tag) => tag.id === value);
        if (selectedTag) {
          setExecutionParams((prev) => ({
            ...prev,
            [field]: JSON.stringify({ strategyTag: selectedTag }),
          }));
          return;
        }
      }
    }
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

  // API deployment function
  const deployStrategy = async () => {
    try {
      setIsDeploying(true);
      setDeploymentStatus(null);
      setDeploymentMessage("");

      // Validate required fields
      if (!baseConfig.strategyName || baseConfig.strategyName.trim() === "") {
        throw new Error(
          "Strategy Name is required. Please enter a strategy name in Base Configuration."
        );
      }

      if (legs.length === 0) {
        throw new Error("At least one leg is required to deploy the strategy");
      }

      // Validate that all legs have required fields
      for (const leg of legs) {
        if (!leg.symbol) {
          throw new Error(`Symbol is required for Leg ${leg.legId}`);
        }
        if (!leg.expiry) {
          throw new Error(`Expiry is required for Leg ${leg.legId}`);
        }
        if (!leg.priceType) {
          throw new Error(`Price Type is required for Leg ${leg.legId}`);
        }
        if (!leg.orderType) {
          throw new Error(`Order Type is required for Leg ${leg.legId}`);
        }
      }
      // Note: strategyTag is now optional, so no validation needed

      // Prepare strategy data for API
      const strategyData = {
        baseConfig,
        legs,
        executionParams,
        targetSettings,
        stoplossSettings,
        exitSettings,
        dynamicHedgeSettings, // Include dynamic hedge settings
        timestamp: new Date().toISOString(),
      };

      console.log("Deploying Strategy Data:", strategyData);

      // Make API call to strategy configuration endpoint
      const response = await fetch(`${API_BASE_URL}/strategy/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(strategyData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error occurred" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Strategy Deployment Result:", result);

      setDeploymentStatus("success");
      setDeploymentMessage(
        `Strategy deployed successfully! Strategy ID: ${result.strategyId}`
      );

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setDeploymentStatus(null);
        setDeploymentMessage("");
      }, 5000);
    } catch (error) {
      console.error("Strategy Deployment Error:", error);
      setDeploymentStatus("error");
      setDeploymentMessage(
        error.message ||
          "Failed to deploy strategy. Please check your configuration and try again."
      );

      // Auto-clear error message after 8 seconds
      setTimeout(() => {
        setDeploymentStatus(null);
        setDeploymentMessage("");
      }, 8000);
    } finally {
      setIsDeploying(false);
    }
  };

  // Add new leg
  const addLeg = () => {
    const newLeg = {
      id: Date.now(), // Internal unique identifier
      legId: `LEG_${legCounter.toString().padStart(3, "0")}`, // User-friendly leg ID
      symbol: "NIFTY",
      expiry: 0,
      orderType: "BUY",
      optionType: "CE",
      lots: 1,
      strike: "ATM",
      target: "Absolute",
      targetValue: 0,
      stoploss: "Absolute",
      stoplossValue: 0,
      priceType: "LTP",
      depthIndex: 0,
      legOrderType: "Limit",
      startTime: "",
      waitAndTrade: 0,
      waitAndTradeLogic: "Absolute",
      dynamicHedge: false,
      onTargetAction: "REENTRY",
      onStoplossAction: "REENTRY",
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
    setLegs((prev) => [...prev, newLeg]);
    setLegCounter((prev) => prev + 1);
  };

  // Update leg
  const updateLeg = (legId, field, value) => {
    setLegs((prev) =>
      prev.map((leg) => (leg.id === legId ? { ...leg, [field]: value } : leg))
    );
  };

  // Update premium based strike config for a specific leg
  const updatePremiumStrikeConfig = (legId, field, value) => {
    setLegs((prev) =>
      prev.map((leg) =>
        leg.id === legId
          ? {
              ...leg,
              premiumBasedStrikeConfig: {
                ...leg.premiumBasedStrikeConfig,
                [field]: value,
              },
            }
          : leg
      )
    );
  };

  // Remove leg
  const removeLeg = (legId) => {
    setLegs((prev) => prev.filter((leg) => leg.id !== legId));
  };

  // Toggle button component with color coding
  const ToggleButton = ({ value, onChange, options, colorScheme }) => {
    const handleToggle = () => {
      // Find current index and toggle to next option
      const currentIndex = options.indexOf(value);
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex]);
    };

    // Get display label for the value
    const getDisplayLabel = () => {
      if (colorScheme === "buysell") {
        if (value === "BUY") return "B";
        if (value === "SELL") return "S";
      }
      return value;
    };

    // Get color classes based on colorScheme
    const getColorClasses = () => {
      if (!colorScheme) {
        return "bg-blue-500 hover:bg-blue-600 text-white border-blue-600";
      }

      if (colorScheme === "buysell") {
        if (value === "BUY") {
          return "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500";
        } else if (value === "SELL") {
          return "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500";
        }
      }

      if (colorScheme === "callput") {
        if (value === "CE") {
          return "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500";
        } else if (value === "PE") {
          return "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500";
        }
      }

      return "bg-blue-500 hover:bg-blue-600 text-white border-blue-600";
    };

    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`px-2 py-1 text-[0.6rem] font-medium rounded border transition-colors min-w-[40px] ${getColorClasses()}`}
      >
        {getDisplayLabel()}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-4 ">
      <div className="max-w-[130rem] mx-auto space-y-4">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-md font-bold text-gray-900 dark:text-white">
                Advanced Options Strategy Builder
              </h1>
              <p className="text-[0.6rem] text-gray-600 dark:text-gray-400 mt-1">
                Build and analyze complex options strategies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[0.6rem] text-green-500 font-medium">
                Live Data
              </span>
            </div>
          </div>
        </div>

        {/* Base Configuration Card */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-md font-semibold text-gray-900 dark:text-white">
                Base Configuration
              </h2>
            </div>
            <button
              onClick={addLeg}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[0.6rem] font-medium rounded-lg transition-colors"
            >
              + Add Leg
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-[0.6rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strategy Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baseConfig.strategyName}
                onChange={(e) =>
                  handleBaseConfigChange("strategyName", e.target.value)
                }
                placeholder="Enter strategy name (required)"
                required
                className="w-full text-[0.6rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lots
              </label>
              <input
                type="number"
                value={baseConfig.lots}
                onChange={(e) =>
                  handleBaseConfigChange("lots", parseInt(e.target.value) || 1)
                }
                className="w-full text-[0.6rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Underlying
              </label>
              <select
                value={baseConfig.underlying}
                onChange={(e) =>
                  handleBaseConfigChange("underlying", e.target.value)
                }
                className="w-full text-[0.6rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {underlyingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.6rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Execution Mode
              </label>
              <select
                value={baseConfig.executionMode}
                onChange={(e) =>
                  handleBaseConfigChange("executionMode", e.target.value)
                }
                className="w-full text-[0.6rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Live Mode">Live Mode</option>
                <option value="Simulation Mode">Simulation Mode</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="buyTradesFirst"
                checked={baseConfig.buyTradesFirst}
                onChange={(e) =>
                  handleBaseConfigChange("buyTradesFirst", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="buyTradesFirst"
                className="ml-2 text-[0.6rem] text-gray-700 dark:text-gray-300"
              >
                Buy Trades First
              </label>
            </div>
          </div>
        </div>

        {/* Legs Builder Card */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h2 className="text-md font-semibold text-gray-900 dark:text-white">
                Legs Builder ({legs.length} legs)
              </h2>
            </div>
            {legs.length > 0 && (
              <div className="text-[0.6rem] text-gray-500 dark:text-gray-400">
                Total legs: {legs.length}
              </div>
            )}
          </div>

          {legs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
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
              <p className="text-gray-500 dark:text-gray-400 text-[0.6rem]">
                No legs added yet. Click "Add Leg" to start building your
                strategy.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Leg ID
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Symbol
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Expiry
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Order
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Option
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Lots
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Strike
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Target
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Target Value
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Stop Loss
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Stop Loss Value
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Price Type
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Depth Index
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Order Type
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Start Time
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Wait & Trade Logic
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Wait & Trade
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Dynamic Hedge
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      On Target Action
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      On Stoploss Action
                    </th>
                    <th className="text-center p-1 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
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
                      <td className="p-1">
                        <div className="text-center">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[0.6rem] font-medium rounded">
                            {leg.legId}
                          </span>
                        </div>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.symbol}
                          onChange={(e) =>
                            updateLeg(leg.id, "symbol", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="NIFTY">NIFTY</option>
                          <option value="BANKNIFTY">BANKNIFTY</option>
                          <option value="FINNIFTY">FINNIFTY</option>
                          <option value="MIDCPNIFTY">MIDCPNIFTY</option>
                        </select>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.expiry}
                          onChange={(e) =>
                            updateLeg(leg.id, "expiry", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {expiryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <div className="flex justify-center">
                          <ToggleButton
                            value={leg.orderType}
                            onChange={(value) =>
                              updateLeg(leg.id, "orderType", value)
                            }
                            options={["BUY", "SELL"]}
                            colorScheme="buysell"
                          />
                        </div>
                      </td>
                      <td className="p-1">
                        <div className="flex justify-center">
                          <ToggleButton
                            value={leg.optionType}
                            onChange={(value) =>
                              updateLeg(leg.id, "optionType", value)
                            }
                            options={["CE", "PE"]}
                            colorScheme="callput"
                          />
                        </div>
                      </td>
                      <td className="p-1">
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
                          className="w-14 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                          min="1"
                          style={{ fontSize: "0.6rem" }}
                        />
                      </td>
                      <td className="p-1">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={leg.premiumBasedStrike || false}
                              onChange={(e) =>
                                updateLeg(
                                  leg.id,
                                  "premiumBasedStrike",
                                  e.target.checked
                                )
                              }
                              className="w-3 h-3 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-[0.7rem] text-gray-600 dark:text-gray-400">
                              Premium
                            </span>
                          </div>
                          {!leg.premiumBasedStrike ? (
                            <select
                              value={leg.strike}
                              onChange={(e) =>
                                updateLeg(leg.id, "strike", e.target.value)
                              }
                              className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              style={{ maxHeight: "200px", overflowY: "auto" }}
                              size="1"
                            >
                              {getStrikeOptions(leg.symbol).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPremiumStrikeModalLeg(leg.id)}
                              className="px-2 py-1 text-[0.6rem] bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                            >
                              Configure
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.target}
                          onChange={(e) =>
                            updateLeg(leg.id, "target", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {targetOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <div className="flex justify-center">
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
                            className="w-14 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01"
                            style={{ fontSize: "0.6rem" }}
                          />
                        </div>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.stoploss}
                          onChange={(e) =>
                            updateLeg(leg.id, "stoploss", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {stoplossOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <div className="flex justify-center">
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
                            className="w-14 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01"
                            style={{ fontSize: "0.6rem" }}
                          />
                        </div>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.priceType}
                          onChange={(e) =>
                            updateLeg(leg.id, "priceType", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {priceTypeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.depthIndex}
                          onChange={(e) =>
                            updateLeg(
                              leg.id,
                              "depthIndex",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.legOrderType || "Limit"}
                          onChange={(e) =>
                            updateLeg(leg.id, "legOrderType", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {orderTypeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="time"
                          value={leg.startTime}
                          onChange={(e) =>
                            updateLeg(leg.id, "startTime", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.waitAndTradeLogic}
                          onChange={(e) =>
                            updateLeg(
                              leg.id,
                              "waitAndTradeLogic",
                              e.target.value
                            )
                          }
                          className="w-auto text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Absolute">Absolute</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={leg.waitAndTrade}
                          onChange={(e) =>
                            updateLeg(
                              leg.id,
                              "waitAndTrade",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          step="0.1"
                          className="w-16 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                          placeholder="0 or -1.5"
                        />
                      </td>
                      <td className="p-1">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={leg.dynamicHedge || false}
                            onChange={(e) =>
                              updateLeg(
                                leg.id,
                                "dynamicHedge",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.onTargetAction || "REENTRY"}
                          onChange={(e) =>
                            updateLeg(leg.id, "onTargetAction", e.target.value)
                          }
                          className="w-auto text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {actionOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <select
                          value={leg.onStoplossAction || "REENTRY"}
                          onChange={(e) =>
                            updateLeg(
                              leg.id,
                              "onStoplossAction",
                              e.target.value
                            )
                          }
                          className="w-auto text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {actionOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeLeg(leg.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[0.6rem] font-medium rounded transition-colors"
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
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-[0.6rem] whitespace-nowrap transition-colors ${
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
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Execution Parameters
                </h3>

                {/* Cards in Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Form Parameters */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Form Parameters
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                              Strategy Tag
                            </td>
                            <td className="p-2">
                              <select
                                value={
                                  executionParams.strategyTag
                                    ? (() => {
                                        try {
                                          const parsed = JSON.parse(
                                            executionParams.strategyTag
                                          );
                                          return parsed.strategyTag?.id || "";
                                        } catch {
                                          return executionParams.strategyTag;
                                        }
                                      })()
                                    : ""
                                }
                                onChange={(e) =>
                                  handleExecutionParamChange(
                                    "strategyTag",
                                    e.target.value
                                  )
                                }
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={loadingTags}
                              >
                                <option value="">
                                  {loadingTags
                                    ? "Loading tags..."
                                    : "Select Tag"}
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
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Time Parameters
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                              Run On Days
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {daysOptions.map((day) => (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDaysChange(day)}
                                    className={`px-2 py-1 text-[0.6rem] rounded transition-colors ${
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-32 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-32 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-32 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
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
                          <th className="text-center p-3 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                            Parameter
                          </th>
                          <th className="text-center p-3 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-600">
                          <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
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
                              className="w-full text-[0.6rem] text-center p-3 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                          <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
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
                              className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mx-auto"
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
                      <div className="text-[0.6rem] text-orange-600 dark:text-orange-400 font-medium">
                        Current Target Configuration
                      </div>
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
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
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Stoploss Configuration
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mx-auto"
                                step="0.01"
                                placeholder="Enter stoploss value"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mx-auto"
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
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Square Off Options
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Option
                            </th>
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Enabled
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                    <div className="text-[0.6rem] text-red-600 dark:text-red-400 font-medium">
                      Current Stoploss Configuration
                    </div>
                    <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
                      Type: {stoplossSettings.stoplossType} | Value:{" "}
                      {stoplossSettings.stoplossValue} | Wait:{" "}
                      {stoplossSettings.stoplossWait}s
                    </div>
                    <div className="text-[0.6rem] text-gray-600 dark:text-gray-400 mt-1">
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
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Exit Configuration
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 mx-auto"
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
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Retry Settings
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mx-auto"
                                step="0.1"
                                placeholder="Wait time between retries"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mx-auto"
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
                    <div className="text-[0.6rem] text-yellow-600 dark:text-yellow-400 font-medium">
                      Current Exit Configuration
                    </div>
                    <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
                      Order Type: {exitSettings.exitOrderType} | Sell First:{" "}
                      {exitSettings.exitSellFirst ? "Yes" : "No"} | Hold Buy:{" "}
                      {exitSettings.holdBuyTime}s
                    </div>
                    <div className="text-[0.6rem] text-gray-600 dark:text-gray-400 mt-1">
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
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Hedge Parameters
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                                placeholder="Min distance"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                                placeholder="Max distance"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                                placeholder="Min premium"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
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
                                className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
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
                      <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                        Strike Configuration
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full max-w-md mx-auto">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-center p-3 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Parameter
                            </th>
                            <th className="text-center p-3 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-600">
                            <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
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
                                className="w-32 text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                                step="100"
                                min="100"
                                placeholder="Multiples of 100"
                              />
                            </td>
                          </tr>
                          {dynamicHedgeSettings.hedgeType ===
                            "fixed Distance" && (
                            <tr className="border-b border-gray-100 dark:border-gray-600">
                              <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                                Strike Distance
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={dynamicHedgeSettings.strikeDistance}
                                  onChange={(e) =>
                                    handleDynamicHedgeSettingsChange(
                                      "strikeDistance",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-32 text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                                  min="1"
                                  placeholder="Strike distance"
                                />
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
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
                        <div className="text-[0.6rem] text-blue-600 dark:text-blue-400 font-medium">
                          Current Strike Configuration
                        </div>
                        <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
                          Steps: {dynamicHedgeSettings.strikeSteps}
                          {dynamicHedgeSettings.hedgeType ===
                            "fixed Distance" && (
                            <>
                              {" "}
                              | Distance: {dynamicHedgeSettings.strikeDistance}
                            </>
                          )}
                          {" | Strike 500: "}
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
                    <div className="text-[0.6rem] text-green-600 dark:text-green-400 font-medium">
                      Current Dynamic Hedge Configuration
                    </div>
                    <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
                      Type: {dynamicHedgeSettings.hedgeType} | Distance:{" "}
                      {dynamicHedgeSettings.minHedgeDistance} -{" "}
                      {dynamicHedgeSettings.maxHedgeDistance} | Premium:{" "}
                      {dynamicHedgeSettings.minPremium} -{" "}
                      {dynamicHedgeSettings.maxPremium}
                    </div>
                    <div className="text-[0.6rem] text-gray-600 dark:text-gray-400 mt-1">
                      Strike Steps: {dynamicHedgeSettings.strikeSteps}
                      {dynamicHedgeSettings.hedgeType === "fixed Distance" && (
                        <> | Distance: {dynamicHedgeSettings.strikeDistance}</>
                      )}
                      {" | Strike 500: "}
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
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-6">
          {/* <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Strategy Deployment
            </h3>
            <p className="text-[0.6rem] text-gray-600 dark:text-gray-400">
              Deploy your complete strategy with all configured parameters
            </p>
          </div> */}

          {/* Strategy Summary and Action Buttons Side by Side */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Strategy Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center">
                <div className="text-[0.6rem] text-indigo-600 dark:text-indigo-400 font-medium">
                  Strategy ID
                </div>
                <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                  {baseConfig.strategyId}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <div className="text-[0.6rem] text-blue-600 dark:text-blue-400 font-medium">
                  Total Legs
                </div>
                <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                  {legs.length}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <div className="text-[0.6rem] text-green-600 dark:text-green-400 font-medium">
                  Execution Mode
                </div>
                <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                  {executionParams.legsExecution}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                <div className="text-[0.6rem] text-orange-600 dark:text-orange-400 font-medium">
                  Target Type
                </div>
                <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                  {targetSettings.targetType}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <button
                onClick={deployStrategy}
                disabled={isDeploying}
                className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[0.6rem] font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isDeploying ? "animate-pulse" : ""
                }`}
              >
                {isDeploying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deploying...
                  </>
                ) : (
                  "🚀 Deploy Strategy"
                )}
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
                    setDynamicHedgeSettings({
                      hedgeType: "premium Based",
                      minHedgeDistance: 0,
                      maxHedgeDistance: 0,
                      minPremium: 0.0,
                      maxPremium: 0.0,
                      strikeSteps: 100,
                      strike500: false,
                      strikeDistance: 1,
                    });
                    setDeploymentStatus(null);
                    setDeploymentMessage("");
                    setActiveTab("strategy");
                  }
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white text-[0.6rem] font-medium rounded-lg transition-colors"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Deployment Status Messages */}
          {deploymentStatus && (
            <div
              className={`mt-4 p-4 rounded-lg border ${
                deploymentStatus === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {deploymentStatus === "success" ? (
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <p
                  className={`text-[0.6rem] font-medium ${
                    deploymentStatus === "success"
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {deploymentMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Premium Based Strike Configuration Modal */}
        {premiumStrikeModalLeg !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              {(() => {
                const leg = legs.find((l) => l.id === premiumStrikeModalLeg);
                if (!leg) return null;

                return (
                  <>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Premium Based Strike - {leg.legId}
                      </h3>
                      <button
                        onClick={() => setPremiumStrikeModalLeg(null)}
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
                            updatePremiumStrikeConfig(
                              leg.id,
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
                            updatePremiumStrikeConfig(
                              leg.id,
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
                            updatePremiumStrikeConfig(
                              leg.id,
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
                                updatePremiumStrikeConfig(
                                  leg.id,
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
                                updatePremiumStrikeConfig(
                                  leg.id,
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
                                updatePremiumStrikeConfig(
                                  leg.id,
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
                                updatePremiumStrikeConfig(
                                  leg.id,
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
                        onClick={() => setPremiumStrikeModalLeg(null)}
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

export default AdvancedOptionsBuilder;
