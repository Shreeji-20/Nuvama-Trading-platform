// Type definitions based on strategy_config.py Pydantic models

// Literal types matching Python Literals
export type Underlying = "SPOT" | "FUTURES";
export type ExecutionMode = "LIVE MODE" | "SIMULATION MODE";
export type PriceType = "LTP" | "BIDASK" | "DEPTH" | "BID" | "ASK";
export type OrderType = "LIMIT" | "MARKET";
export type Action = "BUY" | "SELL";
export type OptionType = "CE" | "PE";
export type TargetStoplossType = "NONE" | "ABSOLUTE" | "PERCENTAGE" | "POINTS";
export type ActionType = "NONE" | "REENTRY" | "REEXECUTE";
export type Product = "NRML" | "MIS" | "CNC";
export type LegsExecution = "PARALLEL" | "ONE_BY_ONE" | "SEQUENTIAL";
export type PortfolioExecutionMode =
  | "START_TIME"
  | "UNDERLYING_PREMIUM"
  | "COMBINED_PREMIUM";
export type EntryOrderType = "LIMIT" | "MARKET" | "SL_LIMIT" | "SL_MARKET";
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type TargetType =
  | "COMBINED_PROFIT"
  | "INDIVIDUAL_LEG_PROFIT"
  | "PERCENTAGE_PROFIT"
  | "PREMIUM_TARGET"
  | "UNDERLYING_MOVEMENT";
export type StoplossType =
  | "COMBINED_LOSS"
  | "COMBINED_PROFIT"
  | "INDIVIDUAL_LEG_LOSS"
  | "PERCENTAGE_LOSS"
  | "PREMIUM_LOSS"
  | "UNDERLYING_MOVEMENT";
export type ExitOrderType = "LIMIT" | "MARKET" | "SL_LIMIT" | "SL_MARKET";
export type HedgeType = "PREMIUM_BASED" | "FIXED_DISTANCE";
export type StrikeType = "NEAREST_PREMIUM" | "PREMIUM";

export type BackendStrikeType = "NEAREST_PREMIUM" | "RANGE_PREMIUM";
export type SearchSide = "ITM" | "OTM" | "BOTH";
export type Condition = "GREATER_THAN_EQUAL" | "LESS_THAN_EQUAL";
export type Symbols = "NIFTY" | "SENSEX" | "BANKNIFTY" | "FINNIFTY";

export interface SLOrderAdjust {
  min_points: number | string;
  max_percentage: number | string;
}

export interface TpSlConfig {
  target_logic_type: TargetStoplossType;
  target_logic_value: number | string;
  stoploss_value_type: TargetStoplossType;
  stoploss_value: number | string;
}

// Mirrors app/models/StrategyConfig/leg.py::Leg
export interface Leg {
  id: number;
  leg_id: string;
  strategy_id: string;
  strategy_name: string;
  symbol: string;
  expiry: number;
  price_type: PriceType;
  depth_index: number;
  order_type: OrderType;
  action: Action;
  option_type: OptionType;
  lots: number;
  strike: string;
  tp_sl_config: TpSlConfig;
  wait_and_trade_logic_type: TargetStoplossType;
  wait_and_trade_value: number | string;
  start_time: string;
  dynamic_hedge: boolean;
  on_target_action_config?: ActionConfig | null;
  on_stoploss_action_config?: ActionConfig | null;
  on_squareoff_action_config?: ActionConfig | null;
  premium_based_strike: boolean;
  premium_based_strike_config?: PremiumBasedStrikeConfig | null;
  marked_as_complete: boolean;
}
// Base configuration interface
export interface BaseConfig {
  strategy_id: string;
  strategy_name: string;
  multiplier: number;
  underlying: Underlying;
  buy_trades_first: boolean;
  execution_mode: ExecutionMode;
  is_selected_for_trading?: boolean;
}

// Premium based strike configuration interface
export interface PremiumBasedStrikeConfig {
  strike_type: StrikeType;
  max_depth: number;
  search_side: SearchSide;
  value: number;
  condition: Condition;
  between: number;
  and: number;
}

// Action configuration interface for leg actions
export interface ActionConfig {
  action_type: "NONE" | "REENTRY" | "REEXECUTE";
  action_count: number | string; // Allow string for empty input state
  order_at_broker: boolean;
  sl_order_adjust: {
    min_points: number | string;
    max_percentage: number | string;
  };
}

// Execution parameters interface
export interface ExecutionParams {
  product: Product;
  strategy_tag: string;
  legs_execution: LegsExecution;
  portfolio_execution_mode: PortfolioExecutionMode;
  entry_order_type: EntryOrderType;
  run_on_days: DayOfWeek[];
  start_time: string;
  end_time: string;
  squareoff_time: string;
}

// Target settings interface
export interface TargetSettings {
  target_type: TargetType;
  target_value: number;
}

// Stoploss settings interface
export interface StoplossSettings {
  stoploss_type: StoplossType;
  stoploss_value: number;
  stoploss_wait: number;
  sqr_off_only_loss_legs: boolean;
  sqr_off_only_profit_legs: boolean;
}

// Exit settings interface
export interface ExitSettings {
  exit_order_type: ExitOrderType;
  exit_sell_first: boolean;
  hold_buy_time: number;
  wait_btwn_retry: number;
  max_wait_time: number;
}

// Dynamic hedge settings interface
export interface DynamicHedgeSettings {
  hedge_type: HedgeType;
  min_hedge_distance: number;
  max_hedge_distance: number;
  min_premium: number;
  max_premium: number;
  strike_steps: Record<string, number>; // Per-symbol strike steps dictionary
  strike_500: boolean;
  strike_distance: number;
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
