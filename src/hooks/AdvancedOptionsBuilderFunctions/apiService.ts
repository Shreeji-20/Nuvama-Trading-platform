import axios from "axios";
import type {
  StrategyTag,
  BaseConfig,
  Leg,
  ExecutionParams,
  TargetSettings,
  StoplossSettings,
  ExitSettings,
  DynamicHedgeSettings,
  AtBrokerSettings,
  StrategyConfiguration,
  DeploymentStatus,
} from "../../types/strategy.types";

// Fetch available strategy tags
export const fetchStrategyTags = async (
  API_BASE_URL: string,
  setLoadingTags: React.Dispatch<React.SetStateAction<boolean>>,
  setAvailableTags: React.Dispatch<React.SetStateAction<StrategyTag[]>>
): Promise<void> => {
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

// API deployment function
export const createDeployStrategyHandler = (
  API_BASE_URL: string,
  baseConfig: BaseConfig,
  legs: Record<string, Leg>,
  executionParams: ExecutionParams,
  targetSettings: TargetSettings,
  stoplossSettings: StoplossSettings,
  exitSettings: ExitSettings,
  dynamicHedgeSettings: DynamicHedgeSettings,
  atBrokerSettings: AtBrokerSettings,
  setIsDeploying: React.Dispatch<React.SetStateAction<boolean>>,
  setDeploymentStatus: React.Dispatch<React.SetStateAction<DeploymentStatus>>,
  setDeploymentMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  return async (): Promise<void> => {
    try {
      setIsDeploying(true);
      setDeploymentStatus(null);
      setDeploymentMessage("");

      if (!baseConfig.strategyName || baseConfig.strategyName.trim() === "") {
        throw new Error(
          "Strategy Name is required. Please enter a strategy name in Base Configuration."
        );
      }

      if (
        !executionParams.strategyTag ||
        executionParams.strategyTag.trim() === ""
      ) {
        throw new Error(
          "Strategy Tag is required. Please select a Strategy Tag in the Execution Parameters tab."
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

        // Sanitize action configs - ensure numbers are numbers, not strings
        const sanitizeActionConfig = (config: any) => {
          if (!config) return config;
          return {
            ...config,
            actionCount:
              typeof config.actionCount === "string"
                ? parseInt(config.actionCount) || 1
                : config.actionCount,
            slOrderAdjust: config.slOrderAdjust
              ? {
                  minPoints:
                    typeof config.slOrderAdjust.minPoints === "string"
                      ? parseFloat(config.slOrderAdjust.minPoints) || 0
                      : config.slOrderAdjust.minPoints,
                  maxPercentage:
                    typeof config.slOrderAdjust.maxPercentage === "string"
                      ? parseFloat(config.slOrderAdjust.maxPercentage) || 0
                      : config.slOrderAdjust.maxPercentage,
                }
              : { minPoints: 0, maxPercentage: 0 },
          };
        };

        if (transformed.onTargetActionConfig) {
          transformed.onTargetActionConfig = sanitizeActionConfig(
            transformed.onTargetActionConfig
          );
        }
        if (transformed.onStoplossActionConfig) {
          transformed.onStoplossActionConfig = sanitizeActionConfig(
            transformed.onStoplossActionConfig
          );
        }
        if (transformed.onSquareOffActionConfig) {
          transformed.onSquareOffActionConfig = sanitizeActionConfig(
            transformed.onSquareOffActionConfig
          );
        }

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

      try {
        const response = await axios.post(
          `${API_BASE_URL}/strategy/create`,
          strategyData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;
        setDeploymentStatus("success");
        setDeploymentMessage(
          `Strategy deployed successfully! Strategy ID: ${result.strategyId}`
        );
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.detail ||
          error.message ||
          "Unknown error occurred";

        throw new Error(errorMsg);
      }

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
};
