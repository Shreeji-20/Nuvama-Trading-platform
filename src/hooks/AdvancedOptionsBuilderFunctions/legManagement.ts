import type {
  Leg,
  BaseConfig,
  PremiumBasedStrikeConfig,
} from "../../types/strategy.types";

// Add new leg
export const createAddLegHandler = (
  setLegs: React.Dispatch<React.SetStateAction<Record<string, Leg>>>,
  baseConfig: BaseConfig
) => {
  return (): void => {
    setLegs((prev) => {
      // Find the next available leg ID
      const existingLegNumbers = Object.values(prev)
        .map((leg) => {
          const match = leg.leg_id?.match(/LEG_(\d+)/);
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
        leg_id: legId,
        strategy_id: baseConfig.strategy_id,
        strategy_name: baseConfig.strategy_name,
        symbol: "NIFTY",
        expiry: 0,
        action: "BUY",
        option_type: "CE",
        lots: 1,
        strike: "ATM",
        tp_sl_config: {
          target_logic_type: "NONE",
          target_logic_value: 0,
          stoploss_value_type: "NONE",
          stoploss_value: 0,
        },
        price_type: "BIDASK",
        depth_index: 1,
        order_type: "LIMIT",
        start_time: "",
        wait_and_trade_value: 0,
        wait_and_trade_logic_type: "NONE",
        dynamic_hedge: false,
        on_target_action_config: {
          action_type: "NONE",
          action_count: 1,
          order_at_broker: false,
          sl_order_adjust: {
            min_points: 0,
            max_percentage: 0,
          },
        },
        on_stoploss_action_config: {
          action_type: "NONE",
          action_count: 1,
          order_at_broker: false,
          sl_order_adjust: {
            min_points: 0,
            max_percentage: 0,
          },
        },
        on_squareoff_action_config: {
          action_type: "NONE",
          action_count: 1,
          order_at_broker: false,
          sl_order_adjust: {
            min_points: 0,
            max_percentage: 0,
          },
        },
        premium_based_strike: false,
        premium_based_strike_config: {
          strike_type: "NEAREST_PREMIUM",
          max_depth: 5,
          search_side: "BOTH",
          value: 0,
          condition: "GREATER_THAN_EQUAL",
          between: 0,
          and: 0,
        },
        marked_as_complete: false,
      };
      return { ...prev, [legId]: newLeg };
    });
  };
};

// Copy existing leg
export const createCopyLegHandler = (
  setLegs: React.Dispatch<React.SetStateAction<Record<string, Leg>>>
) => {
  return (legIdToCopy: string): void => {
    setLegs((prev) => {
      const legToCopy = prev[legIdToCopy];
      if (!legToCopy) return prev;

      // Find the next available leg ID
      const existingLegNumbers = Object.values(prev)
        .map((leg) => {
          const match = leg.leg_id?.match(/LEG_(\d+)/);
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
        leg_id: newLegId,
      };
      return { ...prev, [newLegId]: newLeg };
    });
  };
};

// Update leg
export const createUpdateLegHandler = (
  setLegs: React.Dispatch<React.SetStateAction<Record<string, Leg>>>
) => {
  return <K extends keyof Leg>(
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
};

// Update premium based strike config for a specific leg
export const createUpdatePremiumStrikeConfigHandler = (
  setLegs: React.Dispatch<React.SetStateAction<Record<string, Leg>>>
) => {
  return <K extends keyof PremiumBasedStrikeConfig>(
    legId: string,
    field: K,
    value: PremiumBasedStrikeConfig[K]
  ): void => {
    setLegs((prev) => {
      if (!prev[legId]) return prev;
      const currentConfig = prev[legId].premium_based_strike_config || {
        strike_type: "NEAREST_PREMIUM",
        max_depth: 5,
        search_side: "BOTH",
        value: 0,
        condition: "GREATER_THAN_EQUAL",
        between: 0,
        and: 0,
      };
      return {
        ...prev,
        [legId]: {
          ...prev[legId],
          premium_based_strike_config: {
            ...currentConfig,
            [field]: value,
          },
        },
      };
    });
  };
};

// Remove leg
export const createRemoveLegHandler = (
  setLegs: React.Dispatch<React.SetStateAction<Record<string, Leg>>>
) => {
  return (legId: string): void => {
    setLegs((prev) => {
      const updated = { ...prev };
      delete updated[legId];
      return updated;
    });
  };
};

// Generate new strategy ID and update all legs
export const createGenerateNewStrategyIdHandler = (
  setBaseConfig: React.Dispatch<React.SetStateAction<BaseConfig>>,
  setLegs: React.Dispatch<React.SetStateAction<Record<string, Leg>>>
) => {
  return (): void => {
    const newStrategyId = `STRATEGY_${Date.now().toString().slice(-6)}`;
    setBaseConfig((prev) => ({
      ...prev,
      strategy_id: newStrategyId,
    }));

    setLegs((prev) => {
      const updated: Record<string, Leg> = {};
      Object.entries(prev).forEach(([legId, leg]) => {
        updated[legId] = { ...leg, strategy_id: newStrategyId };
      });
      return updated;
    });
  };
};
