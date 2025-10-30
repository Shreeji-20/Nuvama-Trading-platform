import React, { useState, useEffect, ChangeEvent } from "react";
import LegsConfigurationTable from "../components/LegsConfigurationTable";
import PremiumStrikeModal from "../components/PremiumStrikeModal";
import StatusBadge from "../components/StatusBadge";
import ExecutionParametersTab from "../components/ExecutionParametersTab";
import TargetSettingsTab from "../components/TargetSettingsTab";
import StoplossSettingsTab from "../components/StoplossSettingsTab";
import ExitSettingsTab from "../components/ExitSettingsTab";
import DynamicHedgeTab from "../components/DynamicHedgeTab";
import AtBrokerTab from "../components/AtBrokerTab";
import type {
  Underlying,
  ExecutionMode,
  PriceType,
  OrderType,
  Action,
  OptionType,
  TargetStoplossType,
  ActionType,
  Product,
  LegsExecution,
  PortfolioExecutionMode,
  EntryOrderType,
  DayOfWeek,
  TargetType,
  StoplossType,
  ExitOrderType,
  HedgeType,
  StrikeType,
  SearchSide,
  Condition,
  BaseConfig,
  PremiumBasedStrikeConfig,
  Leg,
  ExecutionParams,
  TargetSettings,
  StoplossSettings,
  ExitSettings,
  DynamicHedgeSettings,
  AtBrokerSettings,
  StrategyConfiguration,
  StrategyTag,
  Tab,
  DeploymentStatus,
  ToggleButtonProps,
} from "../types/strategy.types";

