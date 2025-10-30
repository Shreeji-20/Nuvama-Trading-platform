// Type definitions based on strategy_config.py Pydantic models

// Literal types matching Python Literals
export type Underlying = "Spot" | "Futures";
export type ExecutionMode = "Live Mode" | "Simulation Mode";
export type PriceType = "LTP" | "BIDASK" | "DEPTH" | "BID" | "ASK";
export type OrderType = "LIMIT" | "MARKET";
export type Action = "BUY" | "SELL";
export type OptionType = "CE" | "PE";
export type TargetStoplossType = "NONE" | "ABSOLUTE" | "PERCENTAGE" | "POINTS";
export type ActionType = "NONE" | "REENTRY" | "REEXECUTE";
export type Product = "NRML" | "MIS" | "CNC";
export type LegsExecution = "Parallel" | "One by One" | "Sequential";
export type PortfolioExecutionMode =
  | "startTime"
  | "underlyingPremium"
  | "combinedPremium";
export type EntryOrderType = "LIMIT" | "MARKET" | "SL" | "SL-M";
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
export type TargetType =
  | "CombinedProfit"
  | "IndividualLegProfit"
  | "PercentageProfit"
  | "PremiumTarget"
  | "UnderlyingMovement";
export type StoplossType =
  | "CombinedLoss"
  | "CombinedProfit"
  | "IndividualLegLoss"
  | "PercentageLoss"
  | "PremiumLoss"
  | "UnderlyingMovement";
export type ExitOrderType = "LIMIT" | "MARKET" | "SL" | "SL-M" | "SL-L";
export type HedgeType = "premium Based" | "fixed Distance";
export type StrikeType = "NearestPremium" | "premium";
export type SearchSide = "ITM" | "OTM" | "BOTH";
export type Condition = "Greaterthanequal" | "lessthanequal";

// Base configuration interface
export interface BaseConfig {
  strategyId: string;
  strategyName: string;
  lots: number;
  underlying: Underlying;
  buyTradesFirst: boolean;
  executionMode: ExecutionMode;
}

// Premium based strike configuration interface
export interface PremiumBasedStrikeConfig {
  strikeType: StrikeType;
  maxDepth: number;
  searchSide: SearchSide;
  value: number;
  condition: Condition;
  between: number;
  and: number;
}

// Leg interface
export interface Leg {
  id: number; // Internal unique identifier for React
  legId: string; // User-friendly leg ID
  strategyId: string;
  strategyName: string;
  symbol: string;
  expiry: number;
  priceType: PriceType;
  depthIndex: number;
  orderType: OrderType;
  action: Action;
  optionType: OptionType;
  lots: number;
  strike: string;
  target: TargetStoplossType;
  targetValue: number | string; // Allow string for intermediate input states
  stoploss: TargetStoplossType;
  stoplossValue: number | string; // Allow string for intermediate input states
  startTime: string;
  waitAndTrade: number | string; // Allow string for intermediate input states
  waitAndTradeLogic: TargetStoplossType;
  dynamicHedge: boolean;
  onTargetAction: ActionType;
  onStoplossAction: ActionType;
  premiumBasedStrike: boolean;
  premiumBasedStrikeConfig: PremiumBasedStrikeConfig;
  hedgeSelectedStrike?: number | null;
  initialPrice?: number | null;
  selectedStrike?: number | null;
}

// Execution parameters interface
export interface ExecutionParams {
  product: Product;
  strategyTag: string;
  legsExecution: LegsExecution;
  portfolioExecutionMode: PortfolioExecutionMode;
  entryOrderType: EntryOrderType;
  runOnDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  squareoffTime: string;
}

// Target settings interface
export interface TargetSettings {
  targetType: TargetType;
  targetValue: number;
}

// Stoploss settings interface
export interface StoplossSettings {
  stoplossType: StoplossType;
  stoplossValue: number;
  stoplossWait: number;
  sqrOffOnlyLossLegs: boolean;
  sqrOffOnlyProfitLegs: boolean;
}

// Exit settings interface
export interface ExitSettings {
  exitOrderType: ExitOrderType;
  exitSellFirst: boolean;
  holdBuyTime: number;
  waitBtwnRetry: number;
  maxWaitTime: number;
}

// Dynamic hedge settings interface
export interface DynamicHedgeSettings {
  hedgeType: HedgeType;
  minHedgeDistance: number;
  maxHedgeDistance: number;
  minPremium: number;
  maxPremium: number;
  strikeSteps: Record<string, number>; // Per-symbol strike steps dictionary
  strike500: boolean;
  strikeDistance: number;
}

// At Broker settings interface
export interface AtBrokerSettings {
  legSlAtBroker: boolean;
  legTpAtBroker: boolean;
  legReEntryAtBroker: boolean;
  legWnTAtBroker: boolean;
  slOrderTriggerAdjust: {
    minPoint: number;
    maxPercentage: number;
  };
}

// Complete strategy configuration interface
export interface StrategyConfiguration {
  baseConfig: BaseConfig;
  legs: Record<string, Leg>; // Changed from Leg[] to Record<string, Leg>
  executionParams: ExecutionParams;
  targetSettings: TargetSettings;
  stoplossSettings: StoplossSettings;
  exitSettings: ExitSettings;
  dynamicHedgeSettings: DynamicHedgeSettings;
  atBrokerSettings?: AtBrokerSettings;
  timestamp: string;
}

// Strategy tag interface
export interface StrategyTag {
  id: string;
  tagName: string;
  userMultipliers?: Record<string, number>;
}

// Tab interface for UI
export interface Tab {
  id: string;
  label: string;
}

// Deployment status type
export type DeploymentStatus = "success" | "error" | null;

// Toggle button props interface
export interface ToggleButtonProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  colorScheme?: "buysell" | "callput";
}

// API Response interfaces
export interface StrategyResponse {
  message: string;
  strategyId: string;
  redisKey: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  detail: string | { message: string; errors: any[] };
}
