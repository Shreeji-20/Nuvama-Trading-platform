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

      if (!baseConfig.strategy_name || baseConfig.strategy_name.trim() === "") {
        throw new Error(
          "Strategy Name is required. Please enter a strategy name in Base Configuration."
        );
      }

      if (
        !executionParams.strategy_tag ||
        executionParams.strategy_tag.trim() === ""
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
          throw new Error(`Symbol is required for Leg ${leg.leg_id}`);
        }
        if (leg.expiry === undefined || leg.expiry === null) {
          throw new Error(`Expiry is required for Leg ${leg.leg_id}`);
        }
        if (!leg.price_type) {
          throw new Error(`Price Type is required for Leg ${leg.leg_id}`);
        }
        if (!leg.action) {
          throw new Error(`Action is required for Leg ${leg.leg_id}`);
        }
        if (!leg.order_type) {
          throw new Error(`Order Type is required for Leg ${leg.leg_id}`);
        }
      }

      // Transform legs array to dict format with leg_id as key
      const transformedLegsDict: Record<string, any> = {};
      legsArray.forEach((leg) => {
        const transformed: any = { ...leg };

        console.log("Original leg:", leg);

        // The data should already be in snake_case from the state
        // Just ensure required defaults are set
        transformed.action = transformed.action || "BUY";
        transformed.order_type = transformed.order_type || "LIMIT";
        transformed.price_type = transformed.price_type || "BIDASK";
        transformed.depth_index = transformed.depth_index || 1;

        // Transform premium_based_strike_config enum values
        if (transformed.premium_based_strike_config) {
          const config = transformed.premium_based_strike_config;
          if (config.strike_type === "NEAREST_PREMIUM") {
            config.strike_type = "NEAREST-PREMIUM";
          } else if (config.strike_type === "PREMIUM") {
            config.strike_type = "RANGE-PREMIUM";
          }

          if (config.condition === "GREATER_THAN_EQUAL") {
            config.condition = "Greaterthanequal";
          } else if (config.condition === "LESS_THAN_EQUAL") {
            config.condition = "lessthanequal";
          }
        }

        transformedLegsDict[leg.leg_id] = transformed;
      });

      // Transform baseConfig enum values - underlying and execution_mode now match backend directly
      const transformedBaseConfig: any = { ...baseConfig };

      // Transform executionParams enum values
      const transformedExecutionParams: any = { ...executionParams };
      if (transformedExecutionParams.legs_execution === "PARALLEL") {
        transformedExecutionParams.legs_execution = "Parallel";
      } else if (transformedExecutionParams.legs_execution === "ONE_BY_ONE") {
        transformedExecutionParams.legs_execution = "One by One";
      } else if (transformedExecutionParams.legs_execution === "SEQUENTIAL") {
        transformedExecutionParams.legs_execution = "Sequential";
      }

      if (
        transformedExecutionParams.portfolio_execution_mode === "START_TIME"
      ) {
        transformedExecutionParams.portfolio_execution_mode = "startTime";
      } else if (
        transformedExecutionParams.portfolio_execution_mode ===
        "UNDERLYING_PREMIUM"
      ) {
        transformedExecutionParams.portfolio_execution_mode =
          "underlyingPremium";
      } else if (
        transformedExecutionParams.portfolio_execution_mode ===
        "COMBINED_PREMIUM"
      ) {
        transformedExecutionParams.portfolio_execution_mode = "combinedPremium";
      }

      // Transform targetSettings enum values
      const transformedTargetSettings: any = { ...targetSettings };
      const targetTypeMap: Record<string, string> = {
        COMBINED_PROFIT: "CombinedProfit",
        INDIVIDUAL_LEG_PROFIT: "IndividualLegProfit",
        PERCENTAGE_PROFIT: "PercentageProfit",
        PREMIUM_TARGET: "PremiumTarget",
        UNDERLYING_MOVEMENT: "UnderlyingMovement",
      };
      if (transformedTargetSettings.target_type in targetTypeMap) {
        transformedTargetSettings.target_type =
          targetTypeMap[transformedTargetSettings.target_type];
      }

      // Transform stoplossSettings enum values
      const transformedStoplossSettings: any = { ...stoplossSettings };
      const stoplossTypeMap: Record<string, string> = {
        COMBINED_LOSS: "CombinedLoss",
        COMBINED_PROFIT: "CombinedProfit",
        INDIVIDUAL_LEG_LOSS: "IndividualLegLoss",
        PERCENTAGE_LOSS: "PercentageLoss",
        PREMIUM_LOSS: "PremiumLoss",
        UNDERLYING_MOVEMENT: "UnderlyingMovement",
      };
      if (transformedStoplossSettings.stoploss_type in stoplossTypeMap) {
        transformedStoplossSettings.stoploss_type =
          stoplossTypeMap[transformedStoplossSettings.stoploss_type];
      }

      // Transform dynamicHedgeSettings enum values
      const transformedDynamicHedgeSettings: any = { ...dynamicHedgeSettings };
      if (transformedDynamicHedgeSettings.hedge_type === "PREMIUM_BASED") {
        transformedDynamicHedgeSettings.hedge_type = "premium Based";
      } else if (
        transformedDynamicHedgeSettings.hedge_type === "FIXED_DISTANCE"
      ) {
        transformedDynamicHedgeSettings.hedge_type = "fixed Distance";
      }

      // Transform atBrokerSettings to snake_case
      const transformedAtBrokerSettings: any = {
        leg_sl_at_broker: atBrokerSettings.legSlAtBroker,
        leg_tp_at_broker: atBrokerSettings.legTpAtBroker,
        leg_re_entry_at_broker: atBrokerSettings.legReEntryAtBroker,
        leg_wn_t_at_broker: atBrokerSettings.legWnTAtBroker,
        sl_order_trigger_adjust: {
          min_points: atBrokerSettings.slOrderTriggerAdjust.minPoint,
          max_percentage: atBrokerSettings.slOrderTriggerAdjust.maxPercentage,
        },
      };

      // Build the strategy data with snake_case root-level keys for backend
      const strategyData: any = {
        base_config: transformedBaseConfig,
        legs: transformedLegsDict,
        execution_params: transformedExecutionParams,
        target_settings: transformedTargetSettings,
        stoploss_settings: transformedStoplossSettings,
        exit_settings: exitSettings,
        dynamic_hedge_settings: transformedDynamicHedgeSettings,
        at_broker_settings: transformedAtBrokerSettings,
        timestamp: new Date().toISOString(),
      };

      console.log(
        "Sending strategy configuration:",
        JSON.stringify(strategyData, null, 2)
      );

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
