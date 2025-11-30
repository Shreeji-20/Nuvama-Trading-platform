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
} from "../../types/strategy.types";

export const baseConfigDefault: BaseConfig = {
  strategyId: `STRATEGY_${Date.now().toString().slice(-6)}`,
  strategyName: "",
  lots: 1,
  underlying: "Spot",
  buyTradesFirst: false,
  executionMode: "Live Mode",
};

export const premiumBasedStrikeConfigDefault: PremiumBasedStrikeConfig = {
  strikeType: "NearestPremium",
  maxDepth: 25,
  searchSide: "OTM",
  value: 0,
  condition: "Greaterthanequal",
  between: 0,
  and: 0,
};

export const legDefault: Leg = {
  id: Date.now(), // Internal unique identifier for React
  legId: "LEG_001", // User-friendly leg ID
  strategyId: "",
  strategyName: "",
  symbol: "NIFTY",
  expiry: 0,
  priceType: "BIDASK",
  depthIndex: 0,
  orderType: "LIMIT",
  action: "BUY",
  optionType: "CE",
  lots: 1,
  strike: "",
  target: "NONE",
  targetValue: 0,
  stoploss: "NONE",
  stoplossValue: 0,
  startTime: "",
  waitAndTrade: 0,
  waitAndTradeLogic: "NONE",
  dynamicHedge: false,
  onTargetAction: "NONE",
  onStoplossAction: "NONE",
  onTargetActionConfig: {
    actionType: "NONE",
    actionCount: 0,
    orderAtBroker: false,
    slOrderAdjust: { minPoints: 0, maxPercentage: 0 },
  }, // New: detailed config for target action
  onStoplossActionConfig: {
    actionType: "NONE",
    actionCount: 0,
    orderAtBroker: false,
    slOrderAdjust: { minPoints: 0, maxPercentage: 0 },
  }, // New: detailed config for stoploss action
  onSquareOffAction: "NONE", // New: action on square off
  onSquareOffActionConfig: {
    actionType: "NONE",
    actionCount: 0,
    orderAtBroker: false,
    slOrderAdjust: { minPoints: 0, maxPercentage: 0 },
  }, // New: detailed config for squareoff action
  premiumBasedStrike: false,
  premiumBasedStrikeConfig: premiumBasedStrikeConfigDefault,
  hedgeSelectedStrike: null,
  selectedStrike: null,
  initialLegPrice: null, // Price at which leg was initially entered
  reEnterCount: 0, // Number of times leg has been re-entered
};
