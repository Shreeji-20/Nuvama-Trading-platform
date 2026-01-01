import type {
  Underlying,
  PriceType,
  OrderType,
  TargetStoplossType,
  ActionType,
  Tab,
  Product,
  LegsExecution,
  PortfolioExecutionMode,
  EntryOrderType,
  DayOfWeek,
  TargetType,
  StoplossType,
  ExitOrderType,
  HedgeType,
  ExecutionMode,
  Symbols,
} from "../../types/strategy.types";

// Options for dropdowns
export const symbolOptions: Symbols[] = [
  "NIFTY",
  "BANKNIFTY",
  "FINNIFTY",
  "SENSEX",
];
export const expiryOptions: number[] = [0, 1, 2, 3, 4, 5];

export const dynamicExpiryOptions: string[] = [
  "None",
  "Current Week",
  "Next Week",
  "Next Week+1",
  "Monthly",
];
export const underlyingOptions: Underlying[] = ["SPOT", "FUTURES"];
export const executionModeOptions: ExecutionMode[] = [
  "LIVE MODE",
  "SIMULATION MODE",
];
export const priceTypeOptions: PriceType[] = ["LTP", "BIDASK", "BID", "ASK"];
export const orderTypeOptions: OrderType[] = ["LIMIT", "MARKET"];

export const targetOptions: TargetStoplossType[] = [
  "NONE",
  "ABSOLUTE",
  "PERCENTAGE",
  "POINTS",
];
export const stoplossOptions: TargetStoplossType[] = [
  "NONE",
  "ABSOLUTE",
  "PERCENTAGE",
  "POINTS",
];
export const depthOptions: number[] = [1, 2, 3, 4, 5];
export const actionOptions: ActionType[] = ["NONE", "REENTRY", "REEXECUTE"];

export const tabs: Tab[] = [
  { id: "strategy", label: "Execution Parameters" },
  { id: "analysis", label: "Target Settings" },
  { id: "stoploss", label: "Stoploss Settings" },
  { id: "exit", label: "Exit Settings" },
  { id: "hedge", label: "Dynamic Hedge" },
  { id: "atbroker", label: "At Broker" },
  { id: "backtest", label: "Backtest" },
  { id: "deploy", label: "Deploy" },
];

// Options for execution parameters
export const productOptions: Product[] = ["NRML", "MIS", "CNC"];
export const legsExecutionOptions: LegsExecution[] = [
  "PARALLEL",
  "ONE_BY_ONE",
  "SEQUENTIAL",
];
export const portfolioExecutionModeOptions: PortfolioExecutionMode[] = [
  "START_TIME",
  "UNDERLYING_PREMIUM",
  "COMBINED_PREMIUM",
];
export const entryOrderTypeOptions: EntryOrderType[] = [
  "LIMIT",
  "MARKET",
  "SL_LIMIT",
  "SL_MARKET",
];
export const daysOptions: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Options for target settings
export const targetTypeOptions: TargetType[] = [
  "COMBINED_PROFIT",
  "INDIVIDUAL_LEG_PROFIT",
  "PERCENTAGE_PROFIT",
  "PREMIUM_TARGET",
  "UNDERLYING_MOVEMENT",
];

// Options for stoploss settings
export const stoplossTypeOptions: StoplossType[] = [
  "COMBINED_LOSS",
  "INDIVIDUAL_LEG_LOSS",
  "PERCENTAGE_LOSS",
  "PREMIUM_LOSS",
  "UNDERLYING_MOVEMENT",
];

// Options for exit settings
export const exitOrderTypeOptions: ExitOrderType[] = [
  "LIMIT",
  "MARKET",
  "SL_LIMIT",
  "SL_MARKET",
];

// Options for dynamic hedge settings
export const hedgeTypeOptions: HedgeType[] = [
  "PREMIUM_BASED",
  "FIXED_DISTANCE",
];
