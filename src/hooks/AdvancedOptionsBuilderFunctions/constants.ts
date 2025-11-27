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
} from "../../types/strategy.types";

// Options for dropdowns
export const symbolOptions: string[] = [
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
export const underlyingOptions: Underlying[] = ["Spot", "Futures"];
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
  "Parallel",
  "One by One",
  "Sequential",
];
export const portfolioExecutionModeOptions: PortfolioExecutionMode[] = [
  "startTime",
  "underlyingPremium",
  "combinedPremium",
];
export const entryOrderTypeOptions: EntryOrderType[] = [
  "LIMIT",
  "MARKET",
  "SL",
  "SL-M",
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
  "CombinedProfit",
  "IndividualLegProfit",
  "PercentageProfit",
  "PremiumTarget",
  "UnderlyingMovement",
];

// Options for stoploss settings
export const stoplossTypeOptions: StoplossType[] = [
  "CombinedLoss",
  "IndividualLegLoss",
  "PercentageLoss",
  "PremiumLoss",
  "UnderlyingMovement",
];

// Options for exit settings
export const exitOrderTypeOptions: ExitOrderType[] = [
  "LIMIT",
  "MARKET",
  "SL",
  "SL-M",
  "SL-L",
];

// Options for dynamic hedge settings
export const hedgeTypeOptions: HedgeType[] = [
  "premium Based",
  "fixed Distance",
];
