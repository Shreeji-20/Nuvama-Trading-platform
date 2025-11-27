import React, { useState, useEffect, ChangeEvent } from "react";
import LegsConfigurationTable from "../components/LegsConfigurationTable";
import PremiumStrikeModal from "../components/PremiumStrikeModal";
import ActionConfigModal from "../components/ActionConfigModal";
import ExecutionParametersTab from "../components/ExecutionParametersTab";
import TargetSettingsTab from "../components/TargetSettingsTab";
import StoplossSettingsTab from "../components/StoplossSettingsTab";
import ExitSettingsTab from "../components/ExitSettingsTab";
import DynamicHedgeTab from "../components/DynamicHedgeTab";
import AtBrokerTab from "../components/AtBrokerTab";
import config from "../config/api";
import {
  symbolOptions,
  expiryOptions,
  underlyingOptions,
  priceTypeOptions,
  orderTypeOptions,
  targetOptions,
  stoplossOptions,
  actionOptions,
  tabs,
  productOptions,
  legsExecutionOptions,
  portfolioExecutionModeOptions,
  entryOrderTypeOptions,
  daysOptions,
  targetTypeOptions,
  stoplossTypeOptions,
  exitOrderTypeOptions,
  hedgeTypeOptions,
  createBaseConfigChangeHandler,
  createExecutionParamChangeHandler,
  createDaysChangeHandler,
  createTargetSettingsChangeHandler,
  createStoplossSettingsChangeHandler,
  createExitSettingsChangeHandler,
  createDynamicHedgeSettingsChangeHandler,
  createAtBrokerSettingsChangeHandler,
  createAddLegHandler,
  createCopyLegHandler,
  createUpdateLegHandler,
  createUpdatePremiumStrikeConfigHandler,
  createRemoveLegHandler,
  fetchStrategyTags,
  createDeployStrategyHandler,
} from "../hooks/AdvancedOptionsBuilderFunctions";
import type {
  Underlying,
  ExecutionMode,
  BaseConfig,
  PremiumBasedStrikeConfig,
  Leg,
  ExecutionParams,
  TargetSettings,
  StoplossSettings,
  ExitSettings,
  DynamicHedgeSettings,
  AtBrokerSettings,
  StrategyTag,
  DeploymentStatus,
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
    tradingState: "NONE",
    isSelectedForTrading: false,
    strategyState: "NONE",
  });

  // Legs state - Changed from array to dictionary
  const [legs, setLegs] = useState<Record<string, Leg>>({});
  const [activeTab, setActiveTab] = useState<string>("strategy");
  const [legCounter, setLegCounter] = useState<number>(1);
  const [premiumStrikeModalLeg, setPremiumStrikeModalLeg] = useState<
    string | null
  >(null);
  const [actionConfigModalState, setActionConfigModalState] = useState<{
    legId: string | null;
    actionType: "target" | "stoploss" | "squareoff" | null;
  }>({ legId: null, actionType: null });

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
  const API_BASE_URL = config.API_BASE_URL;

  // Target settings state
  const [targetSettings, setTargetSettings] = useState<TargetSettings>({
    targetType: "CombinedProfit",
    targetValue: 0,
  });

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

  // Effect to auto-populate strikeSteps with default values when legs change
  useEffect(() => {
    const uniqueSymbols = Array.from(
      new Set(Object.values(legs).map((leg) => leg.symbol))
    );

    // Default strike steps per symbol
    const defaultStrikeSteps: Record<string, number> = {
      NIFTY: 50,
      SENSEX: 100,
      BANKNIFTY: 100,
      FINNIFTY: 50,
    };

    // Check if strikeSteps needs updating
    const currentStrikeSteps = dynamicHedgeSettings.strikeSteps || {};
    let needsUpdate = false;
    const updatedStrikeSteps: Record<string, number> = {
      ...currentStrikeSteps,
    };

    // Add missing symbols with default values
    uniqueSymbols.forEach((symbol) => {
      if (!(symbol in updatedStrikeSteps)) {
        updatedStrikeSteps[symbol] = defaultStrikeSteps[symbol] ?? 50;
        needsUpdate = true;
      }
    });

    // Update state if needed
    if (needsUpdate) {
      setDynamicHedgeSettings((prev) => ({
        ...prev,
        strikeSteps: updatedStrikeSteps,
      }));
    }
  }, [legs]); // Run whenever legs change

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

  // Create handler functions using the imported factory functions
  const handleBaseConfigChange = createBaseConfigChangeHandler(
    setBaseConfig,
    setLegs
  );

  const handleExecutionParamChange =
    createExecutionParamChangeHandler(setExecutionParams);

  const handleTargetSettingsChange =
    createTargetSettingsChangeHandler(setTargetSettings);

  const handleStoplossSettingsChange =
    createStoplossSettingsChangeHandler(setStoplossSettings);

  const handleExitSettingsChange =
    createExitSettingsChangeHandler(setExitSettings);

  const handleDynamicHedgeSettingsChange =
    createDynamicHedgeSettingsChangeHandler(setDynamicHedgeSettings);

  const handleAtBrokerSettingsChange =
    createAtBrokerSettingsChangeHandler(setAtBrokerSettings);

  const addLeg = createAddLegHandler(setLegs, baseConfig);
  const copyLeg = createCopyLegHandler(setLegs);
  const updateLeg = createUpdateLegHandler(setLegs);
  const updatePremiumStrikeConfig =
    createUpdatePremiumStrikeConfigHandler(setLegs);
  const removeLeg = createRemoveLegHandler(setLegs);

  const deployStrategy = createDeployStrategyHandler(
    API_BASE_URL,
    baseConfig,
    legs,
    executionParams,
    targetSettings,
    stoplossSettings,
    exitSettings,
    dynamicHedgeSettings,
    atBrokerSettings,
    setIsDeploying,
    setDeploymentStatus,
    setDeploymentMessage
  );

  // Fetch tags on component mount
  useEffect(() => {
    fetchStrategyTags(API_BASE_URL, setLoadingTags, setAvailableTags);
  }, [API_BASE_URL]);

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
              <p className="text-[0.7rem] text-gray-600 dark:text-gray-400 mt-1">
                Build and analyze complex options strategies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[0.7rem] text-green-500 font-medium">
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
              <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full text-[0.7rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lots
              </label>
              <input
                type="number"
                value={baseConfig.lots}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleBaseConfigChange("lots", parseInt(e.target.value) || 1)
                }
                className="w-full text-[0.7rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full text-[0.7rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {underlyingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full text-[0.7rem] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Live Mode">Live Mode</option>
                <option value="Simulation Mode">Simulation Mode</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trading Options
              </label>
              <div className="flex items-center h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
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
                  className="ml-2 text-[0.7rem] text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  Buy Trades First
                </label>
              </div>
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors"
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
              <p className="text-gray-500 dark:text-gray-400 text-[0.7rem]">
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
              onActionConfigModalOpen={(
                legId: string,
                actionType: "target" | "stoploss" | "squareoff"
              ) => {
                setActionConfigModalState({ legId, actionType });
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
                  className={`py-2 px-1 border-b-2 font-medium text-[0.7rem] whitespace-nowrap transition-colors ${
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
                <div className="text-[0.7rem] text-indigo-600 dark:text-indigo-400 font-medium">
                  Strategy ID
                </div>
                <div className="text-[0.7rem] font-semibold text-gray-900 dark:text-white">
                  {baseConfig.strategyId}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <div className="text-[0.7rem] text-blue-600 dark:text-blue-400 font-medium">
                  Total Legs
                </div>
                <div className="text-[0.7rem] font-semibold text-gray-900 dark:text-white">
                  {Object.keys(legs).length}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <div className="text-[0.7rem] text-green-600 dark:text-green-400 font-medium">
                  Execution Mode
                </div>
                <div className="text-[0.7rem] font-semibold text-gray-900 dark:text-white">
                  {executionParams.legsExecution}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                <div className="text-[0.7rem] text-orange-600 dark:text-orange-400 font-medium">
                  Target Type
                </div>
                <div className="text-[0.7rem] font-semibold text-gray-900 dark:text-white">
                  {targetSettings.targetType}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <button
                onClick={deployStrategy}
                disabled={isDeploying}
                className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[0.7rem] font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
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
                      tradingState: "NONE",
                      isSelectedForTrading: false,
                      strategyState: "NONE",
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
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors"
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
                  className={`text-[0.7rem] font-medium ${
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

        {/* Action Config Modal */}
        <ActionConfigModal
          leg={
            actionConfigModalState.legId
              ? legs[actionConfigModalState.legId]
              : null
          }
          isOpen={
            actionConfigModalState.legId !== null &&
            actionConfigModalState.actionType !== null
          }
          onClose={() =>
            setActionConfigModalState({ legId: null, actionType: null })
          }
          actionType={actionConfigModalState.actionType || "target"}
          onConfigChange={(field: string, value: any) => {
            if (actionConfigModalState.legId !== null) {
              const legId = actionConfigModalState.legId;
              const actionType = actionConfigModalState.actionType!;

              setLegs((prev) => {
                if (!prev[legId]) return prev;

                // Determine which config to update
                const configKey =
                  actionType === "target"
                    ? "onTargetActionConfig"
                    : actionType === "stoploss"
                    ? "onStoplossActionConfig"
                    : "onSquareOffActionConfig";

                // Ensure action config exists
                let updatedLeg = { ...prev[legId] };
                if (!updatedLeg[configKey]) {
                  updatedLeg[configKey] = {
                    actionType: "NONE",
                    actionCount: 1,
                    orderAtBroker: false,
                    slOrderAdjust: {
                      minPoints: 0,
                      maxPercentage: 0,
                    },
                  };
                }

                updatedLeg = {
                  ...updatedLeg,
                  [configKey]: {
                    ...updatedLeg[configKey],
                    [field]: value,
                  },
                };

                // Also update the legacy field for backward compatibility
                if (field === "actionType") {
                  if (actionType === "target") {
                    updatedLeg.onTargetAction = value;
                  } else if (actionType === "stoploss") {
                    updatedLeg.onStoplossAction = value;
                  } else if (actionType === "squareoff") {
                    updatedLeg.onSquareOffAction = value;
                  }
                }

                return {
                  ...prev,
                  [legId]: updatedLeg,
                };
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default AdvancedOptionsBuilder;