const AdvancedOptionsBuilder: React.FC = () => {
  // Strategy tags state
  const [availableTags, setAvailableTags] = useState<StrategyTag[]>([]);
  const [loadingTags, setLoadingTags] = useState<boolean>(false);

  // Base configuration state
  const [baseConfig, setBaseConfig] = useState<BaseConfig>({
    strategyId: `STRATEGY_${Date.now().toString().slice(-6)}`,
    strategyName: "",
    lots: 1,
    underlying: "Spot",
    buyTradesFirst: false,
    executionMode: "Live Mode",
  });

  // Legs state - Changed from array to dictionary
  const [legs, setLegs] = useState<Record<string, Leg>>({});
  const [activeTab, setActiveTab] = useState<string>("strategy");
  const [legCounter, setLegCounter] = useState<number>(1);
  const [premiumStrikeModalLeg, setPremiumStrikeModalLeg] = useState<
    string | null
  >(null);

  // Options for dropdowns
  const symbolOptions: string[] = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];
  const expiryOptions: number[] = [0, 1, 2, 3, 4, 5];
  const dynamicExpiryOptions: string[] = [
    "None",
    "Current Week",
    "Next Week",
    "Next Week+1",
    "Monthly",
  ];
  const underlyingOptions: Underlying[] = ["Spot", "Futures"];
  const priceTypeOptions: PriceType[] = [
    "LTP",
    "BIDASK",
    "DEPTH",
    "BID",
    "ASK",
  ];
  const orderTypeOptions: OrderType[] = ["LIMIT", "MARKET"];

  // Generate dynamic strike options based on symbol
  const getStrikeOptions = (symbol: string): string[] => {
    const stepSize = symbol === "NIFTY" || symbol === "FINNIFTY" ? 50 : 100;
    const strikes: string[] = [];

    for (let i = -50; i <= 50; i++) {
      const offset = i * stepSize;
      if (offset === 0) {
        strikes.push("ATM");
      } else if (offset > 0) {
        strikes.push(`ATM+${offset}`);
      } else {
        strikes.push(`ATM${offset}`);
      }
    }

    return strikes;
  };

  const targetOptions: TargetStoplossType[] = [
    "NONE",
    "ABSOLUTE",
    "PERCENTAGE",
    "POINTS",
  ];
  const stoplossOptions: TargetStoplossType[] = [
    "NONE",
    "ABSOLUTE",
    "PERCENTAGE",
    "POINTS",
  ];
  const depthOptions: number[] = [1, 2, 3, 4, 5];
  const actionOptions: ActionType[] = ["NONE", "REENTRY", "REEXECUTE"];

  const tabs: Tab[] = [
    { id: "strategy", label: "Execution Parameters" },
    { id: "analysis", label: "Target Settings" },
    { id: "stoploss", label: "Stoploss Settings" },
    { id: "exit", label: "Exit Settings" },
    { id: "hedge", label: "Dynamic Hedge" },
    { id: "atbroker", label: "At Broker" },
    { id: "backtest", label: "Backtest" },
    { id: "deploy", label: "Deploy" },
  ];

  // Execution parameters state
  const [executionParams, setExecutionParams] = useState<ExecutionParams>({
    product: "NRML",
    strategyTag: "",
    legsExecution: "Parallel",
    portfolioExecutionMode: "startTime",
    entryOrderType: "LIMIT",
    runOnDays: [],
    startTime: "",
    endTime: "",
    squareoffTime: "",
  });

  // API Base URL
  const API_BASE_URL = "http://localhost:8000";

  // Options for execution parameters
  const productOptions: Product[] = ["NRML", "MIS", "CNC"];
  const legsExecutionOptions: LegsExecution[] = [
    "Parallel",
    "One by One",
    "Sequential",
  ];
  const portfolioExecutionModeOptions: PortfolioExecutionMode[] = [
    "startTime",
    "underlyingPremium",
    "combinedPremium",
  ];
  const entryOrderTypeOptions: EntryOrderType[] = [
    "LIMIT",
    "MARKET",
    "SL",
    "SL-M",
  ];
  const daysOptions: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Target settings state
  const [targetSettings, setTargetSettings] = useState<TargetSettings>({
    targetType: "CombinedProfit",
    targetValue: 0,
  });

  // Options for target settings
  const targetTypeOptions: TargetType[] = [
    "CombinedProfit",
    "IndividualLegProfit",
    "PercentageProfit",
    "PremiumTarget",
    "UnderlyingMovement",
  ];

  // Options for stoploss settings
  const stoplossTypeOptions: StoplossType[] = [
    "CombinedLoss",
    "IndividualLegLoss",
    "PercentageLoss",
    "PremiumLoss",
    "UnderlyingMovement",
  ];

  // Options for exit settings
  const exitOrderTypeOptions: ExitOrderType[] = [
    "LIMIT",
    "MARKET",
    "SL",
    "SL-M",
    "SL-L",
  ];

  // Stoploss settings state
  const [stoplossSettings, setStoplossSettings] = useState<StoplossSettings>({
    stoplossType: "CombinedProfit",
    stoplossValue: 0,
    stoplossWait: 0,
    sqrOffOnlyLossLegs: false,
    sqrOffOnlyProfitLegs: false,
  });

  // Exit settings state
  const [exitSettings, setExitSettings] = useState<ExitSettings>({
    exitOrderType: "LIMIT",
    exitSellFirst: false,
    holdBuyTime: 0,
    waitBtwnRetry: 0,
    maxWaitTime: 0,
  });

  // Dynamic hedge settings state
  const [dynamicHedgeSettings, setDynamicHedgeSettings] =
    useState<DynamicHedgeSettings>({
      hedgeType: "premium Based",
      minHedgeDistance: 0,
      maxHedgeDistance: 0,
      minPremium: 0.0,
      maxPremium: 0.0,
      strikeSteps: {},
      strike500: false,
      strikeDistance: 1,
    });

  // At Broker settings state
  const [atBrokerSettings, setAtBrokerSettings] = useState<AtBrokerSettings>({
    legSlAtBroker: false,
    legTpAtBroker: false,
    legReEntryAtBroker: false,
    legWnTAtBroker: false,
    slOrderTriggerAdjust: {
      minPoint: 0,
      maxPercentage: 0,
    },
  });

  // API integration states
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploymentStatus, setDeploymentStatus] =
    useState<DeploymentStatus>(null);
  const [deploymentMessage, setDeploymentMessage] = useState<string>("");

  // Options for dynamic hedge settings
  const hedgeTypeOptions: HedgeType[] = ["premium Based", "fixed Distance"];

  // Handle base config changes
  const handleBaseConfigChange = <K extends keyof BaseConfig>(
    field: K,
    value: BaseConfig[K]
  ): void => {
    setBaseConfig((prev) => ({ ...prev, [field]: value }));

    if (field === "strategyId" || field === "strategyName") {
      setLegs((prev) => {
        const updated: Record<string, Leg> = {};
        Object.entries(prev).forEach(([legId, leg]) => {
          updated[legId] = { ...leg, [field]: value };
        });
        return updated;
      });
    }
  };

  // Generate new strategy ID
  const generateNewStrategyId = (): void => {
    const newStrategyId = `STRATEGY_${Date.now().toString().slice(-6)}`;
    setBaseConfig((prev) => ({
      ...prev,
      strategyId: newStrategyId,
    }));

    setLegs((prev) => {
      const updated: Record<string, Leg> = {};
      Object.entries(prev).forEach(([legId, leg]) => {
        updated[legId] = { ...leg, strategyId: newStrategyId };
      });
      return updated;
    });
  };

  // Fetch available strategy tags
  const fetchStrategyTags = async (): Promise<void> => {
    try {
      setLoadingTags(true);
      const response = await fetch(`${API_BASE_URL}/strategy-tags/list`);
      if (response.ok) {
        const tags: StrategyTag[] = await response.json();
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
  const handleExecutionParamChange = <K extends keyof ExecutionParams>(
    field: K,
    value: ExecutionParams[K]
  ): void => {
    setExecutionParams((prev) => ({ ...prev, [field]: value }));
  };

  // Handle days selection (multiple)
  const handleDaysChange = (day: DayOfWeek): void => {
    setExecutionParams((prev) => ({
      ...prev,
      runOnDays: prev.runOnDays.includes(day)
        ? prev.runOnDays.filter((d) => d !== day)
        : [...prev.runOnDays, day],
    }));
  };

  // Handle target settings changes
  const handleTargetSettingsChange = <K extends keyof TargetSettings>(
    field: K,
    value: TargetSettings[K]
  ): void => {
    setTargetSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle stoploss settings changes
  const handleStoplossSettingsChange = <K extends keyof StoplossSettings>(
    field: K,
    value: StoplossSettings[K]
  ): void => {
    setStoplossSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle exit settings changes
  const handleExitSettingsChange = <K extends keyof ExitSettings>(
    field: K,
    value: ExitSettings[K]
  ): void => {
    setExitSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle dynamic hedge settings changes
  const handleDynamicHedgeSettingsChange = <
    K extends keyof DynamicHedgeSettings
  >(
    field: K,
    value: DynamicHedgeSettings[K]
  ): void => {
    setDynamicHedgeSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Handle At Broker settings changes
  const handleAtBrokerSettingsChange = <K extends keyof AtBrokerSettings>(
    field: K,
    value: AtBrokerSettings[K]
  ): void => {
    setAtBrokerSettings((prev) => ({ ...prev, [field]: value }));
  };

  // API deployment function
  const deployStrategy = async (): Promise<void> => {
    try {
      setIsDeploying(true);
      setDeploymentStatus(null);
      setDeploymentMessage("");

      if (!baseConfig.strategyName || baseConfig.strategyName.trim() === "") {
        throw new Error(
          "Strategy Name is required. Please enter a strategy name in Base Configuration."
        );
      }

      const legsArray = Object.values(legs);
      if (legsArray.length === 0) {
        throw new Error("At least one leg is required to deploy the strategy");
      }

      for (const leg of legsArray) {
        if (!leg.symbol) {
          throw new Error(`Symbol is required for Leg ${leg.legId}`);
        }
        if (leg.expiry === undefined || leg.expiry === null) {
          throw new Error(`Expiry is required for Leg ${leg.legId}`);
        }
        if (!leg.priceType) {
          throw new Error(`Price Type is required for Leg ${leg.legId}`);
        }
        if (!leg.action) {
          throw new Error(`Action is required for Leg ${leg.legId}`);
        }
        if (!leg.orderType) {
          throw new Error(`Order Type is required for Leg ${leg.legId}`);
        }
      }

      // Transform legs array to dict format with legId as key
      const transformedLegsDict: Record<string, any> = {};
      legsArray.forEach((leg) => {
        const transformed: any = { ...leg };

        console.log("Original leg:", leg);

        if (
          transformed.orderType === "BUY" ||
          transformed.orderType === "SELL"
        ) {
          console.log("Transforming old structure leg...");
          transformed.action = transformed.orderType;
          transformed.orderType =
            transformed.legOrderType || leg.orderType || "LIMIT";
          delete transformed.legOrderType;
        }

        transformed.action = transformed.action || "BUY";
        transformed.orderType = transformed.orderType || "LIMIT";
        transformed.target = transformed.target || "NONE";
        transformed.targetValue =
          transformed.targetValue !== undefined ? transformed.targetValue : 0;
        transformed.stoploss = transformed.stoploss || "NONE";
        transformed.stoplossValue =
          transformed.stoplossValue !== undefined
            ? transformed.stoplossValue
            : 0;
        transformed.priceType = transformed.priceType || "BIDASK";
        transformed.depthIndex = transformed.depthIndex || 1;
        transformed.waitAndTrade =
          transformed.waitAndTrade !== undefined ? transformed.waitAndTrade : 0;
        transformed.waitAndTradeLogic = transformed.waitAndTradeLogic || "NONE";
        transformed.onTargetAction = transformed.onTargetAction || "NONE";
        transformed.onStoplossAction = transformed.onStoplossAction || "NONE";
        transformed.dynamicHedge =
          transformed.dynamicHedge !== undefined
            ? transformed.dynamicHedge
            : false;
        transformed.premiumBasedStrike =
          transformed.premiumBasedStrike !== undefined
            ? transformed.premiumBasedStrike
            : false;

        console.log("Transformed leg:", transformed);
        transformedLegsDict[leg.legId] = transformed;
      });

      const strategyData: StrategyConfiguration = {
        baseConfig,
        legs: transformedLegsDict,
        executionParams,
        targetSettings,
        stoplossSettings,
        exitSettings,
        dynamicHedgeSettings,
        atBrokerSettings,
        timestamp: new Date().toISOString(),
      };

      console.log("Deploying Strategy Data:", strategyData);

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

      setTimeout(() => {
        setDeploymentStatus(null);
        setDeploymentMessage("");
      }, 5000);
    } catch (error) {
      console.error("Strategy Deployment Error:", error);
      setDeploymentStatus("error");
      setDeploymentMessage(
        (error as Error).message ||
          "Failed to deploy strategy. Please check your configuration and try again."
      );

      setTimeout(() => {
        setDeploymentStatus(null);
        setDeploymentMessage("");
      }, 8000);
    } finally {
      setIsDeploying(false);
    }
  };

  // Add new leg
  const addLeg = (): void => {
    // Find the next available leg ID
    const existingLegNumbers = Object.values(legs)
      .map((leg) => {
        const match = leg.legId?.match(/LEG_(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .sort((a, b) => a - b);

    let nextLegNumber = 1;
    for (const num of existingLegNumbers) {
      if (num === nextLegNumber) {
        nextLegNumber++;
      } else {
        break;
      }
    }

    const legId = `LEG_${nextLegNumber.toString().padStart(3, "0")}`;
    const newLeg: Leg = {
      id: Date.now(),
      legId: legId,
      strategyId: baseConfig.strategyId,
      strategyName: baseConfig.strategyName,
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
    setLegs((prev) => ({ ...prev, [legId]: newLeg }));
  };

  // Copy existing leg
  const copyLeg = (legIdToCopy: string): void => {
    const legToCopy = legs[legIdToCopy];
    if (legToCopy) {
      // Find the next available leg ID
      const existingLegNumbers = Object.values(legs)
        .map((leg) => {
          const match = leg.legId?.match(/LEG_(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .sort((a, b) => a - b);

      let nextLegNumber = 1;
      for (const num of existingLegNumbers) {
        if (num === nextLegNumber) {
          nextLegNumber++;
        } else {
          break;
        }
      }

      const newLegId = `LEG_${nextLegNumber.toString().padStart(3, "0")}`;
      const newLeg: Leg = {
        ...legToCopy,
        id: Date.now(),
        legId: newLegId,
      };
      setLegs((prev) => ({ ...prev, [newLegId]: newLeg }));
    }
  };

  // Update leg
  const updateLeg = <K extends keyof Leg>(
    legId: string,
    field: K,
    value: Leg[K]
  ): void => {
    setLegs((prev) => {
      if (!prev[legId]) return prev;
      return {
        ...prev,
        [legId]: { ...prev[legId], [field]: value },
      };
    });
  };

  // Update premium based strike config for a specific leg
  const updatePremiumStrikeConfig = <K extends keyof PremiumBasedStrikeConfig>(
    legId: string,
    field: K,
    value: PremiumBasedStrikeConfig[K]
  ): void => {
    setLegs((prev) => {
      if (!prev[legId]) return prev;
      return {
        ...prev,
        [legId]: {
          ...prev[legId],
          premiumBasedStrikeConfig: {
            ...prev[legId].premiumBasedStrikeConfig,
            [field]: value,
          },
        },
      };
    });
  };

  // Remove leg
  const removeLeg = (legId: string): void => {
    setLegs((prev) => {
      const updated = { ...prev };
      delete updated[legId];
      return updated;
    });
  };

  // Toggle button component with color coding
  const ToggleButton: React.FC<ToggleButtonProps> = ({
    value,
    onChange,
    options,
    colorScheme,
  }) => {
    const handleToggle = (): void => {
      const currentIndex = options.indexOf(value);
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex]);
    };

    const getDisplayLabel = (): string => {
      if (colorScheme === "buysell") {
        if (value === "BUY") return "B";
        if (value === "SELL") return "S";
      }
      return value;
    };

    const getColorClasses = (): string => {
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-[0.6rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strategy Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baseConfig.strategyName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleBaseConfigChange(
                    "underlying",
                    e.target.value as Underlying
                  )
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
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleBaseConfigChange(
                    "executionMode",
                    e.target.value as ExecutionMode
                  )
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                Legs Builder ({Object.keys(legs).length} legs)
              </h2>
            </div>
            <button
              onClick={addLeg}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[0.6rem] font-medium rounded-lg transition-colors"
            >
              + Add Leg
            </button>
          </div>

          {Object.keys(legs).length === 0 ? (
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
            <LegsConfigurationTable
              legs={legs}
              isEditing={true}
              onLegChange={(legId: string, field: string, value: any) => {
                updateLeg(legId, field as keyof Leg, value);
              }}
              onDeleteLeg={(legId: string) => {
                removeLeg(legId);
              }}
              onCopyLeg={(legId: string) => {
                copyLeg(legId);
              }}
              onAddLeg={addLeg}
              onPremiumStrikeModalOpen={(legId: string) => {
                setPremiumStrikeModalLeg(legId);
              }}
              symbolOptions={symbolOptions}
              expiryOptions={expiryOptions}
              targetOptions={targetOptions}
              stoplossOptions={stoplossOptions}
              priceTypeOptions={priceTypeOptions}
              actionOptions={actionOptions}
              orderTypeOptions={orderTypeOptions}
              strategyId={baseConfig.strategyId}
            />
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
              <ExecutionParametersTab
                executionParams={executionParams}
                isEditing={true}
                onChange={handleExecutionParamChange as any}
                availableTags={availableTags as any}
                loadingTags={loadingTags}
                productOptions={productOptions as any}
                legsExecutionOptions={legsExecutionOptions as any}
                portfolioExecutionModeOptions={
                  portfolioExecutionModeOptions as any
                }
                entryOrderTypeOptions={entryOrderTypeOptions as any}
                daysOptions={daysOptions as any}
              />
            )}

            {activeTab === "analysis" && (
              <TargetSettingsTab
                targetSettings={targetSettings}
                isEditing={true}
                onChange={handleTargetSettingsChange as any}
                targetTypeOptions={targetTypeOptions as any}
              />
            )}

            {activeTab === "stoploss" && (
              <StoplossSettingsTab
                stoplossSettings={stoplossSettings}
                isEditing={true}
                onChange={handleStoplossSettingsChange as any}
                stoplossTypeOptions={stoplossTypeOptions as any}
              />
            )}

            {activeTab === "exit" && (
              <ExitSettingsTab
                exitSettings={exitSettings}
                isEditing={true}
                onChange={handleExitSettingsChange as any}
                exitOrderTypeOptions={exitOrderTypeOptions as any}
              />
            )}

            {activeTab === "hedge" && (
              <DynamicHedgeTab
                dynamicHedgeSettings={dynamicHedgeSettings}
                legs={legs}
                isEditing={true}
                onChange={handleDynamicHedgeSettingsChange as any}
                hedgeTypeOptions={hedgeTypeOptions as any}
              />
            )}

            {activeTab === "atbroker" && (
              <AtBrokerTab
                atBrokerSettings={atBrokerSettings}
                isEditing={true}
                onChange={handleAtBrokerSettingsChange as any}
              />
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
                  {Object.keys(legs).length}
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
                      strategyName: "",
                      lots: 1,
                      underlying: "Spot",
                      buyTradesFirst: false,
                      executionMode: "Live Mode",
                    });
                    setLegs({});
                    setLegCounter(1);
                    setExecutionParams({
                      product: "NRML",
                      strategyTag: "",
                      legsExecution: "Parallel",
                      portfolioExecutionMode: "startTime",
                      entryOrderType: "LIMIT",
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
                      exitOrderType: "LIMIT",
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
                      strikeSteps: {},
                      strike500: false,
                      strikeDistance: 1,
                    });
                    setAtBrokerSettings({
                      legSlAtBroker: false,
                      legTpAtBroker: false,
                      legReEntryAtBroker: false,
                      legWnTAtBroker: false,
                      slOrderTriggerAdjust: {
                        minPoint: 0,
                        maxPercentage: 0,
                      },
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
        <PremiumStrikeModal
          leg={premiumStrikeModalLeg ? legs[premiumStrikeModalLeg] : null}
          isOpen={premiumStrikeModalLeg !== null}
          onClose={() => setPremiumStrikeModalLeg(null)}
          onConfigChange={(field: string, value: any) => {
            if (premiumStrikeModalLeg !== null) {
              updatePremiumStrikeConfig(
                premiumStrikeModalLeg,
                field as keyof PremiumBasedStrikeConfig,
                value
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default AdvancedOptionsBuilder;
