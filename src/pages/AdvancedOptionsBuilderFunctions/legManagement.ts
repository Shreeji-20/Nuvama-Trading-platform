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
        onSquareOffAction: "NONE",
        onTargetActionConfig: {
          actionType: "NONE",
          actionCount: 1,
          orderAtBroker: false,
          slOrderAdjust: {
            minPoints: 0,
            maxPercentage: 0,
          },
        },
        onStoplossActionConfig: {
          actionType: "NONE",
          actionCount: 1,
          orderAtBroker: false,
          slOrderAdjust: {
            minPoints: 0,
            maxPercentage: 0,
          },
        },
        onSquareOffActionConfig: {
          actionType: "NONE",
          actionCount: 1,
          orderAtBroker: false,
          slOrderAdjust: {
            minPoints: 0,
            maxPercentage: 0,
          },
        },
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
};
